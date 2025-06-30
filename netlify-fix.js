// netlify-fix.js - Corrections pour Netlify

// Vérifier Firebase
if (typeof firebase === 'undefined') {
  console.error('Firebase non chargé');
} else {
  console.log('Firebase OK');
}

// Forcer l'initialisation après chargement
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    // Réinitialiser les variables globales
    if (typeof firebase !== 'undefined') {
      window.auth = firebase.auth();
      window.db = firebase.firestore();
      console.log('Firebase réinitialisé');
    }
    
    // Forcer le rechargement des fonctions
    if (typeof loadFollowedTraders === 'function') {
      loadFollowedTraders();
    }
    
    // Test API
    testAPI();
  }, 2000);
});

// Test de l'API Covalent
async function testAPI() {
  try {
    const response = await fetch('https://api.covalenthq.com/v1/1/block_v2/latest/?key=cqt_rQCtDTV93Qvwpwdj6XX3xMCfq9QM');
    if (response.ok) {
      console.log('✅ API Covalent OK');
    } else {
      console.error('❌ API Covalent erreur:', response.status);
    }
  } catch (error) {
    console.error('❌ API Covalent inaccessible:', error);
  }
}

// Correction CORS pour Netlify
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
  if (url.includes('covalenthq.com')) {
    options.mode = 'cors';
    options.headers = {
      ...options.headers,
      'Accept': 'application/json'
    };
  }
  return originalFetch(url, options);
};

console.log('🔧 Corrections Netlify chargées');