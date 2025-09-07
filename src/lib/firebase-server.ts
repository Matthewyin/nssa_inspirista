// This file is for SERVER-side firebase initialization
// For client-side, see firebase.ts
import { initializeApp, getApps, getApp as getFirebaseApp, cert } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';
import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

let app: App | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

function initializeFirebase() {
  if (app) return { app, auth, db }; // 已经初始化过了

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
        app = getFirebaseApp();
      }

      auth = getFirebaseAuth(app);
      db = getFirebaseFirestore(app);
    } else {
      // For development, try to initialize with project ID only
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      console.log("Attempting to initialize Firebase with project ID:", projectId);

      if (projectId) {
        try {
          if (!getApps().length) {
            app = initializeApp({
              projectId: projectId,
            });
          } else {
            app = getFirebaseApp();
          }
          auth = getFirebaseAuth(app);
          db = getFirebaseFirestore(app);
          console.log("Firebase Admin SDK initialized with project ID only (development mode)");
        } catch (error) {
          console.error("Failed to initialize with project ID:", error);
          console.warn("FIREBASE_SERVICE_ACCOUNT environment variable not set and failed to initialize with project ID. Server-side Firebase features will be disabled.");
        }
      } else {
        console.warn("FIREBASE_SERVICE_ACCOUNT environment variable not set and no project ID found. Server-side Firebase features will be disabled.");
      }
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
  }

  return { app, auth, db };
}

// 延迟初始化的getter
function getDb() {
  if (!db) {
    initializeFirebase();
  }
  return db;
}

function getAuth() {
  if (!auth) {
    initializeFirebase();
  }
  return auth;
}

function getApp() {
  if (!app) {
    initializeFirebase();
  }
  return app;
}

export { getApp as app, getAuth as auth, getDb as db };
