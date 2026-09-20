"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, getIdToken } from "@/lib/auth";
import { categories } from "@/data/products";

const emojiOptions = ["🥬", "🥗", "🍔", "☕", "💊", "📱", "🧴", "📦", "🍓", "🥦"];

export default function PublishProductPage() {
  const router = useRouter();
  const user = useUser();

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
        tag: category,
        image,
        tone: "from-slate-100 to-slate-50",
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

        <div>
          <label className="mb-1 block text-sm font-bold text-[var(--app-text)]">Categoría</label>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter((c) => c !== "Todos")
              .map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`h-10 rounded-full px-4 text-sm font-black ring-1 ring-[var(--app-border)] ${
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
          <label className="mb-1 block text-sm font-bold text-[var(--app-text)]">Icono</label>
          <div className="flex flex-wrap gap-2">
            {emojiOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setImage(emoji)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ring-1 ring-[var(--app-border)] ${
                  image === emoji ? "bg-[var(--brand)]" : "bg-[var(--app-soft)]"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
            Descripción breve (opcional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
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