// Système de surveillance des traders pour CryptoTraderCertified

// Intervalle de vérification des mouvements (en millisecondes)
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Stockage des dernières transactions connues par trader
let lastKnownTransactions = {};

// Fonction pour démarrer la surveillance des traders suivis
function startTraderMonitoring() {
    if (!currentUser) {
        console.log('Utilisateur non connecté, surveillance des traders désactivée');
        return;
    }

    console.log('Démarrage de la surveillance des traders suivis');
    
    // Charger les dernières transactions connues depuis le localStorage
    const savedTransactions = localStorage.getItem(`lastTransactions_${currentUser.uid}`);
    if (savedTransactions) {
        lastKnownTransactions = JSON.parse(savedTransactions);
    }
    
    // Vérifier immédiatement les mouvements
    checkTraderMovements();
    
    // Configurer la vérification périodique
    setInterval(checkTraderMovements, CHECK_INTERVAL);
}

// Fonction pour vérifier les mouvements des traders suivis
async function checkTraderMovements() {
    if (!currentUser || !followedTraders || followedTraders.length === 0) {
        return;
    }
    
    console.log('Vérification des mouvements des traders suivis...');
    
    try {
        for (const trader of followedTraders) {
            // Vérifier si trader et trader.id sont définis
            if (!trader || !trader.id) {
                console.warn('Trader invalide détecté dans la liste des traders suivis:', trader);
                continue;
            }
            
            const traderAddress = trader.id.replace ? trader.id.replace('search_', '') : trader.id;
            const traderName = trader.name || 'Trader inconnu';
            
            console.log(`Vérification des mouvements pour ${traderName} (${traderAddress})`);
            
            // Récupérer les dernières transactions du trader
            const transactions = await fetchTraderTransactions(traderAddress);
            
            if (!transactions || transactions.length === 0) {
                console.log(`Aucune transaction trouvée pour ${traderName}`);
                continue;
            }
            
            // Vérifier s'il y a de nouvelles transactions
            const lastKnownTx = lastKnownTransactions[traderAddress] || '';
            const newTransactions = transactions.filter(tx => {
                // Considérer comme nouvelle si la transaction n'est pas connue
                // et qu'elle est plus récente que la dernière connue
                return tx.hash !== lastKnownTx && 
                       (!lastKnownTx || tx.timeStamp > (lastKnownTransactions[traderAddress + '_timestamp'] || 0));
            });
            
            if (newTransactions.length > 0) {
                // Mettre à jour la dernière transaction connue
                const latestTx = newTransactions[0];
                lastKnownTransactions[traderAddress] = latestTx.hash;
                lastKnownTransactions[traderAddress + '_timestamp'] = latestTx.timeStamp;
                
                // Traiter chaque nouvelle transaction
                for (const tx of newTransactions) {
                    processNewTransaction(traderAddress, traderName, tx);
                }
                
                // Sauvegarder les dernières transactions connues
                localStorage.setItem(`lastTransactions_${currentUser.uid}`, JSON.stringify(lastKnownTransactions));
            }
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des mouvements des traders:', error);
    }
}

// Fonction pour récupérer les transactions d'un trader
async function fetchTraderTransactions(address) {
    try {
        const response = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${API_KEY}`);
        const data = await response.json();
        
        if (data.status === '1' && data.result) {
            return data.result.slice(0, 10); // Récupérer les 10 dernières transactions
        }
        return [];
    } catch (error) {
        console.error('Erreur lors de la récupération des transactions:', error);
        return [];
    }
}

// Fonction pour traiter une nouvelle transaction
async function processNewTransaction(traderAddress, traderName, transaction) {
    try {
        // Déterminer le type d'opération (achat ou vente)
        const operationType = transaction.from.toLowerCase() === traderAddress.toLowerCase() ? 'vente' : 'achat';
        
        // Récupérer les détails du token (si c'est une transaction de token)
        let tokenInfo = { symbol: 'ETH', amount: transaction.value / 1e18 };
        
        if (transaction.input && transaction.input.startsWith('0xa9059cbb')) {
            // C'est probablement un transfert de token ERC-20
            tokenInfo = await getTokenTransferDetails(transaction);
        }
        
        // Créer la notification
        const notificationData = {
            userId: currentUser.uid,
            title: `${traderName} - ${operationType.toUpperCase()} ${tokenInfo.symbol}`,
            body: `${operationType.charAt(0).toUpperCase() + operationType.slice(1)} de ${tokenInfo.amount.toFixed(4)} ${tokenInfo.symbol}`,
            icon: '/logo.png',
            url: `/#trader-details?address=${traderAddress}`,
            traderId: traderAddress,
            traderName: traderName,
            operationType: operationType,
            amount: tokenInfo.amount.toFixed(4),
            token: tokenInfo.symbol,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            read: false,
            txHash: transaction.hash
        };
        
        // Enregistrer la notification dans Firestore
        await db.collection('notifications').add(notificationData);
        
        // Afficher la notification dans l'interface
        showTraderNotification(notificationData);
        
        console.log(`Nouvelle transaction détectée pour ${traderName}:`, notificationData);
    } catch (error) {
        console.error('Erreur lors du traitement de la transaction:', error);
    }
}

