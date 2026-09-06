import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { encrypt, decrypt } from "@/lib/crypto";

// ── GET user orders (authenticated) ────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: verify Firebase ID token in production
  // TODO: verify Firebase ID token here in production

  const userId = "user-placeholder"; // TODO: extract from verified token
  const q = query(collection(db, "orders"), where("userId", "==", userId));
  const snapshot = await getDocs(q);

  const orders = [];
  for (const snap of snapshot.docs) {
    const data = snap.data();
    const order: Record<string, unknown> = { id: snap.id, ...data };

    // Decrypt sensitive fields on server side
    if (data.encryptedPhone) {
      try { order.courier = { ...data.courier, phone: decrypt(data.encryptedPhone) }; } catch { /* keep encrypted */ }
    }
    if (data.encryptedDestination) {
      try { order.destination = decrypt(data.encryptedDestination); } catch { /* keep encrypted */ }
    }

    orders.push(order);
  }

  return NextResponse.json(orders);
}

// ── POST create order (authenticated) ──────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Validate required fields
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "items array is required" }, { status: 400 });
  }

  const orderData: Record<string, unknown> = {
    userId: "user-placeholder", // TODO: extract from verified token
    items: body.items,
    total: body.total || 0,
    status: "pending",
    eta: body.eta || null,
    courier: body.courier || null,
    origin: body.origin || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Encrypt sensitive fields
  if (body.courier?.phone) {
    orderData.encryptedPhone = encrypt(body.courier.phone);
    orderData.courier = Object.fromEntries(
      Object.entries(body.courier).filter(([k]) => k !== "phone"),
    );
  }
  if (body.destination) {
    orderData.encryptedDestination = encrypt(body.destination);
  }

  const docRef = await addDoc(collection(db, "orders"), orderData);
  return NextResponse.json({ id: docRef.id, success: true });
}
