import { NextRequest, NextResponse } from "next/server";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  const adminDb = getAdminDb();

  if (!auth || !adminDb) {
    return NextResponse.json(
      { error: "Firebase not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    let userCredential;
    let isNewUser = false;

    try {
      userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
    } catch (error: unknown) {
      const code = (error as { code?: string }).code || "";

      if (
        !code.includes("user-not-found") &&
        !code.includes("invalid-credential")
      ) {
        console.error("Login error:", error);

        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      try {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        isNewUser = true;
      } catch (createError: unknown) {
        const createCode =
          (createError as { code?: string }).code || "";

        if (createCode.includes("email-already-in-use")) {
          return NextResponse.json(
            { error: "Invalid email or password" },
            { status: 401 }
          );
        }

        throw createError;
      }
    }

    const user = userCredential.user;

    await adminDb.collection("users").doc(user.uid).set(
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || email.split("@")[0],
        updatedAt: new Date().toISOString(),

        ...(isNewUser && {
          createdAt: new Date().toISOString(),
          role: "comprador" as const,
        }),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || email.split("@")[0],
      },
      isNewUser,
    });
  } catch (error) {
    console.error("Authentication error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}