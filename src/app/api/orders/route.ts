import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { encrypt, decrypt } from "@/lib/crypto";

type OrderItem = {
  productId: string;
  name: string;
  price: string;
  quantity: number;
};

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
export async function GET(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId;

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

// Crea un pedido por vendedor. El cliente solo manda los productId.
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

  // los productos se agrupan por vendedor, tomado de Firestore
  const bySeller = new Map<string, OrderItem[]>();
  for (const snap of snaps) {
    const product = snap.data();
    if (!product || (product.expirationDate && product.expirationDate < today)) {
      return NextResponse.json({ error: "Un producto ya no está disponible" }, { status: 409 });
    }
    if (!product.createdBy) {
      return NextResponse.json({ error: "Producto sin vendedor" }, { status: 400 });
    }
    if (product.createdBy === userId) {
      return NextResponse.json({ error: "No puedes pedir tus propios productos" }, { status: 400 });
    }

    const list = bySeller.get(product.createdBy) ?? [];
    list.push({
      productId: snap.id,
      name: product.name,
      price: String(product.price),
      quantity: 1,
    });
    bySeller.set(product.createdBy, list);
  }

  const buyer = await adminDb.collection("users").doc(userId).get();
  const now = new Date().toISOString();
  const batch = adminDb.batch();
  const ids: string[] = [];

  for (const [sellerId, items] of bySeller) {
    const ref = adminDb.collection("orders").doc();
    ids.push(ref.id);

    const orderData: Record<string, unknown> = {
      userId,
      buyerName: buyer.data()?.displayName ?? "",
      sellerIds: [sellerId],
      items,
      total: items.reduce((sum, i) => sum + Number(i.price.replace(/\D/g, "")), 0),
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    if (body.destination) orderData.encryptedDestination = encrypt(body.destination);

    batch.set(ref, orderData);
  }

  await batch.commit();
  return NextResponse.json({ success: true, ids });
}

// El vendedor acepta o rechaza una solicitud pendiente
export async function PATCH(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId;

  const { id, status } = await req.json();
  if (typeof id !== "string" || (status !== "accepted" && status !== "rejected")) {
    return NextResponse.json({ error: "id y status ('accepted' o 'rejected') son obligatorios" }, { status: 400 });
  }

  const ref = adminDb.collection("orders").doc(id);
  const order = (await ref.get()).data();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!order.sellerIds?.includes(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (order.status !== "pending") {
    return NextResponse.json({ error: "Esta solicitud ya fue respondida" }, { status: 409 });
  }

  await ref.update({ status, updatedAt: new Date().toISOString() });
  return NextResponse.json({ success: true, status });
}