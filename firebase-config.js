// firebase-config.js - Configuration Firebase pour CTC
// Ce fichier centralise la configuration Firebase pour toute l'application

// Configuration Firebase
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

// Initialisation Firebase
if (typeof firebase !== 'undefined') {
  // Initialiser l'application Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Initialiser les services Firebase
  window.auth = firebase.auth();
  window.db = firebase.firestore();
  window.rtdb = firebase.database();
  
  // Configuration de Firestore
  window.db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
  });
  
  window.db.enablePersistence({ synchronizeTabs: true })
    .catch(err => {
      if (err.code === 'failed-precondition') {
        console.warn('La persistance Firestore ne peut pas être activée car plusieurs onglets sont ouverts');
      } else if (err.code === 'unimplemented') {
        console.warn('Le navigateur ne prend pas en charge la persistance Firestore');
      }
    });
  
  console.log('✅ Firebase initialisé avec succès');
} else {
  console.error('❌ Firebase SDK non chargé');
}

// Fonction utilitaire pour vérifier l'état de connexion
function isUserLoggedIn() {
  return !!window.auth.currentUser;
}

// Fonction utilitaire pour obtenir l'ID de l'utilisateur actuel
function getCurrentUserId() {
  return window.auth.currentUser ? window.auth.currentUser.uid : null;
}

// Fonction utilitaire pour obtenir les données de l'utilisateur actuel
async function getCurrentUserData() {
  const userId = getCurrentUserId();
  if (!userId) return null;
  
  try {
    const doc = await window.db.collection('users').doc(userId).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    return null;
  }
}

// Exporter les fonctions utilitaires
window.isUserLoggedIn = isUserLoggedIn;
window.getCurrentUserId = getCurrentUserId;
window.getCurrentUserData = getCurrentUserData;