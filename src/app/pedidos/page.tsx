import { CheckCircle2, MapPin, Phone, Route, Timer } from "lucide-react";
import { activeOrder, orderHistory } from "@/data/orders";

export default function OrdersPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
                Pedido en curso
              </p>
              <h1 className="mt-1 text-3xl font-black text-[var(--app-text)]">
                {activeOrder.id}
              </h1>
            </div>
            <span className="flex h-10 items-center gap-2 rounded-full bg-[var(--brand)] px-4 text-sm font-black text-white">
              <Timer size={17} />
              {activeOrder.eta}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-[var(--app-soft)] p-4">
              <p className="text-sm font-bold text-[var(--app-muted)]">
                Contacto
              </p>
              <h2 className="mt-2 text-xl font-black text-[var(--app-text)]">
                {activeOrder.courier.name}
              </h2>
              <div className="mt-4 space-y-2 text-sm font-bold text-[var(--app-muted)]">
                <p className="flex items-center gap-2">
                  <Phone size={16} />
                  {activeOrder.courier.phone}
                </p>
                <p>{activeOrder.courier.vehicle}</p>
              </div>
            </div>

            <div className="rounded-3xl bg-[var(--app-soft)] p-4">
              <p className="text-sm font-bold text-[var(--app-muted)]">
                Ruta
              </p>
              <div className="mt-4 space-y-4">
                <p className="flex gap-3 text-sm font-bold text-[var(--app-text)]">
                  <MapPin className="shrink-0 text-[var(--brand)]" size={18} />
                  {activeOrder.origin}
                </p>
                <p className="flex gap-3 text-sm font-bold text-[var(--app-text)]">
                  <Route className="shrink-0 text-[var(--brand)]" size={18} />
                  {activeOrder.destination}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-black text-[var(--app-text)]">
              Productos
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {activeOrder.items.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl bg-[var(--app-soft)] px-4 py-3"
                >
                  <CheckCircle2 size={18} className="text-[var(--brand)]" />
                  <span className="text-sm font-black text-[var(--app-text)]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)] lg:h-fit">
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
            Compras
          </p>
          <h2 className="mt-1 text-2xl font-black text-[var(--app-text)]">
            Historial
          </h2>
          <div className="mt-5 space-y-3">
            {orderHistory.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl bg-[var(--app-soft)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-[var(--app-text)]">
                    {order.store}
                  </p>
                  <span className="text-sm font-black text-[var(--brand)]">
                    {order.total}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">
                  {order.id} · {order.date}
                </p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}

