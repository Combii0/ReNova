import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { decrypt } from "@/lib/crypto";

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

  const ref = adminDb.collection("pendingRegistrations").doc(email.toLowerCase());
  const data = (await ref.get()).data();

  if (!data || data.expiresAt < Date.now()) {
    await ref.delete();
    return NextResponse.json({ error: "El código expiró. Regístrate de nuevo." }, { status: 400 });
  }
  if (data.attempts >= 5) {
    await ref.delete();
    return NextResponse.json({ error: "Demasiados intentos. Regístrate de nuevo." }, { status: 429 });
  }
  if (data.codeHash !== createHash("sha256").update(String(code)).digest("hex")) {
    await ref.update({ attempts: data.attempts + 1 });
    return NextResponse.json({ error: "Código incorrecto" }, { status: 401 });
  }

  let user;
  try {
    user = await adminAuth.createUser({
      email: data.email,
      password: decrypt(data.encryptedPassword),
      displayName: data.displayName,
      emailVerified: true,
    });
  } catch {
    return NextResponse.json({ error: "No se pudo crear la cuenta" }, { status: 500 });
  }

  await adminDb.collection("users").doc(user.uid).set({
    uid: user.uid,
    email: data.email,
    displayName: data.displayName,
    role: "comprador",
    ...(data.phone && { phone: data.phone }),
    ...(data.address && { address: data.address }),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  await ref.delete();
  const token = await adminAuth.createCustomToken(user.uid);
  return NextResponse.json({ token });
}