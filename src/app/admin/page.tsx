"use client";

import { useEffect, useState } from "react";
import { useUser, getIdToken } from "@/lib/auth";
import type { Product } from "@/types/products";

type AdminUser = {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "user";
  phone?: string;
};

export default function AdminPage() {
  const user = useUser();
  const [tab, setTab] = useState<"products" | "users">("products");
  const [products, setProducts] = useState<(Product & { id: string })[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const token = await getIdToken(user);
        const [productsRes, usersRes] = await Promise.all([
          fetch("/api/products", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!productsRes.ok || !usersRes.ok) {
          throw new Error("No tienes permisos de administrador");
        }

        setProducts(await productsRes.json());
        setUsers(await usersRes.json());
      } catch (err: unknown) {
        setError((err as Error).message || "Error al cargar el panel");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function deleteProduct(id: string) {
    const token = await getIdToken(user);
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function updateRole(uid: string, role: "admin" | "user") {
    const token = await getIdToken(user);
    const res = await fetch(`/api/users/${uid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
    }
  }

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <p className="text-sm font-bold text-[var(--app-muted)]">
          Inicia sesión para ver el panel de administración.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-[var(--app-text)]">Panel de administración</h1>

      <div className="mt-5 flex gap-3">
        <button
          className={`h-10 rounded-full px-4 text-sm font-black ${
            tab === "products" ? "bg-[var(--app-text)] text-[var(--app-bg)]" : "bg-[var(--app-soft)]"
          }`}
          onClick={() => setTab("products")}
        >
          Productos
        </button>
        <button
          className={`h-10 rounded-full px-4 text-sm font-black ${
            tab === "users" ? "bg-[var(--app-text)] text-[var(--app-bg)]" : "bg-[var(--app-soft)]"
          }`}
          onClick={() => setTab("users")}
        >
          Usuarios
        </button>
      </div>

      {loading && <p className="mt-5 text-sm font-bold text-[var(--app-muted)]">Cargando...</p>}
      {error && <p className="mt-5 text-sm font-bold text-red-500">{error}</p>}

      {!loading && !error && tab === "products" && (
        <div className="mt-5 space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-2xl bg-[var(--app-surface)] p-4 shadow-sm ring-1 ring-[var(--app-border)]"
            >
              <div>
                <p className="font-black text-[var(--app-text)]">{product.name}</p>
                <p className="text-sm font-bold text-[var(--app-muted)]">{product.store} · {product.price}</p>
              </div>
              <button
                onClick={() => deleteProduct(product.id)}
                className="rounded-full bg-red-500/10 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-500/20"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && tab === "users" && (
        <div className="mt-5 space-y-3">
          {users.map((u) => (
            <div
              key={u.uid}
              className="flex items-center justify-between rounded-2xl bg-[var(--app-surface)] p-4 shadow-sm ring-1 ring-[var(--app-border)]"
            >
              <div>
                <p className="font-black text-[var(--app-text)]">{u.displayName}</p>
                <p className="text-sm font-bold text-[var(--app-muted)]">{u.email}</p>
              </div>
              <select
                value={u.role}
                onChange={(e) => updateRole(u.uid, e.target.value as "admin" | "user")}
                className="rounded-full bg-[var(--app-soft)] px-3 py-2 text-sm font-bold"
              >
                <option value="user">Usuario</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}