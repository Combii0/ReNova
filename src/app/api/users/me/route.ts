import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { encrypt, decrypt } from "@/lib/crypto";

export async function PATCH(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  // Get user from Firebase session cookie or header
  const auth = getAuth();
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = await auth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = decoded.uid;
  const body = await req.json();

  // Encrypt PII fields before saving
  const updateData: Record<string, unknown> = {};
  if (body.phone) updateData.phone = encrypt(body.phone);
  if (body.address) updateData.address = encrypt(body.address);
  if (body.displayName) updateData.displayName = body.displayName;

  updateData.updatedAt = new Date().toISOString();

  await setDoc(doc(db, "users", userId), updateData, { merge: true });

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  const auth = getAuth();
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = await auth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const docRef = doc(db, "users", decoded.uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const data = docSnap.data();

  // Decrypt PII fields for response (server-side only)
  const response: Record<string, unknown> = {
    uid: decoded.uid,
    email: data.email,
    displayName: data.displayName,
    role: data.role || "user",
    createdAt: data.createdAt,
  };

  if (data.phone) {
    try {
      response.phone = decrypt(data.phone as string);
    } catch {
      response.phone = "[encrypted]";
    }
  }
  if (data.address) {
    try {
      response.address = decrypt(data.address as string);
    } catch {
      response.address = "[encrypted]";
    }
  }

  return NextResponse.json(response);
}
