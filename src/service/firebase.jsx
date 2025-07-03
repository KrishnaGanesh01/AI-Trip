// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpoAjqARSIXnkyTJCi2dNpOpXuFJmE3hA",
  authDomain: "ai-trip-817d4.firebaseapp.com",
  projectId: "ai-trip-817d4",
  storageBucket: "ai-trip-817d4.firebasestorage.app",
  messagingSenderId: "18742947798",
  appId: "1:18742947798:web:488261229a06a69cc07e77",
  measurementId: "G-R0MKXQ0QL8"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app) 
// const analytics = getAnalytics(app);