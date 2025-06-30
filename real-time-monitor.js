// real-time-monitor.js - Monitoring en temps réel pour CTC
// Ce script surveille toutes les données et s'assure qu'elles sont mises à jour en temps réel

class RealTimeMonitor {
  constructor() {
    this.isActive = false;
    this.intervals = new Map();
    this.lastUpdates = new Map();
    this.dataCache = new Map();
    this.updateCallbacks = new Map();
    this.monitoringData = {
      followedTraders: [],
      topTraders: {},
      currentWallet: null,
      apiStatus: 'unknown',
      lastFullUpdate: null
    };
  }

  // Démarrer le monitoring
  start() {
    if (this.isActive) {
      console.log('⚠️ Monitoring déjà actif');
      return;
    }

    this.isActive = true;
    console.log('🔄 Démarrage du monitoring temps réel CTC...');

    // Monitoring des traders suivis (toutes les 30 secondes)
    this.intervals.set('followedTraders', setInterval(() => {
      this.monitorFollowedTraders();
    }, 30000));

    // Monitoring des top traders (toutes les 5 minutes)
    this.intervals.set('topTraders', setInterval(() => {
      this.monitorTopTraders();
    }, 300000));

    // Monitoring du wallet actuel (toutes les 15 secondes)
    this.intervals.set('currentWallet', setInterval(() => {
      this.monitorCurrentWallet();
    }, 15000));

    // Monitoring de l'API (toutes les 60 secondes)
    this.intervals.set('apiStatus', setInterval(() => {
      this.monitorAPIStatus();
    }, 60000));

    // Monitoring des graphiques (toutes les 10 secondes)
    this.intervals.set('charts', setInterval(() => {
      this.monitorCharts();
    }, 10000));

    // Monitoring des notifications (toutes les 20 secondes)
    this.intervals.set('notifications', setInterval(() => {
      this.monitorNotifications();
    }, 20000));

    // Première exécution immédiate
    this.runInitialChecks();

    console.log('✅ Monitoring temps réel démarré');
  }

  // Arrêter le monitoring
  stop() {
    if (!this.isActive) {
      console.log('⚠️ Monitoring déjà arrêté');
      return;
    }

    this.isActive = false;
    
    // Arrêter tous les intervalles
    for (const [name, interval] of this.intervals) {
      clearInterval(interval);
      console.log(`🛑 Arrêt monitoring ${name}`);
    }
    
    this.intervals.clear();
    console.log('✅ Monitoring temps réel arrêté');
  }

  // Exécuter les vérifications initiales
  async runInitialChecks() {
    console.log('🔍 Vérifications initiales...');
    
    await Promise.all([
      this.monitorFollowedTraders(),
      this.monitorTopTraders(),
      this.monitorCurrentWallet(),
      this.monitorAPIStatus(),
      this.monitorCharts(),
      this.monitorNotifications()
    ]);

    this.monitoringData.lastFullUpdate = new Date();
    console.log('✅ Vérifications initiales terminées');
  }

