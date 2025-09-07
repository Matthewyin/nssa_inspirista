// This file is for CLIENT-side firebase initialization
// For server-side, see firebase-server.ts

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, type Firestore, connectFirestoreEmulator } from "firebase/firestore";

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_APP_ENV === 'production';

// Firebase configuration - 开发环境强制使用模拟器配置
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:demo-app-id'
};

// 开发环境安全检查 - 确保不会连接到生产环境
if (isDevelopment) {
  if (firebaseConfig.projectId !== 'demo-project') {
    console.error('❌ 安全警告：开发环境不允许连接到生产Firebase项目！');
    throw new Error('开发环境只能使用Firebase模拟器，不允许连接生产环境');
  }
  console.log('🔧 Firebase Environment: Development (模拟器模式)');
  console.log('📊 Project ID:', firebaseConfig.projectId);
  console.log('🛡️ 安全模式：强制使用模拟器');
}

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(`Firebase configuration is incomplete. Environment: ${isDevelopment ? 'development' : isProduction ? 'production' : 'unknown'}`);
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

// 开发环境强制连接模拟器
if (isDevelopment) {
  try {
    // 强制连接Firestore模拟器
    console.log('🔧 强制连接到Firestore模拟器 (localhost:8080)...');
    connectFirestoreEmulator(db, 'localhost', 8080);

    // 如果需要，也可以连接Auth模拟器
    if (process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR === 'true') {
      console.log('🔧 连接到Auth模拟器 (localhost:9099)...');
      connectAuthEmulator(auth, 'http://localhost:9099');
    }

    console.log('✅ Firebase模拟器连接成功 - 开发环境安全模式');
  } catch (error) {
    // 如果模拟器已经连接，会抛出错误，这是正常的
    console.log('ℹ️ Firebase模拟器可能已经连接');
    // 在开发环境中，如果无法连接模拟器，这是一个严重问题
    if (error instanceof Error && error.message.includes('already')) {
      console.log('✅ 模拟器已连接');
    } else {
      console.warn('⚠️ 无法连接到Firebase模拟器，请确保模拟器正在运行');
      console.warn('运行命令: firebase emulators:start --only firestore');
    }
  }
}

export { app, auth, db };
