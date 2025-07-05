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

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Initialiser Firebase Messaging pour les notifications push
let messaging = null;
try {
    // Vérifier si le navigateur supporte les notifications
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
        messaging = firebase.messaging();
        
        // Ne pas demander de token ici pour éviter l'erreur "permission-blocked"
        // Le token sera demandé uniquement lors du clic sur le bouton d'activation des notifications
        
        // Gérer les messages reçus lorsque l'application est au premier plan
        messaging.onMessage((payload) => {
            console.log('Message reçu:', payload);
            // Afficher la notification dans l'interface
            if (payload.notification) {
                showTraderNotification({
                    title: payload.notification.title,
                    body: payload.notification.body,
                    url: payload.data?.url || '/',
                    traderId: payload.data?.traderId,
                    traderName: payload.data?.traderName,
                    operationType: payload.data?.operationType,
                    amount: payload.data?.amount,
                    token: payload.data?.token
                });
            }
        });
        
        console.log('Firebase Messaging initialisé avec succès');
    } else {
        console.warn('Ce navigateur ne supporte pas les notifications push');
    }
} catch (error) {
    console.error('Firebase Messaging non disponible:', error);
}

// Exporter les objets Firebase pour les utiliser dans d'autres fichiers
window.auth = auth;
window.db = db;
window.messaging = messaging;