import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  // PASTE YOUR KEYS HERE
  apiKey: "AIzaSyBz7bynK8n10oy9115EoNBbTY_6VEXzY14",
  authDomain: "expense-tracker-91536.firebaseapp.com",
  projectId: "expense-tracker-91536",
  storageBucket: "expense-tracker-91536.firebasestorage.app",
  messagingSenderId: "1073522312882",
  appId: "1:1073522312882:web:7b540c054eede44eb5abab"
};

const app = initializeApp(firebaseConfig);
// Initialize Firestore
export const db = getFirestore(app);
export const auth = getAuth(app); // Export Auth
export const googleProvider = new GoogleAuthProvider(); // Export Google Provider