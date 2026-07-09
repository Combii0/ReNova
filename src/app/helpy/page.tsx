import { Bot, PackagePlus, Sparkles } from "lucide-react";

const prompts = [
  "Quiero comprar comida para una reunion",
  "Necesito vender un producto usado",
  "Busco la opcion mas barata y rapida",
  "Recomiendame productos saludables",
];

export default function HelpyPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)]">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-white">
              <Bot size={24} />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
                Helpy
              </p>
              <h1 className="text-3xl font-black text-[var(--app-text)]">
                Asistente IA
              </h1>
            </div>
          </div>

          <div className="mt-6 min-h-[360px] rounded-3xl bg-[var(--app-soft)] p-4">
            <div className="max-w-xl rounded-3xl bg-[var(--app-surface)] p-4 shadow-sm">
              <p className="text-sm font-bold leading-6 text-[var(--app-text)]">
                Puedo ayudarte a elegir productos por presupuesto, tiempo de
                entrega, calidad o necesidad. Tambien puedo guiarte para vender
                algo en ReNova.
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-3 rounded-full bg-[var(--app-soft)] p-2">
            <input
              className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
              placeholder="Escribe lo que necesitas"
            />
            <button className="h-11 rounded-full bg-[var(--brand)] px-5 text-sm font-black text-white">
              Enviar
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)]">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-[var(--brand)]" />
              <h2 className="text-lg font-black text-[var(--app-text)]">
                Compras
              </h2>
            </div>
            <div className="mt-4 space-y-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  className="w-full rounded-2xl bg-[var(--app-soft)] px-4 py-3 text-left text-sm font-black text-[var(--app-text)]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)]">
            <div className="flex items-center gap-3">
              <PackagePlus size={20} className="text-[var(--brand)]" />
              <h2 className="text-lg font-black text-[var(--app-text)]">
                Ventas
              </h2>
            </div>
            <button className="mt-4 h-12 w-full rounded-full bg-[var(--app-text)] text-sm font-black text-[var(--app-bg)]">
              Subir producto
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}

