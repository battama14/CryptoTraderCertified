// Système de notifications
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    
    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600'
    };
    
    notification.className = `${colors[type]} rounded-lg p-4 shadow-lg max-w-sm slide-in`;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="text-white font-medium">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white/70 hover:text-white ml-4">
                ✕
            </button>
        </div>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// API Request avec rate limiting
let lastRequest = 0;
async function apiRequest(url) {
    const now = Date.now();
    if (now - lastRequest < 300) {
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    lastRequest = Date.now();
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
}

// Obtenir le prix ETH
async function getETHPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        return data.ethereum?.usd || 2000;
    } catch (error) {
        return 2000;
    }
}

// Analyser un wallet
async function analyzeWallet(address) {
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Adresse invalide');
    }

    const balanceUrl = `${BASE_URL}?chainid=1&module=account&action=balance&address=${address}&tag=latest&apikey=${API_KEY}`;
    const balanceData = await apiRequest(balanceUrl);
    
    if (balanceData.status !== '1') {
        throw new Error(balanceData.message || 'Erreur API balance');
    }
    
    const ethBalance = parseInt(balanceData.result) / 1e18;
    const txUrl = `${BASE_URL}?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=${API_KEY}`;
    const txData = await apiRequest(txUrl);
    const transactions = txData.result || [];
    const ethPrice = await getETHPrice();
    const totalValueUSD = 0; // Supprimé - pas de calcul USD
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recent24h = transactions.filter(tx => parseInt(tx.timeStamp) * 1000 > oneDayAgo);

    let gain24h = 0;
    recent24h.forEach(tx => {
        const value = parseInt(tx.value) / 1e18;
        const valueUSD = value * ethPrice;
        if (tx.to && tx.to.toLowerCase() === address.toLowerCase()) {
            gain24h += valueUSD;
        } else {
            gain24h -= valueUSD;
        }
    });

    let score = 0;
    if (totalValueUSD > 1000000) score += 40;
    else if (totalValueUSD > 500000) score += 35;
    else if (totalValueUSD > 100000) score += 30;
    else if (totalValueUSD > 50000) score += 25;
    else if (totalValueUSD > 10000) score += 20;
    else if (totalValueUSD > 1000) score += 15;
    else if (totalValueUSD > 100) score += 10;
    else score += 5;
    
    if (transactions.length > 5000) score += 30;
    else if (transactions.length > 2000) score += 25;
    else if (transactions.length > 1000) score += 20;
    else if (transactions.length > 500) score += 15;
    else if (transactions.length > 100) score += 10;
    else if (transactions.length > 50) score += 8;
    else if (transactions.length > 10) score += 5;
    else score += 2;
    
    if (recent24h.length > 20) score += 25;
    else if (recent24h.length > 10) score += 20;
    else if (recent24h.length > 5) score += 15;
    else if (recent24h.length > 1) score += 10;
    else if (recent24h.length > 0) score += 5;
    else score += 2;
    
    if (gain24h > 10) score += 25;
    else if (gain24h > 5) score += 20;
    else if (gain24h > 0) score += 15;
    else if (gain24h > -5) score += 10;
    else score += 5;

    const rating = score >= 80 ? 'certified' : score >= 60 ? 'moyen' : 'eviter';

    return {
        address,
        balance: ethBalance,
        totalValueUSD,
        gain24h: ethBalance > 0 ? (gain24h / ethBalance) * 100 : 0,
        transactions: transactions.length,
        recent24hTxs: recent24h.length,
        score: Math.min(100, score),
        rating,
        ethPrice
    };
}

