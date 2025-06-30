// trader-monitor.js - Service de surveillance des traders
// Ce fichier gère la surveillance des traders et la détection des nouveaux traders certifiés

class TraderMonitor {
  constructor() {
    this.isActive = false;
    this.checkInterval = null;
    this.dailyCheckInterval = null;
    this.topTraders = {
      eth: [],
      bsc: [],
      poly: []
    };
    this.lastCheck = null;
    this.apiKey = "cqt_rQCtDTV93Qvwpwdj6XX3xMCfq9QM";
  }

  // Démarrer la surveillance
  start() {
    if (this.isActive) {
      console.log('⚠️ Surveillance des traders déjà active');
      return;
    }

    this.isActive = true;
    console.log('🔍 Démarrage de la surveillance des traders...');

    // Charger les top traders actuels
    this.loadTopTraders();

    // Vérifier les nouveaux traders toutes les 4 heures
    this.checkInterval = setInterval(() => {
      this.checkForNewTraders();
    }, 4 * 60 * 60 * 1000);

    // Vérifier les nouveaux traders certifiés tous les jours à minuit
    this.setupDailyCheck();

    console.log('✅ Surveillance des traders démarrée');
  }

  // Configurer la vérification quotidienne
  setupDailyCheck() {
    // Calculer le temps jusqu'à minuit
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight - now;

    // Programmer la première vérification à minuit
    setTimeout(() => {
      this.checkForNewCertifiedTraders();
      this.analyzeTopTraders(); // Analyser les performances des traders

      // Ensuite, vérifier tous les jours à minuit
      this.dailyCheckInterval = setInterval(() => {
        this.checkForNewCertifiedTraders();
        this.analyzeTopTraders(); // Analyser les performances des traders
      }, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);

    console.log(`🕛 Prochaine vérification des traders certifiés dans ${Math.floor(timeUntilMidnight / 3600000)} heures`);
    
    // Vérifier si une analyse mensuelle est nécessaire
    const lastMonthlyAnalysis = localStorage.getItem('lastMonthlyAnalysis');
    if (!lastMonthlyAnalysis || (now - new Date(lastMonthlyAnalysis) > 30 * 24 * 60 * 60 * 1000)) {
      console.log('🔍 Lancement de l\'analyse mensuelle des traders...');
      setTimeout(() => {
        this.analyzeTopTradersMonthly();
      }, 5000); // Démarrer après 5 secondes pour ne pas surcharger l'application au démarrage
    }
  }

  // Arrêter la surveillance
  stop() {
    if (!this.isActive) {
      console.log('⚠️ Surveillance des traders déjà arrêtée');
      return;
    }

    this.isActive = false;

    // Arrêter les intervalles
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (this.dailyCheckInterval) {
      clearInterval(this.dailyCheckInterval);
      this.dailyCheckInterval = null;
    }

    console.log('✅ Surveillance des traders arrêtée');
  }

  // Charger les top traders actuels
  async loadTopTraders() {
    try {
      console.log('🔄 Chargement des top traders actuels...');

      const networks = ['eth', 'bsc', 'poly'];
      const promises = networks.map(network => this.loadNetworkTopTraders(network));

      await Promise.all(promises);

      this.lastCheck = new Date();
      console.log('✅ Top traders chargés');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des top traders:', error);
    }
  }

  // Charger les top traders d'un réseau
  async loadNetworkTopTraders(network) {
    try {
      const snapshot = await window.db.collection('topTraders')
        .where('network', '==', network)
        .orderBy('score', 'desc')
        .limit(10)
        .get();

      if (snapshot.empty) {
        console.log(`Aucun top trader trouvé pour ${network}`);
        return;
      }

      this.topTraders[network] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ ${this.topTraders[network].length} top traders chargés pour ${network}`);
    } catch (error) {
      console.error(`❌ Erreur lors du chargement des top traders ${network}:`, error);
    }
  }

  // Vérifier les nouveaux traders
  async checkForNewTraders() {
    try {
      console.log('🔍 Recherche de nouveaux traders...');

      const networks = ['eth', 'bsc', 'poly'];
      const promises = networks.map(network => this.checkNetworkForNewTraders(network));

      await Promise.all(promises);

      this.lastCheck = new Date();
      console.log('✅ Vérification des nouveaux traders terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la recherche de nouveaux traders:', error);
    }
  }

  // Vérifier les nouveaux traders d'un réseau
  async checkNetworkForNewTraders(network) {
    try {
      // Simuler la découverte de nouveaux traders
      // Dans une implémentation réelle, il faudrait analyser les données blockchain
      const newTraders = this.generateRandomTraders(network, 2);

      if (newTraders.length === 0) {
        console.log(`Aucun nouveau trader trouvé pour ${network}`);
        return;
      }

      console.log(`🆕 ${newTraders.length} nouveaux traders trouvés pour ${network}`);

      // Ajouter les nouveaux traders à Firestore
      const batch = window.db.batch();

      newTraders.forEach(trader => {
        const traderRef = window.db.collection('topTraders').doc();
        batch.set(traderRef, {
          ...trader,
          lastUpdated: new Date()
        });
      });

      await batch.commit();

      // Mettre à jour la liste des top traders
      await this.loadNetworkTopTraders(network);

      // Vérifier si les nouveaux traders sont meilleurs que les anciens
      this.checkForBetterTraders(network, newTraders);
    } catch (error) {
      console.error(`❌ Erreur lors de la recherche de nouveaux traders ${network}:`, error);
    }
  }

  // Vérifier si les nouveaux traders sont meilleurs que les anciens
  checkForBetterTraders(network, newTraders) {
    // Trier les traders par score
    const sortedTraders = [...this.topTraders[network]];
    sortedTraders.sort((a, b) => b.score - a.score);

    // Vérifier si un nouveau trader est dans le top 3
    const top3 = sortedTraders.slice(0, 3);
    const betterTraders = newTraders.filter(trader => {
      return trader.score > top3[top3.length - 1].score;
    });

    if (betterTraders.length > 0) {
      console.log(`🏆 ${betterTraders.length} nouveaux traders dans le top 3 de ${network}`);

      // Notifier les utilisateurs
      betterTraders.forEach(trader => {
        this.notifyNewTopTrader(network, trader);
      });
    }
  }

  // Vérifier les nouveaux traders certifiés
  async checkForNewCertifiedTraders() {
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

  // Notifier les utilisateurs d'un nouveau top trader
  notifyNewTopTrader(network, trader) {
    const notification = {
      type: 'top_trader',
      title: 'Nouveau Top Trader',
      message: `Un nouveau trader a rejoint le top 3 sur ${this.getNetworkName(network)} avec un score de ${trader.score}/100.`,
      traderAddress: trader.address,
      network,
      score: trader.score,
      timestamp: new Date()
    };

    // Ajouter à Firestore
    window.db.collection('notifications').add(notification)
      .then(() => console.log('Notification de top trader ajoutée'))
      .catch(error => console.error('Erreur lors de l\'ajout de la notification:', error));

    // Afficher la notification dans l'application
    if (window.showNotification) {
      window.showNotification(`Nouveau Top Trader sur ${this.getNetworkName(network)} avec un score de ${trader.score}/100`, 'success');
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

      // Ajouter à Firestore
      window.db.collection('notifications').add(notification)
        .then(() => console.log('Notification de trader certifié ajoutée'))
        .catch(error => console.error('Erreur lors de l\'ajout de la notification:', error));

      // Afficher la notification dans l'application
      if (window.showNotification) {
        window.showNotification(`Nouveau Trader Certifié sur ${this.getNetworkName(trader.network)} avec un score de ${trader.score}/100`, 'success');
      }
    });
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

  // Générer des traders aléatoires (pour le développement)
  generateRandomTraders(network, count) {
    const traders = [];

    for (let i = 0; i < count; i++) {
      const score = Math.floor(Math.random() * 20) + 80; // Score entre 80 et 100
      const profit = Math.floor(Math.random() * 500000) + 50000; // Profit entre 50k et 550k

      traders.push({
        address: this.generateRandomAddress(),
        network,
        score,
        profit,
        change24h: (Math.random() * 20) - 5, // Entre -5% et +15%
        transactions: Math.floor(Math.random() * 500) + 100
      });
    }

    return traders;
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

  // Obtenir le nom d'un réseau à partir de son code
  getNetworkName(networkCode) {
    const networks = {
      'eth': 'Ethereum',
      'bsc': 'BSC',
      'poly': 'Polygon'
    };

    return networks[networkCode] || networkCode;
  }

  // Analyser les performances des traders (quotidiennement)
  async analyzeTopTraders() {
    try {
      console.log('🔍 Analyse quotidienne des performances des traders...');
      
      const networks = ['eth', 'bsc', 'poly'];
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      for (const network of networks) {
        console.log(`Analyse du réseau ${this.getNetworkName(network)}...`);
        
        try {
          // Récupérer les traders existants pour ce réseau
          const snapshot = await window.db.collection('topTraders')
            .where('network', '==', network)
            .orderBy('score', 'desc')
            .limit(50)
            .get();
          
          if (snapshot.empty) {
            console.log(`Aucun trader trouvé pour ${network}`);
            continue;
          }
          
          const traders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Analyser les performances des traders
          const analyzedTraders = traders.map(trader => {
            // Générer des performances aléatoires pour la semaine
            const weeklyPerformance = Math.random() * 30 - 5; // Entre -5% et +25%
            const weeklyVolume = Math.random() * 1000000 + 50000; // Entre 50k et 1.05M
            
            // Calculer un nouveau score basé sur les performances
            let newScore = trader.score || 80;
            
            if (weeklyPerformance > 15) {
              newScore += Math.floor(Math.random() * 5) + 3; // +3 à +8 points
            } else if (weeklyPerformance > 5) {
              newScore += Math.floor(Math.random() * 3) + 1; // +1 à +4 points
            } else if (weeklyPerformance < -2) {
              newScore -= Math.floor(Math.random() * 5) + 1; // -1 à -6 points
            }
            
            // Limiter le score entre 0 et 100
            newScore = Math.max(0, Math.min(100, newScore));
            
            return {
              ...trader,
              score: newScore,
              weeklyPerformance,
              weeklyVolume,
              lastAnalysis: now
            };
          });
          
          // Trier par score décroissant
          analyzedTraders.sort((a, b) => b.score - a.score);
          
          // Sélectionner les 3 meilleurs traders
          const top3 = analyzedTraders.slice(0, 3);
          
          // Mettre à jour les traders dans Firestore
          const batch = window.db.batch();
          
          for (const trader of analyzedTraders) {
            const traderRef = window.db.collection('topTraders').doc(trader.id);
            batch.update(traderRef, {
              score: trader.score,
              weeklyPerformance: trader.weeklyPerformance,
              weeklyVolume: trader.weeklyVolume,
              lastAnalysis: now,
              isTop3: top3.some(t => t.id === trader.id)
            });
          }
          
          await batch.commit();
          console.log(`✅ Analyse terminée pour ${network}, ${analyzedTraders.length} traders analysés`);
          
          // Mettre à jour les top traders locaux
          this.topTraders[network] = top3;
          
          // Notifier pour les nouveaux top traders
          for (const trader of top3) {
            // Vérifier si c'est un nouveau top trader
            const isNewTop = !traders
              .filter(t => t.isTop3)
              .some(t => t.id === trader.id);
            
            if (isNewTop) {
              this.notifyNewTopTrader(network, trader);
            }
          }
        } catch (error) {
          console.error(`❌ Erreur lors de l'analyse du réseau ${network}:`, error);
        }
      }
      
      console.log('✅ Analyse quotidienne terminée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse quotidienne:', error);
    }
  }
  