  // Monitoring des traders suivis
  async monitorFollowedTraders() {
    try {
      const timestamp = new Date();
      console.log(`👥 Monitoring traders suivis - ${timestamp.toLocaleTimeString()}`);

      // Vérifier si l'utilisateur est connecté
      if (!window.auth?.currentUser) {
        this.updateMonitoringData('followedTraders', { status: 'not_logged_in', traders: [] });
        return;
      }

      // Récupérer les données du localStorage
      const follows = JSON.parse(localStorage.getItem('follows') || '[]');
      const userFollows = follows.filter(f => f.userId === window.auth.currentUser.uid);

      // Vérifier les changements
      const currentData = JSON.stringify(userFollows);
      const lastData = this.dataCache.get('followedTraders');

      if (currentData !== lastData) {
        console.log('🔄 Changement détecté dans les traders suivis');
        this.dataCache.set('followedTraders', currentData);
        
        // Mettre à jour l'affichage
        if (typeof window.loadFollowedTraders === 'function') {
          await window.loadFollowedTraders();
        }
        
        // Mettre à jour le compteur
        if (typeof window.updateFollowCounter === 'function') {
          window.updateFollowCounter();
        }
      }

      // Récupérer les données en temps réel pour chaque trader
      const tradersData = [];
      for (const follow of userFollows) {
        try {
          const traderData = await this.getTraderRealTimeData(follow.traderAddress);
          tradersData.push({
            address: follow.traderAddress,
            ...traderData,
            followedSince: follow.timestamp
          });
        } catch (error) {
          console.warn(`Erreur données trader ${follow.traderAddress}:`, error);
        }
      }

      this.updateMonitoringData('followedTraders', {
        status: 'active',
        count: userFollows.length,
        traders: tradersData,
        lastUpdate: timestamp
      });

      // Vérifier les alertes
      this.checkTraderAlerts(tradersData);

    } catch (error) {
      console.error('Erreur monitoring traders suivis:', error);
      this.updateMonitoringData('followedTraders', { status: 'error', error: error.message });
    }
  }

  // Monitoring des top traders
  async monitorTopTraders() {
    try {
      const timestamp = new Date();
      console.log(`🏆 Monitoring top traders - ${timestamp.toLocaleTimeString()}`);

      const networks = [
        { id: 'eth-mainnet', container: 'ethTopTraders', name: 'Ethereum' },
        { id: 'bsc-mainnet', container: 'bscTopTraders', name: 'BSC' },
        { id: 'matic-mainnet', container: 'polyTopTraders', name: 'Polygon' }
      ];

      const topTradersData = {};

      for (const network of networks) {
        try {
          // Simuler la récupération des top traders (remplacer par vraie API)
          const topTraders = await this.getTopTradersForNetwork(network.id);
          topTradersData[network.id] = {
            name: network.name,
            traders: topTraders,
            lastUpdate: timestamp
          };

          // Vérifier si l'affichage doit être mis à jour
          const container = document.getElementById(network.container);
          if (container) {
            const currentContent = container.innerHTML;
            const lastContent = this.dataCache.get(`topTraders_${network.id}`);
            
            if (currentContent !== lastContent) {
              console.log(`🔄 Mise à jour top traders ${network.name}`);
              this.dataCache.set(`topTraders_${network.id}`, currentContent);
            }
          }
        } catch (error) {
          console.warn(`Erreur top traders ${network.name}:`, error);
          topTradersData[network.id] = { error: error.message };
        }
      }

      this.updateMonitoringData('topTraders', topTradersData);

    } catch (error) {
      console.error('Erreur monitoring top traders:', error);
    }
  }

  // Monitoring du wallet actuel
  async monitorCurrentWallet() {
    try {
      if (!window.currentWalletData) {
        this.updateMonitoringData('currentWallet', { status: 'no_wallet' });
        return;
      }

      const timestamp = new Date();
      console.log(`💰 Monitoring wallet actuel - ${timestamp.toLocaleTimeString()}`);

      const walletAddress = window.currentWalletData.address;
      
      // Vérifier les nouvelles transactions
      const newTransactions = await this.checkNewTransactions(walletAddress);
      
      if (newTransactions.length > 0) {
        console.log(`🆕 ${newTransactions.length} nouvelles transactions détectées`);
        
        // Mettre à jour les données du wallet
        await this.refreshWalletData(walletAddress);
        
        // Envoyer des notifications si configurées
        if (window.auth?.currentUser) {
          await this.sendTransactionNotifications(walletAddress, newTransactions);
        }
      }

      // Vérifier les changements de prix des actifs
      await this.monitorAssetPrices();

      this.updateMonitoringData('currentWallet', {
        status: 'active',
        address: walletAddress,
        newTransactions: newTransactions.length,
        lastUpdate: timestamp
      });

    } catch (error) {
      console.error('Erreur monitoring wallet:', error);
      this.updateMonitoringData('currentWallet', { status: 'error', error: error.message });
    }
  }

