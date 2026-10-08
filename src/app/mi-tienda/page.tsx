import MySales from "@/components/MySales";

export default function StorePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
        Vendedor
      </p>
      <h1 className="mt-1 text-3xl font-black text-[var(--app-text)]">
        Mi tienda
      </h1>

      <MySales />
    </main>
  );
}