// real-time-service.js - Service de mise à jour en temps réel
// Ce fichier gère toutes les mises à jour en temps réel de l'application

class RealTimeService {
  constructor() {
    this.isActive = false;
    this.intervals = new Map();
    this.lastUpdates = new Map();
    this.dataCache = new Map();
    this.updateCallbacks = new Map();
    this.apiKey = "cqt_rQCtDTV93Qvwpwdj6XX3xMCfq9QM";
    this.serviceStatus = {
      api: { status: 'unknown', lastCheck: null },
      websocket: { status: 'unknown', lastCheck: null }
    };
  }

  // Démarrer le service
  start() {
    if (this.isActive) {
      console.log('⚠️ Service temps réel déjà actif');
      return;
    }

    this.isActive = true;
    console.log('🔄 Démarrage du service temps réel...');

    // Vérifier l'état de l'API
    this.intervals.set('apiStatus', setInterval(() => {
      this.checkAPIStatus();
    }, 60000)); // Vérifier toutes les minutes

    // Mettre à jour les top traders
    this.intervals.set('topTraders', setInterval(() => {
      this.updateTopTraders();
    }, 300000)); // Mettre à jour toutes les 5 minutes

    // Mettre à jour les traders suivis
    this.intervals.set('followedTraders', setInterval(() => {
      this.updateFollowedTraders();
    }, 120000)); // Mettre à jour toutes les 2 minutes

    // Vérifier les nouveaux traders certifiés
    this.intervals.set('certifiedTraders', setInterval(() => {
      this.checkNewCertifiedTraders();
    }, 86400000)); // Vérifier toutes les 24 heures

    // Exécuter immédiatement
    this.checkAPIStatus();
    this.updateTopTraders();
    this.updateFollowedTraders();
    this.checkNewCertifiedTraders();

    console.log('✅ Service temps réel démarré');
  }

  // Arrêter le service
  stop() {
    if (!this.isActive) {
      console.log('⚠️ Service temps réel déjà arrêté');
      return;
    }

    this.isActive = false;
    
    // Arrêter tous les intervalles
    for (const [name, interval] of this.intervals) {
      clearInterval(interval);
      console.log(`🛑 Arrêt de l'intervalle ${name}`);
    }
    
    this.intervals.clear();
    console.log('✅ Service temps réel arrêté');
  }

