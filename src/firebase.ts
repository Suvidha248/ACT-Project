// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from 'firebase/database';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmQE8P0ytmnvBcoiDCsIOBqoAQ--wSHz0",
  authDomain: "act-ims.firebaseapp.com",
  projectId: "act-ims",
  storageBucket: "act-ims.firebasestorage.app",
  messagingSenderId: "103082948076",
  appId: "1:103082948076:web:dc5307e2a26dcb54e23cc9",
  measurementId: "G-T210WH3QSY",
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app); 
