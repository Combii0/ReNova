import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  const { email, code } = await req.json();
  if (!email || !code) {
    return NextResponse.json({ error: "Email and code required" }, { status: 400 });
  }

  let uid: string;
  try {
    uid = (await adminAuth.getUserByEmail(email)).uid;
  } catch {
    return NextResponse.json({ error: "Código incorrecto" }, { status: 401 });
  }

  const ref = adminDb.collection("twoFactorCodes").doc(uid);
  const data = (await ref.get()).data();

  if (!data || data.expiresAt < Date.now()) {
    await ref.delete();
    return NextResponse.json({ error: "El código expiró. Inicia sesión de nuevo." }, { status: 400 });
  }
  if (data.attempts >= 5) {
    await ref.delete();
    return NextResponse.json({ error: "Demasiados intentos. Inicia sesión de nuevo." }, { status: 429 });
  }
  if (data.codeHash !== createHash("sha256").update(String(code)).digest("hex")) {
    await ref.update({ attempts: data.attempts + 1 });
    return NextResponse.json({ error: "Código incorrecto" }, { status: 401 });
  }

  await ref.delete();
  await adminAuth.updateUser(uid, { emailVerified: true });
  const token = await adminAuth.createCustomToken(uid);
  return NextResponse.json({ token });
}