  // Vérifier l'état de l'API
  async checkAPIStatus() {
    try {
      console.log('🌐 Vérification de l\'état de l\'API...');
      
      const startTime = Date.now();
      const response = await fetch(`https://api.covalenthq.com/v1/eth-mainnet/block_v2/latest/?key=${this.apiKey}`);
      const responseTime = Date.now() - startTime;
      
      this.serviceStatus.api = {
        status: response.ok ? 'online' : 'error',
        responseTime,
        statusCode: response.status,
        lastCheck: new Date()
      };
      
      if (response.ok) {
        console.log(`✅ API OK (${responseTime}ms)`);
      } else {
        console.warn(`⚠️ API Error: ${response.status}`);
        // Notifier les administrateurs en cas de problème
        this.notifyAdmins('API Error', `L'API Covalent rencontre des problèmes (${response.status})`);
      }
      
      return this.serviceStatus.api;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'API:', error);
      
      this.serviceStatus.api = {
        status: 'offline',
        error: error.message,
        lastCheck: new Date()
      };
      
      // Notifier les administrateurs en cas d'erreur
      this.notifyAdmins('API Offline', `L'API Covalent est inaccessible: ${error.message}`);
      
      return this.serviceStatus.api;
    }
  }

  // Mettre à jour les top traders
  async updateTopTraders() {
    try {
      console.log('🏆 Mise à jour des top traders...');
      
      const networks = [
        { id: 'eth-mainnet', code: 'eth', name: 'Ethereum' },
        { id: 'bsc-mainnet', code: 'bsc', name: 'BSC' },
        { id: 'matic-mainnet', code: 'poly', name: 'Polygon' }
      ];
      
      for (const network of networks) {
        await this.updateNetworkTopTraders(network);
      }
      
      console.log('✅ Top traders mis à jour');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des top traders:', error);
    }
  }

  // Mettre à jour les top traders d'un réseau
  async updateNetworkTopTraders(network) {
    try {
      console.log(`🔍 Recherche des top traders sur ${network.name}...`);
      
      // Récupérer les données depuis Firestore
      const snapshot = await window.db.collection('topTraders')
        .where('network', '==', network.code)
        .orderBy('score', 'desc')
        .limit(10)
        .get();
      
      if (snapshot.empty) {
        console.log(`Aucun top trader trouvé pour ${network.name}, génération de données...`);
        await this.generateTopTradersData(network);
        return;
      }
      
      // Mettre à jour l'UI
      const traders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.updateTopTradersUI(network.code, traders);
      
      // Mettre à jour le cache
      this.dataCache.set(`topTraders_${network.code}`, traders);
      this.lastUpdates.set(`topTraders_${network.code}`, new Date());
      
      console.log(`✅ Top traders ${network.name} mis à jour (${traders.length} traders)`);
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour des top traders ${network.name}:`, error);
    }
  }

  // Générer des données de top traders (pour le développement)
  async generateTopTradersData(network) {
    try {
      const batch = window.db.batch();
      const topTradersRef = window.db.collection('topTraders');
      
      // Générer 10 traders aléatoires
      for (let i = 0; i < 10; i++) {
        const address = this.generateRandomAddress();
        const score = Math.floor(Math.random() * 20) + 80; // Score entre 80 et 100
        const profit = Math.floor(Math.random() * 500000) + 50000; // Profit entre 50k et 550k
        
        const traderRef = topTradersRef.doc();
        batch.set(traderRef, {
          address,
          network: network.code,
          score,
          profit,
          change24h: (Math.random() * 20) - 5, // Entre -5% et +15%
          transactions: Math.floor(Math.random() * 500) + 100,
          lastUpdated: new Date()
        });
      }
      
      await batch.commit();
      console.log(`✅ Données générées pour ${network.name}`);
      
      // Recharger les données
      await this.updateNetworkTopTraders(network);
    } catch (error) {
      console.error(`❌ Erreur lors de la génération des données pour ${network.name}:`, error);
    }
  }

  // Mettre à jour l'UI des top traders
  updateTopTradersUI(networkCode, traders) {
    const container = document.getElementById(`${networkCode}TopTraders`);
    if (!container) return;
    
    // Trier par score
    traders.sort((a, b) => b.score - a.score);
    
    // Limiter à 3 traders
    const topThree = traders.slice(0, 3);
    
    // Mettre à jour l'UI
    container.innerHTML = '';
    
    topThree.forEach((trader, index) => {
      const traderElement = document.createElement('div');
      traderElement.className = 'flex items-center justify-between p-3 bg-gray-600 rounded-lg';
      
      const isFollowed = window.isTraderFollowed ? window.isTraderFollowed(trader.address) : false;
      
      traderElement.innerHTML = `
        <div>
          <div class="font-semibold">#${index + 1} ${window.formatAddress ? window.formatAddress(trader.address) : trader.address.substring(0, 6) + '...' + trader.address.substring(trader.address.length - 4)}</div>
          <div class="text-sm text-gray-300">Score: ${trader.score}/100</div>
          <div class="text-sm text-green-400">+$${trader.profit.toLocaleString()}</div>
        </div>
        <button class="follow-trader-btn px-3 py-1 bg-yellow-400 text-gray-900 rounded text-sm font-semibold" data-address="${trader.address}">
          ${isFollowed ? 'Suivi' : 'Suivre'}
        </button>
      `;
      
      container.appendChild(traderElement);
    });
    
    // Réinitialiser les écouteurs d'événements
    document.querySelectorAll('.follow-trader-btn').forEach(btn => {
      btn.onclick = () => {
        const address = btn.dataset.address;
        if (address && window.toggleFollowTrader) {
          window.toggleFollowTrader(address, btn);
        }
      };
    });
  }

  // Mettre à jour les traders suivis
  async updateFollowedTraders() {
    try {
      if (!window.auth?.currentUser) {
        return;
      }
      
      console.log('👥 Mise à jour des traders suivis...');
      
      const userId = window.auth.currentUser.uid;
      const follows = JSON.parse(localStorage.getItem('follows') || '[]');
      const userFollows = follows.filter(f => f.userId === userId);
      
      if (userFollows.length === 0) {
        console.log('Aucun trader suivi');
        return;
      }
      
      // Mettre à jour les données pour chaque trader suivi
      for (const follow of userFollows) {
        await this.updateFollowedTraderData(follow.traderAddress);
      }
      
      console.log(`✅ ${userFollows.length} traders suivis mis à jour`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des traders suivis:', error);
    }
  }

  // Mettre à jour les données d'un trader suivi
  async updateFollowedTraderData(address) {
    try {
      // Vérifier si les données sont en cache et récentes (moins de 5 minutes)
      const cacheKey = `trader_${address}`;
      const cachedData = this.dataCache.get(cacheKey);
      const now = Date.now();
      
      if (cachedData && (now - cachedData.timestamp) < 300000) {
        console.log(`Utilisation des données en cache pour ${address}`);
        return cachedData.data;
      }
      
      console.log(`Récupération des données pour ${address}...`);
      
      // Récupérer les données depuis l'API
      const response = await fetch(`https://api.covalenthq.com/v1/eth-mainnet/address/${address}/transactions_v2/?key=${this.apiKey}&page-size=5`);
      const data = await response.json();
      
      if (!data.data || !data.data.items) {
        throw new Error('Données indisponibles');
      }
      
      // Analyser les transactions
      const transactions = data.data.items;
      const lastTx = transactions[0];
      const last24h = transactions.filter(tx => {
        const txDate = new Date(tx.block_signed_at);
        const now = new Date();
        return (now - txDate) < 24 * 60 * 60 * 1000;
      });
      
      // Calculer les métriques
      const traderData = {
        address,
        lastActivity: new Date(lastTx.block_signed_at),
        txCount24h: last24h.length,
        pnl24h: this.calculatePNL(transactions),
        isActive: (Date.now() - new Date(lastTx.block_signed_at).getTime()) < 3600000 // Actif si tx < 1h
      };
      
      // Mettre à jour le cache
      this.dataCache.set(cacheKey, {
        timestamp: now,
        data: traderData
      });
      
      // Mettre à jour Firestore
      if (window.auth?.currentUser) {
        const userId = window.auth.currentUser.uid;
        window.db.collection('users').doc(userId).collection('followedTraders').doc(address).update({
          lastActivity: traderData.lastActivity,
          txCount24h: traderData.txCount24h,
          pnl24h: traderData.pnl24h,
          isActive: traderData.isActive,
          lastUpdated: new Date()
        }).catch(error => console.error('Erreur lors de la mise à jour Firestore:', error));
      }
      
      return traderData;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour des données pour ${address}:`, error);
      return null;
    }
  }

  // Calculer le PNL (Profit and Loss) à partir des transactions
  calculatePNL(transactions) {
    // Simulation simple pour le moment
    // Dans une implémentation réelle, il faudrait analyser les prix d'entrée et de sortie
    return (Math.random() * 20) - 5; // Entre -5% et +15%
  }

  // Vérifier les nouveaux traders certifiés
  async checkNewCertifiedTraders() {
    try {
      console.log('🔍 Recherche de nouveaux traders certifiés...');
      
      // Récupérer la date de dernière vérification
      const lastCheckKey = 'lastCertifiedTradersCheck';
      const lastCheck = localStorage.getItem(lastCheckKey) ? new Date(localStorage.getItem(lastCheckKey)) : new Date(0);
      const now = new Date();
      
      // Mettre à jour la date de dernière vérification
      localStorage.setItem(lastCheckKey, now.toISOString());
      
      // Récupérer les traders certifiés depuis Firestore
      const snapshot = await window.db.collection('topTraders')
        .where('score', '>=', 90) // Score minimum pour être certifié
        .where('lastUpdated', '>', lastCheck)
        .orderBy('lastUpdated', 'desc')
        .limit(10)
        .get();
      
      if (snapshot.empty) {
        console.log('Aucun nouveau trader certifié trouvé');
        return;
      }
      
      const newCertifiedTraders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`✅ ${newCertifiedTraders.length} nouveaux traders certifiés trouvés`);
      
      // Notifier les utilisateurs
      this.notifyNewCertifiedTraders(newCertifiedTraders);
      
      // Publier sur les réseaux sociaux
      this.publishToSocialMedia(newCertifiedTraders);
    } catch (error) {
      console.error('❌ Erreur lors de la recherche de nouveaux traders certifiés:', error);
    }
  }

  // Notifier les utilisateurs des nouveaux traders certifiés
  notifyNewCertifiedTraders(traders) {
    if (!traders || traders.length === 0) return;
    
    // Créer une notification pour chaque trader
    traders.forEach(trader => {
      const notification = {
        type: 'certified_trader',
        title: 'Nouveau Trader Certifié',
        message: `Un nouveau trader avec un score de ${trader.score}/100 a été certifié sur ${this.getNetworkName(trader.network)}.`,
        traderAddress: trader.address,
        network: trader.network,
        score: trader.score,
        timestamp: new Date()
      };
      
      // Ajouter à Firestore pour tous les utilisateurs
      window.db.collection('notifications').add(notification)
        .then(() => console.log('Notification ajoutée à Firestore'))
        .catch(error => console.error('Erreur lors de l\'ajout de la notification:', error));
      
      // Afficher la notification dans l'application
      if (window.showNotification) {
        window.showNotification(`Nouveau Trader Certifié sur ${this.getNetworkName(trader.network)} avec un score de ${trader.score}/100`, 'success');
      }
      
      // Notification du navigateur
      this.showBrowserNotification(notification.title, notification.message);
    });
  }

  // Afficher une notification du navigateur
  showBrowserNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '../logo.png'
      });
    }
  }

  // Publier sur les réseaux sociaux
  publishToSocialMedia(traders) {
    if (!traders || traders.length === 0) return;
    
    console.log('📱 Publication sur les réseaux sociaux...');
    
    // Sélectionner le meilleur trader
    const bestTrader = traders.reduce((best, current) => 
      current.score > best.score ? current : best, traders[0]);
    
    // Créer le message
    const message = `🚀 Nouveau Trader Certifié sur ${this.getNetworkName(bestTrader.network)} avec un score impressionnant de ${bestTrader.score}/100! Adresse: ${window.formatAddress ? window.formatAddress(bestTrader.address) : bestTrader.address.substring(0, 6) + '...' + bestTrader.address.substring(bestTrader.address.length - 4)} #CryptoTrading #CTC`;
    
    // Simuler la publication sur Twitter
    console.log('Twitter:', message);
    
    // Simuler la publication sur Telegram
    console.log('Telegram:', message);
    
    // Dans une implémentation réelle, il faudrait utiliser les API de Twitter et Telegram
    // Stocker dans Firestore pour référence
    window.db.collection('socialPosts').add({
      message,
      trader: bestTrader,
      platforms: ['twitter', 'telegram'],
      timestamp: new Date()
    }).catch(error => console.error('Erreur lors de l\'enregistrement du post:', error));
  }

  // Notifier les administrateurs
  notifyAdmins(title, message) {
    window.db.collection('adminNotifications').add({
      title,
      message,
      timestamp: new Date(),
      read: false
    }).catch(error => console.error('Erreur lors de la notification des admins:', error));
  }

  // Obtenir le nom d'un réseau à partir de son code
  getNetworkName(networkCode) {
    const networks = {
      'eth': 'Ethereum',
      'bsc': 'BSC',
      'poly': 'Polygon'
    };
    
    return networks[networkCode] || networkCode;
  }

  // Générer une adresse aléatoire (pour le développement)
  generateRandomAddress() {
    let address = '0x';
    const chars = '0123456789abcdef';
    
    for (let i = 0; i < 40; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return address;
  }

  // Obtenir l'état du service
  getStatus() {
    return {
      isActive: this.isActive,
      api: this.serviceStatus.api,
      websocket: this.serviceStatus.websocket,
      lastUpdates: Object.fromEntries(this.lastUpdates),
      intervals: Array.from(this.intervals.keys())
    };
  }
}

// Créer et exporter l'instance
window.realTimeService = new RealTimeService();

// Démarrer le service automatiquement
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.realTimeService.start();
  }, 2000); // Démarrer après 2 secondes pour laisser le temps à l'application de se charger
});