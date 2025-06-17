// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmQE8P0ytmnvBcoiDCsIOBqoAQ--wSHz0",
  authDomain: "act-ims.firebaseapp.com",
  projectId: "act-ims",
  storageBucket: "act-ims.firebasestorage.app",
  messagingSenderId: "103082948076",
  appId: "1:103082948076:web:dc5307e2a26dcb54e23cc9",
  measurementId: "G-T210WH3QSY"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);