"use client";

import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "./firebase";

export type User = FirebaseUser | null;

/** Persistent hook that returns the current Firebase user. */
export function useUser(): User {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  return user;
}

// ── Client-side helpers ───────────────────────────────────────────────────

/** Paso 1 del login: valida correo y contraseña y envía el código por correo. */
export async function requestCodeClient(email: string, password: string): Promise<void> {
  const res = await fetch("/api/auth/2fa/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "No se pudo enviar el código");
  }
}

/** Paso 2 del login: valida el código y entra con el custom token. */
export async function verifyCodeClient(email: string, code: string): Promise<FirebaseUser> {
  if (!auth) throw new Error("Firebase auth not configured");
  const res = await fetch("/api/auth/2fa/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Código incorrecto");
  const cred = await signInWithCustomToken(auth, data.token);
  return cred.user;
}

export async function googleLoginClient(): Promise<FirebaseUser> {
  if (!auth) throw new Error("Firebase auth not configured");
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);

  const token = await cred.user.getIdToken();
  await fetch("/api/users/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ displayName: cred.user.displayName, email: cred.user.email }),
  });

  return cred.user;
}

export async function requestRegisterCodeClient(data: {
  displayName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}): Promise<void> {
  const res = await fetch("/api/auth/register/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? "No se pudo enviar el código");
  }
}

export async function verifyRegisterCodeClient(email: string, code: string): Promise<FirebaseUser> {
  if (!auth) throw new Error("Firebase auth not configured");
  const res = await fetch("/api/auth/register/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Código incorrecto");
  const cred = await signInWithCustomToken(auth, data.token);
  return cred.user;
}

export async function logoutClient(): Promise<void> {
  if (!auth) return;
  await fbSignOut(auth);
}

/** Get a fresh ID token string for the given user, or null. */
export async function getIdToken(user: FirebaseUser | null): Promise<string | null> {
  if (!user) return null;
  return user.getIdToken();
}