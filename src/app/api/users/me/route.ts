import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { encrypt, decrypt } from "@/lib/crypto";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Verify bearer token; returns UID or a 401 response. */
async function requireUserId(req: NextRequest): Promise<string | NextResponse> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // @ts-expect-error — auth may be null when Firebase config is missing
    const decoded = await auth?.verifyIdToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    return decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

// ── PATCH update user profile (authenticated) ──────────────────────────────

export async function PATCH(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId; // already a 401 response

  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (body.phone) updateData.phone = encrypt(body.phone);
  if (body.address) updateData.address = encrypt(body.address);
  if (body.displayName) updateData.displayName = body.displayName;

  updateData.updatedAt = Timestamp.now();

  await setDoc(doc(db, "users", userId), updateData, { merge: true });

  return NextResponse.json({ success: true });
}

// ── GET user profile (authenticated) ───────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId; // already a 401 response

  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const data = docSnap.data();

  // Decrypt PII fields for response (server-side only)
  const response: Record<string, unknown> = {
    uid: userId,
    email: data.email,
    displayName: data.displayName,
    role: data.role ?? "user",
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt,
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
