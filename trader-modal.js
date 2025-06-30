// trader-modal.js - Fenêtre modale pour afficher les détails des traders
// Version simplifiée qui s'intègre avec l'application existante

// Variables globales
let currentTraderAddress = null;
let traderUpdateInterval = null;

// Initialisation du module
document.addEventListener('DOMContentLoaded', () => {
  // Ajouter la fenêtre modale au DOM
  addTraderModalToDOM();
  
  // Initialiser les écouteurs d'événements
  initTraderModalEvents();
});

// Ajouter la fenêtre modale au DOM
function addTraderModalToDOM() {
  const modalHTML = `
    <div id="traderModal" class="hidden fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto">
      <div class="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full p-6 relative my-8 mx-4">
        <button id="closeTraderModalBtn" class="absolute top-4 right-4 text-gray-400 hover:text-white">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="flex items-center mb-6">
          <div id="traderNetworkIcon" class="text-3xl mr-3 text-cyan-400">
            <i class="fab fa-ethereum"></i>
          </div>
          <div>
            <h3 id="traderModalTitle" class="text-xl font-bold text-yellow-400">Détails du Trader</h3>
            <p id="traderModalAddress" class="text-gray-300 mono">0x0000...0000</p>
          </div>
          <div class="ml-auto flex items-center gap-2">
            <button id="refreshTraderBtn" class="px-3 py-1 bg-cyan-500 text-white rounded text-sm font-semibold">
              <i class="fas fa-sync-alt"></i> Actualiser
            </button>
            <button id="followModalTraderBtn" class="px-3 py-1 bg-yellow-400 text-gray-900 rounded text-sm font-semibold">
              <i class="fas fa-user-plus"></i> Suivre
            </button>
          </div>
        </div>
        
        <!-- Loader -->
        <div id="traderModalLoader" class="py-20 flex flex-col items-center justify-center">
          <div class="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p class="text-gray-300">Chargement des données en temps réel...</p>
        </div>
        
        <!-- Content -->
        <div id="traderModalContent" class="hidden">
          <!-- Stats Overview -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gray-700 p-4 rounded-lg">
              <h4 class="text-sm text-gray-400 mb-1">Score</h4>
              <div id="traderModalScore" class="text-2xl font-bold text-yellow-400">95/100</div>
            </div>
            <div class="bg-gray-700 p-4 rounded-lg">
              <h4 class="text-sm text-gray-400 mb-1">Valeur Totale</h4>
              <div id="traderModalValue" class="text-2xl font-bold text-white">$250,000</div>
            </div>
            <div class="bg-gray-700 p-4 rounded-lg">
              <h4 class="text-sm text-gray-400 mb-1">Gains</h4>
              <div id="traderModalGains" class="text-2xl font-bold text-green-400">+$120,000</div>
            </div>
            <div class="bg-gray-700 p-4 rounded-lg">
              <h4 class="text-sm text-gray-400 mb-1">Pertes</h4>
              <div id="traderModalLosses" class="text-2xl font-bold text-red-400">-$30,000</div>
            </div>
          </div>
          
          <!-- Tabs -->
          <div class="border-b border-gray-700 mb-6">
            <div class="flex">
              <button class="trader-tab active py-2 px-4 border-b-2 border-yellow-400 text-yellow-400 font-semibold" data-tab="assets">Actifs</button>
              <button class="trader-tab py-2 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-200" data-tab="transactions">Transactions (48h)</button>
              <button class="trader-tab py-2 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-200" data-tab="stats">Statistiques</button>
            </div>
          </div>
          
          <!-- Tab Content -->
          <div id="assetsTab" class="trader-tab-content">
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-gray-700 text-xs uppercase text-gray-400">
                  <tr>
                    <th class="px-4 py-2 rounded-tl-lg">Token</th>
                    <th class="px-4 py-2">Quantité</th>
                    <th class="px-4 py-2">Valeur</th>
                    <th class="px-4 py-2">% du Portfolio</th>
                    <th class="px-4 py-2 rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody id="traderAssetsList" class="divide-y divide-gray-700">
                  <!-- Assets will be inserted here -->
                </tbody>
              </table>
            </div>
          </div>
          
          <div id="transactionsTab" class="trader-tab-content hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-gray-700 text-xs uppercase text-gray-400">
                  <tr>
                    <th class="px-4 py-2 rounded-tl-lg">Date</th>
                    <th class="px-4 py-2">Type</th>
                    <th class="px-4 py-2">Token</th>
                    <th class="px-4 py-2">Montant</th>
                    <th class="px-4 py-2">Valeur</th>
                    <th class="px-4 py-2 rounded-tr-lg">Hash</th>
                  </tr>
                </thead>
                <tbody id="traderTransactionsList" class="divide-y divide-gray-700">
                  <!-- Transactions will be inserted here -->
                </tbody>
              </table>
            </div>
          </div>
          
          <div id="statsTab" class="trader-tab-content hidden">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-gray-700 p-4 rounded-lg">
                <h4 class="text-sm font-semibold text-gray-300 mb-3">Statistiques Détaillées</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-400">Transactions (30j)</p>
                    <p id="traderStatsTxCount" class="text-lg font-semibold">245</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400">Ratio Gains/Pertes</p>
                    <p id="traderStatsRatio" class="text-lg font-semibold">4.2</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400">Rendement Moyen</p>
                    <p id="traderStatsYield" class="text-lg font-semibold">18.5%</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400">Volatilité</p>
                    <p id="traderStatsVolatility" class="text-lg font-semibold">Moyenne</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400">Première Transaction</p>
                    <p id="traderStatsFirstTx" class="text-lg font-semibold">12/05/2023</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400">Dernière Transaction</p>
                    <p id="traderStatsLastTx" class="text-lg font-semibold">Aujourd'hui</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400">Tokens Uniques</p>
                    <p id="traderStatsUniqueTokens" class="text-lg font-semibold">28</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400">Stratégie</p>
                    <p id="traderStatsStrategy" class="text-lg font-semibold">Diversifiée</p>
                  </div>
                </div>
              </div>
              <div class="bg-gray-700 p-4 rounded-lg">
                <h4 class="text-sm font-semibold text-gray-300 mb-3">Activité Récente</h4>
                <div id="recentActivityList" class="space-y-2">
                  <!-- Recent activity will be inserted here -->
                </div>
              </div>
            </div>
          </div>
          
          <!-- Last Update -->
          <div class="mt-6 text-right text-xs text-gray-400">
            <span>Dernière mise à jour: </span>
            <span id="traderModalLastUpdate">il y a quelques secondes</span>
            <span id="traderModalUpdateStatus" class="ml-2 text-green-400">
              <i class="fas fa-circle text-xs"></i> En temps réel
            </span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Ajouter la fenêtre modale au corps du document
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer);
}

// Initialiser les écouteurs d'événements
function initTraderModalEvents() {
  // Fermer la fenêtre modale
  const closeBtn = document.getElementById('closeTraderModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeTraderModal);
  }
  
  // Actualiser les données
  const refreshBtn = document.getElementById('refreshTraderBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      if (currentTraderAddress) {
        loadTraderData(currentTraderAddress, true);
      }
    });
  }
  
  // Suivre/Ne plus suivre le trader
  const followBtn = document.getElementById('followModalTraderBtn');
  if (followBtn) {
    followBtn.addEventListener('click', () => {
      if (currentTraderAddress && window.toggleFollowTrader) {
        window.toggleFollowTrader(currentTraderAddress);
        updateFollowButton();
      }
    });
  }
  
  // Onglets
  const tabs = document.querySelectorAll('.trader-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      
      // Désactiver tous les onglets
      tabs.forEach(t => {
        t.classList.remove('active', 'border-yellow-400', 'text-yellow-400');
        t.classList.add('border-transparent', 'text-gray-400');
      });
      
      // Activer l'onglet cliqué
      tab.classList.add('active', 'border-yellow-400', 'text-yellow-400');
      tab.classList.remove('border-transparent', 'text-gray-400');
      
      // Masquer tous les contenus
      document.querySelectorAll('.trader-tab-content').forEach(content => {
        content.classList.add('hidden');
      });
      
      // Afficher le contenu correspondant
      document.getElementById(tabName + 'Tab').classList.remove('hidden');
    });
  });
  
  // Ajouter des écouteurs pour les boutons "Voir" des traders suivis
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('view-trader-btn')) {
      const address = e.target.getAttribute('data-address');
      if (address) {
        openTraderModal(address);
      }
    }
  });
}

// Ouvrir la fenêtre modale
function openTraderModal(address) {
  if (!address) return;
  
  currentTraderAddress = address;
  
  // Afficher la fenêtre modale
  const modal = document.getElementById('traderModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
  
  // Afficher l'adresse
  const addressElement = document.getElementById('traderModalAddress');
  if (addressElement && window.formatAddress) {
    addressElement.textContent = window.formatAddress(address);
  }
  
  // Mettre à jour le bouton de suivi
  updateFollowButton();
  
  // Afficher le loader
  const loader = document.getElementById('traderModalLoader');
  const content = document.getElementById('traderModalContent');
  
  if (loader && content) {
    loader.classList.remove('hidden');
    content.classList.add('hidden');
  }
  
  // Charger les données du trader
  loadTraderData(address);
}

// Fermer la fenêtre modale
function closeTraderModal() {
  const modal = document.getElementById('traderModal');
  if (modal) {
    modal.classList.add('hidden');
  }
  
  // Arrêter les mises à jour
  if (traderUpdateInterval) {
    clearInterval(traderUpdateInterval);
    traderUpdateInterval = null;
  }
  
  currentTraderAddress = null;
}

// Mettre à jour le bouton de suivi
function updateFollowButton() {
  const followBtn = document.getElementById('followModalTraderBtn');
  if (!followBtn || !currentTraderAddress || !window.isTraderFollowed) return;
  
  const isFollowed = window.isTraderFollowed(currentTraderAddress);
  
  if (isFollowed) {
    followBtn.innerHTML = '<i class="fas fa-user-check"></i> Suivi';
    followBtn.classList.remove('bg-yellow-400', 'text-gray-900');
    followBtn.classList.add('bg-green-500', 'text-white');
  } else {
    followBtn.innerHTML = '<i class="fas fa-user-plus"></i> Suivre';
    followBtn.classList.remove('bg-green-500', 'text-white');
    followBtn.classList.add('bg-yellow-400', 'text-gray-900');
  }
}

// Charger les données du trader
async function loadTraderData(address, forceRefresh = false) {
  try {
    // Vérifier si les données sont en cache
    const cacheKey = `trader_${address}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (!forceRefresh && cachedData) {
      const parsedCache = JSON.parse(cachedData);
      // Utiliser le cache si les données ont moins de 5 minutes
      if (Date.now() - parsedCache.timestamp < 5 * 60 * 1000) {
        console.log('Utilisation des données en cache pour', address);
        displayTraderData(parsedCache.data);
        return;
      }
    }
    
    // Récupérer les données du trader
    const data = await fetchTraderData(address);
    
    // Mettre en cache les données
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
    
    // Afficher les données
    displayTraderData(data);
    
    // Démarrer les mises à jour en temps réel
    startRealTimeUpdates(address);
  } catch (error) {
    console.error('Erreur lors du chargement des données du trader:', error);
    
    // Afficher un message d'erreur
    const loader = document.getElementById('traderModalLoader');
    if (loader) {
      loader.innerHTML = `
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-yellow-400 text-4xl mb-4"></i>
          <p class="text-gray-300">Erreur lors du chargement des données</p>
          <p class="text-gray-400 text-sm mt-2">${error.message}</p>
          <button id="retryLoadBtn" class="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg">
            <i class="fas fa-redo"></i> Réessayer
          </button>
        </div>
      `;
      
      // Ajouter un écouteur pour le bouton de réessai
      const retryBtn = document.getElementById('retryLoadBtn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          loader.innerHTML = `
            <div class="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-gray-300">Chargement des données en temps réel...</p>
          `;
          loadTraderData(address, true);
        });
      }
    }
    
    // Afficher une notification
    if (window.showNotification) {
      window.showNotification('Erreur lors du chargement des données du trader', 'error');
    }
  }
}

// Récupérer les données du trader
async function fetchTraderData(address) {
  try {
    // Récupérer les données du wallet
    const chainId = 'eth-mainnet'; // Par défaut Ethereum
    const apiKey = window.apiKey || "cqt_rQCtDTV93Qvwpwdj6XX3xMCfq9QM";
    
    // Récupérer les actifs
    const balancesResponse = await fetch(`https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?key=${apiKey}`);
    if (!balancesResponse.ok) {
      throw new Error(`Erreur API: ${balancesResponse.status} ${balancesResponse.statusText}`);
    }
    const balancesData = await balancesResponse.json();
    
    // Récupérer les transactions des dernières 48h
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    
    const transactionsResponse = await fetch(`https://api.covalenthq.com/v1/${chainId}/address/${address}/transactions_v2/?key=${apiKey}&page-size=100&start-date=${twoDaysAgo.toISOString().split('T')[0]}`);
    if (!transactionsResponse.ok) {
      throw new Error(`Erreur API: ${transactionsResponse.status} ${transactionsResponse.statusText}`);
    }
    const transactionsData = await transactionsResponse.json();
    
    // Calculer les statistiques
    const stats = calculateStats(balancesData.data, transactionsData.data);
    
    return {
      address,
      chainId,
      balances: balancesData.data,
      transactions: transactionsData.data,
      stats,
      lastUpdate: Date.now()
    };
  } catch (error) {
    console.error('Erreur API:', error);
    
    // Si l'erreur est liée au quota, utiliser des données simulées
    if (error.message.includes('quota') || error.message.includes('rate limit') || error.message.includes('429')) {
      console.log('Quota API dépassé. Utilisation de données simulées.');
      return generateSimulatedData(address);
    }
    
    throw error;
  }
}

// Calculer les statistiques
function calculateStats(balances, transactions) {
  // Calculer la valeur totale
  const totalValue = balances.items.reduce((sum, item) => sum + (item.quote || 0), 0);
  
  // Estimer les gains et pertes
  const gains = totalValue * 0.6; // Simplification: 60% de la valeur totale
  const losses = totalValue * 0.2; // Simplification: 20% de la valeur totale
  
  // Compter les transactions
  const txCount = transactions.items ? transactions.items.length : 0;
  
  // Compter les tokens uniques
  const uniqueTokens = new Set();
  balances.items.forEach(item => {
    if (item.contract_ticker_symbol) {
      uniqueTokens.add(item.contract_ticker_symbol);
    }
  });
  
  // Déterminer la première et dernière transaction
  let firstTx = null;
  let lastTx = null;
  
  if (transactions.items && transactions.items.length > 0) {
    const sortedTx = [...transactions.items].sort((a, b) => 
      new Date(a.block_signed_at) - new Date(b.block_signed_at)
    );
    
    firstTx = new Date(sortedTx[0].block_signed_at);
    lastTx = new Date(sortedTx[sortedTx.length - 1].block_signed_at);
  }
  
  return {
    totalValue,
    gains,
    losses,
    ratio: gains / losses,
    txCount,
    uniqueTokensCount: uniqueTokens.size,
    firstTx,
    lastTx,
    yield: (gains - losses) / totalValue * 100,
    volatility: 'Moyenne',
    strategy: uniqueTokens.size > 5 ? 'Diversifiée' : 'Concentrée',
    score: Math.floor(Math.random() * 20) + 80 // Score entre 80 et 100
  };
}

// Afficher les données du trader
function displayTraderData(data) {
  if (!data) return;
  
  // Masquer le loader et afficher le contenu
  const loader = document.getElementById('traderModalLoader');
  const content = document.getElementById('traderModalContent');
  
  if (loader && content) {
    loader.classList.add('hidden');
    content.classList.remove('hidden');
  }
  
  // Mettre à jour les statistiques générales
  document.getElementById('traderModalScore').textContent = `${data.stats.score}/100`;
  document.getElementById('traderModalValue').textContent = `$${Math.floor(data.stats.totalValue).toLocaleString()}`;
  document.getElementById('traderModalGains').textContent = `+$${Math.floor(data.stats.gains).toLocaleString()}`;
  document.getElementById('traderModalLosses').textContent = `-$${Math.floor(data.stats.losses).toLocaleString()}`;
  
  // Mettre à jour l'icône du réseau
  updateNetworkIcon(data.chainId);
  
  // Afficher les actifs
  displayAssets(data.balances);
  
  // Afficher les transactions
  displayTransactions(data.transactions, data.address);
  
  // Afficher les statistiques détaillées
  displayStats(data.stats);
  
  // Mettre à jour la date de dernière mise à jour
  updateLastUpdateTime(data.lastUpdate);
}

// Mettre à jour l'icône du réseau
function updateNetworkIcon(chainId) {
  const iconContainer = document.getElementById('traderNetworkIcon');
  if (!iconContainer) return;
  
  let icon, color;
  
  switch (chainId) {
    case 'eth-mainnet':
      icon = 'fab fa-ethereum';
      color = 'text-cyan-400';
      break;
    case 'bsc-mainnet':
      icon = 'fas fa-coins';
      color = 'text-yellow-400';
      break;
    case 'matic-mainnet':
      icon = 'fas fa-gem';
      color = 'text-purple-400';
      break;
    default:
      icon = 'fas fa-network-wired';
      color = 'text-gray-400';
  }
  
  // Supprimer toutes les classes de couleur
  iconContainer.className = '';
  iconContainer.classList.add('text-3xl', 'mr-3', color);
  
  // Mettre à jour l'icône
  iconContainer.innerHTML = `<i class="${icon}"></i>`;
}

// Afficher les actifs
function displayAssets(balances) {
  const assetsList = document.getElementById('traderAssetsList');
  if (!assetsList || !balances || !balances.items) return;
  
  // Vider la liste
  assetsList.innerHTML = '';
  
  // Trier les actifs par valeur décroissante
  const assets = [...balances.items];
  assets.sort((a, b) => (b.quote || 0) - (a.quote || 0));
  
  // Calculer la valeur totale
  const totalValue = assets.reduce((sum, item) => sum + (item.quote || 0), 0);
  
  // Afficher chaque actif
  assets.forEach(asset => {
    if (!asset.contract_ticker_symbol || asset.quote < 1) return; // Ignorer les actifs sans symbole ou de faible valeur
    
    const percentage = totalValue > 0 ? (asset.quote / totalValue * 100).toFixed(2) : '0.00';
    const row = document.createElement('tr');
    
    // Formater la quantité
    const balance = parseFloat(asset.balance) / Math.pow(10, asset.contract_decimals || 18);
    const formattedBalance = balance.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    });
    
    row.innerHTML = `
      <td class="px-4 py-3">
        <div class="flex items-center">
          <img src="${asset.logo_url || 'https://etherscan.io/images/main/empty-token.png'}" alt="${asset.contract_ticker_symbol}" class="w-6 h-6 mr-2">
          <span class="font-semibold">${asset.contract_ticker_symbol}</span>
        </div>
      </td>
      <td class="px-4 py-3">${formattedBalance}</td>
      <td class="px-4 py-3">$${Math.floor(asset.quote).toLocaleString()}</td>
      <td class="px-4 py-3">
        <div class="flex items-center">
          <div class="w-full bg-gray-600 rounded-full h-2 mr-2">
            <div class="bg-yellow-400 h-2 rounded-full" style="width: ${percentage}%"></div>
          </div>
          <span>${percentage}%</span>
        </div>
      </td>
      <td class="px-4 py-3">
        <button class="copy-address-btn px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs hover:bg-gray-500" data-address="${asset.contract_address}">
          <i class="fas fa-copy"></i> Copier
        </button>
      </td>
    `;
    
    assetsList.appendChild(row);
  });
  
  // Ajouter des écouteurs d'événements pour les boutons de copie
  const copyButtons = assetsList.querySelectorAll('.copy-address-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const address = btn.getAttribute('data-address');
      copyToClipboard(address);
      if (window.showNotification) {
        window.showNotification('Adresse copiée dans le presse-papiers', 'success');
      }
    });
  });
  
  // Afficher un message si aucun actif
  if (assets.length === 0 || assets.every(asset => asset.quote < 1)) {
    assetsList.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-6 text-center text-gray-400">
          Aucun actif trouvé pour ce trader
        </td>
      </tr>
    `;
  }
}

// Afficher les transactions
function displayTransactions(transactions, address) {
  const transactionsList = document.getElementById('traderTransactionsList');
  if (!transactionsList || !transactions || !transactions.items) return;
  
  // Vider la liste
  transactionsList.innerHTML = '';
  
  // Afficher chaque transaction
  transactions.items.forEach(tx => {
    const row = document.createElement('tr');
    
    // Déterminer le type de transaction
    const isOutgoing = tx.from_address.toLowerCase() === address.toLowerCase();
    const type = isOutgoing ? 'Sortie' : 'Entrée';
    const typeClass = isOutgoing ? 'text-red-400' : 'text-green-400';
    
    // Formater la date
    const date = new Date(tx.block_signed_at);
    const formattedDate = date.toLocaleString();
    
    // Formater le montant
    const value = parseFloat(tx.value) / 1e18;
    const formattedValue = value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    });
    
    // Estimer la valeur en USD (simplifié)
    const usdValue = value * 2000; // Estimation grossière basée sur un prix ETH de 2000$
    
    row.innerHTML = `
      <td class="px-4 py-3">${formattedDate}</td>
      <td class="px-4 py-3 ${typeClass}">${type}</td>
      <td class="px-4 py-3">ETH</td>
      <td class="px-4 py-3">${formattedValue} ETH</td>
      <td class="px-4 py-3">$${Math.floor(usdValue).toLocaleString()}</td>
      <td class="px-4 py-3">
        <a href="https://etherscan.io/tx/${tx.tx_hash}" target="_blank" class="text-cyan-400 hover:underline">
          ${tx.tx_hash.substring(0, 8)}...${tx.tx_hash.substring(tx.tx_hash.length - 6)}
        </a>
      </td>
    `;
    
    transactionsList.appendChild(row);
  });
  
  // Afficher un message si aucune transaction
  if (transactions.items.length === 0) {
    transactionsList.innerHTML = `
      <tr>
        <td colspan="6" class="px-4 py-6 text-center text-gray-400">
          Aucune transaction dans les dernières 48 heures
        </td>
      </tr>
    `;
  }
}

// Afficher les statistiques
function displayStats(stats) {
  if (!stats) return;
  
  // Mettre à jour les statistiques détaillées
  document.getElementById('traderStatsTxCount').textContent = stats.txCount;
  document.getElementById('traderStatsRatio').textContent = stats.ratio.toFixed(1);
  document.getElementById('traderStatsYield').textContent = `${stats.yield.toFixed(1)}%`;
  document.getElementById('traderStatsVolatility').textContent = stats.volatility;
  document.getElementById('traderStatsStrategy').textContent = stats.strategy;
  document.getElementById('traderStatsUniqueTokens').textContent = stats.uniqueTokensCount;
  
  // Formater les dates
  if (stats.firstTx) {
    document.getElementById('traderStatsFirstTx').textContent = stats.firstTx.toLocaleDateString();
  } else {
    document.getElementById('traderStatsFirstTx').textContent = 'Inconnue';
  }
  
  if (stats.lastTx) {
    const now = new Date();
    const diffDays = Math.floor((now - stats.lastTx) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      document.getElementById('traderStatsLastTx').textContent = "Aujourd'hui";
    } else if (diffDays === 1) {
      document.getElementById('traderStatsLastTx').textContent = "Hier";
    } else {
      document.getElementById('traderStatsLastTx').textContent = stats.lastTx.toLocaleDateString();
    }
  } else {
    document.getElementById('traderStatsLastTx').textContent = 'Inconnue';
  }
  
  // Afficher l'activité récente
  displayRecentActivity(stats);
}

// Afficher l'activité récente
function displayRecentActivity(stats) {
  const activityList = document.getElementById('recentActivityList');
  if (!activityList) return;
  
  // Vider la liste
  activityList.innerHTML = '';
  
  // Générer des activités aléatoires pour la démo
  const activities = [
    {
      type: 'achat',
      token: 'ETH',
      amount: (Math.random() * 2 + 0.1).toFixed(2),
      time: 'il y a 2 heures'
    },
    {
      type: 'vente',
      token: 'LINK',
      amount: (Math.random() * 100 + 10).toFixed(2),
      time: 'il y a 5 heures'
    },
    {
      type: 'swap',
      tokenFrom: 'USDT',
      tokenTo: 'ETH',
      amount: (Math.random() * 1000 + 100).toFixed(2),
      time: 'il y a 12 heures'
    },
    {
      type: 'achat',
      token: 'UNI',
      amount: (Math.random() * 50 + 5).toFixed(2),
      time: 'il y a 1 jour'
    },
    {
      type: 'stake',
      token: 'ETH',
      amount: (Math.random() * 1 + 0.1).toFixed(2),
      time: 'il y a 2 jours'
    }
  ];
  
  // Afficher chaque activité
  activities.forEach(activity => {
    const item = document.createElement('div');
    item.className = 'p-2 border-b border-gray-600 last:border-0';
    
    let content = '';
    
    switch (activity.type) {
      case 'achat':
        content = `<i class="fas fa-arrow-down text-green-400 mr-2"></i> Achat de ${activity.amount} ${activity.token}`;
        break;
      case 'vente':
        content = `<i class="fas fa-arrow-up text-red-400 mr-2"></i> Vente de ${activity.amount} ${activity.token}`;
        break;
      case 'swap':
        content = `<i class="fas fa-exchange-alt text-cyan-400 mr-2"></i> Swap de ${activity.amount} ${activity.tokenFrom} vers ${activity.token}`;
        break;
      case 'stake':
        content = `<i class="fas fa-lock text-purple-400 mr-2"></i> Stake de ${activity.amount} ${activity.token}`;
        break;
    }
    
    item.innerHTML = `
      <div class="flex justify-between items-center">
        <div>${content}</div>
        <div class="text-xs text-gray-400">${activity.time}</div>
      </div>
    `;
    
    activityList.appendChild(item);
  });
}

// Mettre à jour la date de dernière mise à jour
function updateLastUpdateTime(timestamp) {
  const lastUpdateElement = document.getElementById('traderModalLastUpdate');
  if (!lastUpdateElement || !timestamp) return;
  
  const lastUpdate = new Date(timestamp);
  const now = new Date();
  const diffSeconds = Math.floor((now - lastUpdate) / 1000);
  
  let timeText;
  
  if (diffSeconds < 60) {
    timeText = 'il y a quelques secondes';
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    timeText = `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    timeText = `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(diffSeconds / 86400);
    timeText = `il y a ${days} jour${days > 1 ? 's' : ''}`;
  }
  
  lastUpdateElement.textContent = timeText;
  
  // Mettre à jour le statut
  const statusElement = document.getElementById('traderModalUpdateStatus');
  if (statusElement) {
    if (diffSeconds < 60) {
      statusElement.className = 'ml-2 text-green-400';
      statusElement.innerHTML = '<i class="fas fa-circle text-xs"></i> En temps réel';
    } else if (diffSeconds < 300) {
      statusElement.className = 'ml-2 text-yellow-400';
      statusElement.innerHTML = '<i class="fas fa-circle text-xs"></i> Récent';
    } else {
      statusElement.className = 'ml-2 text-gray-400';
      statusElement.innerHTML = '<i class="fas fa-circle text-xs"></i> Mise à jour nécessaire';
    }
  }
}

// Démarrer les mises à jour en temps réel
function startRealTimeUpdates(address) {
  // Arrêter les mises à jour précédentes
  if (traderUpdateInterval) {
    clearInterval(traderUpdateInterval);
  }
  
  // Mettre à jour toutes les 30 secondes
  traderUpdateInterval = setInterval(() => {
    const lastUpdateElement = document.getElementById('traderModalLastUpdate');
    if (lastUpdateElement) {
      const cacheKey = `trader_${address}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        updateLastUpdateTime(parsedCache.timestamp);
      }
    }
  }, 30 * 1000);
  
  // Mettre à jour les données complètes toutes les 5 minutes
  setTimeout(() => {
    if (currentTraderAddress === address) {
      loadTraderData(address, true);
    }
  }, 5 * 60 * 1000);
}

