import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const adminUid = await requireAdmin(req);
  if (typeof adminUid === "object") return adminUid;

  const { id } = await params;
  const body = await req.json();

  if (body.role !== "admin" && body.role !== "socio" && body.role !== "comprador") {
    return NextResponse.json({ error: "role must be 'admin', 'socio' or 'comprador'" }, { status: 400 });
  }

  await adminDb.collection("users").doc(id).update({ role: body.role });
  return NextResponse.json({ success: true });
}