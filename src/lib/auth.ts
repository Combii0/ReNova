"use client";

import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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

// ── Client-side helpers (call from API routes or useEffect) ────────────────

export async function registerClient(
  email: string,
  password: string,
  displayName: string,
): Promise<FirebaseUser> {
  if (!auth) throw new Error("Firebase auth not configured");
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await cred.user.updateProfile({ displayName });
  return cred.user;
}

export async function loginClient(
  email: string,
  password: string,
): Promise<FirebaseUser> {
  if (!auth) throw new Error("Firebase auth not configured");
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function googleLoginClient(): Promise<FirebaseUser> {
  if (!auth) throw new Error("Firebase auth not configured");
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function logoutClient(): Promise<void> {
  if (!auth) return;
  await fbSignOut(auth);
}
