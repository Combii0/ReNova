import { NextRequest, NextResponse } from "next/server";
import { randomInt, createHash } from "node:crypto";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { verifyPassword } from "@/lib/firebaseRest";
import { sendCodeEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const uid = await verifyPassword(email, password);
  if (!uid) return NextResponse.json({ error: "Correo o contraseña incorrectos" }, { status: 401 });

  const ref = adminDb.collection("twoFactorCodes").doc(uid);
  const previous = (await ref.get()).data();
  if (previous?.createdAt && Date.now() - previous.createdAt < 60 * 1000) {
    return NextResponse.json({ error: "Espera un minuto antes de pedir otro código" }, { status: 429 });
  }

  const code = String(randomInt(100000, 1000000));
  await ref.set({
    codeHash: createHash("sha256").update(code).digest("hex"),
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });

  try {
    await sendCodeEmail(email, code);
  } catch (error) {
    console.error("2FA email error:", error);
    return NextResponse.json({ error: "No se pudo enviar el correo" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}