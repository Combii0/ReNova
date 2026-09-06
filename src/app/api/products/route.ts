import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { encrypt, decrypt } from "@/lib/crypto";

// ── GET all products (public) ──────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  let q = query(collection(db, "products"));
  if (orderBy) {
    q = query(q, orderBy(orderBy));
  }

  // If admin token present, decrypt sensitive fields in response
  const authHeader = req.headers.get("authorization");
  const isAdmin = authHeader?.startsWith("Bearer ") && false; // TODO: verify token role

  const snapshot = await getDocs(q);
  const products: Record<string, unknown>[] = [];

  for (const snap of snapshot.docs) {
    const data = snap.data();
    const product: Record<string, unknown> = { id: snap.id, ...data };

    if (isAdmin) {
      // Decrypt sensitive fields for admin
      if (data.encryptedDescription) {
        try { product.encryptedDescription = decrypt(data.encryptedDescription as string); } catch { /* skip */ }
      }
      if (data.specifications) {
        try { product.specifications = decrypt(data.specifications as string); } catch { /* skip */ }
      }
    }

    products.push(product);
  }

  return NextResponse.json(products);
}

// ── POST create product (admin only — TODO: auth guard) ────────────────────

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const body = await req.json();

  // Validate required fields
  if (!body.name || !body.price) {
    return NextResponse.json({ error: "name and price are required" }, { status: 400 });
  }

  // Encrypt sensitive fields if provided as plaintext
  const productData: Record<string, unknown> = {
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (body.specifications) {
    productData.specifications = encrypt(body.specifications);
  }

  delete (productData as Record<string, unknown>)["encryptedDescription"]; // handle legacy

  const docRef = await addDoc(collection(db, "products"), productData);
  return NextResponse.json({ id: docRef.id, success: true });
}
