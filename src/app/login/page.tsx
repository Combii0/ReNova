"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginClient, googleLoginClient } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginClient(email, password);
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || "Login failed");
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
      setError((err as Error).message || "Google login failed");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-6 px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-black text-[var(--app-text)]">Bienvenido</h1>
        <p className="mt-2 text-sm text-[var(--app-muted)]">Inicia sesión en tu cuenta ReNova</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-2xl bg-[var(--app-surface)] p-6 shadow-sm ring-1 ring-[var(--app-border)]">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
            placeholder="ejemplo@correo.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-bold text-[var(--app-text)]">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
            placeholder="Contraseña"
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
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
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
          Continuar con Google
        </button>
      </form>

      <p className="text-sm text-[var(--app-muted)]">
        ¿No tienes cuenta?{" "}
        <a href="/register" className="font-bold text-[var(--brand)] hover:underline">
          Regístrate
        </a>
      </p>
    </main>
  );
}