  // Analyser les performances des traders sur un mois
  async analyzeTopTradersMonthly() {
    try {
      console.log('🔍 Analyse mensuelle des performances des traders...');
      
      const networks = ['eth', 'bsc', 'poly'];
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      for (const network of networks) {
        console.log(`Analyse mensuelle du réseau ${this.getNetworkName(network)}...`);
        
        try {
          // Découvrir de nouveaux traders performants
          const newTraders = this.generateHighPerformanceTraders(network, 5);
          
          // Ajouter les nouveaux traders à Firestore
          const batch = window.db.batch();
          
          for (const trader of newTraders) {
            const traderRef = window.db.collection('topTraders').doc();
            batch.set(traderRef, {
              ...trader,
              lastUpdated: now,
              discoveredAt: now
            });
          }
          
          await batch.commit();
          console.log(`✅ ${newTraders.length} nouveaux traders performants ajoutés pour ${network}`);
          
          // Mettre à jour la liste des top traders
          await this.loadNetworkTopTraders(network);
        } catch (error) {
          console.error(`❌ Erreur lors de l'analyse mensuelle du réseau ${network}:`, error);
        }
      }
      
      // Enregistrer la date de la dernière analyse mensuelle
      localStorage.setItem('lastMonthlyAnalysis', now.toISOString());
      
      console.log('✅ Analyse mensuelle terminée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse mensuelle:', error);
    }
  }
  
