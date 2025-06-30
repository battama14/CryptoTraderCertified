// emergency-fix.js - Correction d'urgence pour Netlify

// Attendre que tout soit chargé
window.addEventListener('load', () => {
  setTimeout(() => {
    // Réactiver le contenu
    document.body.style.display = 'block';
    document.body.style.visibility = 'visible';
    
    // Forcer l'affichage des sections
    const sections = ['hero', 'features', 'premium', 'token', 'search'];
    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.style.display = 'block';
        element.style.visibility = 'visible';
      }
    });
    
    // Réactiver les boutons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.style.pointerEvents = 'auto';
      btn.disabled = false;
    });
    
    // Réactiver le bouton de connexion
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        const modal = document.getElementById('loginModal');
        if (modal) {
          modal.classList.remove('hidden');
          modal.style.display = 'flex';
        }
      });
    }
    
    // Réactiver la recherche
    const searchBtn = document.getElementById('searchBtn');
    const walletInput = document.getElementById('walletInput');
    if (searchBtn && walletInput) {
      searchBtn.addEventListener('click', () => {
        const address = walletInput.value.trim();
        if (address) {
          alert('Recherche: ' + address);
          // Logique de recherche simplifiée
        }
      });
    }
    
    console.log('🚨 Correction d\'urgence appliquée');
  }, 1000);
});

// Forcer l'affichage immédiat
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.display = 'block';
  document.body.style.visibility = 'visible';
});