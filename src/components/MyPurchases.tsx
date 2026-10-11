"use client";

import { useEffect, useState } from "react";
import { useUser, getIdToken } from "@/lib/auth";

type Purchase = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: { name: string; quantity: number }[];
};

const note = "mt-6 text-sm font-bold text-[var(--app-muted)]";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
};

export default function MyPurchases() {
  const user = useUser();
  const [orders, setOrders] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    (async () => {
      const token = await getIdToken(user);
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: Purchase[] = await res.json();
        setOrders(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      }
      setLoading(false);
    })();
  }, [user]);

  async function cancelOrder(id: string) {
    setError("");
    const token = await getIdToken(user);
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status: "cancelled" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo cancelar la solicitud");
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)));
  }

  if (!user) return <p className={note}>Inicia sesión para ver tus compras.</p>;
  if (loading) return <p className={note}>Cargando...</p>;
  if (orders.length === 0) return <p className={note}>Aún no has hecho compras.</p>;

  return (
    <div className="mt-6 space-y-3">
      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
      {orders.map((o) => (
        <article
          key={o.id}
          className="rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)]"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-black text-[var(--app-text)]">
              {new Date(o.createdAt).toLocaleDateString("es-CO")}
            </p>
            <span className="text-sm font-black text-[var(--brand)]">
              {"$" + Number(o.total).toLocaleString("es-CO")}
            </span>
          </div>
          <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">
            {o.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase text-[var(--brand)]">
              {statusLabels[o.status] ?? o.status}
            </p>
            {o.status === "accepted" && (
              <button
                onClick={() => cancelOrder(o.id)}
                className="rounded-full bg-red-500/10 px-4 py-2 text-xs font-black text-red-600"
              >
                Cancelar
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}