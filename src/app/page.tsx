import { categories, products } from "@/data/products";

export default function Home() {
  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
      <section className="min-w-0">
        <div className="overflow-hidden rounded-[2rem] bg-[var(--brand)] text-white shadow-sm">
          <div className="grid gap-6 p-6 sm:grid-cols-[1.3fr_0.7fr] sm:p-8">
            <div className="flex flex-col justify-between gap-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-white/80">
                  ReNova Express
                </p>
                <h1 className="mt-3 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
                  Todo lo que suban tus tiendas, en un solo lugar.
                </h1>
                <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-white/85">
                  Descubre productos disponibles, compara precios y agrega al
                  carrito desde la vista principal.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="h-11 rounded-full bg-white px-5 text-sm font-black text-[var(--brand)] shadow-sm">
                  Ver productos
                </button>
                <button className="h-11 rounded-full border border-white/35 px-5 text-sm font-black text-white">
                  Tiendas cercanas
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 self-end">
              {[
                ["🥑", "Mercado fresco"],
                ["🍔", "Comida rapida"],
                ["💊", "Farmacia"],
                ["📱", "Tecnologia"],
              ].map(([icon, label]) => (
                <div key={label} className="rounded-3xl bg-white/16 p-4">
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.name}
              className="group overflow-hidden rounded-[1.5rem] bg-[var(--app-surface)] shadow-sm ring-1 ring-[var(--app-border)] transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${product.tone}`}
              >
                <span className="text-7xl drop-shadow-sm" aria-hidden>
                  {product.image}
                </span>
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
                  <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-700">
                    ★ {product.rating}
                  </span>
                </div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-[var(--app-text)]">
                      {product.price}
                    </p>
                    <p className="text-xs font-bold text-[var(--app-muted)] line-through">
                      {product.before}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--app-soft)] px-3 py-1 text-xs font-black text-[var(--app-text)]">
                    {product.time}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[var(--app-text)]">
              Mi pedido
            </h2>
            <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-black text-[var(--brand)]">
              3 items
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {products.slice(0, 3).map((product) => (
              <div key={product.name} className="flex items-center gap-3">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${product.tone} text-2xl`}
                >
                  {product.image}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-[var(--app-text)]">
                    {product.name}
                  </p>
                  <p className="text-xs font-semibold text-[var(--app-muted)]">
                    {product.price}
                  </p>
                </div>
                <span className="text-sm font-black text-[var(--app-muted)]">
                  x1
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t border-[var(--app-border)] pt-5 text-sm font-bold">
            <div className="flex justify-between text-[var(--app-muted)]">
              <span>Subtotal</span>
              <span>$97.600</span>
            </div>
            <div className="flex justify-between text-[var(--app-muted)]">
              <span>Envio</span>
              <span>$4.900</span>
            </div>
            <div className="flex justify-between text-lg font-black text-[var(--app-text)]">
              <span>Total</span>
              <span>$102.500</span>
            </div>
          </div>

          <button className="mt-6 h-12 w-full rounded-full bg-[var(--app-text)] text-sm font-black text-[var(--app-bg)] shadow-sm transition hover:opacity-90">
            Continuar compra
          </button>
        </div>
      </aside>
    </main>
  );
}

