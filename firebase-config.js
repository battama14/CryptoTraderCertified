// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1QR_NIqm9YrPN5xppZM08DdlUUgGiFMI",
  authDomain: "crypto-trader-certified.firebaseapp.com",
  databaseURL: "https://crypto-trader-certified-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "crypto-trader-certified",
  storageBucket: "crypto-trader-certified.firebasestorage.app",
  messagingSenderId: "1026750561248",
  appId: "1:1026750561248:web:9dcf56f1526e8e3df6c985",
  measurementId: "G-09PT2CXLSR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);

export { app, analytics, auth, firestore, database };