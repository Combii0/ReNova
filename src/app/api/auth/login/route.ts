import { NextRequest, NextResponse } from "next/server";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export async function POST(req: NextRequest) {
  if (!auth || !db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Try login first
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      const code = (error as { code?: string }).code || "";
      if (!code.includes("user-not-found") && !code.includes("invalid-credential")) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
      // If user doesn't exist, offer auto-registration with empty PII
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || email.split("@")[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: "user" as const,
      }, { merge: true });
    }

    const user = userCredential.user;

    return NextResponse.json({
      user: {
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
