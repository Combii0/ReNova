"use client";

import { useEffect, useState } from "react";
import { useUser, getIdToken } from "@/lib/auth";
import CreateProductModal from "@/components/CreateProductModal";
import type { Product } from "@/types/products";

type SellerOrder = {
  id: string;
  buyerName?: string;
  status: string;
  total: number;
  items: { productId: string; name: string; quantity: number }[];
};

const card = "rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)]";
const note = "mt-6 text-sm font-bold text-[var(--app-muted)]";

export default function MySales() {
  const user = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const token = await getIdToken(user);
      const headers = { Authorization: `Bearer ${token}` };
      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/products?mine=1", { headers }),
        fetch("/api/orders?as=seller", { headers }),
      ]);
      if (productsRes.ok) setProducts(await productsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      setLoading(false);
    })();
  }, [user]);

  if (!user) return <p className={note}>Inicia sesión para ver tu tienda.</p>;
  if (loading) return <p className={note}>Cargando...</p>;
  if (products.length === 0) return <p className={note}>Aún no has subido productos.</p>;

  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className={card}>
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
          Publicaciones
        </p>
        <h2 className="mt-1 text-2xl font-black text-[var(--app-text)]">
          Mis productos
        </h2>
        <div className="mt-5 space-y-3">
          {products.map((p) => (
            <article
              key={p.id}
              className="flex items-center justify-between rounded-2xl bg-[var(--app-soft)] p-4"
            >
              <div>
                <p className="font-black text-[var(--app-text)]">{p.name}</p>
                <p className="text-xs font-bold text-[var(--app-muted)]">{p.price}</p>
              </div>
              <button
                onClick={() => setEditing(p)}
                className="rounded-full bg-[var(--app-text)] px-4 py-2 text-xs font-black text-[var(--app-bg)]"
              >
                Editar
              </button>
            </article>
          ))}
        </div>
      </div>

      <div className={card}>
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
          Ventas
        </p>
        <h2 className="mt-1 text-2xl font-black text-[var(--app-text)]">
          Pedidos recibidos
        </h2>
        <div className="mt-5 space-y-3">
          {orders.length === 0 && (
            <p className="text-sm font-bold text-[var(--app-muted)]">
              Aún no tienes pedidos.
            </p>
          )}
          {orders.map((o) => (
            <article key={o.id} className="rounded-2xl bg-[var(--app-soft)] p-4">
              <p className="font-black text-[var(--app-text)]">
                {o.buyerName || "Comprador"}
              </p>
              <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">
                {o.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
              </p>
            </article>
          ))}
        </div>
      </div>

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