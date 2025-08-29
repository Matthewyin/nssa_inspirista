'use server';
// This file is for SERVER-side firebase initialization
// For client-side, see firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp, cert } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import type { User } from 'firebase-admin/auth';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

try {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountString) {
    const serviceAccount = JSON.parse(serviceAccountString);
    const appConfig = {
      credential: cert(serviceAccount),
    };

    if (!getApps().length) {
      app = initializeApp(appConfig);
    } else {
      app = getApp();
    }
    
    auth = getAuth(app);
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT environment variable not set. Server-side Firebase features will be disabled.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
}

export { app, auth };
