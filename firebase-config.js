// Configuration Firebase pour production
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

// Initialisation Firebase globale
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  window.auth = firebase.auth();
  window.db = firebase.firestore();
} else {
  console.warn('Firebase SDK non chargé');
}
