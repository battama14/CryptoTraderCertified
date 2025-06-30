// notification-service.js - Service de gestion des notifications
// Ce fichier gère toutes les notifications de l'application

class NotificationService {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
    this.isInitialized = false;
    this.listeners = new Set();
  }

  // Initialiser le service
  initialize() {
    if (this.isInitialized) return;
    
    console.log('🔔 Initialisation du service de notifications...');
    
    // Écouter les changements d'authentification
    window.auth.onAuthStateChanged(user => {
      if (user) {
        this.loadNotifications();
        this.setupRealtimeNotifications();
      } else {
        this.clearNotifications();
      }
    });
    
    // Configurer les écouteurs d'événements
    this.setupEventListeners();
    
    this.isInitialized = true;
    console.log('✅ Service de notifications initialisé');
  }

  // Configurer les écouteurs d'événements
  setupEventListeners() {
    // Marquer toutes les notifications comme lues
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', () => {
        this.markAllAsRead();
      });
    }
  }

  // Configurer les notifications en temps réel
  setupRealtimeNotifications() {
    if (!window.auth.currentUser) return;
    
    const userId = window.auth.currentUser.uid;
    
    // Écouter les nouvelles notifications globales
    window.db.collection('notifications')
      .where('timestamp', '>', new Date(Date.now() - 86400000)) // Dernières 24h
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const notification = {
              id: change.doc.id,
              ...change.doc.data(),
              read: false
            };
            
            this.addNotification(notification);
          }
        });
      }, error => {
        console.error('Erreur lors de l\'écoute des notifications:', error);
      });
    
    // Écouter les notifications spécifiques à l'utilisateur
    window.db.collection('users').doc(userId).collection('notifications')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const notification = {
              id: change.doc.id,
              ...change.doc.data(),
              userSpecific: true
            };
            
            this.addNotification(notification);
          } else if (change.type === 'modified') {
            const notification = {
              id: change.doc.id,
              ...change.doc.data(),
              userSpecific: true
            };
            
            this.updateNotification(notification);
          }
        });
      }, error => {
        console.error('Erreur lors de l\'écoute des notifications utilisateur:', error);
      });
  }

  // Charger les notifications
  async loadNotifications() {
    if (!window.auth.currentUser) return;
    
    try {
      console.log('🔄 Chargement des notifications...');
      
      // Réinitialiser les notifications
      this.notifications = [];
      this.unreadCount = 0;
      
      // Charger les notifications globales
      const globalSnapshot = await window.db.collection('notifications')
        .where('timestamp', '>', new Date(Date.now() - 86400000)) // Dernières 24h
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
      
      // Charger les notifications spécifiques à l'utilisateur
      const userId = window.auth.currentUser.uid;
      const userSnapshot = await window.db.collection('users').doc(userId).collection('notifications')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
      
      // Charger l'état de lecture des notifications
      const readStatusSnapshot = await window.db.collection('users').doc(userId).collection('readNotifications').get();
      const readNotifications = new Set();
      
      readStatusSnapshot.forEach(doc => {
        readNotifications.add(doc.id);
      });
      
      // Ajouter les notifications globales
      globalSnapshot.forEach(doc => {
        const notification = {
          id: doc.id,
          ...doc.data(),
          read: readNotifications.has(doc.id)
        };
        
        this.notifications.push(notification);
        
        if (!notification.read) {
          this.unreadCount++;
        }
      });
      
      // Ajouter les notifications spécifiques à l'utilisateur
      userSnapshot.forEach(doc => {
        const notification = {
          id: doc.id,
          ...doc.data(),
          userSpecific: true,
          read: doc.data().read || false
        };
        
        this.notifications.push(notification);
        
        if (!notification.read) {
          this.unreadCount++;
        }
      });
      
      // Trier par date
      this.notifications.sort((a, b) => {
        return b.timestamp.toDate() - a.timestamp.toDate();
      });
      
      console.log(`✅ ${this.notifications.length} notifications chargées (${this.unreadCount} non lues)`);
      
      // Mettre à jour l'UI
      this.updateNotificationUI();
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des notifications:', error);
    }
  }

  // Ajouter une notification
  addNotification(notification) {
    // Vérifier si la notification existe déjà
    const existingIndex = this.notifications.findIndex(n => n.id === notification.id);
    
    if (existingIndex !== -1) {
      // Mettre à jour la notification existante
      this.notifications[existingIndex] = notification;
    } else {
      // Ajouter la nouvelle notification
      this.notifications.unshift(notification);
      
      // Limiter à 20 notifications
      if (this.notifications.length > 20) {
        this.notifications.pop();
      }
      
      // Incrémenter le compteur de non lues
      if (!notification.read) {
        this.unreadCount++;
      }
      
      // Afficher une notification du navigateur
      this.showBrowserNotification(notification);
    }
    
    // Mettre à jour l'UI
    this.updateNotificationUI();
    
    // Notifier les écouteurs
    this.notifyListeners('notification_added', notification);
  }

  // Mettre à jour une notification
  updateNotification(notification) {
    const index = this.notifications.findIndex(n => n.id === notification.id);
    
    if (index !== -1) {
      const oldNotification = this.notifications[index];
      this.notifications[index] = notification;
      
      // Mettre à jour le compteur de non lues
      if (oldNotification.read && !notification.read) {
        this.unreadCount++;
      } else if (!oldNotification.read && notification.read) {
        this.unreadCount--;
      }
      
      // Mettre à jour l'UI
      this.updateNotificationUI();
      
      // Notifier les écouteurs
      this.notifyListeners('notification_updated', notification);
    }
  }

  // Marquer une notification comme lue
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    
    if (notification && !notification.read) {
      notification.read = true;
      this.unreadCount--;
      
      // Mettre à jour dans Firestore
      this.updateReadStatus(notificationId, true);
      
      // Mettre à jour l'UI
      this.updateNotificationUI();
      
      // Notifier les écouteurs
      this.notifyListeners('notification_read', notification);
    }
  }

  // Marquer toutes les notifications comme lues
  markAllAsRead() {
    let updated = false;
    
    this.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        updated = true;
        
        // Mettre à jour dans Firestore
        this.updateReadStatus(notification.id, true);
      }
    });
    
    if (updated) {
      this.unreadCount = 0;
      
      // Mettre à jour l'UI
      this.updateNotificationUI();
      
      // Notifier les écouteurs
      this.notifyListeners('all_notifications_read');
    }
  }

  // Mettre à jour l'état de lecture dans Firestore
  updateReadStatus(notificationId, isRead) {
    if (!window.auth.currentUser) return;
    
    const userId = window.auth.currentUser.uid;
    
    if (isRead) {
      // Marquer comme lu
      window.db.collection('users').doc(userId).collection('readNotifications').doc(notificationId).set({
        readAt: new Date()
      }).catch(error => {
        console.error('Erreur lors de la mise à jour de l\'état de lecture:', error);
      });
    } else {
      // Marquer comme non lu
      window.db.collection('users').doc(userId).collection('readNotifications').doc(notificationId).delete()
        .catch(error => {
          console.error('Erreur lors de la suppression de l\'état de lecture:', error);
        });
    }
  }

  // Effacer toutes les notifications
  clearNotifications() {
    this.notifications = [];
    this.unreadCount = 0;
    
    // Mettre à jour l'UI
    this.updateNotificationUI();
    
    // Notifier les écouteurs
    this.notifyListeners('notifications_cleared');
  }

  // Mettre à jour l'UI des notifications
  updateNotificationUI() {
    // Mettre à jour le badge
    const badge = document.getElementById('notificationBadge');
    const mobileBadge = document.getElementById('mobileNotificationBadge');
    
    if (badge) {
      if (this.unreadCount > 0) {
        badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
    
    if (mobileBadge) {
      if (this.unreadCount > 0) {
        mobileBadge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
        mobileBadge.classList.remove('hidden');
      } else {
        mobileBadge.classList.add('hidden');
      }
    }
    
    // Mettre à jour la liste des notifications
    this.updateNotificationList();
  }

  // Mettre à jour la liste des notifications
  updateNotificationList() {
    const notificationList = document.getElementById('notificationList');
    const mobileNotificationList = document.getElementById('mobileNotificationList');
    
    if (notificationList) {
      notificationList.innerHTML = '';
      
      if (this.notifications.length === 0) {
        notificationList.innerHTML = `
          <div class="p-4 text-center text-gray-400">
            <i class="fas fa-bell-slash text-2xl mb-2"></i>
            <p>Aucune notification</p>
          </div>
        `;
      } else {
        this.notifications.forEach(notification => {
          const notificationElement = this.createNotificationElement(notification);
          notificationList.appendChild(notificationElement);
        });
      }
    }
    
    if (mobileNotificationList) {
      mobileNotificationList.innerHTML = '';
      
      if (this.notifications.length === 0) {
        mobileNotificationList.innerHTML = `
          <div class="p-4 text-center text-gray-400">
            <i class="fas fa-bell-slash text-2xl mb-2"></i>
            <p>Aucune notification</p>
          </div>
        `;
      } else {
        this.notifications.forEach(notification => {
          const notificationElement = this.createNotificationElement(notification);
          mobileNotificationList.appendChild(notificationElement);
        });
      }
    }
  }

  // Créer un élément de notification
  createNotificationElement(notification) {
    const element = document.createElement('div');
    element.className = `notification-item p-3 border-b border-gray-700 ${notification.read ? '' : 'new'}`;
    element.dataset.id = notification.id;
    
    // Formater la date
    const date = notification.timestamp.toDate ? notification.timestamp.toDate() : new Date(notification.timestamp);
    const formattedDate = this.formatDate(date);
    
    // Déterminer l'icône
    let icon = 'fa-bell';
    let iconColor = 'text-cyan-400';
    
    switch (notification.type) {
      case 'certified_trader':
        icon = 'fa-award';
        iconColor = 'text-yellow-400';
        break;
      case 'price_alert':
        icon = 'fa-chart-line';
        iconColor = 'text-green-400';
        break;
      case 'security_alert':
        icon = 'fa-shield-alt';
        iconColor = 'text-red-400';
        break;
      case 'transaction':
        icon = 'fa-exchange-alt';
        iconColor = 'text-purple-400';
        break;
    }
    
    element.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 mt-1">
          <i class="fas ${icon} ${iconColor}"></i>
        </div>
        <div class="flex-grow">
          <div class="font-semibold">${notification.title}</div>
          <div class="text-sm text-gray-300">${notification.message}</div>
          <div class="text-xs text-gray-400 mt-1">${formattedDate}</div>
        </div>
        ${!notification.read ? `
          <div class="flex-shrink-0">
            <div class="w-2 h-2 bg-cyan-400 rounded-full"></div>
          </div>
        ` : ''}
      </div>
    `;
    
    // Ajouter un écouteur d'événements pour marquer comme lu
    element.addEventListener('click', () => {
      this.markAsRead(notification.id);
    });
    
    return element;
  }

  // Formater une date
  formatDate(date) {
    const now = new Date();
    const diff = now - date;
    
    // Moins d'une minute
    if (diff < 60000) {
      return 'À l\'instant';
    }
    
    // Moins d'une heure
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    
    // Moins d'un jour
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    }
    
    // Moins d'une semaine
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
    
    // Format standard
    return date.toLocaleDateString();
  }

  // Afficher une notification du navigateur
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '../logo.png'
      });
    }
  }

  // Ajouter un écouteur d'événements
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notifier les écouteurs
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Erreur dans un écouteur de notifications:', error);
      }
    });
  }

  // Obtenir le nombre de notifications non lues
  getUnreadCount() {
    return this.unreadCount;
  }

  // Obtenir toutes les notifications
  getNotifications() {
    return [...this.notifications];
  }
}

// Créer et exporter l'instance
window.notificationService = new NotificationService();

// Initialiser le service
document.addEventListener('DOMContentLoaded', () => {
  window.notificationService.initialize();
});

// Fonctions globales pour l'accès depuis d'autres modules
window.loadNotifications = () => window.notificationService.loadNotifications();
window.markNotificationsAsRead = () => window.notificationService.markAllAsRead();