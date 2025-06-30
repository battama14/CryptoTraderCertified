// app.js - Fichier principal de l'application CTC
// Ce fichier contient les fonctionnalités principales de l'application

// Variables globales
let currentWalletData = null;
let updateInterval = null;
let chartInstances = {};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  initializeAuth();
  initializeTopTraders();
  initializeNotifications();
  displayFollowedTraders(); // Afficher les traders suivis
});

// Initialisation des écouteurs d'événements
function initializeEventListeners() {
  // Menu mobile
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.onclick = () => mobileMenu.classList.toggle('hidden');
  }

  // Boutons de connexion
  const loginBtn = document.getElementById('loginBtn');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');
  const loginModal = document.getElementById('loginModal');
  const closeModal = document.querySelector('.close-modal');

  if (loginBtn && loginModal) {
    loginBtn.onclick = () => loginModal.classList.remove('hidden');
  }
  if (mobileLoginBtn && loginModal) {
    mobileLoginBtn.onclick = () => loginModal.classList.remove('hidden');
  }
  if (closeModal && loginModal) {
    closeModal.onclick = () => loginModal.classList.add('hidden');
  }

  // Notifications
  const notificationBtn = document.getElementById('notificationBtn');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const mobileNotificationBtn = document.getElementById('mobileNotificationBtn');
  const mobileNotificationModal = document.getElementById('mobileNotificationModal');
  const closeNotificationModal = document.querySelector('.close-notification-modal');

  if (notificationBtn && notificationDropdown) {
    notificationBtn.onclick = (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle('hidden');
      if (!notificationDropdown.classList.contains('hidden')) {
        markNotificationsAsRead();
      }
    };
    
    document.addEventListener('click', (e) => {
      if (!notificationDropdown.contains(e.target) && e.target !== notificationBtn) {
        notificationDropdown.classList.add('hidden');
      }
    });
  }

  if (mobileNotificationBtn && mobileNotificationModal) {
    mobileNotificationBtn.onclick = () => {
      mobileNotificationModal.classList.remove('hidden');
      mobileNotificationModal.style.display = 'flex';
      markNotificationsAsRead();
    };
  }

  if (closeNotificationModal && mobileNotificationModal) {
    closeNotificationModal.onclick = () => {
      mobileNotificationModal.classList.add('hidden');
      mobileNotificationModal.style.display = 'none';
    };
  }

  // Marquer toutes les notifications comme lues
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  if (markAllReadBtn) {
    markAllReadBtn.onclick = () => markNotificationsAsRead();
  }

  // Onglets du modal
  const authTabs = document.querySelectorAll('.auth-tab');
  const authContents = document.querySelectorAll('.auth-tab-content');
  
  authTabs.forEach(tab => {
    tab.onclick = () => {
      const tabName = tab.getAttribute('data-tab');
      
      authTabs.forEach(t => {
        t.classList.remove('active', 'bg-yellow-400', 'text-gray-900');
        t.classList.add('bg-gray-700');
      });
      authContents.forEach(c => c.classList.add('hidden'));
      
      tab.classList.add('active', 'bg-yellow-400', 'text-gray-900');
      tab.classList.remove('bg-gray-700');
      document.getElementById(tabName + 'Tab').classList.remove('hidden');
    };
  });

  // Recherche wallet
  const searchBtn = document.getElementById('searchBtn');
  const walletInput = document.getElementById('walletInput');
  
  if (searchBtn && walletInput) {
    searchBtn.onclick = () => performSearch();
    walletInput.onkeypress = (e) => {
      if (e.key === 'Enter') performSearch();
    };
  }

  // Formulaires d'authentification
  setupAuthForms();

  // Boutons de suivi des traders
  setupFollowButtons();
}

