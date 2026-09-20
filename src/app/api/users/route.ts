import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { decrypt } from "@/lib/crypto";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const uid = await requireAdmin(req);
  if (typeof uid === "object") return uid;

  const snapshot = await adminDb.collection("users").get();
  const users = snapshot.docs.map((snap) => {
    const data = snap.data();
    let phone: string | undefined;
    if (data.phone) {
      try { phone = decrypt(data.phone as string); } catch { phone = "[encrypted]"; }
    }
    return {
      uid: snap.id,
      email: data.email,
      displayName: data.displayName,
      role: data.role ?? "comprador",
      phone,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    };
  });

  return NextResponse.json(users);
}