// Charger les top traders par catégorie
async function loadTopTraders() {
    const traderCategories = {
        whales: [
            { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', name: 'Vitalik Buterin', network: 'Ethereum', category: '🐋 Whale' },
            { address: '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503', name: 'Binance Hot Wallet', network: 'Multi-Chain', category: '🐋 Whale' },
            { address: '0x28C6c06298d514Db089934071355E5743bf21d60', name: 'Coinbase Institutional', network: 'Ethereum', category: '🐋 Whale' }
        ],
        medium: [
            { address: '0x220866B1A2219f40e72f5c628B65D54268cA3A9D', name: 'DeFi Master Pro', network: 'Polygon', category: '🚀 Rising Star' },
            { address: '0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2', name: 'Arbitrum Specialist', network: 'Arbitrum', category: '🚀 Rising Star' },
            { address: '0xb5d85cbf7cb3ee0d56b3bb207d5fc4b82f43f511', name: 'BSC Yield Hunter', network: 'BSC', category: '🚀 Rising Star' }
        ],
        small: [
            { address: '0x1234567890123456789012345678901234567890', name: 'Micro Trader Elite', network: 'Avalanche', category: '💎 Diamond Hands' },
            { address: '0x0987654321098765432109876543210987654321', name: 'Smart Scalper', network: 'Fantom', category: '💎 Diamond Hands' },
            { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', name: 'Precision Trader', network: 'Solana', category: '💎 Diamond Hands' }
        ]
    };

    const traders = [];
    
    for (const [categoryType, wallets] of Object.entries(traderCategories)) {
        for (const wallet of wallets) {
            try {
                let analysis;
                
                if (categoryType === 'whales') {
                    analysis = await generateMockAnalysis(wallet.address, 'whale');
                } else if (categoryType === 'medium') {
                    analysis = await generateMockAnalysis(wallet.address, 'medium');
                } else {
                    analysis = await generateMockAnalysis(wallet.address, 'small');
                }
                
                traders.push({
                    ...analysis,
                    name: wallet.name,
                    network: wallet.network,
                    category: wallet.category,
                    id: `trader_${wallet.address}`,
                    rating: 'certified'
                });
                
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Erreur ${wallet.address}:`, error);
            }
        }
    }
    
    return traders;
}

// Générer une analyse simulée selon la catégorie
async function generateMockAnalysis(address, category) {
    const ethPrice = await getETHPrice();
    
    let balance, totalValueUSD, score, transactions, recent24hTxs;
    
    switch (category) {
        case 'whale':
            balance = Math.random() * 50000 + 10000;
            totalValueUSD = balance * ethPrice;
            score = Math.floor(Math.random() * 10 + 90);
            transactions = Math.floor(Math.random() * 5000 + 5000);
            recent24hTxs = Math.floor(Math.random() * 50 + 20);
            break;
        case 'medium':
            balance = Math.random() * 50 + 5;
            totalValueUSD = balance * ethPrice;
            score = Math.floor(Math.random() * 15 + 80);
            transactions = Math.floor(Math.random() * 2000 + 1000);
            recent24hTxs = Math.floor(Math.random() * 30 + 10);
            break;
        case 'small':
            balance = Math.random() * 0.5 + 0.1;
            totalValueUSD = balance * ethPrice;
            score = Math.floor(Math.random() * 20 + 75);
            transactions = Math.floor(Math.random() * 500 + 200);
            recent24hTxs = Math.floor(Math.random() * 15 + 5);
            break;
    }
    
    const gain24h = (Math.random() - 0.3) * 20;
    
    return {
        address,
        balance,
        totalValueUSD,
        gain24h,
        transactions,
        recent24hTxs,
        score,
        rating: 'certified',
        ethPrice
    };
}

// Afficher les résultats d'analyse
function displayAnalysis(analysis) {
    const resultDiv = document.getElementById('analysis-result');
    const ratingColors = {
        certified: 'border-green-500 bg-green-900/20',
        moyen: 'border-yellow-500 bg-yellow-900/20',
        eviter: 'border-red-500 bg-red-900/20'
    };
    
    const ratingLabels = {
        certified: '🛡️ Trader Certifié',
        moyen: '⚠️ Trader Moyen',
        eviter: '❌ Trader à Éviter'
    };
    
    resultDiv.innerHTML = `
        <div class="border-l-4 ${ratingColors[analysis.rating]} rounded-lg p-4 sm:p-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h3 class="text-lg sm:text-xl font-bold">Analyse Blockchain Réelle</h3>
                <span class="text-xs sm:text-sm font-medium ${analysis.rating === 'certified' ? 'text-green-400' : analysis.rating === 'moyen' ? 'text-yellow-400' : 'text-red-400'}">
                    ${ratingLabels[analysis.rating]}
                </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-400">Adresse:</span>
                        <span class="text-sm font-medium">${analysis.address.slice(0, 6)}...${analysis.address.slice(-4)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-400">Balance ETH:</span>
                        <span class="text-sm font-medium">${analysis.balance.toFixed(4)} ETH</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-400">Transactions:</span>
                        <span class="text-sm font-medium">${analysis.transactions}</span>
                    </div>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-400">Gain 24h:</span>
                        <span class="text-sm font-medium ${analysis.gain24h >= 0 ? 'text-green-400' : 'text-red-400'}">
                            ${analysis.gain24h >= 0 ? '+' : ''}${analysis.gain24h.toFixed(2)}%
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-400">Activité 24h:</span>
                        <span class="text-sm font-medium">${analysis.recent24hTxs} tx</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-400">Score:</span>
                        <span class="text-sm font-medium">${analysis.score}/100</span>
                    </div>
                </div>
            </div>
            
            <div class="mt-3 sm:mt-4 text-center">
                <p class="text-xs sm:text-sm text-gray-400">Prix ETH: $${analysis.ethPrice}</p>
            </div>
            
            <div class="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                <div class="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:gap-0">
                    <button onclick="window.showTraderDetails('${analysis.address}', 'Wallet Analysé')" class="flex-1 bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all">
                        Voir Détails
                    </button>
                    <button onclick="followTrader('search_${analysis.address}', 'Wallet ${analysis.address.slice(0, 6)}')" class="bg-green-600 hover:bg-green-700 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all">
                        Suivre
                    </button>
                </div>
                
                <!-- Partage Réseaux Sociaux -->
                <div class="bg-gray-700/30 rounded-lg p-2 sm:p-3">
                    <p class="text-xs font-medium mb-2 text-center text-gray-300">📢 Partager cette analyse</p>
                    <div class="flex justify-center space-x-2">
                        <button onclick="shareOnTwitter('Wallet Analysé', '${analysis.address}')" class="bg-blue-500 hover:bg-blue-600 p-1.5 rounded transition-all" title="Twitter">
                            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                        </button>
                        <button onclick="shareOnTelegram('Wallet Analysé', '${analysis.address}')" class="bg-blue-400 hover:bg-blue-500 p-1.5 rounded transition-all" title="Telegram">
                            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                            </svg>
                        </button>
                        <button onclick="shareOnWhatsApp('Wallet Analysé', '${analysis.address}')" class="bg-green-500 hover:bg-green-600 p-1.5 rounded transition-all" title="WhatsApp">
                            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.085"/>
                            </svg>
                        </button>
                        <button onclick="copyShareLink('Wallet Analysé', '${analysis.address}')" class="bg-gray-600 hover:bg-gray-700 p-1.5 rounded transition-all" title="Copier">
                            <i data-lucide="copy" class="w-4 h-4 text-white"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    resultDiv.classList.remove('hidden');
}



// Afficher les traders
function displayTraders(traders) {
    const grid = document.getElementById('traders-grid');
    
    if (traders.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-12">Aucun trader trouvé</div>';
        return;
    }

    grid.innerHTML = traders.map((trader, index) => {
        const rank = index + 1;
        return `
            <div class="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 trader-${trader.rating} hover:transform hover:scale-105 transition-all duration-200">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span class="text-white font-bold">#${rank}</span>
                        </div>
                        <div>
                            <h3 class="font-bold text-white">${trader.name}</h3>
                            <p class="text-sm text-gray-400">${trader.address.slice(0, 10)}...${trader.address.slice(-6)}</p>
                            <div class="flex items-center space-x-2 mt-1">
                                <span class="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded">${trader.network}</span>
                                <span class="text-xs text-gray-500">${trader.category}</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-xs px-2 py-1 rounded-full bg-green-600 text-white font-medium">
                        Score: ${trader.score}/100
                    </div>
                </div>
                
                <div class="space-y-3 mb-4">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Balance ETH:</span>
                        <span class="font-medium text-white">${trader.balance.toFixed(4)} ETH</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Gain 24h:</span>
                        <span class="font-medium ${trader.gain24h >= 0 ? 'text-green-400' : 'text-red-400'}">
                            ${trader.gain24h >= 0 ? '+' : ''}${trader.gain24h.toFixed(2)}%
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Transactions:</span>
                        <span class="font-medium text-white">${trader.transactions}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Activité 24h:</span>
                        <span class="font-medium text-yellow-400">${trader.recent24hTxs} transactions</span>
                    </div>
                </div>
                
                <div class="text-center mb-4">
                    <span class="text-sm font-medium text-green-400">🛡️ Trader Certifié</span>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="window.showTraderDetails('${trader.address}', '${trader.name}')" class="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                        Voir Détails
                    </button>
                    <button onclick="followTrader('${trader.id}', '${trader.name}')" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                        Suivre
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Mettre à jour la section des traders suivis
function updateFollowedTradersSection() {
    const section = document.getElementById('followed-traders-list');
    if (!currentUser || followedTraders.length === 0) {
        section.innerHTML = `
            <div class="text-center text-gray-400 py-12">
                <i data-lucide="user-plus" class="w-16 h-16 mx-auto mb-4 opacity-50"></i>
                <p class="text-lg mb-2">Aucun trader suivi</p>
                <p class="text-sm">${!currentUser ? 'Connectez-vous et cliquez sur "Suivre" sur un trader' : 'Cliquez sur "Suivre" sur un trader pour l\'ajouter ici'}</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    section.innerHTML = followedTraders.map(traderId => {
        // Extraire l'adresse correctement
        let address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // Défaut Vitalik
        let name = 'Trader Suivi';
        
        if (traderId.startsWith('trader_')) {
            address = traderId.replace('trader_', '');
            name = 'Top Trader';
        } else if (traderId.startsWith('search_')) {
            address = traderId.replace('search_', '');
            name = 'Wallet Analysé';
        }
        
        console.log('Trader suivi - ID:', traderId, 'Address:', address, 'Name:', name);
        
        return `
            <div class="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                            <p class="font-medium">${name}</p>
                            <p class="text-sm text-gray-400 font-mono">${address.slice(0, 10)}...${address.slice(-6)}</p>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="console.log('Clic détails:', '${address}', '${name}'); window.showTraderDetails('${address}', '${name}');" class="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm transition-all">
                            Détails
                        </button>
                        <button onclick="followTrader('${traderId}', '${name}')" class="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm transition-all">
                            Ne plus suivre
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Fonction pour suivre un trader
window.followTrader = function(traderId, traderName) {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    if (followedTraders.includes(traderId)) {
        followedTraders = followedTraders.filter(id => id !== traderId);
        showNotification(`${traderName} retiré de votre liste`, 'success');
    } else {
        const maxFollowed = isPremium ? 9 : 3;
        if (followedTraders.length < maxFollowed) {
            followedTraders.push(traderId);
            showNotification(`${traderName} ajouté à votre liste`, 'success');
        } else {
            showNotification(`Limite atteinte (${maxFollowed} traders max)`, 'error');
            return;
        }
    }
    
    // Sauvegarder dans localStorage pour compatibilité
    localStorage.setItem('followedTraders', JSON.stringify(followedTraders));
    
    // Sauvegarder dans Firestore si l'utilisateur est connecté
    if (currentUser && currentUser.uid) {
        db.collection('users').doc(currentUser.uid).update({
            followedTraders: followedTraders
        }).catch(error => {
            console.error("Erreur lors de la sauvegarde des traders suivis:", error);
        });
    }
    
    updateFollowedTradersSection();
};

// Fonction pour fermer la modal d'authentification
function closeAuthModal() {
    const modals = document.querySelectorAll('.fixed.inset-0.bg-black\\/50.backdrop-blur-sm');
    modals.forEach(modal => modal.remove());
}

// Modal d'authentification
function showAuthModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
    modal.id = 'auth-modal'; // Ajout d'un ID pour faciliter la sélection
    modal.innerHTML = `
        <div class="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 border border-gray-700">
            <div class="text-center mb-6">
                <h2 class="text-2xl font-bold mb-2">Connexion / Inscription</h2>
                <p class="text-gray-400">Accédez à toutes les fonctionnalités</p>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-2">Email</label>
                    <input type="email" id="modal-email" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500" placeholder="votre@email.com">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">Mot de passe</label>
                    <input type="password" id="modal-password" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500" placeholder="••••••••">
                </div>
                
                <div class="flex space-x-3">
                    <button onclick="handleAuth('login')" class="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-medium transition-all">
                        Se connecter
                    </button>
                    <button onclick="handleAuth('signup')" class="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium transition-all">
                        S'inscrire
                    </button>
                </div>
                
                <div class="mt-4 text-center">
                    <div class="relative">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-gray-600"></div>
                        </div>
                        <div class="relative flex justify-center text-sm">
                            <span class="px-2 bg-gray-800 text-gray-400">ou</span>
                        </div>
                    </div>
                    <button onclick="handleAuth('google')" class="mt-4 w-full bg-white hover:bg-gray-100 text-gray-900 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2">
                        <svg class="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Continuer avec Google</span>
                    </button>
                </div>
            </div>
            
            <button onclick="closeAuthModal()" class="absolute top-4 right-4 text-gray-400 hover:text-white">
                <i data-lucide="x" class="w-6 h-6"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    lucide.createIcons();
}

window.handleAuth = function(type) {
    const email = document.getElementById('modal-email')?.value;
    const password = document.getElementById('modal-password')?.value;
    
    if (type === 'google') {
        // Authentification avec Google
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then((result) => {
                // L'utilisateur est connecté
                const user = result.user;
                currentUser = { 
                    email: user.email,
                    uid: user.uid,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                };
                
                // Vérifier si l'utilisateur est premium (à implémenter selon votre logique)
                checkPremiumStatus(user.uid);
                
                showNotification('Connecté avec Google !', 'success');
                
                // Fermer la modal avec la nouvelle fonction
                closeAuthModal();
            })
            .catch((error) => {
                console.error("Erreur d'authentification Google:", error);
                showNotification("Erreur de connexion: " + error.message, 'error');
            });
    } else if (type === 'login') {
        // Connexion avec email/mot de passe
        if (!email || !password) {
            showNotification('Veuillez remplir tous les champs', 'error');
            return;
        }
        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // L'utilisateur est connecté
                const user = userCredential.user;
                currentUser = { 
                    email: user.email,
                    uid: user.uid
                };
                
                // Vérifier si l'utilisateur est premium
                checkPremiumStatus(user.uid);
                
                showNotification('Connecté avec succès', 'success');
                
                // Fermer la modal avec la nouvelle fonction
                closeAuthModal();
            })
            .catch((error) => {
                console.error("Erreur d'authentification:", error);
                showNotification("Erreur de connexion: " + error.message, 'error');
            });
    } else if (type === 'signup') {
        // Création de compte avec email/mot de passe
        if (!email || !password) {
            showNotification('Veuillez remplir tous les champs', 'error');
            return;
        }
        
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Compte créé et utilisateur connecté
                const user = userCredential.user;
                currentUser = { 
                    email: user.email,
                    uid: user.uid
                };
                
                // Par défaut, les nouveaux utilisateurs ne sont pas premium
                isPremium = false;
                
                // Créer un document utilisateur dans Firestore
                db.collection('users').doc(user.uid).set({
                    email: user.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    isPremium: false,
                    followedTraders: []
                });
                
                showNotification('Compte créé avec succès', 'success');
                
                // Fermer la modal avec la nouvelle fonction
                closeAuthModal();
            })
            .catch((error) => {
                console.error("Erreur de création de compte:", error);
                showNotification("Erreur d'inscription: " + error.message, 'error');
            });
    }
};

// Fonction pour vérifier si un utilisateur est premium
function checkPremiumStatus(userId) {
    db.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                isPremium = doc.data().isPremium || false;
                
                // Mettre à jour l'interface utilisateur
                if (isPremium) {
                    document.getElementById('premium-badge').classList.remove('hidden');
                    showNotification('Statut Premium activé !', 'success');
                } else {
                    document.getElementById('premium-badge').classList.add('hidden');
                }
                
                // Récupérer les traders suivis
                if (doc.data().followedTraders) {
                    followedTraders = doc.data().followedTraders;
                    updateFollowedTradersSection();
                }
            } else {
                // Créer un document pour le nouvel utilisateur
                db.collection('users').doc(userId).set({
                    email: currentUser.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    isPremium: false,
                    followedTraders: []
                });
                isPremium = false;
            }
            
            // Mettre à jour l'interface utilisateur
            document.getElementById('auth-btn').textContent = 'Déconnexion';
            document.getElementById('user-info').classList.remove('hidden');
            document.getElementById('user-info').style.display = 'flex';
            document.getElementById('user-email').textContent = currentUser.email;
        })
        .catch((error) => {
            console.error("Erreur lors de la vérification du statut premium:", error);
            isPremium = false;
        });
}

// Fonction pour gérer le menu mobile
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.querySelector('#mobile-menu-btn i');
    
    if (mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.remove('hidden');
        menuIcon.setAttribute('data-lucide', 'x');
    } else {
        mobileMenu.classList.add('hidden');
        menuIcon.setAttribute('data-lucide', 'menu');
    }
    
    // Rafraîchir les icônes Lucide
    lucide.createIcons();
}

// Fonction pour faire défiler vers une section
window.scrollToSection = function(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    
    // Écouter les changements d'état d'authentification
    auth.onAuthStateChanged((user) => {
        if (user) {
            // L'utilisateur est connecté
            currentUser = {
                email: user.email,
                uid: user.uid,
                displayName: user.displayName,
                photoURL: user.photoURL
            };
            
            // Mettre à jour l'interface utilisateur
            document.getElementById('auth-btn').textContent = 'Déconnexion';
            document.getElementById('user-info').classList.remove('hidden');
            document.getElementById('user-email').textContent = user.email;
            
            // Vérifier si l'utilisateur est premium
            checkPremiumStatus(user.uid);
        } else {
            // L'utilisateur est déconnecté
            currentUser = null;
            isPremium = false;
            document.getElementById('auth-btn').textContent = 'Se connecter';
            document.getElementById('user-info').classList.add('hidden');
            document.getElementById('premium-badge').classList.add('hidden');
        }
    });
    
    // Bouton analyser - Attendre que le DOM soit chargé
    setTimeout(() => {
        const analyzeBtn = document.getElementById('analyze-btn');
        const walletInput = document.getElementById('wallet-input');
        
        console.log('Recherche bouton analyser:', analyzeBtn);
        console.log('Recherche input wallet:', walletInput);
        
        if (analyzeBtn && walletInput) {
            console.log('Bouton analyser trouvé, ajout event listener');
            
            analyzeBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('Bouton analyser cliqué');
                
                const address = walletInput.value.trim();
                console.log('Adresse à analyser:', address);
                
                if (!address) {
                    showNotification('Veuillez entrer une adresse', 'error');
                    return;
                }

                const loadingEl = document.getElementById('loading');
                if (loadingEl) loadingEl.classList.remove('hidden');
                
                try {
                    const analysis = await analyzeWallet(address);
                    displayAnalysis(analysis);
                    showNotification('Analyse terminée avec succès !', 'success');
                } catch (error) {
                    console.error('Erreur analyse:', error);
                    showNotification('Erreur: ' + error.message, 'error');
                } finally {
                    if (loadingEl) loadingEl.classList.add('hidden');
                }
            });
            
            // Aussi sur Enter
            walletInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    analyzeBtn.click();
                }
            });
        } else {
            console.error('Bouton ou input non trouvé:', {analyzeBtn, walletInput});
        }
    }, 1000);
    
    // Bouton connexion
    document.getElementById('auth-btn').addEventListener('click', () => {
        if (currentUser) {
            // Déconnexion avec Firebase
            auth.signOut().then(() => {
                currentUser = null;
                isPremium = false;
                followedTraders = [];
                localStorage.removeItem('followedTraders');
                document.getElementById('auth-btn').textContent = 'Se connecter';
                document.getElementById('user-info').classList.add('hidden');
                document.getElementById('premium-badge').classList.add('hidden');
                showNotification('Déconnecté avec succès', 'success');
                updateFollowedTradersSection();
            }).catch((error) => {
                console.error("Erreur lors de la déconnexion:", error);
                showNotification("Erreur lors de la déconnexion", 'error');
            });
        } else {
            showAuthModal();
        }
    });
    
    // Charger les traders au démarrage avec cache 24h
    async function initApp() {
        try {
            const now = Date.now();
            const lastUpdate = localStorage.getItem('lastTradersUpdate');
            const cachedTraders = localStorage.getItem('cachedTraders');
            
            // Vérifier si les données sont récentes (moins de 24h)
            if (lastUpdate && cachedTraders && (now - parseInt(lastUpdate)) < 24 * 60 * 60 * 1000) {
                const traders = JSON.parse(cachedTraders);
                displayTraders(traders);
                const updateTime = new Date(parseInt(lastUpdate)).toLocaleString('fr-FR');
                document.getElementById('last-update').textContent = updateTime;
                showNotification('Données chargées depuis le cache (24h)', 'info');
                
                // Programmer la prochaine mise à jour
                const timeUntilUpdate = 24 * 60 * 60 * 1000 - (now - parseInt(lastUpdate));
                setTimeout(() => {
                    showNotification('Mise à jour automatique des traders...', 'info');
                    forceUpdateTraders();
                }, timeUntilUpdate);
            } else {
                // Charger de nouvelles données
                await forceUpdateTraders();
            }
        } catch (error) {
            showNotification('Erreur chargement traders: ' + error.message, 'error');
        }
    }
    
    // Forcer la mise à jour des traders
    async function forceUpdateTraders() {
        try {
            showNotification('Recherche des meilleurs traders...', 'info');
            const traders = await loadTopTraders();
            displayTraders(traders);
            
            // Sauvegarder en cache
            const now = Date.now();
            localStorage.removeItem('cachedTraders');
            localStorage.removeItem('lastTradersUpdate');
            localStorage.setItem('cachedTraders', JSON.stringify(traders));
            localStorage.setItem('lastTradersUpdate', now.toString());
            
            document.getElementById('last-update').textContent = new Date().toLocaleString('fr-FR');
            showNotification('Top traders mis à jour !', 'success');
            
            // Programmer la prochaine mise à jour dans 24h
            setTimeout(() => {
                showNotification('Mise à jour automatique des traders...', 'info');
                forceUpdateTraders();
            }, 24 * 60 * 60 * 1000);
        } catch (error) {
            showNotification('Erreur mise à jour: ' + error.message, 'error');
        }
    }
    
    initApp();
    
    // Initialisation du menu mobile
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
});