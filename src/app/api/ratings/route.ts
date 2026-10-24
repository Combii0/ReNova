import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

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

// Devuelve las calificaciones que el usuario ha dado: [{ orderId, stars }]
export async function GET(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId;

  const snapshot = await adminDb.collection("ratings").where("fromId", "==", userId).get();
  return NextResponse.json(
    snapshot.docs.map((d) => ({ orderId: d.data().orderId, stars: d.data().stars })),
  );
}

// { orderId, stars }: el usuario califica a la otra parte de un pedido completado
export async function POST(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId;

  const { orderId, stars } = await req.json();
  if (typeof orderId !== "string" || !orderId) {
    return NextResponse.json({ error: "orderId es obligatorio" }, { status: 400 });
  }
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return NextResponse.json({ error: "Las estrellas deben ser un número entero de 1 a 5" }, { status: 400 });
  }

  const orderRef = adminDb.collection("orders").doc(orderId);
  // un solo documento posible por pedido + evaluador
  const ratingRef = adminDb.collection("ratings").doc(`${orderId}_${userId}`);

  const failure = await adminDb.runTransaction(async (tx) => {
    const order = (await tx.get(orderRef)).data();
    if (!order) return { code: 404, message: "Not found" };

    const isBuyer = order.userId === userId;
    const isSeller = !!order.sellerIds?.includes(userId);
    if (!isBuyer && !isSeller) return { code: 403, message: "Forbidden" };

    if (order.status !== "completed") {
      return { code: 409, message: "Solo puedes calificar pedidos completados" };
    }

    // la contraparte: el comprador califica al vendedor y viceversa
    const toId: string = isBuyer ? order.sellerIds[0] : order.userId;
    const targetRef = adminDb.collection("users").doc(toId);
    const [rating, target] = await tx.getAll(ratingRef, targetRef);

    if (rating.exists) return { code: 409, message: "Ya calificaste este pedido" };
    if (!target.exists) return { code: 404, message: "El usuario a calificar ya no existe" };

    const { ratingSum = 0, ratingCount = 0 } = target.data() ?? {};
    const newSum = ratingSum + stars;
    const newCount = ratingCount + 1;

    tx.set(ratingRef, {
      orderId,
      fromId: userId,
      toId,
      stars,
      createdAt: new Date().toISOString(),
    });
    tx.update(targetRef, {
      ratingSum: newSum,
      ratingCount: newCount,
      ratingAvg: Math.round((newSum / newCount) * 100) / 100,
    });
    return null;
  });

  if (failure) return NextResponse.json({ error: failure.message }, { status: failure.code });
  return NextResponse.json({ success: true });
}