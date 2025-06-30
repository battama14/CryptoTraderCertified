// social-auto-post.js - Auto-post sur Twitter et Telegram

class SocialAutoPoster {
  constructor() {
    this.telegramBotToken = 'YOUR_TELEGRAM_BOT_TOKEN'; // À configurer
    this.telegramChannelId = '@your_channel'; // À configurer
    this.twitterApiKey = 'YOUR_TWITTER_API_KEY'; // À configurer
    this.lastPostDate = localStorage.getItem('lastTopTradersPost');
  }

  // Vérifier si il faut poster (toutes les 24h)
  shouldPost() {
    if (!this.lastPostDate) return true;
    const lastPost = new Date(this.lastPostDate);
    const now = new Date();
    const diffHours = (now - lastPost) / (1000 * 60 * 60);
    return diffHours >= 24;
  }

  // Poster les top traders automatiquement
  async autoPostTopTraders() {
    if (!this.shouldPost()) return;

    try {
      const topTraders = await this.getTopTradersData();
      const message = this.formatTopTradersMessage(topTraders);
      
      // Poster sur Telegram
      await this.postToTelegram(message);
      
      // Poster sur Twitter
      await this.postToTwitter(message);
      
      // Sauvegarder la date du dernier post
      localStorage.setItem('lastTopTradersPost', new Date().toISOString());
      
      console.log('✅ Top traders postés sur les réseaux sociaux');
    } catch (error) {
      console.error('❌ Erreur auto-post:', error);
    }
  }

  // Récupérer les données des top traders
  async getTopTradersData() {
    const networks = ['eth-mainnet', 'bsc-mainnet', 'matic-mainnet'];
    const allTopTraders = {};
    
    for (const network of networks) {
      const traders = await getTopTradersForNetwork(network);
      allTopTraders[network] = traders.slice(0, 3); // Top 3 par réseau
    }
    
    return allTopTraders;
  }

  // Formater le message pour les réseaux sociaux
  formatTopTradersMessage(topTraders) {
    let message = '🏆 TOP TRADERS DU JOUR - CTC\n\n';
    
    const networkNames = {
      'eth-mainnet': '🔷 Ethereum',
      'bsc-mainnet': '🟡 BSC', 
      'matic-mainnet': '🟣 Polygon'
    };
    
    for (const [network, traders] of Object.entries(topTraders)) {
      message += `${networkNames[network]}\n`;
      traders.forEach((trader, index) => {
        const shortAddress = `${trader.address.substring(0, 6)}...${trader.address.substring(trader.address.length - 4)}`;
        message += `${index + 1}. ${shortAddress} - Score: ${trader.score}/100\n`;
      });
      message += '\n';
    }
    
    message += '📊 Analysez ces traders sur CTC\n#CryptoTrading #DeFi #TopTraders';
    return message;
  }

  // Poster sur Telegram
  async postToTelegram(message) {
    const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: this.telegramChannelId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    if (!response.ok) {
      throw new Error('Erreur Telegram API');
    }
  }

  // Poster sur Twitter (nécessite un backend pour l'API v2)
  async postToTwitter(message) {
    // Twitter API v2 nécessite un backend sécurisé
    // Voici un exemple d'appel à votre backend
    const response = await fetch('/api/twitter-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    if (!response.ok) {
      throw new Error('Erreur Twitter API');
    }
  }

  // Démarrer l'auto-post (vérification toutes les heures)
  startAutoPosting() {
    // Vérifier immédiatement
    this.autoPostTopTraders();
    
    // Puis toutes les heures
    setInterval(() => {
      this.autoPostTopTraders();
    }, 60 * 60 * 1000); // 1 heure
    
    console.log('🤖 Auto-post démarré (vérification toutes les heures)');
  }
}

// Créer une instance globale
window.socialAutoPoster = new SocialAutoPoster();

// Démarrer automatiquement
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.socialAutoPoster.startAutoPosting();
  }, 10000); // Attendre 10 secondes
});

console.log('📱 Module auto-post social chargé');