// Fonction pour récupérer les détails d'un transfert de token
async function getTokenTransferDetails(transaction) {
    try {
        // Récupérer l'adresse du contrat
        const contractAddress = transaction.to;
        
        // Récupérer les informations sur le token
        const tokenInfoResponse = await fetch(`https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress=${contractAddress}&apikey=${API_KEY}`);
        const tokenInfoData = await tokenInfoResponse.json();
        
        let symbol = 'UNKNOWN';
        let decimals = 18;
        
        if (tokenInfoData.status === '1' && tokenInfoData.result) {
            symbol = tokenInfoData.result[0].symbol;
            decimals = parseInt(tokenInfoData.result[0].divisor) || 18;
        }
        
        // Extraire le montant du transfert depuis les données d'entrée
        // Note: Ceci est une simplification, une analyse plus précise nécessiterait une bibliothèque comme web3.js
        const dataWithoutMethodId = transaction.input.slice(10); // Enlever le method ID (0xa9059cbb)
        const amount = parseInt(dataWithoutMethodId.slice(64), 16) / Math.pow(10, decimals);
        
        return { symbol, amount };
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du token:', error);
        return { symbol: 'UNKNOWN', amount: 0 };
    }
}

// Fonction pour afficher une notification dans l'interface
function showTraderNotification(notification) {
    // Afficher la notification dans l'interface
    const notificationElement = document.createElement('div');
    notificationElement.className = 'notification slide-in bg-gray-800 border-l-4 border-blue-500 p-4 rounded-lg shadow-lg mb-2';
    notificationElement.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0 mr-3">
                <i data-lucide="activity" class="w-5 h-5 text-blue-400"></i>
            </div>
            <div class="flex-1">
                <h4 class="text-sm font-semibold">${notification.title}</h4>
                <p class="text-xs text-gray-400 mt-1">${notification.body}</p>
                <div class="mt-2 flex space-x-2">
                    <a href="${notification.url}" class="text-xs text-blue-400 hover:text-blue-300">Voir détails</a>
                    <button class="text-xs text-gray-400 hover:text-gray-300 dismiss-notification">Fermer</button>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter la notification à la liste
    const notificationsContainer = document.getElementById('notifications');
    notificationsContainer.appendChild(notificationElement);
    
    // Initialiser les icônes Lucide
    lucide.createIcons();
    
    // Configurer le bouton de fermeture
    const dismissButton = notificationElement.querySelector('.dismiss-notification');
    dismissButton.addEventListener('click', () => {
        notificationElement.classList.add('fade-out');
        setTimeout(() => {
            notificationsContainer.removeChild(notificationElement);
        }, 300);
    });
    
    // Fermer automatiquement après 10 secondes
    setTimeout(() => {
        if (notificationsContainer.contains(notificationElement)) {
            notificationElement.classList.add('fade-out');
            setTimeout(() => {
                if (notificationsContainer.contains(notificationElement)) {
                    notificationsContainer.removeChild(notificationElement);
                }
            }, 300);
        }
    }, 10000);
}

// Fonction pour charger les notifications non lues depuis Firestore
async function loadUnreadNotifications() {
    if (!currentUser) return;
    
    try {
        // Utiliser une requête simple sans tri pour éviter les problèmes d'index
        const notificationsSnapshot = await db.collection('notifications')
            .where('userId', '==', currentUser.uid)
            .limit(50)
            .get();
        
        if (notificationsSnapshot.empty) {
            return;
        }
        
        // Filtrer les notifications non lues côté client et les trier par date
        const allNotifications = [];
        notificationsSnapshot.forEach(doc => {
            const data = doc.data();
            allNotifications.push({ id: doc.id, ...data });
        });
        
        // Trier les notifications par date (les plus récentes d'abord)
        allNotifications.sort((a, b) => {
            const timestampA = a.timestamp ? a.timestamp.toDate().getTime() : 0;
            const timestampB = b.timestamp ? b.timestamp.toDate().getTime() : 0;
            return timestampB - timestampA;
        });
        
        // Filtrer pour ne garder que les notifications non lues
        const unreadNotifications = allNotifications.filter(notification => notification.read === false);
        
        if (unreadNotifications.length === 0) {
            return;
        }
        
        // Mettre à jour le compteur de notifications
        const notificationCount = document.getElementById('notification-count');
        notificationCount.textContent = unreadNotifications.length;
        notificationCount.classList.remove('hidden');
        
        // Afficher les notifications non lues (limiter à 5 pour éviter de surcharger l'interface)
        const notificationsToShow = unreadNotifications.slice(0, 5);
        notificationsToShow.forEach(notification => {
            showTraderNotification(notification);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des notifications non lues:', error);
    }
}

// Fonction pour marquer toutes les notifications comme lues
async function markAllNotificationsAsRead() {
    if (!currentUser) return;
    
    try {
        const batch = db.batch();
        // Utiliser une requête plus simple pour éviter les problèmes d'index
        const notificationsSnapshot = await db.collection('notifications')
            .where('userId', '==', currentUser.uid)
            .get();
        
        // Ne mettre à jour que les notifications non lues
        let unreadCount = 0;
        notificationsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.read === false) {
                batch.update(doc.ref, { read: true });
                unreadCount++;
            }
        });
        
        console.log(`Marquage de ${unreadCount} notifications comme lues`);
        
        await batch.commit();
        
        // Mettre à jour l'interface
        const notificationCount = document.getElementById('notification-count');
        notificationCount.textContent = '0';
        notificationCount.classList.add('hidden');
        
        // Vider le conteneur de notifications
        const notificationsContainer = document.getElementById('notifications');
        notificationsContainer.innerHTML = '';
        
        console.log('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
        console.error('Erreur lors du marquage des notifications comme lues:', error);
    }
}