const categories = [
  "Todos",
  "Mercado",
  "Restaurantes",
  "Farmacia",
  "Tecnologia",
  "Hogar",
  "Ofertas",
];

const products = [
  {
    name: "Canasta organica",
    store: "Mercado Verde",
    price: "$42.900",
    before: "$51.000",
    tag: "Nuevo",
    rating: "4.8",
    time: "18 min",
    image: "🥬",
    tone: "from-emerald-100 to-lime-50",
  },
  {
    name: "Bowl ejecutivo",
    store: "Casa Urbana",
    price: "$28.500",
    before: "$34.000",
    tag: "-16%",
    rating: "4.7",
    time: "22 min",
    image: "🥗",
    tone: "from-orange-100 to-amber-50",
  },
  {
    name: "Kit limpieza hogar",
    store: "ReNova Market",
    price: "$36.200",
    before: "$44.900",
    tag: "Eco",
    rating: "4.9",
    time: "25 min",
    image: "🧴",
    tone: "from-sky-100 to-cyan-50",
  },
  {
    name: "Cafe especial 500g",
    store: "Montana Cafe",
    price: "$31.900",
    before: "$38.000",
    tag: "Top",
    rating: "4.9",
    time: "16 min",
    image: "☕",
    tone: "from-stone-100 to-yellow-50",
  },
  {
    name: "Audifonos wireless",
    store: "Tech Express",
    price: "$119.900",
    before: "$149.900",
    tag: "-20%",
    rating: "4.6",
    time: "30 min",
    image: "🎧",
    tone: "from-violet-100 to-slate-50",
  },
  {
    name: "Desayuno completo",
    store: "Brunch Club",
    price: "$24.900",
    before: "$29.900",
    tag: "Promo",
    rating: "4.8",
    time: "14 min",
    image: "🥐",
    tone: "from-rose-100 to-orange-50",
  },
  {
    name: "Protector solar",
    store: "Farmacia Plus",
    price: "$54.700",
    before: "$62.000",
    tag: "Salud",
    rating: "4.7",
    time: "20 min",
    image: "🧴",
    tone: "from-blue-100 to-indigo-50",
  },
  {
    name: "Pack frutas frescas",
    store: "La Plaza",
    price: "$27.800",
    before: "$33.500",
    tag: "Fresco",
    rating: "4.9",
    time: "17 min",
    image: "🍓",
    tone: "from-red-100 to-pink-50",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#202124]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ff4b2b] text-lg font-black text-white shadow-sm">
            R
          </div>

          <div className="hidden min-w-0 flex-col md:flex">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#ff4b2b]">
              Entrega en
            </span>
            <button className="flex items-center gap-1 text-sm font-bold text-zinc-900">
              Medellin, Colombia <span aria-hidden>⌄</span>
            </button>
          </div>

          <label className="flex h-12 flex-1 items-center gap-3 rounded-full bg-zinc-100 px-4 text-sm text-zinc-500 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-[#ff4b2b]/30">
            <span aria-hidden className="text-base">
              ⌕
            </span>
            <input
              className="w-full bg-transparent font-medium text-zinc-900 outline-none placeholder:text-zinc-500"
              placeholder="Buscar productos, tiendas o categorias"
              type="search"
            />
          </label>

          <button className="hidden h-11 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-800 shadow-sm transition hover:border-zinc-300 lg:flex">
            <span aria-hidden>＋</span>
            Subir producto
          </button>

          <button
            className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-950 text-white shadow-sm"
            aria-label="Abrir carrito"
          >
            🛒
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <section className="min-w-0">
          <div className="overflow-hidden rounded-[2rem] bg-[#ff4b2b] text-white shadow-sm">
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
                  <button className="h-11 rounded-full bg-white px-5 text-sm font-black text-[#ff4b2b] shadow-sm">
                    Ver productos
                  </button>
                  <button className="h-11 rounded-full border border-white/35 px-5 text-sm font-black text-white">
                    Tiendas cercanas
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 self-end">
                <div className="rounded-3xl bg-white/16 p-4">
                  <p className="text-3xl">🥑</p>
                  <p className="mt-4 text-sm font-bold">Mercado fresco</p>
                </div>
                <div className="rounded-3xl bg-white/16 p-4">
                  <p className="text-3xl">🍔</p>
                  <p className="mt-4 text-sm font-bold">Comida rapida</p>
                </div>
                <div className="rounded-3xl bg-white/16 p-4">
                  <p className="text-3xl">💊</p>
                  <p className="mt-4 text-sm font-bold">Farmacia</p>
                </div>
                <div className="rounded-3xl bg-white/16 p-4">
                  <p className="text-3xl">📱</p>
                  <p className="mt-4 text-sm font-bold">Tecnologia</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="mt-6 flex gap-3 overflow-x-auto pb-2" aria-label="Categorias">
            {categories.map((category) => (
              <button
                key={category}
                className={`h-11 shrink-0 rounded-full px-5 text-sm font-bold shadow-sm transition ${
                  category === "Todos"
                    ? "bg-zinc-950 text-white"
                    : "bg-white text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {category}
              </button>
            ))}
          </nav>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[#ff4b2b]">
                Productos subidos
              </p>
              <h2 className="mt-1 text-2xl font-black text-zinc-950">
                Disponibles ahora
              </h2>
            </div>
            <button className="h-10 self-start rounded-full bg-white px-4 text-sm font-bold text-zinc-700 shadow-sm sm:self-auto">
              Ordenar: destacados
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.name}
                className="group overflow-hidden rounded-[1.5rem] bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${product.tone}`}
                >
                  <span className="text-7xl drop-shadow-sm" aria-hidden>
                    {product.image}
                  </span>
                  <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-black text-[#ff4b2b] shadow-sm">
                    {product.tag}
                  </span>
                  <button
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm transition group-hover:scale-105"
                    aria-label={`Agregar ${product.name} al carrito`}
                  >
                    ＋
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-black text-zinc-950">
                        {product.name}
                      </h3>
                      <p className="mt-1 truncate text-sm font-semibold text-zinc-500">
                        {product.store}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-700">
                      ★ {product.rating}
                    </span>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-zinc-950">
                        {product.price}
                      </p>
                      <p className="text-xs font-bold text-zinc-400 line-through">
                        {product.before}
                      </p>
                    </div>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-700">
                      {product.time}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-zinc-950">Mi pedido</h2>
              <span className="rounded-full bg-[#ff4b2b]/10 px-3 py-1 text-xs font-black text-[#ff4b2b]">
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
                    <p className="truncate text-sm font-black text-zinc-950">
                      {product.name}
                    </p>
                    <p className="text-xs font-semibold text-zinc-500">
                      {product.price}
                    </p>
                  </div>
                  <span className="text-sm font-black text-zinc-500">x1</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-zinc-100 pt-5 text-sm font-bold">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>$97.600</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Envio</span>
                <span>$4.900</span>
              </div>
              <div className="flex justify-between text-lg font-black text-zinc-950">
                <span>Total</span>
                <span>$102.500</span>
              </div>
            </div>

            <button className="mt-6 h-12 w-full rounded-full bg-zinc-950 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800">
              Continuar compra
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
