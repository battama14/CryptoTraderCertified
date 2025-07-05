// Service Worker pour CryptoTraderCertified
const CACHE_NAME = 'ctc-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/script.js',
  '/style.css',
  '/logo.png'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Gestion des notifications push
self.addEventListener('push', event => {
  console.log('[Service Worker] Notification push reçue');
  
  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
      console.log('[Service Worker] Données de notification:', data);
    }
  } catch (e) {
    console.error('[Service Worker] Erreur lors du parsing des données:', e);
    // Si le parsing échoue, utiliser le texte brut
    data = {
      title: 'CryptoTraderCertified',
      body: event.data ? event.data.text() : 'Nouvelle activité détectée'
    };
  }

  const options = {
    body: data.body || 'Nouvelle activité détectée',
    icon: data.icon || '/logo.png',
    badge: '/logo.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      traderId: data.traderId || '',
      traderName: data.traderName || '',
      operationType: data.operationType || '',
      amount: data.amount || '',
      token: data.token || '',
      timestamp: data.timestamp || Date.now(),
      txHash: data.txHash || ''
    },
    actions: [
      {
        action: 'view-details',
        title: 'Voir détails'
      },
      {
        action: 'close',
        title: 'Fermer'
      }
    ],
    // Garantir que la notification reste visible jusqu'à ce que l'utilisateur interagisse avec
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'CryptoTraderCertified', options)
      .then(() => {
        console.log('[Service Worker] Notification affichée avec succès');
      })
      .catch(error => {
        console.error('[Service Worker] Erreur lors de l\'affichage de la notification:', error);
      })
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Clic sur notification:', event.action);
  
  // Fermer la notification
  event.notification.close();
  
  // Récupérer l'URL à ouvrir
  let url = '/';
  
  if (event.action === 'close') {
    // Ne rien faire si l'action est "fermer"
    return;
  } else if (event.action === 'view-details' && event.notification.data && event.notification.data.url) {
    // Utiliser l'URL spécifique pour "voir détails"
    url = event.notification.data.url;
  } else if (event.notification.data && event.notification.data.url) {
    // Clic sur la notification elle-même
    url = event.notification.data.url;
  }
  
  console.log('[Service Worker] Ouverture de l\'URL:', url);
  
  // Ouvrir l'URL
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then(clientList => {
        // Vérifier si une fenêtre est déjà ouverte
        for (const client of clientList) {
          // Si l'URL correspond exactement ou si l'URL de la page contient l'URL cible
          if ((client.url === url || client.url.includes(url)) && 'focus' in client) {
            console.log('[Service Worker] Utilisation d\'une fenêtre existante');
            return client.focus();
          }
        }
        
        // Si aucune fenêtre correspondante n'est trouvée, en ouvrir une nouvelle
        if (clients.openWindow) {
          console.log('[Service Worker] Ouverture d\'une nouvelle fenêtre');
          return clients.openWindow(url);
        }
      })
      .catch(error => {
        console.error('[Service Worker] Erreur lors de la gestion du clic sur notification:', error);
      })
  );
});