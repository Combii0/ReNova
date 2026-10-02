import SettingsPanel from "@/components/SettingsPanel";
import AccountSettings from "@/components/AccountSettings";

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
          Configuracion
        </p>
        <h1 className="mt-1 text-3xl font-black text-[var(--app-text)]">
          ¡Las mejores opciones únicamente para ti!
        </h1>
      </div>

      <SettingsPanel />

      <div className="mt-6">
        <AccountSettings />
      </div>
    </main>
  );
}