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
  const [showPassword, setShowPassword] = useState(false);

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
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 pr-10 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
              placeholder="Contraseña"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--app-muted)] hover:text-[var(--app-text)]"
            >
              <img
                src={showPassword ? "/password-show.svg" : "/password-hide.svg"}
                alt=""
                className="h-5 w-5"
              />
            </button>
          </div>
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
          className="w-full rounded-full border-2 border-[var(--app-border)] bg-white py-3 text-sm font-bold text-gray-800 shadow-sm transition hover:bg-gray-50"
        >
          <svg className="mr-2 inline h-4 w-4 -mt-0.5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
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
