"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ImagePlus, X } from "lucide-react";
import { getIdToken, type User } from "@/lib/auth";
import { uploadProductImage } from "@/lib/storage";
import { categories } from "@/data/products";
import SocioRequirements, { type Requirements } from "@/components/SocioRequirements";

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
  const [profile, setProfile] = useState<{ role: string; requirements: Requirements } | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getIdToken(user);
        const res = await fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setProfile(await res.json());
      } finally {
        setCheckingRole(false);
      }
    })();
  }, [user]);

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

        {checkingRole ? (
          <p className="mt-6 text-sm font-bold text-[var(--app-muted)]">Cargando...</p>
        ) : profile?.role === "comprador" ? (
          <div className="mt-4">
            <p className="text-sm font-bold text-[var(--app-text)]">
              Aún no puedes publicar. Para ser socio te falta completar:
            </p>
            <SocioRequirements requirements={profile.requirements} />
            <Link
              href="/configuracion"
              onClick={onClose}
              className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-[var(--app-text)] text-sm font-black text-[var(--app-bg)]"
            >
              Completar mis datos
            </Link>
          </div>
        ) : success ? (
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
              className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
            />
            <input
              placeholder="Tienda (opcional)"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
            />

            <input
              required={!isFree}
              disabled={isFree}
              placeholder={isFree ? "Gratis" : "Precio"}
              value={isFree ? "" : price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)] disabled:opacity-50"
            />

            <button
              type="button"
              aria-pressed={isFree}
              onClick={() => setIsFree((v) => !v)}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left ring-1 ring-[var(--app-border)] ${
                isFree ? "bg-[var(--brand-soft)]" : "bg-[var(--app-soft)]"
              }`}
            >
              <span>
                <span className="block text-sm font-black text-[var(--app-text)]">
                  Donación (gratis)
                </span>
                <span className="block text-xs font-bold text-[var(--app-muted)]">
                  El producto se publica sin precio
                </span>
              </span>
              <span
                className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
                  isFree ? "bg-[var(--brand)]" : "bg-[var(--app-border)]"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-white transition ${
                    isFree ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </span>
            </button>

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
              <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[var(--brand)] bg-[var(--app-soft)] px-4 py-6 text-center">
                <ImagePlus size={28} className="text-[var(--brand)]" />
                <span className="text-sm font-black text-[var(--app-text)]">
                  {file ? file.name : "Toca para subir una imagen"}
                </span>
                <span className="text-xs font-bold text-[var(--app-muted)]">Máximo 5 MB</span>
                <input
                  type="file"
                  accept="image/*"
                  required
                  className="sr-only"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
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