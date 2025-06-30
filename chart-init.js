// chart-init.js - Initialisation forcée des graphiques

// Forcer l'initialisation des graphiques après chargement complet
window.addEventListener('load', () => {
  setTimeout(() => {
    initializeCharts();
  }, 3000);
});

function initializeCharts() {
  console.log('🔄 Initialisation forcée des graphiques...');
  
  // Données par défaut si pas de currentWalletData
  if (!window.currentWalletData) {
    window.currentWalletData = {
      balances: {
        items: [
          { contract_ticker_symbol: 'ETH', quote: 5000, balance: 2000000000000000000, contract_decimals: 18 },
          { contract_ticker_symbol: 'USDC', quote: 3000, balance: 3000000000, contract_decimals: 6 }
        ]
      },
      performance: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        data: [10, 25, -5, 15, 30, 20]
      },
      activity: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        buyData: [15, 20, 25, 18, 22, 30],
        sellData: [8, 12, 15, 10, 18, 20]
      }
    };
  }

  // Initialiser chaque graphique individuellement
  initAssetsChart();
  initPerformanceChart();
  initActivityChart();
}

function initAssetsChart() {
  const canvas = document.getElementById('assetsChart');
  if (!canvas || canvas.chart) return;
  
  const ctx = canvas.getContext('2d');
  const data = window.currentWalletData.balances.items.map(item => item.quote);
  const labels = window.currentWalletData.balances.items.map(item => item.contract_ticker_symbol);
  
  canvas.chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#627eea', '#8a92b2', '#9c6ade']
      }]
    },
    options: { responsive: true, maintainAspectRatio: true }
  });
  
  console.log('✅ Assets chart initialisé');
}

function initPerformanceChart() {
  const canvas = document.getElementById('performanceChart');
  if (!canvas || canvas.chart) return;
  
  const ctx = canvas.getContext('2d');
  
  canvas.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: window.currentWalletData.performance.labels,
      datasets: [{
        label: 'Performance (%)',
        data: window.currentWalletData.performance.data,
        borderColor: '#627eea',
        backgroundColor: 'rgba(98, 126, 234, 0.1)',
        tension: 0.4
      }]
    },
    options: { responsive: true, maintainAspectRatio: true }
  });
  
  console.log('✅ Performance chart initialisé');
}

function initActivityChart() {
  const canvas = document.getElementById('activityChart');
  if (!canvas || canvas.chart) return;
  
  const ctx = canvas.getContext('2d');
  
  canvas.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: window.currentWalletData.activity.labels,
      datasets: [
        {
          label: 'Achats',
          data: window.currentWalletData.activity.buyData,
          backgroundColor: 'rgba(0, 200, 83, 0.7)'
        },
        {
          label: 'Ventes',
          data: window.currentWalletData.activity.sellData,
          backgroundColor: 'rgba(255, 61, 113, 0.7)'
        }
      ]
    },
    options: { responsive: true, maintainAspectRatio: true }
  });
  
  console.log('✅ Activity chart initialisé');
}