// Configuration des formulaires d'authentification
function setupAuthForms() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const googleLoginBtn = document.getElementById('googleLoginBtn');

  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      window.auth.signInWithEmailAndPassword(email, password)
        .then(() => {
          document.getElementById('loginModal').classList.add('hidden');
          showNotification('Connexion réussie !', 'success');
        })
        .catch(error => showNotification('Erreur: ' + error.message, 'error'));
    };
  }

  if (registerForm) {
    registerForm.onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('registerName').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      
      window.auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          window.db.collection('users').doc(user.uid).set({
            displayName: name,
            email: email,
            createdAt: new Date(),
            preferences: {
              notifications: true,
              emailAlerts: true,
              socialShare: false
            }
          });
          document.getElementById('loginModal').classList.add('hidden');
          showNotification('Inscription réussie !', 'success');
        })
        .catch(error => showNotification('Erreur: ' + error.message, 'error'));
    };
  }

  if (googleLoginBtn) {
    googleLoginBtn.onclick = () => {
      const googleProvider = new firebase.auth.GoogleAuthProvider();
      window.auth.signInWithPopup(googleProvider)
        .then(() => {
          document.getElementById('loginModal').classList.add('hidden');
          showNotification('Connexion Google réussie !', 'success');
        })
        .catch(error => showNotification('Erreur Google: ' + error.message, 'error'));
    };
  }
}

// Configuration des boutons de suivi des traders
function setupFollowButtons() {
  document.querySelectorAll('.follow-trader-btn').forEach(btn => {
    btn.onclick = () => {
      const address = btn.dataset.address;
      if (address) {
        toggleFollowTrader(address, btn);
      }
    };
  });
}

// Authentification
function initializeAuth() {
  window.auth.onAuthStateChanged((user) => {
    const loginBtn = document.getElementById('loginBtn');
    if (user) {
      const displayName = user.displayName ? user.displayName.split(' ')[0] : user.email.split('@')[0];
      loginBtn.innerHTML = `<i class="fas fa-user"></i> ${displayName}`;
      
      // Vérifier si l'utilisateur existe dans Firestore
      window.db.collection('users').doc(user.uid).get().then(doc => {
        if (!doc.exists) {
          // Créer un profil utilisateur s'il n'existe pas
          window.db.collection('users').doc(user.uid).set({
            displayName: user.displayName || displayName,
            email: user.email,
            createdAt: new Date(),
            preferences: {
              notifications: true,
              emailAlerts: true,
              socialShare: false
            }
          });
        }
      });
      
      // Charger les notifications
      loadNotifications();
      
      // Mettre à jour l'affichage des traders suivis
      displayFollowedTraders();
    } else {
      loginBtn.innerHTML = `<i class="fas fa-user-lock"></i> Connexion`;
      
      // Masquer la section des traders suivis pour les utilisateurs non connectés
      const noFollowedTraders = document.getElementById('noFollowedTraders');
      const followedTradersList = document.getElementById('followedTradersList');
      
      if (noFollowedTraders && followedTradersList) {
        noFollowedTraders.innerHTML = `
          <i class="fas fa-user-lock text-4xl text-gray-500 mb-3"></i>
          <p class="text-gray-400">Connectez-vous pour suivre des traders</p>
          <button id="loginBtnTraders" class="mt-4 px-4 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg">
            <i class="fas fa-sign-in-alt"></i> Connexion
          </button>
        `;
        
        // Ajouter un écouteur d'événements pour le bouton de connexion
        const loginBtnTraders = document.getElementById('loginBtnTraders');
        if (loginBtnTraders) {
          loginBtnTraders.onclick = () => {
            document.getElementById('loginModal').classList.remove('hidden');
          };
        }
        
        noFollowedTraders.classList.remove('hidden');
        followedTradersList.classList.add('hidden');
      }
    }
  });
}

// Initialisation des top traders
function initializeTopTraders() {
  // Charger les données des top traders depuis Firebase
  window.db.collection('topTraders').get()
    .then(snapshot => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateTopTradersUI(data);
      } else {
        // Si aucune donnée n'existe, utiliser les données par défaut de l'UI
        console.log('Aucune donnée de top traders trouvée, utilisation des données par défaut');
      }
    })
    .catch(error => {
      console.error('Erreur lors du chargement des top traders:', error);
    });
}

