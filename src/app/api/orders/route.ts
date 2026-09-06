import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { encrypt, decrypt } from "@/lib/crypto";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Verify bearer token; returns UID or a 401 response. */
async function requireUserId(req: NextRequest): Promise<string | NextResponse> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // @ts-expect-error — auth may be null when Firebase config is missing
    const decoded = await auth?.verifyIdToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    return decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

// ── GET user orders (authenticated) ────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId; // already a 401 response

  const q = query(collection(db, "orders"), where("userId", "==", userId));
  const snapshot = await getDocs(q);

  const orders: Record<string, unknown>[] = [];
  for (const snap of snapshot.docs) {
    const data = snap.data();
    const order: Record<string, unknown> = { id: snap.id, ...data };

    // Decrypt sensitive fields on server side
    if (data.encryptedPhone) {
      try {
        order.courier = { ...data.courier, phone: decrypt(data.encryptedPhone as string) };
      } catch {
        /* keep encrypted */
      }
    }
    if (data.encryptedDestination) {
      try {
        order.destination = decrypt(data.encryptedDestination as string);
      } catch {
        /* keep encrypted */
      }
    }

    orders.push(order);
  }

  return NextResponse.json(orders);
}

// ── POST create order (authenticated) ──────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId; // already a 401 response

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
