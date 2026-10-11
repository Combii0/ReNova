import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { encrypt, decrypt } from "@/lib/crypto";

type OrderItem = {
  productId: string;
  name: string;
  price: string;
  quantity: number;
};

// solicitudes que un comprador puede enviar cada 24 horas (un pedido por producto)
const DAILY_LIMIT = 10;

async function requireUserId(req: NextRequest): Promise<string | NextResponse> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminAuth = getAdminAuth();
  if (!adminAuth) return NextResponse.json({ error: "Firebase admin not configured" }, { status: 500 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.firebase.sign_in_provider === "password") {
      return NextResponse.json({ error: "Verificación en dos pasos requerida" }, { status: 403 });
    }
    return decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

// ?as=seller devuelve los pedidos que contienen productos del usuario
// ?unread=1 devuelve si hay pedidos sin ver como vendedor (store) y como comprador (purchases)
export async function GET(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId;

  if (req.nextUrl.searchParams.get("unread") === "1") {
    const [sold, bought] = await Promise.all([
      adminDb.collection("orders").where("sellerIds", "array-contains", userId).get(),
      adminDb.collection("orders").where("userId", "==", userId).get(),
    ]);
    return NextResponse.json({
      store: sold.docs.some((d) => d.data().unreadSeller),
      purchases: bought.docs.some((d) => d.data().unreadBuyer),
    });
  }

  const asSeller = req.nextUrl.searchParams.get("as") === "seller";
  const snapshot = await adminDb
    .collection("orders")
    .where(asSeller ? "sellerIds" : "userId", asSeller ? "array-contains" : "==", userId)
    .get();

  const orders: Record<string, unknown>[] = [];
  for (const snap of snapshot.docs) {
    const data = snap.data();
    const order: Record<string, unknown> = { id: snap.id, ...data };

    if (asSeller) {
      // el vendedor no recibe la dirección ni el teléfono cifrados
      delete order.encryptedPhone;
      delete order.encryptedDestination;

      // rating del comprador (solo si ya tiene calificaciones)
      const buyer = await adminDb.collection("users").doc(data.userId).get();
      const { ratingAvg, ratingCount } = buyer.data() ?? {};
      if (ratingCount) order.buyerRating = { avg: ratingAvg, count: ratingCount };

      orders.push(order);
      continue;
    }

    if (data.encryptedPhone) {
      try {
        order.courier = { ...(data.courier as object), phone: decrypt(data.encryptedPhone as string) };
      } catch { /* keep encrypted */ }
    }
    if (data.encryptedDestination) {
      try { order.destination = decrypt(data.encryptedDestination as string); } catch { /* keep encrypted */ }
    }

    orders.push(order);
  }

  return NextResponse.json(orders);
}

// Crea un pedido por producto. El cliente solo manda los productId.
export async function POST(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId;

  const body = await req.json();
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "items array is required" }, { status: 400 });
  }

  const requested: unknown[] = body.items.map((i: { productId?: unknown }) => i?.productId);
  if (requested.some((id) => typeof id !== "string" || !id)) {
    return NextResponse.json({ error: "productId no válido" }, { status: 400 });
  }
  const productIds = [...new Set(requested as string[])];

  const snaps = await adminDb.getAll(
    ...productIds.map((id) => adminDb.collection("products").doc(id)),
  );
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

  // el vendedor de cada producto se toma de Firestore, no del cliente
  const requests: { sellerId: string; item: OrderItem }[] = [];
  for (const snap of snaps) {
    const product = snap.data();
    if (!product || (product.expirationDate && product.expirationDate < today)) {
      return NextResponse.json({ error: "Un producto ya no está disponible" }, { status: 409 });
    }
    if (product.reservedOrderId) {
      return NextResponse.json({ error: "Un producto ya fue reservado por otro comprador" }, { status: 409 });
    }
    if (!product.createdBy) {
      return NextResponse.json({ error: "Producto sin vendedor" }, { status: 400 });
    }
    if (product.createdBy === userId) {
      return NextResponse.json({ error: "No puedes pedir tus propios productos" }, { status: 400 });
    }

    requests.push({
      sellerId: product.createdBy,
      item: {
        productId: snap.id,
        name: product.name,
        price: String(product.price),
        quantity: 1,
      },
    });
  }

  // límite diario: pedidos creados por este comprador en las últimas 24 horas
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const previous = await adminDb.collection("orders").where("userId", "==", userId).get();
  const recent = previous.docs.filter((d) => d.data().createdAt >= since).length;
  if (recent + requests.length > DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Solo puedes enviar ${DAILY_LIMIT} solicitudes cada 24 horas` },
      { status: 429 },
    );
  }

  const buyer = await adminDb.collection("users").doc(userId).get();
  const now = new Date().toISOString();
  const batch = adminDb.batch();
  const ids: string[] = [];

  for (const { sellerId, item } of requests) {
    const ref = adminDb.collection("orders").doc();
    ids.push(ref.id);

    const orderData: Record<string, unknown> = {
      userId,
      buyerName: buyer.data()?.displayName ?? "",
      sellerIds: [sellerId],
      items: [item],
      total: Number(item.price.replace(/\D/g, "")),
      status: "pending",
      unreadSeller: true,
      unreadBuyer: false,
      createdAt: now,
      updatedAt: now,
    };
    if (body.destination) orderData.encryptedDestination = encrypt(body.destination);

    batch.set(ref, orderData);
  }

  await batch.commit();
  return NextResponse.json({ success: true, ids });
}

// { read: [ids] }: marca pedidos como vistos
// accepted / rejected: lo hace el vendedor sobre un pedido pending
// cancelled: lo hace el comprador o el vendedor sobre un pedido accepted
export async function PATCH(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId;

  const body = await req.json();

  // apaga el punto rojo del vendedor o del comprador, según quién sea el usuario en cada pedido
  if (Array.isArray(body.read)) {
    const readIds: string[] = body.read
      .filter((x: unknown): x is string => typeof x === "string" && x !== "")
      .slice(0, 100);
    if (readIds.length === 0) return NextResponse.json({ success: true });

    const snaps = await adminDb.getAll(
      ...readIds.map((orderId) => adminDb.collection("orders").doc(orderId)),
    );
    const batch = adminDb.batch();
    for (const snap of snaps) {
      const order = snap.data();
      if (!order) continue;
      if (order.sellerIds?.includes(userId) && order.unreadSeller) {
        batch.update(snap.ref, { unreadSeller: false });
      }
      if (order.userId === userId && order.unreadBuyer) {
        batch.update(snap.ref, { unreadBuyer: false });
      }
    }
    await batch.commit();
    return NextResponse.json({ success: true });
  }

  const { id, status } = body;
  if (typeof id !== "string" || !["accepted", "rejected", "cancelled"].includes(status)) {
    return NextResponse.json(
      { error: "id y status ('accepted', 'rejected' o 'cancelled') son obligatorios" },
      { status: 400 },
    );
  }

  const orderRef = adminDb.collection("orders").doc(id);

  // transacción: dos aceptaciones simultáneas no pueden reservar el mismo producto
  const failure = await adminDb.runTransaction(async (tx) => {
    const order = (await tx.get(orderRef)).data();
    if (!order) return { code: 404, message: "Not found" };

    const isSeller = order.sellerIds?.includes(userId);
    const isBuyer = order.userId === userId;
    const productRefs = (order.items as OrderItem[]).map((i) =>
      adminDb.collection("products").doc(i.productId),
    );
    const products = await tx.getAll(...productRefs);

    if (status === "cancelled") {
      if (!isSeller && !isBuyer) return { code: 403, message: "Forbidden" };
      if (order.status !== "accepted") {
        return { code: 409, message: "Solo se puede cancelar una solicitud aceptada" };
      }
      // libera los productos que este pedido tenía reservados
      products.forEach((snap) => {
        if (snap.data()?.reservedOrderId === id) {
          tx.update(snap.ref, { reservedOrderId: FieldValue.delete() });
        }
      });
    } else {
      if (!isSeller) return { code: 403, message: "Forbidden" };
      if (order.status !== "pending") {
        return { code: 409, message: "Esta solicitud ya fue respondida" };
      }
      if (status === "accepted") {
        for (const snap of products) {
          const reserved = snap.data()?.reservedOrderId;
          if (!snap.exists || (reserved && reserved !== id)) {
            return { code: 409, message: "Un producto de esta solicitud ya no está disponible" };
          }
        }
        products.forEach((snap) => tx.update(snap.ref, { reservedOrderId: id }));
      }
    }

    // el cambio lo ve la otra persona: si actúa el vendedor se avisa al comprador y viceversa
    tx.update(orderRef, {
      status,
      updatedAt: new Date().toISOString(),
      ...(isSeller ? { unreadBuyer: true } : { unreadSeller: true }),
    });
    return null;
  });

  if (failure) return NextResponse.json({ error: failure.message }, { status: failure.code });
  return NextResponse.json({ success: true, status });
}