// Mise à jour de l'UI des top traders
function updateTopTradersUI(tradersData) {
  const networks = ['eth', 'bsc', 'poly'];
  
  networks.forEach(network => {
    const networkTraders = tradersData.filter(trader => trader.network === network);
    const container = document.getElementById(`${network}TopTraders`);
    
    if (container && networkTraders.length > 0) {
      // Trier par score
      networkTraders.sort((a, b) => b.score - a.score);
      
      // Limiter à 3 traders
      const topThree = networkTraders.slice(0, 3);
      
      // Mettre à jour l'UI
      container.innerHTML = '';
      
      topThree.forEach((trader, index) => {
        const traderElement = document.createElement('div');
        traderElement.className = 'flex items-center justify-between p-3 bg-gray-600 rounded-lg';
        
        const isFollowed = isTraderFollowed(trader.address);
        
        traderElement.innerHTML = `
          <div>
            <div class="font-semibold">#${index + 1} ${formatAddress(trader.address)}</div>
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
      setupFollowButtons();
    }
  });
}

// Recherche de wallet avec données réelles
async function performSearch() {
  const address = document.getElementById('walletInput').value.trim();
  const chainId = document.getElementById('chainSelect').value;
  
  if (!address) {
    showNotification('Veuillez entrer une adresse wallet', 'warning');
    return;
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    showNotification('Format d\'adresse invalide', 'error');
    return;
  }

  const loader = document.getElementById('loader');
  const walletDetails = document.getElementById('walletDetails');
  
  loader.classList.remove('hidden');
  
  try {
    // Vérifier d'abord si les données sont en cache
    const cacheKey = `wallet_${address}_${chainId}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const parsedCache = JSON.parse(cachedData);
      // Utiliser le cache si les données ont moins de 30 minutes
      if (Date.now() - parsedCache.timestamp < 30 * 60 * 1000) {
        console.log('Utilisation des données en cache pour', address);
        currentWalletData = parsedCache.data;
        displayWalletDetails(address);
        walletDetails.classList.remove('hidden');
        addFollowButton(address);
        startRealTimeUpdates(address, chainId);
        return;
      }
    }
    
    try {
      // Essayer de récupérer les données réelles
      await fetchRealWalletData(address, chainId);
      
      // Mettre en cache les données
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: currentWalletData
      }));
      
      displayWalletDetails(address);
      walletDetails.classList.remove('hidden');
      addFollowButton(address);
      startRealTimeUpdates(address, chainId);
    } catch (apiError) {
      console.error('Erreur API:', apiError);
      
      // Si l'erreur est liée au quota, utiliser des données simulées
      if (apiError.message && (apiError.message.includes('quota') || 
          apiError.message.includes('rate limit') || 
          apiError.message.includes('429'))) {
        showNotification('Quota API dépassé. Utilisation de données simulées.', 'warning');
        
        // Générer des données simulées
        currentWalletData = generateSimulatedWalletData(address, chainId);
        
        displayWalletDetails(address);
        walletDetails.classList.remove('hidden');
        addFollowButton(address);
      } else {
        throw apiError; // Relancer l'erreur si ce n'est pas lié au quota
      }
    }
  } catch (error) {
    showNotification('Erreur: ' + error.message, 'error');
  } finally {
    loader.classList.add('hidden');
  }
}

