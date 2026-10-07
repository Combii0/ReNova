import { NextRequest, NextResponse } from "next/server";
import { randomInt, createHash } from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { encrypt } from "@/lib/crypto";
import { sendCodeEmail } from "@/lib/mailer";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  const { displayName, email, password, phone, address } = await req.json();
  if (!displayName || !email || !password) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
  }

  // getUserByEmail lanza error si no existe, que es lo que queremos
  const exists = await adminAuth.getUserByEmail(email).then(() => true).catch(() => false);
  if (exists) {
    return NextResponse.json({ error: "Ese correo ya está registrado" }, { status: 409 });
  }

  const ref = adminDb.collection("pendingRegistrations").doc(email.toLowerCase());
  const previous = (await ref.get()).data();
  if (previous?.createdAt && Date.now() - previous.createdAt < 60 * 1000) {
    return NextResponse.json({ error: "Espera un minuto antes de pedir otro código" }, { status: 429 });
  }

  const code = String(randomInt(100000, 1000000));
  await ref.set({
    displayName,
    email,
    encryptedPassword: encrypt(password),
    phone: phone ? encrypt(phone) : null,
    address: address ? encrypt(address) : null,
    codeHash: createHash("sha256").update(code).digest("hex"),
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000,
    deleteAt: Timestamp.fromMillis(Date.now() + 10 * 60 * 1000),
    attempts: 0,
  });

  try {
    await sendCodeEmail(email, code);
  } catch (error) {
    console.error("Register email error:", error);
    return NextResponse.json({ error: "No se pudo enviar el correo" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}