import { NextRequest, NextResponse } from "next/server";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!auth || !adminDb) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      const code = (error as { code?: string }).code || "";
      if (!code.includes("user-not-found") && !code.includes("invalid-credential")) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await adminDb.collection("users").doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || email.split("@")[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: "comprador" as const,
      }, { merge: true });
    }

    const user = userCredential.user;
    return NextResponse.json({
      user: { id: user.uid, email: user.email, displayName: user.displayName },
    });
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}