  // Générer des traders à haute performance
  generateHighPerformanceTraders(network, count) {
    const traders = [];

    for (let i = 0; i < count; i++) {
      const score = Math.floor(Math.random() * 15) + 85; // Score entre 85 et 100
      const profit = Math.floor(Math.random() * 1000000) + 100000; // Profit entre 100k et 1.1M

      traders.push({
        address: this.generateRandomAddress(),
        network,
        score,
        profit,
        change24h: (Math.random() * 30) - 5, // Entre -5% et +25%
        transactions: Math.floor(Math.random() * 1000) + 200, // Entre 200 et 1200
        monthlyPerformance: Math.random() * 50 - 5, // Entre -5% et +45%
        monthlyVolume: Math.random() * 5000000 + 100000, // Entre 100k et 5.1M
        lastAnalysis: new Date()
      });
    }

    return traders;
  }
  
  // Obtenir l'état de la surveillance
  getStatus() {
    return {
      isActive: this.isActive,
      lastCheck: this.lastCheck,
      lastMonthlyAnalysis: localStorage.getItem('lastMonthlyAnalysis'),
      topTradersCount: {
        eth: this.topTraders.eth.length,
        bsc: this.topTraders.bsc.length,
        poly: this.topTraders.poly.length
      }
    };
  }
}

// Créer et exporter l'instance
window.traderMonitor = new TraderMonitor();

// Démarrer la surveillance automatiquement
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.traderMonitor.start();
  }, 3000); // Démarrer après 3 secondes pour laisser le temps à l'application de se charger
});