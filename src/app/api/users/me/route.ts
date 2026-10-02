import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { encrypt, decrypt } from "@/lib/crypto";

async function requireUserId(
  req: NextRequest,
  allowIfNoProfile = false,
): Promise<string | NextResponse> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminAuth = getAdminAuth();
  if (!adminAuth) return NextResponse.json({ error: "Firebase admin not configured" }, { status: 500 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);

    if (decoded.firebase.sign_in_provider === "password") {
      let canContinue = false;
      if (allowIfNoProfile) {
        const profile = await getAdminDb()?.collection("users").doc(decoded.uid).get();
        canContinue = !!profile && !profile.exists;
      }
      if (!canContinue) {
        return NextResponse.json({ error: "Verificación en dos pasos requerida" }, { status: 403 });
      }
    }

    return decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

// ── PATCH crea o actualiza el perfil (autenticado) ──────────────────────────
// allowIfNoProfile: el registro crea el perfil antes del primer código

export async function PATCH(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req, true);
  if (typeof userId === "object") return userId;

  const body = await req.json();
  const userRef = adminDb.collection("users").doc(userId);
  const existing = await userRef.get();

  const updateData: Record<string, unknown> = {};
  if (body.phone) updateData.phone = encrypt(body.phone);
  if (body.address) updateData.address = encrypt(body.address);
  if (body.displayName) updateData.displayName = body.displayName;
  if (body.email) updateData.email = body.email;
  if (body.age) {
    const age = Number(body.age);
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      return NextResponse.json({ error: "Edad no válida" }, { status: 400 });
    }
    updateData.age = age;
  }
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

  if (data.age) response.age = data.age;
  if (data.phone) {
    try { response.phone = decrypt(data.phone as string); } catch { response.phone = "[encrypted]"; }
  }
  if (data.address) {
    try { response.address = decrypt(data.address as string); } catch { response.address = "[encrypted]"; }
  }

  return NextResponse.json(response);
}

// ── DELETE elimina la cuenta, sus pedidos y su perfil ────────────────────────

export async function DELETE(req: NextRequest) {
  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId;

  const orders = await adminDb.collection("orders").where("userId", "==", userId).get();

  const batch = adminDb.batch();
  orders.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(adminDb.collection("users").doc(userId));
  batch.delete(adminDb.collection("twoFactorCodes").doc(userId));
  await batch.commit();

  await adminAuth.deleteUser(userId);
  return NextResponse.json({ success: true });
}