  // Monitoring du statut de l'API
  async monitorAPIStatus() {
    try {
      const timestamp = new Date();
      console.log(`🌐 Monitoring API - ${timestamp.toLocaleTimeString()}`);

      // Test de connectivité Covalent API
      const apiKey = "cqt_rQCtDTV93Qvwpwdj6XX3xMCfq9QM";
      const testUrl = `https://api.covalenthq.com/v1/1/block_v2/latest/?key=${apiKey}`;
      
      const startTime = Date.now();
      const response = await fetch(testUrl);
      const responseTime = Date.now() - startTime;
      
      const apiStatus = {
        status: response.ok ? 'online' : 'error',
        responseTime: responseTime,
        statusCode: response.status,
        lastCheck: timestamp
      };

      if (response.ok) {
        const data = await response.json();
        apiStatus.hasData = !!(data && data.data);
        console.log(`✅ API OK (${responseTime}ms)`);
      } else {
        console.warn(`⚠️ API Error: ${response.status}`);
      }

      this.updateMonitoringData('apiStatus', apiStatus);

      // Mettre à jour l'indicateur visuel si présent
      this.updateAPIStatusIndicator(apiStatus);

    } catch (error) {
      console.error('Erreur monitoring API:', error);
      this.updateMonitoringData('apiStatus', {
        status: 'offline',
        error: error.message,
        lastCheck: new Date()
      });
    }
  }

  // Monitoring des graphiques
  async monitorCharts() {
    try {
      const chartIds = ['assetsChart', 'performanceChart', 'activityChart'];
      const chartsStatus = {};

      for (const chartId of chartIds) {
        const canvas = document.getElementById(chartId);
        if (canvas) {
          const hasChart = canvas.chart || canvas._chart || (window.Chart && window.Chart.getChart(canvas));
          chartsStatus[chartId] = {
            exists: true,
            initialized: !!hasChart,
            visible: !canvas.closest('.hidden')
          };

          // Vérifier si le graphique a besoin d'être mis à jour
          if (hasChart && window.currentWalletData) {
            this.refreshChartIfNeeded(chartId, hasChart);
          }
        } else {
          chartsStatus[chartId] = { exists: false };
        }
      }

      this.updateMonitoringData('charts', chartsStatus);

    } catch (error) {
      console.error('Erreur monitoring graphiques:', error);
    }
  }

  // Monitoring des notifications
  async monitorNotifications() {
    try {
      if (!window.auth?.currentUser) {
        this.updateMonitoringData('notifications', { status: 'not_logged_in' });
        return;
      }

      // Vérifier les paramètres de notification
      const notificationSettings = await this.getNotificationSettings();
      
      // Vérifier les permissions du navigateur
      const browserPermission = 'Notification' in window ? Notification.permission : 'not_supported';
      
      this.updateMonitoringData('notifications', {
        status: 'active',
        settings: notificationSettings,
        browserPermission: browserPermission,
        lastCheck: new Date()
      });

    } catch (error) {
      console.error('Erreur monitoring notifications:', error);
    }
  }

  // Récupérer les données temps réel d'un trader
  async getTraderRealTimeData(address) {
    const apiKey = "cqt_rQCtDTV93Qvwpwdj6XX3xMCfq9QM";
    
    try {
      const response = await fetch(`https://api.covalenthq.com/v1/eth-mainnet/address/${address}/transactions_v2/?key=${apiKey}&page-size=5`);
      const data = await response.json();
      
      if (data.data && data.data.items && data.data.items.length > 0) {
        const lastTx = data.data.items[0];
        const last24h = data.data.items.filter(tx => {
          const txDate = new Date(tx.block_signed_at);
          const now = new Date();
          return (now - txDate) < 24 * 60 * 60 * 1000;
        });
        
        return {
          lastActivity: new Date(lastTx.block_signed_at),
          txCount24h: last24h.length,
          pnl24h: (Math.random() * 20 - 10), // Simulé
          isActive: (Date.now() - new Date(lastTx.block_signed_at).getTime()) < 3600000 // Actif si tx < 1h
        };
      }
    } catch (error) {
      console.warn('Erreur API trader:', error);
    }
    
    return {
      lastActivity: null,
      txCount24h: 0,
      pnl24h: 0,
      isActive: false
    };
  }

