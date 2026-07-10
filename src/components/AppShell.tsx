"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bot,
  ClipboardList,
  Home,
  Info,
  Menu,
  PackagePlus,
  Search,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { applyTheme, getCookie, type AppTheme } from "@/lib/cookies";

const navigation = [
  { href: "/", label: "Market", icon: Home },
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/helpy", label: "Helpy", icon: Bot },
  { href: "/informacion", label: "Informacion", icon: Info },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const theme = (getCookie("renova-theme") as AppTheme | null) ?? "light";
    applyTheme(theme);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <header className="sticky top-0 z-[70] border-b border-[var(--app-border)] bg-[var(--app-surface)]/95 backdrop-blur">
        <div className="flex w-full items-center gap-2 px-2 py-3 sm:gap-3 sm:px-3 lg:px-4">
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[var(--app-text)] transition hover:bg-[var(--app-soft)]"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-label="Abrir menu"
          >
            <Menu size={24} strokeWidth={2.5}/>
          </button>

          <Link
            href="/"
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)] text-lg font-black text-white shadow-sm sm:flex"
          >
            R
          </Link>

          <div className="hidden min-w-0 flex-col md:flex">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--brand)]">
              Entrega en
            </span>
            <button className="flex items-center gap-1 text-sm font-bold text-[var(--app-text)]">
              Medellin, Colombia <span aria-hidden>⌄</span>
            </button>
          </div>

          <label className="flex h-12 flex-1 items-center gap-3 rounded-full bg-[var(--app-soft)] px-4 text-sm text-[var(--app-muted)] ring-1 ring-transparent transition focus-within:bg-[var(--app-surface)] focus-within:ring-[var(--brand)]/30">
            <Search size={18} />
            <input
              className="w-full bg-transparent font-medium text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
              placeholder="Buscar productos, tiendas o categorias"
              type="search"
            />
          </label>

          <button className="hidden h-11 items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-sm font-bold text-[var(--app-text)] shadow-sm transition hover:bg-[var(--app-soft)] lg:flex">
            <PackagePlus size={17} />
            Subir producto
          </button>

          <button
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--app-text)] text-[var(--app-bg)] shadow-sm"
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={19} />
          </button>
        </div>
      </header>
      <div className="realtive z-0">
        {children}
      </div>

      {isMenuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[80] bg-black/35"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Cerrar menu"
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-[90] flex h-dvh w-[min(88vw,340px)] flex-col bg-[var(--app-surface)] px-4 py-4 shadow-2xl transition-transform duration-200 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menu principal"
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand)] text-lg font-black text-white">
              R
            </span>
            <span className="text-xl font-black text-[var(--app-text)]">
              ReNova
            </span>
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--app-soft)]"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Cerrar menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="mt-8 space-y-2" aria-label="Navegacion principal">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-black transition ${
                  isActive
                    ? "bg-[var(--brand)] text-white"
                    : "text-[var(--app-text)] hover:bg-[var(--app-soft)]"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[var(--app-border)] pt-4">
          <Link
            href="/configuracion"
            onClick={() => setIsMenuOpen(false)}
            className={`flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-black transition ${
              pathname === "/configuracion"
                ? "bg-[var(--app-text)] text-[var(--app-bg)]"
                : "text-[var(--app-text)] hover:bg-[var(--app-soft)]"
            }`}>
            <Settings size={19}/>
            Configuracion
          </Link>
        </div>
      </aside>
    </div>
  );
}
