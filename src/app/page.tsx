"use client";

import { useState } from "react";
import { Check, Pill, Plus, ShoppingBasket, Smartphone, Utensils } from "lucide-react";
import { useFirestoreProducts } from "@/lib/useFirestoreProducts";
import { useCart } from "@/lib/useCart";
import type { Product } from "@/types/products";
import ProductDetailModal from "@/components/ProductDetailModal";

const formatPrice = (price: string) =>
  "$" + Number(price.replace(/\D/g, "")).toLocaleString("es-CO");

export default function Home() {
  const { products, loading, error } = useFirestoreProducts();
  const { addToCart, isInCart } = useCart();
  const [selected, setSelected] = useState<Product | null>(null);

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
        <p className="text-sm font-bold text-[var(--app-muted)]">Cargando productos...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
        <p className="text-sm font-bold text-red-600">Error: {error}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-5 lg:px-6 xl:px-8">
      <section className="min-w-0">
        <div className="overflow-hidden rounded-[2rem] bg-[var(--brand)] text-white shadow-sm">
          <div className="grid gap-5 p-4 sm:p-6 md:grid-cols-[1.3fr_0.7fr] lg:p-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-white/80">
                ReNova Express
              </p>
              <h1 className="mt-3 max-w-xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Haz que cada objeto tenga una nueva historia...
              </h1>
              <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-white/85">
                ¡Dales otra vida hoy!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 self-end sm:gap-3">
              {[
                { icon: ShoppingBasket, label: "Mercado fresco" },
                { icon: Utensils, label: "Comida rapida" },
                { icon: Pill, label: "Farmacia" },
                { icon: Smartphone, label: "Tecnologia" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-3xl bg-white/16 p-3 sm:p-4">
                  <Icon size={30} />
                  <p className="mt-4 text-sm font-bold">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
            Productos subidos
          </p>
          <h2 className="mt-1 text-2xl font-black text-[var(--app-text)]">
            Disponibles ahora
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id ?? product.name}
              onClick={() => setSelected(product)}
              className="group cursor-pointer overflow-hidden rounded-[1.5rem] bg-[var(--app-surface)] shadow-sm ring-1 ring-[var(--app-border)] transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${product.tone}`}
              >
                {product.image?.startsWith("http") ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-7xl drop-shadow-sm" aria-hidden>
                    {product.image}
                  </span>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--brand)] shadow-sm">
                  {product.tag}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (product.id) addToCart(product.id);
                  }}
                  className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-950 shadow-sm transition group-hover:scale-105"
                  aria-label={`Agregar ${product.name} al carrito`}
                >
                  {product.id && isInCart(product.id) ? <Check size={18} /> : <Plus size={18} />}
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-[var(--app-text)]">
                      {product.name}
                    </h3>
                    <p className="mt-1 truncate text-sm font-semibold text-[var(--app-muted)]">
                      {product.store}
                    </p>
                  </div>
                  {product.rating && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-700">
                      ★ {product.rating}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-lg font-black text-[var(--app-text)]">
                    {product.donation ? "Donación" : formatPrice(product.price)}
                  </p>
                  {product.expirationDate && (
                    <p className="mt-1 text-xs font-semibold text-[var(--app-muted)]">
                      Vence: {product.expirationDate.split("-").reverse().join("/")}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selected && (
        <ProductDetailModal product={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}