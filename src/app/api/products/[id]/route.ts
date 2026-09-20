import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { encrypt, decrypt } from "@/lib/crypto";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  const { id } = await params;

  const snap = await adminDb.collection("products").doc(id).get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = snap.data()!;
  const product: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === "encryptedDescription" || key === "specifications") {
      try { product[key] = decrypt(value as string); } catch { product[key] = "[decryption error]"; }
    } else {
      product[key] = value;
    }
  }

  return NextResponse.json(product);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const uid = await requireAdmin(req);
  if (typeof uid === "object") return uid;

  const { id } = await params;
  const body = await req.json();
  const updateData: Record<string, unknown> = { ...body, updatedAt: new Date().toISOString() };

  if (body.encryptedDescription) updateData.encryptedDescription = encrypt(body.encryptedDescription);
  if (body.specifications) updateData.specifications = encrypt(body.specifications);

  await adminDb.collection("products").doc(id).update(updateData);
  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const uid = await requireAdmin(req);
  if (typeof uid === "object") return uid;

  const { id } = await params;
  await adminDb.collection("products").doc(id).delete();
  return NextResponse.json({ success: true });
}