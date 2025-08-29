'use server';
// This file is for SERVER-side firebase initialization
// For client-side, see firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp, cert } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import type { User } from 'firebase-admin/auth';

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;

try {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountString) {
    const serviceAccount = JSON.parse(serviceAccountString);
    const appConfig = {
      credential: cert(serviceAccount),
    };

    if (!getApps().length) {
      _app = initializeApp(appConfig);
    } else {
      _app = getApp();
    }
    
    _auth = getAuth(_app);
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT environment variable not set. Server-side Firebase features will be disabled.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
}


// A simple mock for the currentUser to avoid crashes when auth is not initialized.
const mockAuth = {
  get currentUser(): Promise<User | null> {
    console.warn("Firebase Admin SDK not initialized. Returning null for currentUser.");
    return Promise.resolve(null);
  }
};

const app = _app;
const auth: Pick<Auth, 'currentUser'> = _auth || mockAuth;

export { app, auth };
