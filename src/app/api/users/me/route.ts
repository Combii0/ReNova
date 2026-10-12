import { NextRequest, NextResponse } from "next/server";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { encrypt, decrypt } from "@/lib/crypto";

function ageFromBirthDate(birthDate: string) {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  if (
    now.getUTCMonth() < birth.getUTCMonth() ||
    (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate())
  ) {
    age--;
  }
  return age;
}

function socioChecks(data?: Record<string, unknown>) {
  return {
    age: !!data?.birthDate && ageFromBirthDate(data.birthDate as string) >= 16,
    phone: !!data?.phone,
    address: !!data?.address,
  };
}

async function requireUserId(
  req: NextRequest,
  allowIfNoProfile = false,
): Promise<string | NextResponse> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminAuth = getAdminAuth();
  if (!adminAuth) return NextResponse.json({ error: "Firebase admin not configured" }, { status: 500 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);

    if (decoded.firebase.sign_in_provider === "password") {
      let canContinue = false;
      if (allowIfNoProfile) {
        const profile = await getAdminDb()?.collection("users").doc(decoded.uid).get();
        canContinue = !!profile && !profile.exists;
      }
      if (!canContinue) {
        return NextResponse.json({ error: "Verificación en dos pasos requerida" }, { status: 403 });
      }
    }

    return decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

// ── PATCH crea o actualiza el perfil (autenticado) ──────────────────────────
// allowIfNoProfile: el registro crea el perfil antes del primer código

export async function PATCH(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req, true);
  if (typeof userId === "object") return userId;

  const body = await req.json();
  const userRef = adminDb.collection("users").doc(userId);
  const existing = await userRef.get();

  const updateData: Record<string, unknown> = {};
  if (body.displayName) updateData.displayName = body.displayName;
  if (body.email) updateData.email = body.email;

  // Teléfono: celular colombiano (10 dígitos que empiezan por 3), se guarda como +57XXXXXXXXXX
  if (body.phone) {
    const digits = String(body.phone).replace(/\D/g, "").replace(/^57/, "");
    if (!/^3\d{9}$/.test(digits)) {
      return NextResponse.json({ error: "Teléfono no válido" }, { status: 400 });
    }
    updateData.phone = encrypt(`+57${digits}`);
  }

  if (body.birthDate) {
    const birth = new Date(body.birthDate);
    const validDate = !isNaN(birth.getTime()) && birth.toISOString().slice(0, 10) === body.birthDate;
    const age = validDate ? ageFromBirthDate(body.birthDate) : -1;
    if (age < 0 || age > 120) {
      return NextResponse.json({ error: "Fecha de nacimiento no válida" }, { status: 400 });
    }
    updateData.birthDate = body.birthDate;
  }

  // Dirección: se valida con Google y se guarda la que devuelve Google
  if (body.placeId) {
    const place = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(body.placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY!,
          "X-Goog-FieldMask": "formattedAddress,addressComponents",
        },
      },
    ).then((r) => (r.ok ? r.json() : null));

    const isColombia = place?.addressComponents?.some(
      (c: { types: string[]; shortText: string }) =>
        c.types.includes("country") && c.shortText === "CO",
    );
    if (!isColombia) {
      return NextResponse.json({ error: "Dirección no válida" }, { status: 400 });
    }
    updateData.address = encrypt(place.formattedAddress);
  }

  updateData.updatedAt = Timestamp.now();

  if (!existing.exists) {
    updateData.uid = userId;
    updateData.role = "comprador";
    updateData.createdAt = Timestamp.now();
  }

  // Pasa a socio: 16+ años, teléfono y dirección guardados
  const current = existing.data();
  const currentRole = current?.role ?? "comprador";
  const checks = socioChecks({ ...current, ...updateData });
  if (checks.age && checks.phone && checks.address && currentRole === "comprador") {
    updateData.role = "socio";
  }

  await userRef.set(updateData, { merge: true });
  return NextResponse.json({
    success: true,
    role: updateData.role ?? currentRole,
    requirements: checks,
  });
}

// ── GET perfil (autenticado) ─────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId;

  const docSnap = await adminDb.collection("users").doc(userId).get();
  if (!docSnap.exists) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const data = docSnap.data()!;
  const response: Record<string, unknown> = {
    uid: userId,
    email: data.email,
    displayName: data.displayName,
    role: data.role ?? "comprador",
    requirements: socioChecks(data),
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
  };

  if (data.age) response.age = data.age;
  if (data.birthDate) response.birthDate = data.birthDate;
  if (data.phone) {
    try { response.phone = decrypt(data.phone as string); } catch { response.phone = "[encrypted]"; }
  }
  if (data.address) {
    try { response.address = decrypt(data.address as string); } catch { response.address = "[encrypted]"; }
  }

  return NextResponse.json(response);
}

// ── DELETE elimina la cuenta, sus pedidos (con sus mensajes) y su perfil ─────

export async function DELETE(req: NextRequest) {
  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  const userId = await requireUserId(req);
  if (typeof userId === "object") return userId;

  const orders = await adminDb.collection("orders").where("userId", "==", userId).get();

  // los productos que estos pedidos tenían reservados vuelven a estar disponibles
  const release = adminDb.batch();
  for (const order of orders.docs) {
    const items = (order.data().items ?? []) as { productId: string }[];
    if (items.length === 0) continue;

    const products = await adminDb.getAll(
      ...items.map((i) => adminDb.collection("products").doc(i.productId)),
    );
    products.forEach((snap) => {
      if (snap.data()?.reservedOrderId === order.id) {
        release.update(snap.ref, { reservedOrderId: FieldValue.delete() });
      }
    });
  }
  await release.commit();

  // cada pedido se borra junto con su subcolección de mensajes
  await Promise.all(orders.docs.map((order) => adminDb.recursiveDelete(order.ref)));

  const batch = adminDb.batch();
  batch.delete(adminDb.collection("users").doc(userId));
  batch.delete(adminDb.collection("twoFactorCodes").doc(userId));
  await batch.commit();

  await adminAuth.deleteUser(userId);
  return NextResponse.json({ success: true });
}