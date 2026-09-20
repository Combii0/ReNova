import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { decrypt } from "@/lib/crypto";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const uid = await requireAdmin(req);
  if (typeof uid === "object") return uid;

  const snapshot = await getDocs(collection(db, "users"));
  const users = snapshot.docs.map((snap) => {
    const data = snap.data();

    let phone: string | undefined;
    if (data.phone) {
      try {
        phone = decrypt(data.phone as string);
      } catch {
        phone = "[encrypted]";
      }
    }

    return {
      uid: snap.id,
      email: data.email,
      displayName: data.displayName,
      role: data.role ?? "user",
      phone,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
    };
  });

  return NextResponse.json(users);
}