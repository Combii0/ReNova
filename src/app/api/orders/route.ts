import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { encrypt, decrypt } from "@/lib/crypto";

async function requireUserId(req: NextRequest): Promise<string | NextResponse> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminAuth = getAdminAuth();
  if (!adminAuth) return NextResponse.json({ error: "Firebase admin not configured" }, { status: 500 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

export async function GET(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId;

  const snapshot = await adminDb.collection("orders").where("userId", "==", userId).get();

  const orders: Record<string, unknown>[] = [];
  for (const snap of snapshot.docs) {
    const data = snap.data();
    const order: Record<string, unknown> = { id: snap.id, ...data };

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

export async function POST(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId;

  const body = await req.json();
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "items array is required" }, { status: 400 });
  }

  const orderData: Record<string, unknown> = {
    userId,
    items: body.items,
    total: body.total || 0,
    status: "pending",
    eta: body.eta ?? null,
    courier: body.courier ?? null,
    origin: body.origin ?? "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (body.courier?.phone) {
    orderData.encryptedPhone = encrypt(body.courier.phone);
    orderData.courier = Object.fromEntries(Object.entries(body.courier).filter(([k]) => k !== "phone"));
  }
  if (body.destination) orderData.encryptedDestination = encrypt(body.destination);

  const docRef = await adminDb.collection("orders").add(orderData);
  return NextResponse.json({ id: docRef.id, success: true });
}