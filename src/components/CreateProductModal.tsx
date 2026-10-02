"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { getIdToken, type User } from "@/lib/auth";
import { uploadProductImage } from "@/lib/storage";
import { categories } from "@/data/products";

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
  const [isFree, setIsFree] = useState(false);
  const [category, setCategory] = useState(categories[1]);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !file) return;
    setLoading(true);
    setError("");

    try {
      const token = await getIdToken(user);
      const image = await uploadProductImage(file, token);

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          store,
          price: isFree ? "Gratis" : price,
          donation: isFree,
          tag: category,
          image,
          tone: "from-slate-100 to-slate-50",
          specifications: description || undefined,
          expirationDate: expirationDate || undefined,
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
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[1.5rem] bg-[var(--app-surface)] p-6 shadow-2xl">
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

            <input
              required={!isFree}
              disabled={isFree}
              placeholder={isFree ? "Gratis" : "Precio"}
              value={isFree ? "" : price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] disabled:opacity-50"
            />
            <label className="flex items-center gap-2 text-sm font-bold text-[var(--app-text)]">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              Donación (gratis)
            </label>

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
              <p className="mb-2 text-xs font-bold text-[var(--app-muted)]">Imagen</p>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm font-bold text-[var(--app-muted)]"
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-bold text-[var(--app-muted)]">
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