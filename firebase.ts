// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { logEnvironmentStatus, validateEnvironmentOrThrow } from "./src/utils/envValidation";

// Validate environment variables
try {
  validateEnvironmentOrThrow();
} catch (error) {
  console.error('❌ Firebase initialization failed due to missing environment variables');
  console.error('Please check your .env.local file and ensure all Firebase variables are set.');
  throw error;
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.ANALYTICS_MEASUREMENT_ID,
};

// Log configuration status (only in development)
if (process.env.NODE_ENV === 'development') {
  logEnvironmentStatus();
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, app, db, storage };