  // Récupérer les top traders d'un réseau
  async getTopTradersForNetwork(chainId) {
    // Simulation - dans la réalité, analyser les données blockchain
    const mockTraders = [
      { 
        address: this.generateRandomAddress(), 
        score: 90 + Math.random() * 10, 
        profit: Math.floor(Math.random() * 500000) + 100000,
        change24h: (Math.random() * 20 - 10)
      },
      { 
        address: this.generateRandomAddress(), 
        score: 85 + Math.random() * 10, 
        profit: Math.floor(Math.random() * 300000) + 50000,
        change24h: (Math.random() * 20 - 10)
      },
      { 
        address: this.generateRandomAddress(), 
        score: 80 + Math.random() * 10, 
        profit: Math.floor(Math.random() * 200000) + 25000,
        change24h: (Math.random() * 20 - 10)
      }
    ];
    
    return mockTraders;
  }

  // Vérifier les nouvelles transactions
  async checkNewTransactions(address) {
    const apiKey = "cqt_rQCtDTV93Qvwpwdj6XX3xMCfq9QM";
    const url = `https://api.covalenthq.com/v1/eth-mainnet/address/${address}/transactions_v2/?key=${apiKey}&page-size=5`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const lastCheck = this.lastUpdates.get(`transactions_${address}`) || new Date(Date.now() - 3600000);
      const newTransactions = [];
      
      if (data.data && data.data.items) {
        data.data.items.forEach(tx => {
          if (new Date(tx.block_signed_at) > lastCheck) {
            newTransactions.push(tx);
          }
        });
      }
      
      this.lastUpdates.set(`transactions_${address}`, new Date());
      return newTransactions;
    } catch (error) {
      console.error('Erreur vérification transactions:', error);
      return [];
    }
  }

  // Actualiser les données du wallet
  async refreshWalletData(address) {
    try {
      if (typeof window.fetchWalletData === 'function') {
        const chainId = document.getElementById('chainSelect')?.value || 'eth-mainnet';
        await window.fetchWalletData(address, chainId);
        
        // Mettre à jour l'affichage
        if (typeof window.displayWalletDetails === 'function') {
          window.displayWalletDetails(address);
        }
        
        console.log('🔄 Données wallet actualisées');
      }
    } catch (error) {
      console.error('Erreur actualisation wallet:', error);
    }
  }

  // Surveiller les prix des actifs
  async monitorAssetPrices() {
    if (!window.currentWalletData?.balances?.items) return;

    try {
      // Vérifier les changements de prix significatifs (>5%)
      const significantChanges = [];
      
      for (const asset of window.currentWalletData.balances.items) {
        if (asset.quote > 100) { // Seulement les actifs > $100
          const lastPrice = this.dataCache.get(`price_${asset.contract_address}`);
          const currentPrice = asset.quote;
          
          if (lastPrice && Math.abs((currentPrice - lastPrice) / lastPrice) > 0.05) {
            significantChanges.push({
              symbol: asset.contract_ticker_symbol,
              oldPrice: lastPrice,
              newPrice: currentPrice,
              change: ((currentPrice - lastPrice) / lastPrice) * 100
            });
          }
          
          this.dataCache.set(`price_${asset.contract_address}`, currentPrice);
        }
      }

      if (significantChanges.length > 0) {
        console.log('💰 Changements de prix significatifs:', significantChanges);
        this.notifyPriceChanges(significantChanges);
      }
    } catch (error) {
      console.error('Erreur monitoring prix:', error);
    }
  }

  // Envoyer des notifications de transaction
  async sendTransactionNotifications(address, transactions) {
    try {
      const settings = await this.getNotificationSettings();
      
      if (!settings || (!settings.email && !settings.push && !settings.telegram)) {
        return;
      }

      const message = `🔔 ${transactions.length} nouvelle(s) transaction(s) pour ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
      
      // Notification push
      if (settings.push && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('CTC - Nouvelle Transaction', {
          body: message,
          icon: '/logo.png'
        });
      }
      
      // Notification visuelle dans l'interface
      this.showInAppNotification(message);
      
    } catch (error) {
      console.error('Erreur notifications:', error);
    }
  }

  // Vérifier les alertes des traders
  checkTraderAlerts(tradersData) {
    for (const trader of tradersData) {
      // Alerte si trader très actif (>10 transactions en 24h)
      if (trader.txCount24h > 10) {
        this.showAlert(`🔥 ${trader.address.substring(0, 6)}... très actif: ${trader.txCount24h} transactions en 24h`);
      }
      
      // Alerte si gros gain/perte
      if (Math.abs(trader.pnl24h) > 50) {
        const emoji = trader.pnl24h > 0 ? '📈' : '📉';
        this.showAlert(`${emoji} ${trader.address.substring(0, 6)}... P&L 24h: ${trader.pnl24h.toFixed(2)}%`);
      }
    }
  }

  // Notifier les changements de prix
  notifyPriceChanges(changes) {
    for (const change of changes) {
      const emoji = change.change > 0 ? '📈' : '📉';
      const message = `${emoji} ${change.symbol}: ${change.change > 0 ? '+' : ''}${change.change.toFixed(2)}%`;
      this.showInAppNotification(message);
    }
  }

  // Notifications désactivées pour la production
  showInAppNotification(message) {
    // console.log('Notification:', message);
  }

  // Alertes désactivées pour la production
  showAlert(message) {
    console.log('🚨 ALERTE:', message);
    // this.showInAppNotification(message);
  }

  // Mettre à jour l'indicateur de statut API
  updateAPIStatusIndicator(status) {
    let indicator = document.getElementById('api-status-indicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'api-status-indicator';
      indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        z-index: 9999;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(indicator);
    }
    
    if (status.status === 'online') {
      indicator.style.backgroundColor = '#28a745';
      indicator.title = `API Online (${status.responseTime}ms)`;
    } else {
      indicator.style.backgroundColor = '#dc3545';
      indicator.title = `API ${status.status}`;
    }
  }

  // Actualiser un graphique si nécessaire
  refreshChartIfNeeded(chartId, chart) {
    try {
      // Vérifier si les données ont changé
      const lastUpdate = this.lastUpdates.get(`chart_${chartId}`);
      const now = Date.now();
      
      // Actualiser toutes les 30 secondes
      if (!lastUpdate || (now - lastUpdate) > 30000) {
        if (chart.update) {
          chart.update('none'); // Mise à jour sans animation
        }
        this.lastUpdates.set(`chart_${chartId}`, now);
      }
    } catch (error) {
      console.warn(`Erreur actualisation chart ${chartId}:`, error);
    }
  }

  // Récupérer les paramètres de notification
  async getNotificationSettings() {
    try {
      if (!window.auth?.currentUser || !window.db) {
        return null;
      }
      
      // Simuler la récupération depuis Firebase
      return {
        email: true,
        push: true,
        telegram: false
      };
    } catch (error) {
      console.warn('Erreur paramètres notifications:', error);
      return null;
    }
  }

  // Générer une adresse aléatoire
  generateRandomAddress() {
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  }

  // Mettre à jour les données de monitoring
  updateMonitoringData(key, data) {
    this.monitoringData[key] = data;
    
    // Déclencher les callbacks si présents
    const callbacks = this.updateCallbacks.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erreur callback ${key}:`, error);
        }
      });
    }
  }

  // Ajouter un callback de mise à jour
  onUpdate(key, callback) {
    if (!this.updateCallbacks.has(key)) {
      this.updateCallbacks.set(key, []);
    }
    this.updateCallbacks.get(key).push(callback);
  }

  // Obtenir les données de monitoring
  getMonitoringData() {
    return { ...this.monitoringData };
  }

  // Obtenir le statut
  getStatus() {
    return {
      isActive: this.isActive,
      activeIntervals: this.intervals.size,
      lastFullUpdate: this.monitoringData.lastFullUpdate,
      dataKeys: Object.keys(this.monitoringData)
    };
  }
}

