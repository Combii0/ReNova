"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, getIdToken } from "@/lib/auth";

const tones = [
  { label: "Verde", value: "from-emerald-100 to-lime-50" },
  { label: "Naranja", value: "from-orange-100 to-amber-50" },
  { label: "Celeste", value: "from-sky-100 to-cyan-50" },
  { label: "Amarillo", value: "from-stone-100 to-yellow-50" },
  { label: "Morado", value: "from-violet-100 to-slate-50" },
  { label: "Rosa", value: "from-rose-100 to-orange-50" },
];

export default function PublishProductPage() {
  const router = useRouter();
  const user = useUser();

  const [name, setName] = useState("");
  const [store, setStore] = useState("");
  const [price, setPrice] = useState("");
  const [before, setBefore] = useState("");
  const [tag, setTag] = useState("Nuevo");
  const [image, setImage] = useState("📦");
  const [time, setTime] = useState("20 min");
  const [tone, setTone] = useState(tones[0].value);
  const [description, setDescription] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Debes iniciar sesión para publicar un producto.");
      return;
    }

    setLoading(true);
    try {
      const token = await getIdToken(user);

      const body: Record<string, unknown> = {
        name,
        store,
        price,
        tag,
        image,
        time,
        tone,
      };
      if (before) body.before = before;
      if (description) body.specifications = description;
      if (expirationDate) body.expirationDate = expirationDate;

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo publicar el producto");

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || "No se pudo publicar el producto");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <h1 className="text-2xl font-black text-[var(--app-text)]">Inicia sesión para publicar</h1>
        <p className="text-sm text-[var(--app-muted)]">
          Necesitas una cuenta para subir productos al market.
        </p>
        <Link
          href="/login"
          className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-black text-white shadow-sm hover:opacity-90"
        >
          Iniciar sesión
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">Vender</p>
        <h1 className="mt-1 text-3xl font-black text-[var(--app-text)]">Publicar producto</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-[1.5rem] bg-[var(--app-surface)] p-6 shadow-sm ring-1 ring-[var(--app-border)]"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
              Nombre
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
              placeholder="Canasta organica"
            />
          </div>
          <div>
            <label htmlFor="store" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
              Tienda
            </label>
            <input
              id="store"
              required
              value={store}
              onChange={(e) => setStore(e.target.value)}
              className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
              placeholder="Mercado Verde"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
              Precio
            </label>
            <input
              id="price"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
              placeholder="$42.900"
            />
          </div>
          <div>
            <label htmlFor="before" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
              Precio original (opcional)
            </label>
            <input
              id="before"
              value={before}
              onChange={(e) => setBefore(e.target.value)}
              className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
              placeholder="$51.000"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="tag" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
              Etiqueta
            </label>
            <input
              id="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)]"
            />
          </div>
          <div>
            <label htmlFor="image" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
              Icono
            </label>
            <input
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-center text-lg outline-none ring-1 focus:ring-[var(--brand)]"
            />
          </div>
          <div>
            <label htmlFor="time" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
              Tiempo entrega
            </label>
            <input
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)]"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-[var(--app-text)]">Color</label>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTone(t.value)}
                className={`h-10 rounded-full bg-gradient-to-br px-4 text-xs font-black text-zinc-700 ring-2 ${t.value} ${
                   tone === t.value ? "ring-[var(--brand)]" : "ring-transparent"
                 }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
            Descripción (opcional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
            placeholder="Detalles del producto"
          />
        </div>

        <div>
          <label htmlFor="expirationDate" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
            Fecha de vencimiento (opcional)
          </label>
          <input
            id="expirationDate"
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
          className="w-full rounded-full bg-[var(--app-text)] py-3 text-sm font-black text-[var(--app-bg)] shadow-sm transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Publicando..." : "Publicar producto"}
        </button>
      </form>
    </main>
  );
}