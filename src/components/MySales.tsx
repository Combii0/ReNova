"use client";

import { useEffect, useState } from "react";
import { useUser, getIdToken } from "@/lib/auth";
import { markOrdersRead } from "@/lib/orders";
import CreateProductModal from "@/components/CreateProductModal";
import type { Product } from "@/types/products";

type SellerOrder = {
  id: string;
  buyerName?: string;
  buyerRating?: { avg: number; count: number };
  status: string;
  total: number;
  createdAt: string;
  unreadSeller?: boolean;
  items: { productId: string; name: string; quantity: number }[];
};

const card = "rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)]";
const note = "mt-6 text-sm font-bold text-[var(--app-muted)]";
const redDot = "h-2.5 w-2.5 shrink-0 rounded-full bg-red-500";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
};

const isFor = (order: SellerOrder, productId?: string) =>
  order.items.some((i) => i.productId === productId);

export default function MySales() {
  const user = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    (async () => {
      const token = await getIdToken(user);
      const headers = { Authorization: `Bearer ${token}` };
      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/products?mine=1", { headers }),
        fetch("/api/orders?as=seller", { headers }),
      ]);
      const loadedProducts: Product[] = productsRes.ok ? await productsRes.json() : [];
      const loadedOrders: SellerOrder[] = ordersRes.ok ? await ordersRes.json() : [];

      // las solicitudes de productos que ya no existen se ven de inmediato: se marcan como vistas
      const orphanUnread = productsRes.ok
        ? loadedOrders
            .filter((o) => o.unreadSeller && !loadedProducts.some((p) => isFor(o, p.id)))
            .map((o) => o.id)
        : [];
      await markOrdersRead(token, orphanUnread);

      setProducts(loadedProducts);
      setOrders(
        loadedOrders.map((o) => (orphanUnread.includes(o.id) ? { ...o, unreadSeller: false } : o)),
      );
      setLoading(false);
    })();
  }, [user]);

  // solicitudes de un producto, la más antigua primero
  const requestsFor = (productId?: string) =>
    orders
      .filter((o) => isFor(o, productId))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const orphanOrders = orders.filter((o) => !products.some((p) => isFor(o, p.id)));

  async function openProduct(productId: string) {
    const next = openId === productId ? null : productId;
    setOpenId(next);
    if (!next) return;

    // al abrir el producto sus solicitudes quedan vistas
    const unseen = requestsFor(productId).filter((o) => o.unreadSeller).map((o) => o.id);
    if (unseen.length === 0) return;

    await markOrdersRead(await getIdToken(user), unseen);
    setOrders((prev) => prev.map((o) => (unseen.includes(o.id) ? { ...o, unreadSeller: false } : o)));
  }

  async function changeStatus(id: string, status: "accepted" | "rejected" | "cancelled") {
    setError("");
    const token = await getIdToken(user);
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo actualizar la solicitud");
      return;
    }

    const order = orders.find((o) => o.id === id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

    // al aceptar se reserva el producto del pedido, al cancelar se libera
    if (status !== "rejected") {
      setProducts((prev) =>
        prev.map((p) =>
          order && isFor(order, p.id)
            ? { ...p, reservedOrderId: status === "accepted" ? id : undefined }
            : p,
        ),
      );
    }
  }

  // lockedText: motivo por el que no se puede aceptar (solo queda Rechazar)
  function renderRequest(o: SellerOrder, lockedText?: string) {
    const active = o.status === "pending" || o.status === "accepted";

    return (
      <article
        key={o.id}
        className={`rounded-2xl bg-[var(--app-surface)] p-4 ${active ? "" : "opacity-60"}`}
      >
        <p className="font-black text-[var(--app-text)]">
          {o.buyerName || "Comprador"}
          {o.buyerRating && (
            <span className="ml-2 text-xs font-bold text-amber-700">
              ★ {o.buyerRating.avg.toFixed(1)} ({o.buyerRating.count})
            </span>
          )}
        </p>
        <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">
          {new Date(o.createdAt).toLocaleDateString("es-CO")} ·{" "}
          {o.items.map((i) => i.name).join(", ")}
        </p>

        {o.status === "pending" && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {lockedText ? (
              <p className="text-xs font-bold text-[var(--app-muted)]">{lockedText}</p>
            ) : (
              <button
                onClick={() => changeStatus(o.id, "accepted")}
                className="rounded-full bg-[var(--app-text)] px-4 py-2 text-xs font-black text-[var(--app-bg)]"
              >
                Aceptar
              </button>
            )}
            <button
              onClick={() => changeStatus(o.id, "rejected")}
              className="rounded-full bg-red-500/10 px-4 py-2 text-xs font-black text-red-600"
            >
              Rechazar
            </button>
          </div>
        )}

        {o.status !== "pending" && (
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase text-[var(--brand)]">
              {statusLabels[o.status] ?? o.status}
            </p>
            {o.status === "accepted" && (
              <button
                onClick={() => changeStatus(o.id, "cancelled")}
                className="rounded-full bg-red-500/10 px-4 py-2 text-xs font-black text-red-600"
              >
                Cancelar
              </button>
            )}
          </div>
        )}
      </article>
    );
  }

  if (!user) return <p className={note}>Inicia sesión para ver tu tienda.</p>;
  if (loading) return <p className={note}>Cargando...</p>;

  return (
    <section className="mt-6 space-y-6">
      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

      <div className={card}>
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
          Publicaciones
        </p>
        <h2 className="mt-1 text-2xl font-black text-[var(--app-text)]">
          Mis productos
        </h2>
        <div className="mt-5 space-y-3">
          {products.length === 0 && (
            <p className="text-sm font-bold text-[var(--app-muted)]">
              Aún no has subido productos.
            </p>
          )}
          {products.map((p) => {
            const requests = requestsFor(p.id);
            const active = requests.filter((o) => o.status === "pending" || o.status === "accepted");
            const history = requests.filter((o) => o.status !== "pending" && o.status !== "accepted");
            const isOpen = openId === p.id;

            return (
              <article key={p.id} className="rounded-2xl bg-[var(--app-soft)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => openProduct(p.id!)}
                    aria-expanded={isOpen}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="flex items-center gap-2 font-black text-[var(--app-text)]">
                      <span className="truncate">{p.name}</span>
                      {requests.some((o) => o.unreadSeller) && <span className={redDot} />}
                    </p>
                    <p className="text-xs font-bold text-[var(--app-muted)]">{p.price}</p>
                    <p className="mt-1 text-xs font-black uppercase text-[var(--brand)]">
                      {p.reservedOrderId ? "Reservado" : "Disponible"} · {active.length}{" "}
                      {active.length === 1 ? "solicitud" : "solicitudes"}
                    </p>
                  </button>
                  <button
                    onClick={() => setEditing(p)}
                    className="rounded-full bg-[var(--app-text)] px-4 py-2 text-xs font-black text-[var(--app-bg)]"
                  >
                    Editar
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-4 space-y-3">
                    {active.length === 0 && (
                      <p className="text-sm font-bold text-[var(--app-muted)]">
                        Aún no tienes solicitudes para este producto.
                      </p>
                    )}
                    {active.map((o) =>
                      renderRequest(
                        o,
                        p.reservedOrderId && p.reservedOrderId !== o.id
                          ? "En diálogo con otro comprador"
                          : undefined,
                      ),
                    )}
                    {history.length > 0 && (
                      <>
                        <p className="pt-2 text-xs font-bold uppercase tracking-wide text-[var(--app-muted)]">
                          Historial
                        </p>
                        {history.map((o) => renderRequest(o))}
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {orphanOrders.length > 0 && (
        <div className={card}>
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
            Otras solicitudes
          </p>
          <h2 className="mt-1 text-2xl font-black text-[var(--app-text)]">
            Productos que ya no están
          </h2>
          <div className="mt-5 space-y-3">
            {orphanOrders
              .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
              .map((o) => renderRequest(o, "El producto ya no está disponible"))}
          </div>
        </div>
      )}

      {editing && (
        <CreateProductModal
          user={user}
          product={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}