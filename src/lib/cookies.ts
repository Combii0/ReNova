"use client";

export type AppTheme = "light" | "dark";

const maxAge = 60 * 60 * 24 * 365;

export function getCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1] ?? null
  );
}

export function setCookie(name: string, value: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function readJsonCookie<T>(name: string, fallback: T): T {
  const value = getCookie(name);

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(decodeURIComponent(value)) as T;
  } catch {
    return fallback;
  }
}

export function setJsonCookie<T>(name: string, value: T) {
  setCookie(name, JSON.stringify(value));
}

export function applyTheme(theme: AppTheme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
}

