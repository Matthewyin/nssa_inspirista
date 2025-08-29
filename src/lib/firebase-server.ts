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
    // For development, try to initialize with project ID only
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (projectId && !getApps().length) {
      try {
        app = initializeApp({
          projectId: projectId,
        });
        auth = getAuth(app);
        console.log("Firebase Admin SDK initialized with project ID only (development mode)");
      } catch (error) {
        console.warn("FIREBASE_SERVICE_ACCOUNT environment variable not set and failed to initialize with project ID. Server-side Firebase features will be disabled.");
      }
    } else {
      console.warn("FIREBASE_SERVICE_ACCOUNT environment variable not set. Server-side Firebase features will be disabled.");
    }
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
}

export { app, auth };
