import { NextRequest, NextResponse } from "next/server";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { encrypt } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  if (!auth || !db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { email, password, displayName, phone, address } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName: displayName || email.split("@")[0] });

    // Encrypt PII before storing in Firestore
    const userData: Record<string, unknown> = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: "user" as const,
    };

    // Encrypt sensitive fields if provided
    if (phone) userData.phone = encrypt(phone);
    if (address) userData.address = encrypt(address);

    // Save to Firestore users/{uid}
    await setDoc(doc(db, "users", user.uid), userData);

    return NextResponse.json({
      user: {
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error: unknown) {
    const code = (error as { code?: string }).code || "";
    // Map Firebase error codes to HTTP status
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
