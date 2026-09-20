"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { getIdToken, type User } from "@/lib/auth";
import { categories } from "@/data/products";

const emojiOptions = ["🥬", "🥗", "🍔", "☕", "💊", "📱", "🧴", "📦", "🍓", "🥦"];

export default function CreateProductModal({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [store, setStore] = useState("");
  const [price, setPrice] = useState("");
  const [before, setBefore] = useState("");
  const [category, setCategory] = useState(categories[1]);
  const [image, setImage] = useState(emojiOptions[0]);
  const [description, setDescription] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = await getIdToken(user);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          store,
          price,
          before,
          tag: category,
          rating: "5.0",
          image,
          tone: "from-slate-100 to-slate-50",
          specifications: description || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo crear el producto");

      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error).message || "No se pudo crear el producto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-md rounded-[1.5rem] bg-[var(--app-surface)] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[var(--app-text)]">Subir producto</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-[var(--app-soft)]" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm font-bold text-[var(--app-text)]">
              Producto creado. Recarga la página principal para verlo.
            </p>
            <button
              onClick={onClose}
              className="h-11 w-full rounded-full bg-[var(--app-text)] text-sm font-black text-[var(--app-bg)]"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              required
              placeholder="Nombre del producto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)]"
            />
            <input
              placeholder="Tienda"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="Precio"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)]"
              />
              <input
                placeholder="Precio original"
                value={before}
                onChange={(e) => setBefore(e.target.value)}
                className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)]"
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-bold text-[var(--app-muted)]">Categoría</p>
              <div className="flex flex-wrap gap-2">
                {categories
                  .filter((c) => c !== "Todos")
                  .map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`h-9 rounded-full px-3 text-xs font-black ring-1 ring-[var(--app-border)] ${
                        category === cat
                          ? "bg-[var(--app-text)] text-[var(--app-bg)]"
                          : "bg-[var(--app-soft)] text-[var(--app-text)]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold text-[var(--app-muted)]">Icono</p>
              <div className="flex flex-wrap gap-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setImage(emoji)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ring-1 ring-[var(--app-border)] ${
                      image === emoji ? "bg-[var(--brand)]" : "bg-[var(--app-soft)]"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p 
                className="mb-2 text-xs font-bold text-[var(--app-muted)]">
                  Descripción breve (opcional)
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-bold text-[var(--app-muted)]">
                Fecha de vencimiento (opcional)
              </p>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)]"
              />
            </div>

            {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-full bg-[var(--app-text)] text-sm font-black text-[var(--app-bg)] disabled:opacity-50"
            >
              {loading ? "Creando..." : "Crear producto"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}