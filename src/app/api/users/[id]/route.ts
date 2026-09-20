import { NextRequest, NextResponse } from "next/server";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAdmin } from "@/lib/adminAuth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!db) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const adminUid = await requireAdmin(req);
  if (typeof adminUid === "object") return adminUid;

  const { id } = await params;
  const body = await req.json();

  if (body.role !== "admin" && body.role !== "user") {
    return NextResponse.json({ error: "role must be 'admin' or 'user'" }, { status: 400 });
  }

  await updateDoc(doc(db, "users", id), { role: body.role });
  return NextResponse.json({ success: true });
}