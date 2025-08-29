// This file is for SERVER-side firebase initialization
// For client-side, see firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp, cert } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

const appConfig = {
  credential: cert(serviceAccount!),
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(appConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);

export { app, auth };
