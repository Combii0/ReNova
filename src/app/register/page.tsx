"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerClient, googleLoginClient } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      void registerClient(email, password, displayName);
      // Save encrypted PII to Firestore
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone || undefined, address: address || undefined }),
      });
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      await googleLoginClient();
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || "Google registration failed");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-6 px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-black text-[var(--app-text)]">Crea tu cuenta</h1>
        <p className="mt-2 text-sm text-[var(--app-muted)]">Ãnete a ReNova y empieza a comprar</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-2xl bg-[var(--app-surface)] p-6 shadow-sm ring-1 ring-[var(--app-border)]">
        <div>
          <label htmlFor="displayName" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
            Nombre completo
          </label>
          <input
            id="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
            Correo electrÃ³nico
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
            placeholder="tu@correo.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
            ContraseÃ±a
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
            placeholder="mÃ­nimo 6 caracteres"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
            TelÃ©fono (opcional, se encriptarÃ¡)
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
            placeholder="+57 300 555 0198"
          />
        </div>

        <div>
          <label htmlFor="address" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
            DirecciÃ³n (opcional, se encriptarÃ¡)
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
            placeholder="Cra 76 #32-18, AptÃ©"
          />
        </div>

        {error && (
          <p className="text-sm font-semibold text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[var(--app-text)] py-3 text-sm font-black text-[var(--app-bg)] shadow-sm transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--app-border)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--app-surface)] px-2 text-[var(--app-muted)]">o</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full rounded-full border-2 border-[var(--app-border)] bg-white py-3 text-sm font-bold text-[var(--app-text)] shadow-sm transition hover:bg-gray-50"
        >
          Registrarse con Google
        </button>
      </form>

      <p className="text-sm text-[var(--app-muted)]">
        Â¿Ya tienes cuenta?{" "}
        <a href="/login" className="font-bold text-[var(--brand)] hover:underline">
          Inicia sesiÃ³n
        </a>
      </p>
    </main>
  );
}
