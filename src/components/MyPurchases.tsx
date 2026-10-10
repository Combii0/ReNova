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
};

export default function MyPurchases() {
  const user = useUser();
  const [orders, setOrders] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (!user) return <p className={note}>Inicia sesión para ver tus compras.</p>;
  if (loading) return <p className={note}>Cargando...</p>;
  if (orders.length === 0) return <p className={note}>Aún no has hecho compras.</p>;

  return (
    <div className="mt-6 space-y-3">
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
          <p className="mt-2 text-xs font-black uppercase text-[var(--brand)]">
            {statusLabels[o.status] ?? o.status}
          </p>
        </article>
      ))}
    </div>
  );
}