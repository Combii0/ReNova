import { NextRequest, NextResponse } from "next/server";
import type { Query } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { encrypt, decrypt } from "@/lib/crypto";
import { requireSocio } from "@/lib/adminAuth";

// ── GET all products (público, admin ve campos decriptados) ────────────────

export async function GET(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const orderField = req.nextUrl.searchParams.get("orderBy");
  let queryRef: Query = adminDb.collection("products");
  if (orderField) queryRef = queryRef.orderBy(orderField);

  const authHeader = req.headers.get("authorization");
  let isAdmin = false;

  if (authHeader?.startsWith("Bearer ")) {
    const adminAuth = getAdminAuth();
    if (adminAuth) {
      try {
        const decoded = await adminAuth.verifyIdToken(authHeader.replace(/^Bearer\s+/i, ""));
        const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
        isAdmin = userDoc.data()?.role === "admin";
      } catch {
        isAdmin = false;
      }
    }
  }

  const snapshot = await queryRef.get();
  const products: Record<string, unknown>[] = [];

  for (const snap of snapshot.docs) {
    const data = snap.data();
    const product: Record<string, unknown> = { id: snap.id, ...data };

    if (isAdmin) {
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

// ── POST create product (solo socios) ───────────────────────────────────────

export async function POST(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const uid = await requireSocio(req);
  if (typeof uid === "object") return uid;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.name || !body.price) {
    return NextResponse.json({ error: "name and price are required" }, { status: 400 });
  }

  const productData: Record<string, unknown> = {
    ...body,
    name: (body.name as string).trim(),
    createdBy: uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (body.specifications) {
    productData.specifications = encrypt(body.specifications as string);
  }
  delete productData["encryptedDescription"]; // legacy

  const docRef = await adminDb.collection("products").add(productData);
  return NextResponse.json({ id: docRef.id, success: true });
}