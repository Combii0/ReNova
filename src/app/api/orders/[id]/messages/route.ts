import { NextRequest, NextResponse } from "next/server";
import type { DocumentData, DocumentReference } from "firebase-admin/firestore";
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
async function checkAccess(
  orderRef: DocumentReference,
  userId: string,
): Promise<NextResponse | { order: DocumentData; isSeller: boolean }> {
  const order = (await orderRef.get()).data();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isSeller = !!order.sellerIds?.includes(userId);
  if (order.userId !== userId && !isSeller) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.status !== "accepted") {
    return NextResponse.json({ error: "El chat solo está disponible en solicitudes aceptadas" }, { status: 409 });
  }
  return { order, isSeller };
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
  const access = await checkAccess(orderRef, userId);
  if (access instanceof NextResponse) return access;
  const { order, isSeller } = access;

  // los últimos 100 mensajes, del más antiguo al más reciente
  const snapshot = await orderRef
    .collection("messages")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  // cuándo leyó el otro usuario por última vez (para marcar "Visto")
  const otherSeenAt: string = (isSeller ? order.chatSeenBuyer : order.chatSeenSeller) ?? "";

  const messages = snapshot.docs.reverse().map((snap) => {
    const data = snap.data();
    const mine = data.senderId === userId;

    let text = "";
    if (data.encryptedText) {
      try { text = decrypt(data.encryptedText as string); } catch { text = "[mensaje no disponible]"; }
    }
    let image: string | undefined;
    if (data.encryptedImage) {
      try { image = decrypt(data.encryptedImage as string); } catch { /* sin imagen */ }
    }

    return {
      id: snap.id,
      text,
      image,
      mine,
      seen: mine && otherSeenAt >= data.createdAt,
      createdAt: data.createdAt,
    };
  });

  // al leer se apaga el aviso de este usuario y queda como "Visto" para el otro
  const unreadField = isSeller ? "unreadChatSeller" : "unreadChatBuyer";
  const seenField = isSeller ? "chatSeenSeller" : "chatSeenBuyer";
  if (order[unreadField]) {
    await orderRef.update({ [unreadField]: false, [seenField]: new Date().toISOString() });
  }

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
  const access = await checkAccess(orderRef, userId);
  if (access instanceof NextResponse) return access;
  const { isSeller } = access;

  const { text, image } = await req.json();
  const message = typeof text === "string" ? text.trim() : "";
  if (message.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: `El mensaje no puede tener más de ${MAX_LENGTH} caracteres` },
      { status: 400 },
    );
  }

  // solo el vendedor envía imágenes, y solo las subidas a nuestro Cloudinary
  if (image) {
    if (!isSeller) {
      return NextResponse.json({ error: "Solo el vendedor puede enviar imágenes" }, { status: 403 });
    }
    const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
    if (typeof image !== "string" || !image.startsWith(prefix)) {
      return NextResponse.json({ error: "Imagen no válida" }, { status: 400 });
    }
  }

  if (!message && !image) {
    return NextResponse.json({ error: "El mensaje no puede estar vacío" }, { status: 400 });
  }

  const createdAt = new Date().toISOString();
  const docRef = await orderRef.collection("messages").add({
    senderId: userId,
    ...(message ? { encryptedText: encrypt(message) } : {}),
    ...(image ? { encryptedImage: encrypt(image) } : {}),
    createdAt,
  });

  // el otro usuario tiene un mensaje sin leer
  await orderRef.update({ [isSeller ? "unreadChatBuyer" : "unreadChatSeller"]: true });

  return NextResponse.json({
    id: docRef.id,
    text: message,
    image: image || undefined,
    mine: true,
    seen: false,
    createdAt,
  });
}