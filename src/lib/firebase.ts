// This file is for CLIENT-side firebase initialization
// For server-side, see firebase-server.ts

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_APP_ENV === 'production';
const isBuild = process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_APP_ENV;

// Firebase configuration with fallbacks for build environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'build-placeholder-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'build-placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'build-placeholder-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'build-placeholder-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:placeholder'
};

// Validate configuration (skip validation during build)
if (!isBuild && (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)) {
  throw new Error(`Firebase configuration is incomplete. Environment: ${isDevelopment ? 'development' : isProduction ? 'production' : 'unknown'}`);
}

// Log environment info (only in development)
if (isDevelopment) {
  console.log('🔧 Firebase Environment: Development');
  console.log('📊 Project ID:', firebaseConfig.projectId);
} else if (isBuild) {
  console.log('🏗️ Firebase Environment: Build (using placeholders)');
}

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
