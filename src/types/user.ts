import type { User as FirebaseUser } from "firebase/auth";

export type AppUser = FirebaseUser | null;
