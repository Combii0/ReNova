"use client";

import { useState } from "react";
import { categories } from "@/data/products";
import { useFirestoreProducts } from "@/lib/useFirestoreProducts";
import { useCart } from "@/lib/useCart";
import type { Product } from "@/types/products";
import ProductDetailModal from "@/components/ProductDetailModal";

export default function Home() {
  const { products, loading, error } = useFirestoreProducts();
  const { addToCart, isInCart } = useCart();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selected, setSelected] = useState<Product | null>(null);

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center">
        <p className="text-sm font-semibold text-[var(--app-muted)]">Cargando...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center">
        <p className="text-sm font-semibold text-rose-600">{error}</p>
      </main>
    );
  }

  const visibleProducts =
    activeCategory === "Todos"
      ? products
      : products.filter((p) => p.tag === activeCategory);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="rounded-2xl bg-[var(--brand)] p-6 text-white sm:p-8">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">ReNova Express</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Compra y venta local</h1>
          <p className="mt-2 text-sm text-white/90">Encuentra o publica articulos disponibles.</p>
          <div className="mt-6 flex gap-3">
            <button className="h-10 rounded-full bg-white px-5 text-sm font-bold text-[var(--brand)]">
              Ver productos
            </button>
            <button className="h-10 rounded-full border border-white/40 px-5 text-sm font-bold text-white">
              Tiendas
            </button>
          </div>
        </div>
      </section>

      <nav className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`h-9 shrink-0 rounded-full px-4 text-xs font-bold transition ${
              activeCategory === cat
                ? "bg-[var(--app-text)] text-[var(--app-bg)]"
                : "bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-soft)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </nav>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-[var(--app-text)]">Disponibles</h2>
        <span className="text-xs text-[var(--app-muted)]">{visibleProducts.length} productos</span>
      </div>

      {visibleProducts.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--app-muted)]">
          No hay productos en esta categoria.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((p) => {
            const inCart = p.id ? isInCart(p.id) : false;
            const price = "$" + Number(p.price?.replace(/\D/g, "") || 0).toLocaleString("es-CO");

            return (
              <article
                key={p.id ?? p.name}
                onClick={() => setSelected(p)}
                className="cursor-pointer overflow-hidden rounded-xl bg-[var(--app-surface)] ring-1 ring-[var(--app-border)]"
              >
                <div className={`relative flex aspect-[4/3] items-center justify-center ${p.tone}`}>
                  {p.image?.startsWith("http") ? (
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-[var(--app-muted)]">Sin imagen</span>
                  )}

                  <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[var(--brand)]">
                    {p.tag}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (p.id) addToCart(p.id);
                    }}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-black"
                  >
                    {inCart ? "x" : "+"}
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-[var(--app-text)]">{p.name}</h3>
                      <p className="truncate text-xs text-[var(--app-muted)]">{p.store}</p>
                    </div>
                    {p.rating && (
                      <span className="text-xs font-bold text-[var(--app-muted)]">{p.rating} / 5</span>
                    )}
                  </div>

                  <div className="mt-3 flex items-baseline justify-between text-sm font-bold">
                    <span>{p.donation ? "Donacion" : price}</span>
                    {p.expirationDate && (
                      <span className="text-xs font-normal text-[var(--app-muted)]">
                        {p.expirationDate}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selected && (
        <ProductDetailModal product={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}