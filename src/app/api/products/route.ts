
import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { encrypt, decrypt } from "@/lib/crypto";
import { getAdminAuth } from "@/lib/firebaseAdmin";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Verify bearer token; returns decoded UID or a 401 response. */
async function requireAuth(req: NextRequest): Promise<string | NextResponse> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return NextResponse.json({ error: "Firebase admin not configured" }, { status: 500 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.uid) return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    return decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

// ── GET all products (public list, optional admin decrypt) ──────────────────

export async function GET(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const searchParams = req.nextUrl.searchParams;
  const orderField = searchParams.get("orderBy");

  let q = query(collection(db, "products"));
  if (orderField) {
    q = query(q, orderBy(orderField as string));
  }

  // Determine whether admin token is present (TODO: implement role check)
  const authHeader = req.headers.get("authorization");
  let isAdmin = authHeader?.startsWith("Bearer ");

  if (isAdmin) {
    const adminAuth = getAdminAuth();
    if (adminAuth) {
      try {
        const token = authHeader!.replace(/^Bearer\s+/i, "");
        await adminAuth.verifyIdToken(token);
      } catch {
        // Token invalid or expired, treat as non-admin
        isAdmin = false;
      }
    }
  }

  if (isAdmin) {
    const adminAuth = getAdminAuth();
    if (adminAuth) {
      try {
        const token = authHeader!.replace(/^Bearer\s+/i, "");
        await adminAuth.verifyIdToken(token);
      } catch {
        // Token invalid or expired, treat as non-admin
        isAdmin = false;
      }
    }
  }

  const snapshot = await getDocs(q);
  const products: Record<string, unknown>[] = [];

  for (const snap of snapshot.docs as QueryDocumentSnapshot<Record<string, unknown>>[]) {
    const data = snap.data();
    const product: Record<string, unknown> = { id: snap.id, ...data };

    if (isAdmin) {
      // Decrypt sensitive fields for admin view
      if (data.encryptedDescription) {
        try {
          product.encryptedDescription = decrypt(data.encryptedDescription as string);
        } catch {
          /* skip */
        }
      }
      if (data.specifications) {
        try {
          product.specifications = decrypt(data.specifications as string);
        } catch {
          /* skip */
        }
      }
    }

    products.push(product);
  }

  return NextResponse.json(products);
}

// ── POST create product (admin only) ───────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const uid = await requireAuth(req);
  if (typeof uid === "object") return uid; // already a 401 response

  const body = await req.json();

  if (!body.name || !body.price) {
    return NextResponse.json({ error: "name and price are required" }, { status: 400 });
  }

  const productData: Record<string, unknown> = {
    ...body,
    name: body.name.trim(),
    createdBy: uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (body.specifications) {
    productData.specifications = encrypt(body.specifications);
  }

  delete productData["encryptedDescription"]; // legacy

  const docRef = await addDoc(collection(db, "products"), productData);
  return NextResponse.json({ id: docRef.id, success: true });
}