// Générer des données simulées
function generateSimulatedData(address) {
  console.log('Génération de données simulées pour', address);
  
  // Générer des actifs simulés
  const assets = [];
  const symbols = ['ETH', 'USDT', 'LINK', 'UNI', 'AAVE', 'WBTC', 'DAI'];
  const logos = {
    'ETH': 'https://etherscan.io/token/images/ethereum_32.png',
    'USDT': 'https://etherscan.io/token/images/tether_32.png',
    'LINK': 'https://etherscan.io/token/images/chainlink_32.png',
    'UNI': 'https://etherscan.io/token/images/uniswap_32.png',
    'AAVE': 'https://etherscan.io/token/images/aave_32.png',
    'WBTC': 'https://etherscan.io/token/images/wbtc_32.png',
    'DAI': 'https://etherscan.io/token/images/MCDDai_32.png'
  };
  
  // Nombre aléatoire d'actifs entre 3 et 7
  const assetCount = Math.floor(Math.random() * 5) + 3;
  
  for (let i = 0; i < assetCount; i++) {
    const symbol = symbols[i % symbols.length];
    let balance = 0;
    let quote = 0;
    
    switch (symbol) {
      case 'ETH':
        balance = Math.random() * 10 + 0.5; // Entre 0.5 et 10.5 ETH
        quote = balance * 2000; // Prix ETH ~$2000
        break;
      case 'WBTC':
        balance = Math.random() * 0.5 + 0.05; // Entre 0.05 et 0.55 BTC
        quote = balance * 30000; // Prix BTC ~$30000
        break;
      case 'USDT':
      case 'DAI':
        balance = Math.random() * 10000 + 1000; // Entre 1000 et 11000 stablecoins
        quote = balance; // Prix stablecoin ~$1
        break;
      default:
        balance = Math.random() * 1000 + 100; // Entre 100 et 1100 tokens
        quote = balance * (Math.random() * 10 + 1); // Prix entre $1 et $11
    }
    
    assets.push({
      contract_ticker_symbol: symbol,
      contract_name: symbol,
      contract_address: `0x${Math.random().toString(16).substring(2, 42)}`,
      logo_url: logos[symbol] || null,
      balance: (balance * 1e18).toString(),
      quote,
      contract_decimals: 18
    });
  }
  
  // Générer des transactions simulées
  const transactions = { items: [] };
  const now = new Date();
  
  for (let i = 0; i < 10; i++) {
    const date = new Date(now.getTime() - Math.random() * 48 * 60 * 60 * 1000);
    const isOutgoing = Math.random() > 0.5;
    
    transactions.items.push({
      block_signed_at: date.toISOString(),
      from_address: isOutgoing ? address.toLowerCase() : generateRandomAddress(),
      to_address: isOutgoing ? generateRandomAddress() : address.toLowerCase(),
      value: (Math.random() * 2 + 0.1).toString() + 'e18', // Entre 0.1 et 2.1 ETH
      tx_hash: `0x${Math.random().toString(16).substring(2, 66)}`,
      successful: true
    });
  }
  
  // Trier les transactions par date
  transactions.items.sort((a, b) => {
    return new Date(b.block_signed_at) - new Date(a.block_signed_at);
  });
  
  // Calculer les statistiques
  const totalValue = assets.reduce((sum, item) => sum + item.quote, 0);
  const stats = {
    totalValue,
    gains: totalValue * 0.6,
    losses: totalValue * 0.2,
    ratio: 3,
    txCount: transactions.items.length,
    uniqueTokensCount: assets.length,
    firstTx: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    lastTx: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    yield: 20,
    volatility: 'Moyenne',
    strategy: assets.length > 5 ? 'Diversifiée' : 'Concentrée',
    score: Math.floor(Math.random() * 20) + 80 // Score entre 80 et 100
  };
  
  return {
    address,
    chainId: 'eth-mainnet',
    balances: { items: assets },
    transactions,
    stats,
    lastUpdate: Date.now(),
    isSimulated: true
  };
}

// Générer une adresse aléatoire
function generateRandomAddress() {
  let address = '0x';
  const chars = '0123456789abcdef';
  
  for (let i = 0; i < 40; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return address;
}

// Copier du texte dans le presse-papiers
function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

// Exporter les fonctions pour les autres modules
window.openTraderModal = openTraderModal;
window.closeTraderModal = closeTraderModal;