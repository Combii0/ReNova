"use client";

import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
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

// ── Client-side helpers ───────────────────────────────────────────────────

export async function registerClient(
  email: string,
  password: string,
  displayName: string,
): Promise<FirebaseUser> {
  if (!auth) throw new Error("Firebase auth not configured");

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });

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

  const token = await cred.user.getIdToken();
  await fetch("/api/users/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ displayName: cred.user.displayName, email: cred.user.email }),
  });

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