// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Use Firestore instead of Analytics

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqfa-mhTIytrnM34317Zz8aQBqLqV7ewQ",
  authDomain: "reservation-terrains.firebaseapp.com",
  projectId: "reservation-terrains",
  storageBucket: "reservation-terrains.appspot.com",
  messagingSenderId: "998246359513",
  appId: "1:998246359513:web:da54964d530214e06ef9c8",
  measurementId: "G-K3L6P79746"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore

export default db;
