// script-clean.js - Version propre et fonctionnelle

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD1QR_NIqm9YrPN5xppZM08DdlUUgGiFMI",
  authDomain: "crypto-trader-certified.firebaseapp.com",
  projectId: "crypto-trader-certified",
  storageBucket: "crypto-trader-certified.firebasestorage.app",
  messagingSenderId: "1026750561248",
  appId: "1:1026750561248:web:9dcf56f1526e8e3df6c985"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Variables globales
let currentWalletData = null;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  initializeAuth();
});

// Gestionnaires d'événements
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

  // Onglets du modal
  const authTabs = document.querySelectorAll('.auth-tab');
  const authContents = document.querySelectorAll('.auth-tab-content');
  
  authTabs.forEach(tab => {
    tab.onclick = () => {
      const tabName = tab.getAttribute('data-tab');
      
      // Reset tous les onglets
      authTabs.forEach(t => {
        t.classList.remove('active', 'bg-yellow-400', 'text-gray-900');
        t.classList.add('bg-gray-700');
      });
      authContents.forEach(c => c.classList.add('hidden'));
      
      // Activer l'onglet cliqué
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
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const googleLoginBtn = document.getElementById('googleLoginBtn');

  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      auth.signInWithEmailAndPassword(email, password)
        .then(() => {
          loginModal.classList.add('hidden');
          alert('Connexion réussie !');
        })
        .catch(error => alert('Erreur: ' + error.message));
    };
  }

  if (registerForm) {
    registerForm.onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('registerName').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      
      auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          db.collection('users').doc(user.uid).set({
            displayName: name,
            email: email,
            createdAt: new Date()
          });
          loginModal.classList.add('hidden');
          alert('Inscription réussie !');
        })
        .catch(error => alert('Erreur: ' + error.message));
    };
  }

  if (googleLoginBtn) {
    googleLoginBtn.onclick = () => {
      auth.signInWithPopup(googleProvider)
        .then(() => {
          loginModal.classList.add('hidden');
          alert('Connexion Google réussie !');
        })
        .catch(error => alert('Erreur Google: ' + error.message));
    };
  }
}

// Authentification
function initializeAuth() {
  auth.onAuthStateChanged((user) => {
    const loginBtn = document.getElementById('loginBtn');
    if (user) {
      const displayName = user.displayName ? user.displayName.split(' ')[0] : user.email.split('@')[0];
      loginBtn.innerHTML = `<i class="fas fa-user"></i> ${displayName}`;
    } else {
      loginBtn.innerHTML = `<i class="fas fa-user-lock"></i> Connexion`;
    }
  });
}

// Recherche de wallet
async function performSearch() {
  const address = document.getElementById('walletInput').value.trim();
  const chainId = document.getElementById('chainSelect').value;
  
  if (!address) {
    alert('Veuillez entrer une adresse wallet');
    return;
  }

  // Validation de l'adresse Ethereum
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    alert('Format d\'adresse invalide');
    return;
  }

  const loader = document.getElementById('loader');
  const walletDetails = document.getElementById('walletDetails');
  
  loader.classList.remove('hidden');
  
  try {
    await fetchWalletData(address, chainId);
    displayWalletDetails(address);
    walletDetails.classList.remove('hidden');
  } catch (error) {
    alert('Erreur lors de la recherche: ' + error.message);
  } finally {
    loader.classList.add('hidden');
  }
}

// Récupération des données wallet
async function fetchWalletData(address, chainId) {
  const apiKey = "cqt_rQCtDTV93Qvwpwdj6XX3xMCfq9QM";
  
  try {
    // Récupérer les soldes
    const balancesUrl = `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?key=${apiKey}`;
    const balancesRes = await fetch(balancesUrl);
    const balancesData = await balancesRes.json();
    
    if (!balancesData.data) {
      throw new Error('Impossible de récupérer les données du wallet');
    }

    // Générer des données simulées pour la démo
    currentWalletData = {
      address: address,
      balances: balancesData.data,
      rating: generateRating(balancesData.data),
      transactions: { items: [] }
    };

  } catch (error) {
    throw new Error('Erreur API: ' + error.message);
  }
}

// Génération de la notation
function generateRating(balances) {
  const totalValue = balances.items.reduce((sum, item) => sum + (item.quote || 0), 0);
  const txCount = Math.floor(Math.random() * 100) + 10;
  
  let level, gains, losses;
  
  if (totalValue > 10000) {
    level = "green";
    gains = Math.floor(totalValue * 0.8);
    losses = Math.floor(totalValue * 0.3);
  } else if (totalValue > 1000) {
    level = "orange";
    gains = Math.floor(totalValue * 0.6);
    losses = Math.floor(totalValue * 0.4);
  } else {
    level = "red";
    gains = Math.floor(totalValue * 0.3);
    losses = Math.floor(totalValue * 0.7);
  }
  
  return {
    level,
    gains,
    losses,
    ratio: gains / (losses || 1),
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
      badgeImage.src = "certifié.png";
      break;
    case "orange":
      ratingBadge.classList.add("bg-yellow-500");
      ratingText.textContent = "TRADER MOYEN";
      badgeImage.src = "moyen.png";
      break;
    case "red":
      ratingBadge.classList.add("bg-red-500");
      ratingText.textContent = "TRADER À ÉVITER";
      badgeImage.src = "mauvais.png";
      break;
  }
  
  // Statistiques
  document.getElementById('transactionCount').textContent = currentWalletData.rating.txCount;
  document.getElementById('totalGains').textContent = `$${currentWalletData.rating.gains.toLocaleString()}`;
  document.getElementById('totalLosses').textContent = `$${currentWalletData.rating.losses.toLocaleString()}`;
  document.getElementById('winLossRatio').textContent = currentWalletData.rating.ratio.toFixed(2);
  
  // Graphiques
  renderCharts();
}

// Rendu des graphiques
function renderCharts() {
  if (!currentWalletData) return;
  
  // Graphique des actifs
  const assetsCanvas = document.getElementById('assetsChart');
  if (assetsCanvas) {
    const ctx = assetsCanvas.getContext('2d');
    
    const assets = currentWalletData.balances.items
      .filter(item => item.quote > 0)
      .sort((a, b) => b.quote - a.quote)
      .slice(0, 5);
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: assets.map(item => item.contract_ticker_symbol || 'Unknown'),
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
        maintainAspectRatio: true
      }
    });
  }
  
  // Graphique de performance
  const performanceCanvas = document.getElementById('performanceChart');
  if (performanceCanvas) {
    const ctx = performanceCanvas.getContext('2d');
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [{
          label: 'Performance (%)',
          data: [10, 25, -5, 15, 30, 20],
          borderColor: 'rgba(98, 126, 234, 1)',
          backgroundColor: 'rgba(98, 126, 234, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }
}

console.log('CTC Script Clean chargé');