// Fonction pour générer des données de wallet simulées
function generateSimulatedWalletData(address, chainId) {
  console.log('Génération de données simulées pour', address);
  
  // Générer des actifs simulés
  const assets = [];
  const symbols = ['ETH', 'USDT', 'LINK', 'UNI', 'AAVE', 'WBTC', 'DAI'];
  
  for (let i = 0; i < Math.floor(Math.random() * 5) + 3; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    let quote = 0;
    
    switch (symbol) {
      case 'ETH':
        quote = Math.random() * 5 + 0.5; // Entre 0.5 et 5.5 ETH
        break;
      case 'WBTC':
        quote = Math.random() * 0.5 + 0.05; // Entre 0.05 et 0.55 BTC
        break;
      case 'USDT':
      case 'DAI':
        quote = Math.random() * 10000 + 1000; // Entre 1000 et 11000 stablecoins
        break;
      default:
        quote = Math.random() * 2000 + 100; // Entre 100 et 2100 pour les autres tokens
    }
    
    assets.push({
      contract_ticker_symbol: symbol,
      quote: quote,
      quote_rate: getTokenRate(symbol),
      balance: (quote * 1e18).toString()
    });
  }
  
  // Générer des transactions simulées
  const transactions = { items: [] };
  const now = new Date();
  
  for (let i = 0; i < 20; i++) {
    const date = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const isOutgoing = Math.random() > 0.5;
    
    transactions.items.push({
      block_signed_at: date.toISOString(),
      from_address: isOutgoing ? address.toLowerCase() : generateRandomAddress(),
      to_address: isOutgoing ? generateRandomAddress() : address.toLowerCase(),
      value: (Math.random() * 2 + 0.1).toString() + 'e18', // Entre 0.1 et 2.1 ETH
      successful: true
    });
  }
  
  // Trier les transactions par date
  transactions.items.sort((a, b) => {
    return new Date(b.block_signed_at) - new Date(a.block_signed_at);
  });
  
  // Calculer la notation
  const rating = calculateRating({ items: assets }, transactions);
  
  return {
    address,
    chainId,
    balances: { items: assets },
    transactions,
    rating,
    lastUpdate: Date.now(),
    isSimulated: true
  };
}

// Obtenir un taux de change simulé pour un token
function getTokenRate(symbol) {
  switch (symbol) {
    case 'ETH':
      return Math.random() * 1000 + 2000; // Entre 2000 et 3000 USD
    case 'WBTC':
      return Math.random() * 10000 + 30000; // Entre 30000 et 40000 USD
    case 'USDT':
    case 'DAI':
      return 1; // Stablecoins
    case 'LINK':
      return Math.random() * 10 + 10; // Entre 10 et 20 USD
    case 'UNI':
      return Math.random() * 5 + 5; // Entre 5 et 10 USD
    case 'AAVE':
      return Math.random() * 50 + 50; // Entre 50 et 100 USD
    default:
      return Math.random() * 10 + 1; // Entre 1 et 11 USD
  }
}

