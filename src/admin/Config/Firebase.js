import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC72HTUVTxJJQJln4F9T4025DO0gnU2Zyo",
  authDomain: "g-client-app.firebaseapp.com",
  projectId: "g-client-app",
  storageBucket: "g-client-app.firebasestorage.app",
  messagingSenderId: "439925901384",
  appId: "1:439925901384:web:23992cb569ff644dd8b07d",
  measurementId: "G-0CMLK2CDEG",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db =getFirestore(app)


