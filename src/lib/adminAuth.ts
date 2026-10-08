import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

/** Verify bearer token and require role === "admin" on the user's doc. Returns UID or an error response. */
export async function requireAdmin(req: NextRequest): Promise<string | NextResponse> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "Firebase admin not configured" }, { status: 500 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.firebase.sign_in_provider === "password") {
      return NextResponse.json({ error: "Verificación en dos pasos requerida" }, { status: 403 });
    }
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

/** Verify bearer token and require role === "socio" on the user's doc. Returns UID or an error response. */
export async function requireSocio(req: NextRequest): Promise<string | NextResponse> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "Firebase admin not configured" }, { status: 500 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.firebase.sign_in_provider === "password") {
      return NextResponse.json({ error: "Verificación en dos pasos requerida" }, { status: 403 });
    }
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    const role = userDoc.data()?.role;
    if (role !== "socio" && role !== "admin") {
      return NextResponse.json({ error: "Solo los socios pueden publicar productos" }, { status: 403 });
    }
    return decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

/** Verify bearer token and require the user to be admin or the creator of the product. Returns UID or an error response. */
export async function requireProductEditor(
  req: NextRequest,
  productId: string,
): Promise<string | NextResponse> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "Firebase admin not configured" }, { status: 500 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.firebase.sign_in_provider === "password") {
      return NextResponse.json({ error: "Verificación en dos pasos requerida" }, { status: 403 });
    }

    const product = await adminDb.collection("products").doc(productId).get();
    if (!product.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    const isAdmin = userDoc.data()?.role === "admin";
    if (!isAdmin && product.data()?.createdBy !== decoded.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}