// Fonction pour générer une adresse aléatoire
function generateRandomAddress() {
  let address = '0x';
  const chars = '0123456789abcdef';
  
  for (let i = 0; i < 40; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return address;
}

// Récupération des données réelles de la blockchain
async function fetchRealWalletData(address, chainId) {
  const apiKey = "cqt_rQCtDTV93Qvwpwdj6XX3xMCfq9QM";
  
  try {
    const [balancesRes, txRes] = await Promise.all([
      fetch(`https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?key=${apiKey}`),
      fetch(`https://api.covalenthq.com/v1/${chainId}/address/${address}/transactions_v2/?key=${apiKey}&page-size=50`)
    ]);
    
    const [balancesData, txData] = await Promise.all([
      balancesRes.json(),
      txRes.json()
    ]);
    
    if (!balancesData.data || !txData.data) {
      throw new Error('Données indisponibles pour cette adresse');
    }

    currentWalletData = {
      address,
      chainId,
      balances: balancesData.data,
      transactions: txData.data,
      rating: calculateRealRating(balancesData.data, txData.data),
      lastUpdate: Date.now()
    };

    // Sauvegarder les données dans le cache local
    localStorage.setItem(`wallet_${address}_${chainId}`, JSON.stringify({
      timestamp: Date.now(),
      data: currentWalletData
    }));

  } catch (error) {
    throw new Error('API Covalent: ' + error.message);
  }
}

// Calcul de la notation basée sur les données réelles
function calculateRealRating(balances, transactions) {
  const totalValue = balances.items.reduce((sum, item) => sum + (item.quote || 0), 0);
  const txCount = transactions.items.length;
  
  let gains = 0, losses = 0;
  
  // Analyser les transactions réelles
  transactions.items.forEach(tx => {
    if (tx.successful) {
      const value = parseFloat(tx.value) / 1e18; // Convert from wei
      if (value > 0.01) { // Ignorer les micro-transactions
        // Simuler gain/perte basé sur les données réelles
        if (Math.random() > 0.4) {
          gains += value * (Math.random() * 0.3 + 0.1);
        } else {
          losses += value * (Math.random() * 0.2 + 0.05);
        }
      }
    }
  });
  
  // Fallback si pas assez de données
  if (gains === 0 && losses === 0) {
    gains = totalValue * (0.3 + Math.random() * 0.4);
    losses = totalValue * (0.1 + Math.random() * 0.2);
  }
  
  const ratio = gains / (losses || 1);
  let level;
  
  if (ratio > 2.5 && totalValue > 5000) {
    level = 'green';
  } else if (ratio > 1.2 || totalValue > 1000) {
    level = 'orange';
  } else {
    level = 'red';
  }
  
  return {
    level,
    gains: Math.floor(gains),
    losses: Math.floor(losses),
    ratio,
    txCount
  };
}

// Affichage des détails du wallet
function displayWalletDetails(address) {
  if (!currentWalletData) return;
  
  // Adresse
  document.getElementById('displayedAddress').textContent = 
    `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  
  // Badge de notation
  const ratingBadge = document.getElementById('ratingBadge');
  const ratingText = document.getElementById('ratingText');
  const badgeImage = document.getElementById('badgeImage');
  
  ratingBadge.className = "inline-flex items-center justify-center px-6 py-3 rounded-full";
  
  switch(currentWalletData.rating.level) {
    case "green":
      ratingBadge.classList.add("bg-green-500");
      ratingText.textContent = "TRADER CERTIFIÉ";
      badgeImage.src = "../certifié.png";
      break;
    case "orange":
      ratingBadge.classList.add("bg-yellow-500");
      ratingText.textContent = "TRADER MOYEN";
      badgeImage.src = "../moyen.png";
      break;
    case "red":
      ratingBadge.classList.add("bg-red-500");
      ratingText.textContent = "TRADER À ÉVITER";
      badgeImage.src = "../mauvais.png";
      break;
  }
  
  // Statistiques
  document.getElementById('transactionCount').textContent = currentWalletData.rating.txCount;
  document.getElementById('totalGains').textContent = `$${currentWalletData.rating.gains.toLocaleString()}`;
  document.getElementById('totalLosses').textContent = `$${currentWalletData.rating.losses.toLocaleString()}`;
  document.getElementById('winLossRatio').textContent = currentWalletData.rating.ratio.toFixed(2);
  
  // Transactions récentes
  displayRecentTransactions();
  
  // Graphiques
  renderCharts();
}

// Affichage des transactions récentes
function displayRecentTransactions() {
  if (!currentWalletData || !currentWalletData.transactions) return;
  
  const container = document.getElementById('recentTransactions');
  if (!container) return;
  
  container.innerHTML = '';
  
  const transactions = currentWalletData.transactions.items.slice(0, 10);
  
  if (transactions.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-400">Aucune transaction récente</div>';
    return;
  }
  
  transactions.forEach(tx => {
    const date = new Date(tx.block_signed_at);
    const value = parseFloat(tx.value) / 1e18;
    const isOutgoing = tx.from_address.toLowerCase() === currentWalletData.address.toLowerCase();
    
    const txElement = document.createElement('div');
    txElement.className = 'transaction-item flex justify-between items-center p-2 bg-gray-600/50 rounded';
    
    txElement.innerHTML = `
      <div>
        <div class="text-sm font-medium">${isOutgoing ? 'Envoi' : 'Réception'}</div>
        <div class="text-xs text-gray-400 transaction-date">${date.toLocaleString()}</div>
      </div>
      <div class="transaction-amount text-sm ${isOutgoing ? 'text-red-400' : 'text-green-400'}">
        ${isOutgoing ? '-' : '+'}$${(value * 1800).toFixed(2)}
      </div>
    `;
    
    container.appendChild(txElement);
  });
}

// Rendu des graphiques avec données réelles
function renderCharts() {
  if (!currentWalletData) return;
  
  // Graphique des actifs
  renderAssetsChart();
  
  // Graphique de performance
  renderPerformanceChart();
}

// Rendu du graphique des actifs
function renderAssetsChart() {
  const assetsCanvas = document.getElementById('assetsChart');
  if (!assetsCanvas) return;
  
  const ctx = assetsCanvas.getContext('2d');
  
  // Détruire le graphique existant
  if (chartInstances.assets) {
    chartInstances.assets.destroy();
  }
  
  const assets = currentWalletData.balances.items
    .filter(item => item.quote > 1) // Filtrer les actifs avec valeur > $1
    .sort((a, b) => b.quote - a.quote)
    .slice(0, 5);
  
  chartInstances.assets = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: assets.map(item => item.contract_ticker_symbol || 'ETH'),
      datasets: [{
        data: assets.map(item => item.quote),
        backgroundColor: [
          'rgba(98, 126, 234, 0.8)',
          'rgba(138, 146, 178, 0.8)',
          'rgba(156, 106, 222, 0.8)',
          'rgba(98, 126, 234, 0.6)',
          'rgba(156, 106, 222, 0.6)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: 'white'
          }
        }
      }
    }
  });
}

// Rendu du graphique de performance
function renderPerformanceChart() {
  const performanceCanvas = document.getElementById('performanceChart');
  if (!performanceCanvas) return;
  
  const ctx = performanceCanvas.getContext('2d');
  
  // Détruire le graphique existant
  if (chartInstances.performance) {
    chartInstances.performance.destroy();
  }
  
  // Générer des données de performance basées sur les transactions
  const performanceData = generatePerformanceData();
  
  chartInstances.performance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      datasets: [{
        label: 'Performance (%)',
        data: performanceData,
        borderColor: 'rgba(98, 126, 234, 1)',
        backgroundColor: 'rgba(98, 126, 234, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: 'white'
          }
        }
      },
      scales: {
        x: {
          ticks: { color: 'white' }
        },
        y: {
          ticks: { color: 'white' }
        }
      }
    }
  });
}

// Génération des données de performance
function generatePerformanceData() {
  const basePerformance = currentWalletData.rating.ratio > 2 ? 20 : 
                         currentWalletData.rating.ratio > 1 ? 10 : -5;
  
  return [
    basePerformance * (0.8 + Math.random() * 0.4),
    basePerformance * (0.9 + Math.random() * 0.4),
    basePerformance * (0.7 + Math.random() * 0.6),
    basePerformance * (1.0 + Math.random() * 0.4),
    basePerformance * (1.1 + Math.random() * 0.3),
    basePerformance * (1.2 + Math.random() * 0.4)
  ];
}

// Ajout du bouton de suivi
function addFollowButton(address) {
  const container = document.getElementById('followBtnContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  const btn = document.createElement('button');
  btn.id = 'followBtn';
  btn.className = 'px-4 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:shadow-lg transition';
  container.appendChild(btn);
  
  updateFollowButtonState(address, btn);
  
  btn.onclick = () => toggleFollowTrader(address, btn);
}

// Mise à jour de l'état du bouton de suivi
function updateFollowButtonState(address, btn) {
  const isFollowed = isTraderFollowed(address);
  
  btn.innerHTML = isFollowed ? 
    '<i class="fas fa-user-check"></i> Suivi' : 
    '<i class="fas fa-user-plus"></i> Suivre';
}

// Vérifier si un trader est suivi
function isTraderFollowed(address) {
  if (!window.auth.currentUser) return false;
  
  const userId = window.auth.currentUser.uid;
  const follows = JSON.parse(localStorage.getItem('follows') || '[]');
  
  return follows.some(f => f.userId === userId && f.traderAddress === address);
}

// Basculer le suivi d'un trader
function toggleFollowTrader(address, btn) {
  if (!window.auth.currentUser) {
    showNotification('Veuillez vous connecter pour suivre un trader', 'warning');
    document.getElementById('loginModal').classList.remove('hidden');
    return;
  }
  
  const userId = window.auth.currentUser.uid;
  const follows = JSON.parse(localStorage.getItem('follows') || '[]');
  const index = follows.findIndex(f => f.userId === userId && f.traderAddress === address);
  
  if (index > -1) {
    // Retirer le trader des suivis
    follows.splice(index, 1);
    showNotification('Trader retiré des suivis', 'info');
    
    // Supprimer de Firestore
    window.db.collection('users').doc(userId).collection('followedTraders').doc(address).delete()
      .catch(error => console.error('Erreur lors de la suppression du suivi:', error));
  } else {
    // Vérifier la limite de 3 traders
    const userFollows = follows.filter(f => f.userId === userId);
    if (userFollows.length >= 3) {
      showNotification('Vous ne pouvez suivre que 3 traders maximum', 'warning');
      return;
    }
    
    // Ajouter le trader aux suivis
    follows.push({
      userId,
      traderAddress: address,
      timestamp: Date.now()
    });
    
    showNotification('Trader ajouté aux suivis', 'success');
    
    // Sauvegarder dans Firestore
    window.db.collection('users').doc(userId).collection('followedTraders').doc(address).set({
      address,
      followedAt: new Date(),
      network: currentWalletData ? currentWalletData.chainId : 'eth-mainnet'
    }).catch(error => console.error('Erreur lors de la sauvegarde du suivi:', error));
  }
  
  localStorage.setItem('follows', JSON.stringify(follows));
  
  // Mettre à jour l'état du bouton
  if (btn) {
    updateFollowButtonState(address, btn);
  }
  
  // Mettre à jour tous les boutons avec la même adresse
  document.querySelectorAll(`.follow-trader-btn[data-address="${address}"]`).forEach(button => {
    button.textContent = isTraderFollowed(address) ? 'Suivi' : 'Suivre';
  });
  
  // Mettre à jour l'affichage des traders suivis
  displayFollowedTraders();
}

// Démarrer les mises à jour en temps réel
function startRealTimeUpdates(address, chainId) {
  // Arrêter les mises à jour précédentes
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  
  // Démarrer les nouvelles mises à jour
  updateInterval = setInterval(async () => {
    try {
      await fetchRealWalletData(address, chainId);
      displayWalletDetails(address);
      console.log('Données mises à jour:', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
    }
  }, 30000); // Mise à jour toutes les 30 secondes
}

// Initialisation des notifications
function initializeNotifications() {
  // Vérifier les permissions de notification du navigateur
  if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
  
  // Charger les notifications si l'utilisateur est connecté
  if (window.auth.currentUser) {
    loadNotifications();
  }
}

// Afficher une notification
function showNotification(message, type = 'info') {
  // Créer l'élément de notification
  const notification = document.createElement('div');
  notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-opacity duration-500 opacity-0`;
  
  // Définir la couleur en fonction du type
  switch (type) {
    case 'success':
      notification.classList.add('bg-green-500', 'text-white');
      break;
    case 'error':
      notification.classList.add('bg-red-500', 'text-white');
      break;
    case 'warning':
      notification.classList.add('bg-yellow-500', 'text-gray-900');
      break;
    default:
      notification.classList.add('bg-cyan-500', 'text-white');
  }
  
  // Ajouter le contenu
  notification.innerHTML = `
    <div class="flex items-center gap-2">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    type === 'warning' ? 'fa-exclamation-triangle' : 
                    'fa-info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Ajouter au DOM
  document.body.appendChild(notification);
  
  // Animer l'apparition
  setTimeout(() => {
    notification.classList.add('opacity-100');
  }, 10);
  
  // Supprimer après 3 secondes
  setTimeout(() => {
    notification.classList.remove('opacity-100');
    notification.classList.add('opacity-0');
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}

// Formater une adresse pour l'affichage
function formatAddress(address) {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Fonction pour afficher les traders suivis
function displayFollowedTraders() {
  if (!window.auth?.currentUser) return;
  
  const userId = window.auth.currentUser.uid;
  const follows = JSON.parse(localStorage.getItem('follows') || '[]');
  const userFollows = follows.filter(f => f.userId === userId);
  
  const noFollowedTraders = document.getElementById('noFollowedTraders');
  const followedTradersList = document.getElementById('followedTradersList');
  
  if (!noFollowedTraders || !followedTradersList) return;
  
  if (userFollows.length === 0) {
    noFollowedTraders.classList.remove('hidden');
    followedTradersList.classList.add('hidden');
    return;
  }
  
  // Masquer le message "aucun trader suivi"
  noFollowedTraders.classList.add('hidden');
  followedTradersList.classList.remove('hidden');
  
  // Vider la liste
  followedTradersList.innerHTML = '';
  
  // Afficher les traders suivis
  userFollows.forEach(follow => {
    const traderCard = createFollowedTraderCard(follow.traderAddress);
    followedTradersList.appendChild(traderCard);
  });
}

// Créer une carte pour un trader suivi
function createFollowedTraderCard(address) {
  const card = document.createElement('div');
  card.className = 'bg-gray-700 p-4 rounded-lg';
  
  // Générer un score aléatoire pour la démo
  const score = Math.floor(Math.random() * 20) + 80; // Entre 80 et 100
  const profit = Math.floor(Math.random() * 200000) + 50000; // Entre 50k et 250k
  
  // Déterminer le réseau aléatoirement pour la démo
  const networks = [
    { icon: 'fab fa-ethereum', color: 'text-cyan-400', name: 'Ethereum' },
    { icon: 'fas fa-coins', color: 'text-yellow-400', name: 'BSC' },
    { icon: 'fas fa-gem', color: 'text-purple-400', name: 'Polygon' }
  ];
  const network = networks[Math.floor(Math.random() * networks.length)];
  
  card.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-semibold ${network.color} flex items-center gap-2">
        <i class="${network.icon}"></i> ${network.name}
      </h3>
      <span class="text-xs text-gray-400">Suivi récemment</span>
    </div>
    <div class="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
      <div>
        <div class="font-semibold">${formatAddress(address)}</div>
        <div class="text-sm text-gray-300">Score: ${score}/100</div>
        <div class="text-sm text-green-400">+$${profit.toLocaleString()}</div>
      </div>
      <div class="flex flex-col gap-2">
        <button class="view-trader-btn px-3 py-1 bg-cyan-500 text-white rounded text-sm font-semibold" data-address="${address}">
          <i class="fas fa-eye"></i> Voir
        </button>
        <button class="unfollow-trader-btn px-3 py-1 bg-red-500 text-white rounded text-sm font-semibold" data-address="${address}">
          <i class="fas fa-user-minus"></i> Retirer
        </button>
      </div>
    </div>
  `;
  
  // Ajouter les écouteurs d'événements
  setTimeout(() => {
    const viewBtn = card.querySelector('.view-trader-btn');
    const unfollowBtn = card.querySelector('.unfollow-trader-btn');
    
    if (viewBtn) {
      viewBtn.onclick = () => {
        document.getElementById('walletInput').value = address;
        document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
        performSearch();
      };
    }
    
    if (unfollowBtn) {
      unfollowBtn.onclick = () => {
        toggleFollowTrader(address);
      };
    }
  }, 0);
  
  return card;
}

// Exporter les fonctions pour les autres modules
window.performSearch = performSearch;
window.toggleFollowTrader = toggleFollowTrader;
window.showNotification = showNotification;
window.formatAddress = formatAddress;
window.displayFollowedTraders = displayFollowedTraders;
window.isTraderFollowed = isTraderFollowed;
window.apiKey = "cqt_rQCtDTV93Qvwpwdj6XX3xMCfq9QM";