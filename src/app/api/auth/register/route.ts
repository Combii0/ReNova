import { NextRequest, NextResponse } from "next/server";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Timestamp } from "firebase-admin/firestore";
import { auth } from "@/lib/firebase";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { encrypt } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!auth || !adminDb) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { email, password, displayName, phone, address } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: displayName || email.split("@")[0] });

    const now = Timestamp.now();
    const userData: Record<string, unknown> = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      createdAt: now,
      updatedAt: now,
      role: "comprador" as const,
    };
    if (phone) userData.phone = encrypt(phone);
    if (address) userData.address = encrypt(address);

    await adminDb.collection("users").doc(user.uid).set(userData);

    return NextResponse.json({
      user: { id: user.uid, email: user.email, displayName: user.displayName },
    });
  } catch (error: unknown) {
    const code = (error as { code?: string }).code || "";
    if (code.includes("email-already-in-use")) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    if (code.includes("weak-password")) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}