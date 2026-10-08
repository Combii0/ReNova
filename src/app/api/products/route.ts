import { NextRequest, NextResponse } from "next/server";
import type { Query } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { encrypt, decrypt } from "@/lib/crypto";
import { requireSocio } from "@/lib/adminAuth";

// Fecha de hoy en Colombia con formato YYYY-MM-DD
function todayCo() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}

// ── GET all products (público, admin ve campos decriptados) ────────────────
// ?mine=1 devuelve solo los productos del usuario autenticado (con campos decriptados)

export async function GET(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const orderField = req.nextUrl.searchParams.get("orderBy");
  const mine = req.nextUrl.searchParams.get("mine") === "1";
  let queryRef: Query = adminDb.collection("products");
  if (orderField) queryRef = queryRef.orderBy(orderField);

  const authHeader = req.headers.get("authorization");
  let isAdmin = false;
  let userId: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const adminAuth = getAdminAuth();
    if (adminAuth) {
      try {
        const decoded = await adminAuth.verifyIdToken(authHeader.replace(/^Bearer\s+/i, ""));
        userId = decoded.firebase.sign_in_provider !== "password" ? decoded.uid : null;
        const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
        isAdmin = userDoc.data()?.role === "admin" && userId !== null;
      } catch {
        isAdmin = false;
        userId = null;
      }
    }
  }

  if (mine) {
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    queryRef = queryRef.where("createdBy", "==", userId);
  }

  const snapshot = await queryRef.get();
  const products: Record<string, unknown>[] = [];
  const today = todayCo();
  const expired = [];

  for (const snap of snapshot.docs) {
    const data = snap.data();

    // Producto vencido: se elimina y no se devuelve
    if (data.expirationDate && data.expirationDate < today) {
      expired.push(snap.ref);
      continue;
    }

    const product: Record<string, unknown> = { id: snap.id, ...data };

    if (isAdmin || mine) {
      if (data.encryptedDescription) {
        try { product.encryptedDescription = decrypt(data.encryptedDescription as string); } catch { /* skip */ }
      }
      if (data.specifications) {
        try { product.specifications = decrypt(data.specifications as string); } catch { /* skip */ }
      }
    }

    products.push(product);
  }

  if (expired.length > 0) {
    const batch = adminDb.batch();
    expired.forEach((ref) => batch.delete(ref));
    await batch.commit();
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

  // Fecha de vencimiento (opcional): debe ser una fecha real y no estar en el pasado
  if (body.expirationDate) {
    const date = String(body.expirationDate);
    const parsed = new Date(date);
    const validDate = !isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
    if (!validDate) {
      return NextResponse.json({ error: "Fecha de vencimiento no válida" }, { status: 400 });
    }
    if (date < todayCo()) {
      return NextResponse.json({ error: "La fecha de vencimiento no puede ser anterior a hoy" }, { status: 400 });
    }
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