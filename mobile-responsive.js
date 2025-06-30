// mobile-responsive.js - Adaptations mobile et tablette

document.addEventListener('DOMContentLoaded', () => {
  // Menu mobile hamburger
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
  
  // Connexion mobile
  if (mobileLoginBtn) {
    mobileLoginBtn.addEventListener('click', () => {
      document.getElementById('loginBtn').click();
    });
  }
  
  // Fermer le menu mobile lors du clic sur un lien
  document.querySelectorAll('#mobileMenu a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
  
  // Adaptations responsive pour les graphiques
  function resizeCharts() {
    const charts = ['assetsChart', 'performanceChart', 'activityChart'];
    charts.forEach(chartId => {
      const canvas = document.getElementById(chartId);
      if (canvas && canvas.chart) {
        canvas.chart.resize();
      }
    });
  }
  
  // Redimensionner les graphiques lors du changement d'orientation
  window.addEventListener('orientationchange', () => {
    setTimeout(resizeCharts, 500);
  });
  
  window.addEventListener('resize', resizeCharts);
  
  // Ajustements pour les modals sur mobile
  const modals = ['loginModal', 'traderDetailsModal', 'notificationModal'];
  modals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal) {
      // Ajuster la taille sur mobile
      if (window.innerWidth <= 768) {
        modal.style.padding = '10px';
        const modalContent = modal.querySelector('div');
        if (modalContent) {
          modalContent.style.maxWidth = '95vw';
          modalContent.style.maxHeight = '90vh';
          modalContent.style.overflow = 'auto';
        }
      }
    }
  });
  
  console.log('📱 Adaptations mobile/tablette chargées');
});