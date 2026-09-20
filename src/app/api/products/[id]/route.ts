import { NextRequest, NextResponse } from "next/server";
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { encrypt, decrypt } from "@/lib/crypto";
import { requireAdmin } from "@/lib/adminAuth";

// ── GET single product ─────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!db) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  const { id } = await params;

  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = snap.data();
  const product: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === "encryptedDescription" || key === "specifications") {
      try {
        product[key] = decrypt(value as string);
      } catch {
        product[key] = "[decryption error]";
      }
    } else {
      product[key] = value;
    }
  }

  return NextResponse.json(product);
}

// ── PATCH update product ───────────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!db) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const uid = await requireAdmin(req);
  if (typeof uid === "object") return uid;

  const { id } = await params;

  const body = await req.json();
  const updateData: Record<string, unknown> = { ...body, updatedAt: new Date().toISOString() };

  if (body.encryptedDescription) updateData.encryptedDescription = encrypt(body.encryptedDescription);
  if (body.specifications) updateData.specifications = encrypt(body.specifications);

  await updateDoc(doc(db, "products", id), updateData);
  return NextResponse.json({ success: true });
}

// ── DELETE product ─────────────────────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!db) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const uid = await requireAdmin(req);
  if (typeof uid === "object") return uid;

  const { id } = await params;
  await deleteDoc(doc(db, "products", id));
  return NextResponse.json({ success: true });
}