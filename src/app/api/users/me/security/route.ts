import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { verifyPassword } from "@/lib/firebaseRest";

export async function POST(req: NextRequest) {
  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.firebase.sign_in_provider === "password") {
      return NextResponse.json({ error: "Verificación en dos pasos requerida" }, { status: 403 });
    }
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const { currentPassword, newPassword, newEmail } = await req.json();
  if (!currentPassword || (!newPassword && !newEmail)) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }
  if (newPassword && newPassword.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
  }

  const record = await adminAuth.getUser(uid);
  if (!record.email || !(await verifyPassword(record.email, currentPassword))) {
    return NextResponse.json({ error: "La contraseña actual no es correcta" }, { status: 401 });
  }

  try {
    await adminAuth.updateUser(uid, {
      ...(newPassword && { password: newPassword }),
      ...(newEmail && { email: newEmail }),
    });
  } catch (error: unknown) {
    const code = (error as { code?: string }).code || "";
    if (code.includes("email-already-exists")) {
      return NextResponse.json({ error: "Ese correo ya está registrado" }, { status: 409 });
    }
    console.error("Security update error:", error);
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }

  if (newEmail) await adminDb.collection("users").doc(uid).update({ email: newEmail });

  return NextResponse.json({ success: true });
}