"use client";

import { categories } from "@/data/products";
import { useFirestoreProducts } from "@/lib/useFirestoreProducts";

const formatPrice = (price: string) =>
  "$" + Number(price.replace(/\D/g, "")).toLocaleString("es-CO");

export default function Home() {
  const { products, loading, error } = useFirestoreProducts();

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
            <div className="flex flex-col justify-between gap-8">
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

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button className="h-11 w-full rounded-full bg-white px-5 text-sm font-black text-[var(--brand)] shadow-sm sm:w-auto">
                  Ver productos
                </button>
                <button className="h-11 w-full rounded-full border border-white/35 px-5 text-sm font-black text-white sm:w-auto">
                  Tiendas cercanas
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 self-end sm:gap-3">
              {[
                ["🥑", "Mercado fresco"],
                ["🍔", "Comida rapida"],
                ["💊", "Farmacia"],
                ["📱", "Tecnologia"],
              ].map(([icon, label]) => (
                <div key={label} className="rounded-3xl bg-white/16 p-3 sm:rounded-3xl sm:p-4">
                  <p className="text-3xl">{icon}</p>
                  <p className="mt-4 text-sm font-bold">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <nav className="mt-6 flex gap-3 overflow-x-auto pb-2" aria-label="Categorias">
          {categories.map((category) => (
            <button
              key={category}
              className={`h-11 shrink-0 rounded-full px-5 text-sm font-bold shadow-sm transition ${
                category === "Todos"
                  ? "bg-[var(--app-text)] text-[var(--app-bg)]"
                  : "bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-soft)]"
              }`}
            >
              {category}
            </button>
          ))}
        </nav>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
              Productos subidos
            </p>
            <h2 className="mt-1 text-2xl font-black text-[var(--app-text)]">
              Disponibles ahora
            </h2>
          </div>
          <button className="h-10 self-start rounded-full bg-[var(--app-surface)] px-4 text-sm font-bold text-[var(--app-text)] shadow-sm sm:self-auto">
            Ordenar: destacados
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id ?? product.name}
              className="group overflow-hidden rounded-[1.5rem] bg-[var(--app-surface)] shadow-sm ring-1 ring-[var(--app-border)] transition hover:-translate-y-0.5 hover:shadow-md"
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
                  className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-zinc-950 shadow-sm transition group-hover:scale-105"
                  aria-label={`Agregar ${product.name} al carrito`}
                >
                  ＋
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

                {/* CAMBIO: muestra "Donación" y la fecha de vencimiento */}
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
    </main>
  );
}