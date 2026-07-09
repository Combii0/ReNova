import { couriers } from "@/data/orders";
import SettingsPanel from "@/components/SettingsPanel";

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
          Configuracion
        </p>
        <h1 className="mt-1 text-3xl font-black text-[var(--app-text)]">
          Preferencias
        </h1>
      </div>

      <SettingsPanel />

      <section className="mt-6 rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)]">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
          Repartidores
        </p>
        <h2 className="mt-1 text-2xl font-black text-[var(--app-text)]">
          Contactos
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {couriers.map((courier) => (
            <article
              key={courier.phone}
              className="rounded-3xl bg-[var(--app-soft)] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-black text-[var(--app-text)]">
                    {courier.name}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-[var(--app-muted)]">
                    {courier.zone}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-700">
                  ★ {courier.rating}
                </span>
              </div>
              <p className="mt-4 text-sm font-black text-[var(--brand)]">
                {courier.phone}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

