"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { Bell, Moon, Sun, Clock } from "lucide-react";
import {
  applyTheme,
  getCookie,
  readJsonCookie,
  setCookie,
  setJsonCookie,
  type AppTheme,
} from "@/lib/cookies";

type NotificationSettings = {
  orders: boolean;
  promos: boolean;
  riders: boolean;
};

type SettingsSnapshot = {
  theme: AppTheme;
  historyRange: string;
  notifications: NotificationSettings;
};

const defaultNotifications: NotificationSettings = {
  orders: true,
  promos: false,
  riders: true,
};

const defaultSettings: SettingsSnapshot = {
  theme: "light",
  historyRange: "90",
  notifications: defaultNotifications,
};

const defaultSettingsSnapshot = JSON.stringify(defaultSettings);

function readSettingsSnapshot(): SettingsSnapshot {
  const savedTheme =
    readJsonCookie<AppTheme | null>("renova-theme-json", null) ??
    (getCookie("renova-theme") as AppTheme | null);

  return {
    theme: savedTheme ?? defaultSettings.theme,
    historyRange:
      readJsonCookie<string | null>("renova-history-range", null) ??
      defaultSettings.historyRange,
    notifications: readJsonCookie<NotificationSettings>(
      "renova-notifications",
      defaultNotifications,
    ),
  };
}

function getClientSettingsSnapshot() {
  return JSON.stringify(readSettingsSnapshot());
}

function getServerSettingsSnapshot() {
  return defaultSettingsSnapshot;
}

function subscribeToSettings(callback: () => void) {
  window.addEventListener("renova-settings-change", callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("renova-settings-change", callback);
    window.removeEventListener("storage", callback);
  };
}

function notifySettingsChanged() {
  window.dispatchEvent(new Event("renova-settings-change"));
}

export default function SettingsPanel() {
  const settingsSnapshot = useSyncExternalStore(
    subscribeToSettings,
    getClientSettingsSnapshot,
    getServerSettingsSnapshot,
  );

  const { theme, historyRange, notifications } = useMemo(
    () => JSON.parse(settingsSnapshot) as SettingsSnapshot,
    [settingsSnapshot],
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function updateTheme(nextTheme: AppTheme) {
    applyTheme(nextTheme);
    setCookie("renova-theme", nextTheme);
    setJsonCookie("renova-theme-json", nextTheme);
    notifySettingsChanged();
  }

  function updateHistoryRange(value: string) {
    setJsonCookie("renova-history-range", value);
    notifySettingsChanged();
  }

  function toggleNotification(key: keyof NotificationSettings) {
    const next = { ...notifications, [key]: !notifications[key] };
    setJsonCookie("renova-notifications", next);
    notifySettingsChanged();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="space-y-5">
        <div className="rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
                Tema
              </p>
              <h2 className="mt-1 text-2xl font-black text-[var(--app-text)]">
                Apariencia
              </h2>
            </div>
            <div className="grid w-full grid-cols-2 rounded-full bg-[var(--app-soft)] p-1 sm:w-auto">
              <button
                className={`flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-black ${
                  theme === "light"
                    ? "bg-[var(--app-surface)] text-[var(--app-text)] shadow-sm"
                    : "text-[var(--app-muted)]"
                }`}
                onClick={() => updateTheme("light")}
              >
                <Sun size={17}/>
                Claro
              </button>
              <button
                className={`flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-black ${
                  theme === "dark"
                    ? "bg-[var(--app-surface)] text-[var(--app-text)] shadow-sm"
                    : "text-[var(--app-muted)]"
                }`}
                onClick={() => updateTheme("dark")}
              >
                <Moon size={17} />
                Oscuro
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)]">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
            <Clock size={16} className="shrink-0" />
            <span>Historial</span>
          </div>
          <h2 className="mt-1 text-2xl font-black text-[var(--app-text)]">
            Pedidos anteriores
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["30", "30 días"],
              ["90", "3 meses"],
              ["365", "1 año"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`h-12 rounded-2xl text-sm font-black ring-1 ring-[var(--app-border)] ${
                  historyRange === value
                    ? "bg-[var(--app-text)] text-[var(--app-bg)]"
                    : "bg-[var(--app-soft)] text-[var(--app-text)]"
                }`}
                onClick={() => updateHistoryRange(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <aside className="rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)] lg:h-fit">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand)] text-white">
            <Bell size={20} />
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
              Notificaciones
            </p>
            <h2 className="text-xl font-black text-[var(--app-text)]">
              Alertas
            </h2>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {[
            ["orders", "Pedidos"],
            ["promos", "Promociones"],
            ["riders", "Repartidores"],
          ].map(([key, label]) => {
            const typedKey = key as keyof NotificationSettings;
            const enabled = notifications[typedKey];

            return (
              <button
                key={key}
                className="flex w-full items-center justify-between rounded-2xl bg-[var(--app-soft)] px-4 py-3 text-left"
                onClick={() => toggleNotification(typedKey)}
              >
                <span className="text-sm font-black text-[var(--app-text)]">
                  {label}
                </span>
                <span
                  className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
                    enabled ? "bg-[var(--brand)]" : "bg-[var(--app-border)]"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white transition ${
                      enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
