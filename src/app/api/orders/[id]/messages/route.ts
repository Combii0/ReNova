import { NextRequest, NextResponse } from "next/server";
import type { DocumentReference } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { encrypt, decrypt } from "@/lib/crypto";

const MAX_LENGTH = 500;

async function requireUserId(req: NextRequest): Promise<string | NextResponse> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminAuth = getAdminAuth();
  if (!adminAuth) return NextResponse.json({ error: "Firebase admin not configured" }, { status: 500 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.firebase.sign_in_provider === "password") {
      return NextResponse.json({ error: "Verificación en dos pasos requerida" }, { status: 403 });
    }
    return decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

// Solo el comprador o el vendedor del pedido, y solo si el pedido está aceptado
async function checkAccess(orderRef: DocumentReference, userId: string): Promise<NextResponse | null> {
  const order = (await orderRef.get()).data();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant = order.userId === userId || order.sellerIds?.includes(userId);
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (order.status !== "accepted") {
    return NextResponse.json({ error: "El chat solo está disponible en solicitudes aceptadas" }, { status: 409 });
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId;

  const { id } = await params;
  const orderRef = adminDb.collection("orders").doc(id);
  const denied = await checkAccess(orderRef, userId);
  if (denied) return denied;

  // los últimos 100 mensajes, del más antiguo al más reciente
  const snapshot = await orderRef
    .collection("messages")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  const messages = snapshot.docs.reverse().map((snap) => {
    const data = snap.data();
    let text = "[mensaje no disponible]";
    try { text = decrypt(data.encryptedText as string); } catch { /* keep placeholder */ }
    return { id: snap.id, text, mine: data.senderId === userId, createdAt: data.createdAt };
  });

  return NextResponse.json(messages);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId;

  const { id } = await params;
  const orderRef = adminDb.collection("orders").doc(id);
  const denied = await checkAccess(orderRef, userId);
  if (denied) return denied;

  const { text } = await req.json();
  const message = typeof text === "string" ? text.trim() : "";
  if (!message || message.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: `El mensaje debe tener entre 1 y ${MAX_LENGTH} caracteres` },
      { status: 400 },
    );
  }

  const createdAt = new Date().toISOString();
  const docRef = await orderRef.collection("messages").add({
    senderId: userId,
    encryptedText: encrypt(message),
    createdAt,
  });

  return NextResponse.json({ id: docRef.id, text: message, mine: true, createdAt });
}