import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
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

// ── PATCH crea o actualiza el perfil (autenticado) ──────────────────────────

export async function PATCH(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId;

  const body = await req.json();
  const userRef = adminDb.collection("users").doc(userId);
  const existing = await userRef.get();

  const updateData: Record<string, unknown> = {};
  if (body.phone) updateData.phone = encrypt(body.phone);
  if (body.address) updateData.address = encrypt(body.address);
  if (body.displayName) updateData.displayName = body.displayName;
  if (body.email) updateData.email = body.email;
  updateData.updatedAt = Timestamp.now();

  if (!existing.exists) {
    updateData.uid = userId;
    updateData.role = "comprador";
    updateData.createdAt = Timestamp.now();
  }

  await userRef.set(updateData, { merge: true });
  return NextResponse.json({ success: true });
}

// ── GET perfil (autenticado) ─────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId;

  const docSnap = await adminDb.collection("users").doc(userId).get();
  if (!docSnap.exists) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const data = docSnap.data()!;
  const response: Record<string, unknown> = {
    uid: userId,
    email: data.email,
    displayName: data.displayName,
    role: data.role ?? "comprador",
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
  };

  if (data.phone) {
    try { response.phone = decrypt(data.phone as string); } catch { response.phone = "[encrypted]"; }
  }
  if (data.address) {
    try { response.address = decrypt(data.address as string); } catch { response.address = "[encrypted]"; }
  }

  return NextResponse.json(response);
}