// Créer une instance globale
window.realTimeMonitor = new RealTimeMonitor();

// Interface utilisateur pour le monitoring
function createMonitorUI() {
  const monitorUI = document.createElement('div');
  monitorUI.id = 'ctc-monitor-ui';
  monitorUI.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    border-radius: 8px;
    padding: 15px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    max-width: 300px;
    z-index: 9998;
    border: 1px solid #333;
  `;

  monitorUI.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <h4 style="margin: 0; color: #00ff00;">🔄 Monitor CTC</h4>
      <button id="toggle-monitor" style="background: #28a745; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">Start</button>
    </div>
    <div id="monitor-status" style="font-size: 11px; line-height: 1.4;">
      <div>Status: <span id="monitor-active">Arrêté</span></div>
      <div>API: <span id="api-status">-</span></div>
      <div>Traders: <span id="traders-count">-</span></div>
      <div>Wallet: <span id="wallet-status">-</span></div>
      <div>Dernière MAJ: <span id="last-update">-</span></div>
    </div>
  `;

  document.body.appendChild(monitorUI);

  // Event listeners
  const toggleBtn = document.getElementById('toggle-monitor');
  let isMonitoring = false;

  toggleBtn.onclick = () => {
    if (isMonitoring) {
      window.realTimeMonitor.stop();
      toggleBtn.textContent = 'Start';
      toggleBtn.style.background = '#28a745';
      isMonitoring = false;
    } else {
      window.realTimeMonitor.start();
      toggleBtn.textContent = 'Stop';
      toggleBtn.style.background = '#dc3545';
      isMonitoring = true;
    }
  };

  // Mettre à jour l'interface toutes les 2 secondes
  setInterval(() => {
    updateMonitorUI();
  }, 2000);

  function updateMonitorUI() {
    const status = window.realTimeMonitor.getStatus();
    const data = window.realTimeMonitor.getMonitoringData();
    
    document.getElementById('monitor-active').textContent = status.isActive ? 'Actif' : 'Arrêté';
    document.getElementById('monitor-active').style.color = status.isActive ? '#00ff00' : '#ff6b6b';
    
    document.getElementById('api-status').textContent = data.apiStatus?.status || '-';
    document.getElementById('api-status').style.color = data.apiStatus?.status === 'online' ? '#00ff00' : '#ff6b6b';
    
    document.getElementById('traders-count').textContent = data.followedTraders?.count || '0';
    
    document.getElementById('wallet-status').textContent = data.currentWallet?.status || '-';
    document.getElementById('wallet-status').style.color = data.currentWallet?.status === 'active' ? '#00ff00' : '#888';
    
    const lastUpdate = status.lastFullUpdate;
    document.getElementById('last-update').textContent = lastUpdate ? 
      lastUpdate.toLocaleTimeString() : '-';
  }
}

// Ajouter les styles CSS pour les animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Interface désactivée pour la production
// document.addEventListener('DOMContentLoaded', () => {
//   setTimeout(() => {
//     createMonitorUI();
//     console.log('🔄 Interface de monitoring CTC créée!');
//   }, 3000);
// });

// Commandes console
console.log(`
🔄 MONITORING TEMPS RÉEL CTC CHARGÉ
===================================

Commandes disponibles:
- realTimeMonitor.start()           : Démarrer le monitoring
- realTimeMonitor.stop()            : Arrêter le monitoring
- realTimeMonitor.getStatus()       : Voir le statut
- realTimeMonitor.getMonitoringData() : Voir les données

L'interface de monitoring apparaîtra en bas à gauche dans 3 secondes.
`);