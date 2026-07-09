import { FileText, ShieldCheck, Store, Truck } from "lucide-react";

const sections = [
  {
    icon: Store,
    title: "Vendedores",
    text: "Publicaciones verificadas, precios claros y disponibilidad actualizada.",
  },
  {
    icon: Truck,
    title: "Entregas",
    text: "Rutas visibles, contacto del repartidor y estados del pedido.",
  },
  {
    icon: ShieldCheck,
    title: "Seguridad",
    text: "Pagos protegidos, soporte activo y reglas de comercio local.",
  },
];

export default function InformationPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[1.5rem] bg-[var(--app-surface)] p-6 shadow-sm ring-1 ring-[var(--app-border)]">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-white">
            <FileText size={23} />
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
              Informacion
            </p>
            <h1 className="text-3xl font-black text-[var(--app-text)]">
              Reglas
            </h1>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <article
                key={section.title}
                className="rounded-3xl bg-[var(--app-soft)] p-5"
              >
                <Icon size={24} className="text-[var(--brand)]" />
                <h2 className="mt-5 text-xl font-black text-[var(--app-text)]">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm font-bold leading-6 text-[var(--app-muted)]">
                  {section.text}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

