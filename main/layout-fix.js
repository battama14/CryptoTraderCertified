// layout-fix.js - Correction du layout au chargement

document.addEventListener('DOMContentLoaded', () => {
  // Forcer le reflow pour éviter les déformations
  setTimeout(() => {
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.style.visibility = 'visible';
    }
  }, 100);
  
  // Déclencher l'animation après le chargement complet
  window.addEventListener('load', () => {
    const animatedElement = document.querySelector('.animate-fade-in');
    if (animatedElement) {
      animatedElement.style.opacity = '1';
    }
  });
});