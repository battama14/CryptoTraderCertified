// Gestion des notifications push pour CryptoTraderCertified

// Clé publique VAPID - doit correspondre à celle dans firebase-config.js
const publicVapidKey = 'BGx5nuudjkt--P7VZ8dUxR9kpyb4lalN0cxXZa255xyOPfLe1_rMb2wyr2DA9yGe-enkQYvFHJddbuUNnPLwmdM';

// Fonction pour enregistrer le Service Worker et s'abonner aux notifications
async function registerPushNotifications() {
    try {
        // Vérifier si le navigateur supporte les Service Workers et les notifications
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.error('Les notifications push ne sont pas supportées par ce navigateur');
            showNotification('Votre navigateur ne supporte pas les notifications push', 'error');
            return false;
        }

        // Vérifier l'état actuel de la permission
        if (Notification.permission === 'denied') {
            console.error('Permission pour les notifications déjà refusée');
            showNotification('Les notifications sont bloquées dans votre navigateur. Veuillez les activer dans les paramètres.', 'warning');
            return false;
        }

        // Demander la permission pour les notifications si pas encore accordée
        if (Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.error('Permission pour les notifications refusée');
                return false;
            }
        }

        // Vérifier si un Service Worker est déjà enregistré
        let registration;
        try {
            registration = await navigator.serviceWorker.ready;
            console.log('Service Worker déjà actif');
        } catch (e) {
            // Enregistrer le Service Worker s'il n'est pas déjà actif
            registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });
            console.log('Service Worker enregistré avec succès');
            
            // Attendre que le Service Worker soit activé
            if (registration.installing) {
                console.log('Service Worker en cours d\'installation...');
                await new Promise(resolve => {
                    registration.installing.addEventListener('statechange', e => {
                        if (e.target.state === 'activated') {
                            console.log('Service Worker activé');
                            resolve();
                        }
                    });
                });
            }
        }

        // Vérifier si un abonnement existe déjà
        let subscription = await registration.pushManager.getSubscription();
        
        // Créer un nouvel abonnement si nécessaire
        if (!subscription) {
            try {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
                });
                console.log('Nouvel abonnement aux notifications push créé');
            } catch (subscribeError) {
                console.error('Erreur lors de l\'abonnement aux notifications push:', subscribeError);
                if (subscribeError.name === 'NotAllowedError') {
                    showNotification('Les notifications ont été bloquées par votre navigateur', 'error');
                } else {
                    showNotification('Erreur lors de l\'abonnement aux notifications: ' + subscribeError.message, 'error');
                }
                return false;
            }
        } else {
            console.log('Abonnement aux notifications push existant récupéré');
        }

        // Envoyer l'abonnement au serveur
        await saveSubscription(subscription);
        showNotification('Notifications push activées avec succès', 'success');
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement des notifications push:', error);
        return false;
    }
}

// Fonction pour enregistrer l'abonnement dans Firestore
async function saveSubscription(subscription) {
    if (!currentUser || !currentUser.uid) {
        console.error('Utilisateur non connecté, impossible d\'enregistrer l\'abonnement');
        return;
    }

    try {
        // Enregistrer l'abonnement dans Firestore
        await db.collection('users').doc(currentUser.uid).update({
            pushSubscription: JSON.stringify(subscription),
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Abonnement enregistré dans Firestore');
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'abonnement:', error);
    }
}

// Fonction pour convertir la clé publique VAPID en Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Fonction pour vérifier si l'utilisateur est déjà abonné aux notifications
async function checkPushSubscription() {
    // Vérifier si le navigateur supporte les Service Workers et les notifications
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Ce navigateur ne supporte pas les notifications push');
        return false;
    }

    // Vérifier si la permission est accordée
    if (Notification.permission !== 'granted') {
        console.log('Permission pour les notifications non accordée');
        return false;
    }

    try {
        // Vérifier si un Service Worker est enregistré et actif
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
                console.log('Abonnement aux notifications push trouvé');
                return true;
            } else {
                console.log('Aucun abonnement aux notifications push trouvé');
                return false;
            }
        } catch (e) {
            console.log('Aucun Service Worker actif');
            return false;
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'abonnement:', error);
        return false;
    }
}

// Fonction pour désabonner des notifications push
async function unsubscribePushNotifications() {
    if (!('serviceWorker' in navigator)) return false;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
            await subscription.unsubscribe();
            
            // Mettre à jour Firestore si l'utilisateur est connecté
            if (currentUser && currentUser.uid) {
                await db.collection('users').doc(currentUser.uid).update({
                    pushSubscription: null,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            console.log('Désabonnement des notifications push réussi');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Erreur lors du désabonnement des notifications push:', error);
        return false;
    }
}

// Fonction pour simuler l'envoi d'une notification (pour les tests)
async function sendTestNotification() {
    if (!currentUser) {
        showNotification('Vous devez être connecté pour recevoir des notifications', 'error');
        return;
    }
    
    try {
        // Vérifier si l'utilisateur est abonné aux notifications
        const isSubscribed = await checkPushSubscription();
        if (!isSubscribed) {
            if (confirm('Vous n\'êtes pas abonné aux notifications push. Voulez-vous vous abonner maintenant?')) {
                const success = await registerPushNotifications();
                if (!success) {
                    showNotification('Impossible d\'activer les notifications push', 'error');
                    return;
                }
            } else {
                return;
            }
        }
        
        // 1. Créer une notification dans Firestore
        const notificationData = {
            userId: currentUser.uid,
            title: 'Test de notification',
            body: 'Ceci est un test de notification push',
            icon: '/logo.png',
            url: '/#followed-traders',
            traderId: 'test_trader',
            traderName: 'Trader Test',
            operationType: 'achat',
            amount: '1.5',
            token: 'ETH',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            read: false,
            txHash: 'test_' + Date.now()
        };
        
        await db.collection('notifications').add(notificationData);
        
        // 2. Afficher la notification dans l'interface si la fonction existe
        if (typeof showTraderNotification === 'function') {
            showTraderNotification(notificationData);
        }
        
        // 3. Afficher une notification native via le Service Worker si possible
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification('Test de notification native', {
                    body: 'Ceci est un test de notification native (via le Service Worker)',
                    icon: '/logo.png',
                    badge: '/logo.png',
                    vibrate: [100, 50, 100],
                    data: {
                        url: '/#followed-traders'
                    }
                });
            } catch (err) {
                console.error('Erreur lors de l\'affichage de la notification native:', err);
            }
        }
        
        showNotification('Notification de test envoyée', 'success');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de la notification de test:', error);
        showNotification('Erreur lors de l\'envoi de la notification de test', 'error');
    }
}