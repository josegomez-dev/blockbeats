// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLzTaGe_WCw9RVdutz4Mqx-ViQrL_to9Y",
  authDomain: "blockbeats-ee6d3.firebaseapp.com",
  projectId: "blockbeats-ee6d3",
  storageBucket: "blockbeats-ee6d3.firebasestorage.app",
  messagingSenderId: "380764586846",
  appId: "1:380764586846:web:7285f377aa1d29103d85cf",
  measurementId: "G-018RENMEBY"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, app, db, storage };