"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { getIdToken, type User } from "@/lib/auth";

const toneOptions = [
  { value: "from-emerald-100 to-lime-50", label: "Verde" },
  { value: "from-orange-100 to-amber-50", label: "Naranja" },
  { value: "from-sky-100 to-cyan-50", label: "Azul" },
  { value: "from-stone-100 to-yellow-50", label: "Beige" },
  { value: "from-violet-100 to-slate-50", label: "Violeta" },
  { value: "from-rose-100 to-orange-50", label: "Rosa" },
  { value: "from-blue-100 to-indigo-50", label: "Indigo" },
  { value: "from-red-100 to-pink-50", label: "Rojo" },
];

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
  const [tag, setTag] = useState("Nuevo");
  const [time, setTime] = useState("20 min");
  const [image, setImage] = useState("📦");
  const [tone, setTone] = useState(toneOptions[0].value);
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
          tag,
          rating: "5.0",
          time,
          image,
          tone,
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
                placeholder="Precio ($42.900)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)]"
              />
              <input
                placeholder="Precio anterior"
                value={before}
                onChange={(e) => setBefore(e.target.value)}
                className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)]"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                placeholder="Etiqueta"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)]"
              />
              <input
                placeholder="Tiempo"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)]"
              />
              <input
                placeholder="Emoji"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-center text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)]"
              />
            </div>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)]"
            >
              {toneOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

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