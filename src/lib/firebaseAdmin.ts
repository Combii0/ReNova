import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App | null = null;

if (getApps().length) {
  app = getApps()[0];
} else {
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    app = initializeApp({
      credential: cert(serviceAccount),
    });
  }
}

export function getAdminApp(): App | null {
  return app;
}

export function getAdminAuth(): Auth | null {
  if (!app) return null;
  return getAuth(app);
}

export function getAdminDb(): Firestore | null {
  if (!app) return null;
  return getFirestore(app);
}