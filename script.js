// script.js - CTC

// Variables Firebase globales
let auth, db, googleProvider;

// Initialiser Firebase quand disponible
function initFirebase() {
  if (typeof firebase !== 'undefined') {
    auth = firebase.auth();
    db = firebase.firestore();
    googleProvider = new firebase.auth.GoogleAuthProvider();
    console.log('Firebase initialisé');
  } else {
    setTimeout(initFirebase, 500);
  }
}

initFirebase();

// Variables globales
let currentWalletData = null;
let assetsChart = null;
let performanceChart = null;
let activityChart = null;
let isFollowing = false;

// Animation des blocs blockchain dans le hero
function animateBlocks() {
  const blockchainAnimation = document.querySelector('.blockchain-animation');
  if (!blockchainAnimation) return;
  
  // Supprimer les blocs existants
  while (blockchainAnimation.firstChild) {
    blockchainAnimation.removeChild(blockchainAnimation.firstChild);
  }
  
  // Créer de nouveaux blocs
  const numBlocks = 5;
  const blocks = [];
  
  for (let i = 0; i < numBlocks; i++) {
    const block = document.createElement('div');
    block.className = 'block';
    blockchainAnimation.appendChild(block);
    blocks.push(block);
    
    // Position aléatoire mais plus centrée
    const randomX = 100 + Math.random() * (window.innerWidth - 300);
    const randomY = 50 + Math.random() * 200;
    block.style.left = `${randomX}px`;
    block.style.top = `${randomY}px`;
  }
  
  // Créer des connexions entre les blocs
  for (let i = 0; i < numBlocks - 1; i++) {
    createConnection(blocks[i], blocks[i + 1]);
  }
  
  // Créer une connexion entre le dernier et le premier bloc
  createConnection(blocks[numBlocks - 1], blocks[0]);
  
  // Créer des connexions supplémentaires pour former un réseau plus complexe
  createConnection(blocks[0], blocks[2]);
  createConnection(blocks[1], blocks[3]);
  createConnection(blocks[2], blocks[4]);
}

// Créer une connexion entre deux blocs
function createConnection(block1, block2) {
  const connection = document.createElement('div');
  connection.className = 'connection';
  document.querySelector('.blockchain-animation').appendChild(connection);
  
  // Ajouter un effet de pulse à la connexion
  const pulseInterval = 3000 + Math.random() * 2000; // Entre 3 et 5 secondes
  setInterval(() => {
    connection.classList.add('pulse');
    setTimeout(() => {
      connection.classList.remove('pulse');
    }, 1000);
  }, pulseInterval);
  
  // Mettre à jour la position et la rotation de la connexion
  updateConnection(connection, block1, block2);
  
  // Mettre à jour la connexion lors de l'animation des blocs
  setInterval(() => {
    updateConnection(connection, block1, block2);
  }, 50);
}

// Mettre à jour la position et la rotation d'une connexion
function updateConnection(connection, block1, block2) {
  const rect1 = block1.getBoundingClientRect();
  const rect2 = block2.getBoundingClientRect();
  
  const x1 = rect1.left + rect1.width / 2;
  const y1 = rect1.top + rect1.height / 2;
  const x2 = rect2.left + rect2.width / 2;
  const y2 = rect2.top + rect2.height / 2;
  
  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  
  connection.style.width = `${length}px`;
  connection.style.left = `${x1}px`;
  connection.style.top = `${y1}px`;
  connection.style.transform = `rotate(${angle}deg)`;
}

// Créer l'animation des particules blockchain
function createParticlesAnimation() {
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles-container';
  document.body.appendChild(particlesContainer);
  
  // Créer des particules aléatoires
  const numParticles = 50;
  
  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const randomX = Math.random() * window.innerWidth;
    const randomY = Math.random() * window.innerHeight;
    const randomSize = 2 + Math.random() * 3;
    const randomDuration = 10 + Math.random() * 20;
    const randomDelay = Math.random() * 10;
    
    particle.style.left = `${randomX}px`;
    particle.style.top = `${randomY}px`;
    particle.style.width = `${randomSize}px`;
    particle.style.height = `${randomSize}px`;
    particle.style.animationDuration = `${randomDuration}s`;
    particle.style.animationDelay = `${randomDelay}s`;
    
    particlesContainer.appendChild(particle);
  }
  
  // Créer des connexions entre particules proches
  setInterval(() => {
    createParticleConnections(particlesContainer);
  }, 1000);
}

// Créer des connexions entre particules proches
function createParticleConnections(container) {
  // Supprimer les anciennes connexions
  container.querySelectorAll('.particle-connection').forEach(conn => conn.remove());
  
  const particles = container.querySelectorAll('.particle');
  const particlePositions = [];
  
  // Collecter les positions des particules
  particles.forEach(particle => {
    const rect = particle.getBoundingClientRect();
    particlePositions.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      element: particle
    });
  });
  
  // Créer des connexions entre particules proches
  for (let i = 0; i < particlePositions.length; i++) {
    for (let j = i + 1; j < particlePositions.length; j++) {
      const p1 = particlePositions[i];
      const p2 = particlePositions[j];
      
      const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      
      // Connecter seulement les particules proches
      if (distance < 150) {
        const connection = document.createElement('div');
        connection.className = 'connection particle-connection';
        
        const length = distance;
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        
        connection.style.width = `${length}px`;
        connection.style.left = `${p1.x}px`;
        connection.style.top = `${p1.y}px`;
        connection.style.transform = `rotate(${angle}deg)`;
        connection.style.opacity = (1 - distance / 150) * 0.3;
        
        container.appendChild(connection);
      }
    }
  }
}

// Créer le fond de grille 3D
function createGridBackground() {
  const gridBg = document.createElement('div');
  gridBg.className = 'grid-bg';
  
  const grid = document.createElement('div');
  grid.className = 'grid';
  
  gridBg.appendChild(grid);
  document.body.appendChild(gridBg);
}

// Créer l'animation de cubes 3D
function createCubeAnimation() {
  const cubeContainer = document.createElement('div');
  cubeContainer.className = 'cube-container';
  document.body.appendChild(cubeContainer);
  
  // Créer plusieurs cubes
  const numCubes = 3;
  
  for (let i = 0; i < numCubes; i++) {
    const cube = document.createElement('div');
    cube.className = 'cube';
    
    // Position aléatoire
    const randomX = -300 + Math.random() * 600;
    const randomY = -300 + Math.random() * 600;
    const randomZ = -300 + Math.random() * 600;
    const randomScale = 0.5 + Math.random() * 1.5;
    const randomDelay = Math.random() * 10;
    
    cube.style.transform = `translate3d(${randomX}px, ${randomY}px, ${randomZ}px) scale(${randomScale})`;
    cube.style.animationDelay = `${randomDelay}s`;
    
    // Créer les faces du cube
    for (let j = 0; j < 6; j++) {
      const face = document.createElement('div');
      face.className = 'cube-face';
      cube.appendChild(face);
    }
    
    cubeContainer.appendChild(cube);
  }
}

// Créer les cubes de la bannière
function createBannerCubes() {
  const banner = document.querySelector('.top-banner');
  if (!banner) return;
  
  const overlay = document.createElement('div');
  overlay.className = 'banner-overlay';
  banner.appendChild(overlay);
  
  // Créer plusieurs cubes
  const numCubes = 4;
  
  for (let i = 0; i < numCubes; i++) {
    const cube = document.createElement('div');
    cube.className = 'banner-cube';
    
    // Créer les faces du cube
    for (let j = 0; j < 6; j++) {
      const face = document.createElement('div');
      face.className = 'banner-cube-face';
      cube.appendChild(face);
    }
    
    overlay.appendChild(cube);
  }
}

// Créer l'effet de matrice en arrière-plan
function createMatrixEffect() {
  const matrixBg = document.createElement('div');
  matrixBg.className = 'matrix-bg';
  document.body.appendChild(matrixBg);
  
  // Caractères pour l'effet matrice
  const chars = '01';
  
  // Créer les colonnes de caractères
  const numColumns = 50;
  
  for (let i = 0; i < numColumns; i++) {
    const column = document.createElement('div');
    column.className = 'matrix-column';
    
    // Position aléatoire
    const randomX = Math.random() * 100;
    const randomSpeed = 10 + Math.random() * 20;
    const randomDelay = Math.random() * 10;
    const randomLength = 10 + Math.random() * 20;
    
    column.style.left = `${randomX}%`;
    column.style.animationDuration = `${randomSpeed}s`;
    column.style.animationDelay = `${randomDelay}s`;
    
    // Générer des caractères aléatoires
    for (let j = 0; j < randomLength; j++) {
      const char = document.createElement('div');
      char.textContent = chars.charAt(Math.floor(Math.random() * chars.length));
      char.style.opacity = 1 - (j / randomLength);
      column.appendChild(char);
    }
    
    matrixBg.appendChild(column);
  }
}

// Initialisation des animations et événements
document.addEventListener('DOMContentLoaded', () => {
  // Créer les animations de fond
  createGridBackground();
  createParticlesAnimation();
  createCubeAnimation();
  createBannerCubes();
  // createMatrixEffect(); // Désactivé
  
  // Animation des blocs blockchain
  animateBlocks();
  
  // Ajouter l'attribut data-text aux éléments pour les effets de texte
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle) {
    heroTitle.setAttribute('data-text', heroTitle.textContent);
    heroTitle.classList.add('cyber-text');
  }
  
  // Ajouter des effets 3D aux éléments
  document.querySelectorAll('.feature, .premium-tier, .token-stat').forEach(card => {
    card.classList.add('glass-card');
    card.classList.add('element-3d');
  });
  
  // Ajouter des effets de texte néon
  document.querySelectorAll('.section h2, .feature-icon i, .token-stat i').forEach(element => {
    element.classList.add('neon-text');
  });
  
  // Ajouter des effets de shimmer holographique
  document.querySelectorAll('.cta, .premium-tier.featured, nav button').forEach(element => {
    element.classList.add('shimmer');
  });
  
  // Ajouter des effets de glitch aux textes importants
  document.querySelectorAll('.premium-tier h3, .highlight-text').forEach(element => {
    const text = element.textContent;
    element.setAttribute('data-text', text);
    element.classList.add('glitch');
  });
  
  // Ajouter des effets 3D aux conteneurs
  document.querySelectorAll('.search-container, .hero-content, .section h2').forEach(element => {
    element.classList.add('element-3d');
  });
  
  // Smooth scroll pour les liens d'ancrage avec effet 3D
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Ajouter un effet de flash au scroll
        document.body.classList.add('flash-transition');
        setTimeout(() => {
          document.body.classList.remove('flash-transition');
        }, 500);
        
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Effets de parallaxe désactivés
  // window.addEventListener('scroll', () => {
  //   const scrollY = window.scrollY;
  //   document.querySelectorAll('.element-3d').forEach(element => {
  //     const speed = 0.05;
  //     const yPos = -(scrollY * speed);
  //     element.style.transform = `translateZ(20px) translateY(${yPos}px)`;
  //   });
  //   const grid = document.querySelector('.grid');
  //   if (grid) {
  //     grid.style.transform = `rotateX(60deg) translateY(${scrollY * 0.1}px) scale(2)`;
  //   }
  // });
  
  // Ajouter des effets de survol 3D aux éléments interactifs
  addHoverEffects3D();
  
  // Initialiser les onglets du modal de connexion
  initAuthTabs();
  
  // Vérifier l'état de connexion (avec gestion d'erreur)
  try {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Afficher le nom de l'utilisateur ou son email
        const displayName = user.displayName ? user.displayName.split(' ')[0] : user.email.split('@')[0];
        document.getElementById("loginBtn").innerHTML = `<i class="fas fa-user"></i> ${displayName}`;
        
        // Afficher les éléments réservés aux utilisateurs connectés
        document.querySelectorAll('.auth-required').forEach(el => {
          el.classList.remove('hidden');
        });
        
        // Si un wallet est affiché, vérifier si l'utilisateur le suit
        if (currentWalletData) {
          checkFollowStatus(currentWalletData.address);
        }
      } else {
        document.getElementById("loginBtn").innerHTML = `<i class="fas fa-user-lock"></i> Connexion`;
        
        // Masquer les éléments réservés aux utilisateurs connectés
        document.querySelectorAll('.auth-required').forEach(el => {
          el.classList.add('hidden');
        });
      }
    });
  } catch (error) {
    console.warn("Erreur auth:", error);
  }
  
  // Initialiser les gestionnaires d'événements pour les interactions utilisateur
  initEventListeners();
  
  // Charger les top traders
  loadTopTraders();
  
  // Charger les traders suivis
  loadFollowedTraders();
  updateFollowCounter();
  
  // Mettre à jour les top traders toutes les 24h
  setInterval(loadTopTraders, 24 * 60 * 60 * 1000);
  
  // Mettre à jour les traders suivis toutes les 30 secondes
  setInterval(loadFollowedTraders, 30000);
});

// Initialiser les gestionnaires d'événements pour les interactions utilisateur
function initEventListeners() {
  // Filtrage des transactions
  const txTypeFilter = document.getElementById("txTypeFilter");
  if (txTypeFilter) {
    txTypeFilter.addEventListener("change", function() {
      if (currentWalletData) {
        // Afficher/masquer les transactions selon le filtre sélectionné
        displayRecentTransactions(this.value);
      }
    });
  }
  
  // Gestion du bouton "Suivre ce trader"
  const followBtn = document.getElementById("followBtn");
  if (followBtn) {
    followBtn.addEventListener("click", function() {
      if (!currentWalletData) return;
      
      // Vérifier si l'utilisateur est connecté
      if (!auth.currentUser) {
        alert("Vous devez être connecté pour suivre un trader");
        // Afficher le modal de connexion
        const loginModal = document.getElementById("loginModal");
        if (loginModal) {
          loginModal.classList.remove("hidden");
          document.body.style.overflow = "hidden";
        }
        return;
      }
      
      // Toggle du statut de suivi
      if (isFollowing) {
        unfollowTrader(currentWalletData.address);
      } else {
        followTrader(currentWalletData.address);
      }
      
      // Effet visuel de confirmation
      this.classList.add("animate-pulse");
      setTimeout(() => {
        this.classList.remove("animate-pulse");
      }, 500);
    });
  }
  
  // Gestion du bouton "Publier" commentaire
  const submitCommentBtn = document.getElementById("submitCommentBtn");
  if (submitCommentBtn) {
    submitCommentBtn.addEventListener("click", function() {
      if (!currentWalletData) return;
      
      // Vérifier si l'utilisateur est connecté
      if (!auth.currentUser) {
        alert("Vous devez être connecté pour publier un commentaire");
        // Afficher le modal de connexion
        const loginModal = document.getElementById("loginModal");
        if (loginModal) {
          loginModal.classList.remove("hidden");
          document.body.style.overflow = "hidden";
        }
        return;
      }
      
      // Récupérer et valider le texte du commentaire
      const commentInput = document.getElementById("commentInput");
      const commentText = commentInput.value.trim();
      
      if (!commentText) {
        alert("Veuillez entrer un commentaire");
        commentInput.focus();
        return;
      }
      
      // Ajouter le commentaire
      addComment(currentWalletData.address, commentText);
      
      // Effet visuel de confirmation
      this.innerHTML = '<i class="fas fa-check"></i> Publié';
      setTimeout(() => {
        this.innerHTML = '<i class="fas fa-paper-plane"></i> Publier';
      }, 2000);
    });
  }
  
  // Ajouter un événement pour soumettre le commentaire avec la touche Entrée
  const commentInput = document.getElementById("commentInput");
  if (commentInput) {
    commentInput.addEventListener("keydown", function(e) {
      // Soumettre avec Ctrl+Entrée
      if (e.key === "Enter" && e.ctrlKey) {
        const submitCommentBtn = document.getElementById("submitCommentBtn");
        if (submitCommentBtn) {
          submitCommentBtn.click();
        }
      }
    });
  }
}
  
// Ajouter des effets de rotation du placeholder sur le champ de recherche
const walletInput = document.getElementById("walletInput");

if (walletInput) {
  const placeholders = [
    "Entrez une adresse Ethereum...",
    "Recherchez un wallet de trader...",
    "Analysez un portefeuille crypto...",
    "Découvrez les meilleurs traders..."
  ];

  let currentIndex = 0;

  setInterval(() => {
    walletInput.placeholder = placeholders[currentIndex];
    currentIndex = (currentIndex + 1) % placeholders.length;
  }, 3000);
}

// Initialiser les onglets du modal de connexion
function initAuthTabs() {
  // Ajouter des animations au modal
  const loginModal = document.getElementById("loginModal");
  if (!loginModal) return;
  
  console.log("Initializing auth tabs");
  
  // Gestion du toggle des onglets de modal (.auth-tab / .auth-tab-content)
  const authTabs = document.querySelectorAll(".auth-tab");
  const authContents = document.querySelectorAll(".auth-tab-content");
  
  console.log("Auth tabs:", authTabs.length);
  console.log("Auth contents:", authContents.length);
  
  // Activer le premier onglet par défaut
  if (authTabs.length > 0 && authContents.length > 0) {
    // Ajouter une classe active visible
    authTabs[0].classList.add("active");
    authTabs[0].classList.add("bg-yellow-400");
    authTabs[0].classList.add("text-gray-900");
    authTabs[0].classList.remove("bg-gray-700");
    
    // S'assurer que le premier contenu est visible
    authContents[0].classList.remove("hidden");
    
    // Cacher les autres contenus
    for (let i = 1; i < authContents.length; i++) {
      authContents[i].classList.add("hidden");
    }
  }
  
  // Ajouter des écouteurs d'événements pour chaque onglet
  authTabs.forEach(tab => {
    tab.addEventListener("click", function() {
      console.log("Tab clicked:", this.getAttribute("data-tab"));
      
      // Retirer la classe active de tous les onglets
      authTabs.forEach(t => {
        t.classList.remove("active");
        t.classList.remove("bg-yellow-400");
        t.classList.remove("text-gray-900");
        t.classList.add("bg-gray-700");
      });
      
      // Cacher tous les contenus
      authContents.forEach(c => c.classList.add("hidden"));
      
      // Ajouter la classe active à l'onglet cliqué
      this.classList.add("active");
      this.classList.add("bg-yellow-400");
      this.classList.add("text-gray-900");
      this.classList.remove("bg-gray-700");
      
      // Afficher le contenu correspondant
      const tabId = this.getAttribute("data-tab");
      const tabContent = document.getElementById(`${tabId}Tab`);
      if (tabContent) {
        tabContent.classList.remove("hidden");
        console.log("Showing tab content:", tabId);
      } else {
        console.log("Tab content not found:", tabId);
      }
    });
  });
  
  // Ajouter des effets aux formulaires
  document.querySelectorAll("input").forEach(input => {
    input.addEventListener("focus", function() {
      this.classList.add("border-yellow-400");
    });
    
    input.addEventListener("blur", function() {
      if (!this.value) {
        this.classList.remove("border-yellow-400");
      }
    });
  });
}

// Ajouter des effets de survol 3D aux éléments interactifs
function addHoverEffects3D() {
  // Effet de survol 3D pour les cartes
  document.querySelectorAll('.stat-card, .chart-container, .crypto-item, .favorite-crypto, .latest-purchase').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px) translateZ(30px) rotateX(5deg)';
      this.style.boxShadow = '0 15px 35px rgba(74, 107, 255, 0.3), 0 0 15px rgba(0, 247, 255, 0.2)';
      this.style.borderColor = 'rgba(0, 247, 255, 0.3)';
      this.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
      this.style.borderColor = '';
      this.style.zIndex = '';
    });
    
    // Effet de rotation 3D au mouvement de la souris
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left; // Position X de la souris dans l'élément
      const y = e.clientY - rect.top; // Position Y de la souris dans l'élément
      
      // Calculer la rotation en fonction de la position de la souris
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateY = (x - centerX) / 20; // Rotation autour de l'axe Y
      const rotateX = (centerY - y) / 20; // Rotation autour de l'axe X
      
      this.style.transform = `translateY(-10px) translateZ(30px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  });
  
  // Effet de survol 3D pour les boutons
  document.querySelectorAll('button:not(.auth-tab), .cta').forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px) translateZ(20px)';
      this.style.boxShadow = '0 15px 35px rgba(74, 107, 255, 0.4), 0 0 20px rgba(0, 247, 255, 0.3)';
      
      // Ajouter un effet de lueur au survol
      const glow = document.createElement('div');
      glow.className = 'button-glow';
      glow.style.position = 'absolute';
      glow.style.top = '0';
      glow.style.left = '0';
      glow.style.width = '100%';
      glow.style.height = '100%';
      glow.style.borderRadius = 'inherit';
      glow.style.background = 'radial-gradient(circle at center, rgba(0, 247, 255, 0.3) 0%, transparent 70%)';
      glow.style.pointerEvents = 'none';
      glow.style.zIndex = '-1';
      
      if (!this.querySelector('.button-glow')) {
        this.style.position = 'relative';
        this.appendChild(glow);
      }
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
      
      // Supprimer l'effet de lueur
      const glow = this.querySelector('.button-glow');
      if (glow) {
        glow.remove();
      }
    });
  });
  
  // Effet de survol 3D pour les liens de navigation
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px) translateZ(20px)';
      this.style.textShadow = '0 0 10px rgba(0, 247, 255, 0.7)';
      
      // Faire briller l'icône
      const icon = this.querySelector('i');
      if (icon) {
        icon.style.transform = 'scale(1.2)';
        icon.style.color = 'var(--accent)';
        icon.style.filter = 'drop-shadow(0 0 5px rgba(0, 247, 255, 0.7))';
      }
    });
    
    link.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.textShadow = '';
      
      // Restaurer l'icône
      const icon = this.querySelector('i');
      if (icon) {
        icon.style.transform = '';
        icon.style.color = '';
        icon.style.filter = '';
      }
    });
  });
  
  // Effet de survol 3D pour les sections
  document.querySelectorAll('.section').forEach(section => {
    section.addEventListener('mouseenter', function() {
      // Ajouter un effet de lueur subtil à la section
      this.style.boxShadow = 'inset 0 0 100px rgba(74, 107, 255, 0.1)';
    });
    
    section.addEventListener('mouseleave', function() {
      this.style.boxShadow = '';
    });
  });
  
  // Effet de survol pour le logo
  const logo = document.querySelector('.logo-img');
  if (logo) {
    logo.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.2) rotate(10deg) translateZ(40px)';
      this.style.filter = 'drop-shadow(0 0 25px rgba(0, 247, 255, 1))';
    });
    
    logo.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.filter = '';
    });
  }
}

// Gestion du modal de connexion
const loginModal = document.getElementById("loginModal");
const closeModal = document.querySelector(".close-modal");
const authTabs = document.querySelectorAll(".auth-tab");
const authContents = document.querySelectorAll(".auth-tab-content");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const googleRegisterBtn = document.getElementById("googleRegisterBtn");
const forgotPasswordLink = document.querySelector(".forgot-password");

// Ouvrir le modal de connexion
document.addEventListener("DOMContentLoaded", function() {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      if (auth.currentUser) {
        // Si déjà connecté, afficher un menu ou déconnecter
        if (confirm("Voulez-vous vous déconnecter ?")) {
          auth.signOut();
        }
        return;
      }
      
      // Afficher le modal
      const loginModal = document.getElementById("loginModal");
      if (loginModal) {
        loginModal.classList.remove("hidden");
        document.body.style.overflow = "hidden"; // Empêcher le défilement
      }
    });
  }
});

// Fermer le modal
document.addEventListener("DOMContentLoaded", function() {
  const closeModal = document.querySelector(".close-modal");
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      const loginModal = document.getElementById("loginModal");
      if (loginModal) {
        loginModal.classList.add("hidden");
        document.body.style.overflow = "auto"; // Réactiver le défilement
      }
    });
  }

  // Fermer le modal en cliquant en dehors
  window.addEventListener("click", (e) => {
    const loginModal = document.getElementById("loginModal");
    if (e.target === loginModal) {
      loginModal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  });
});

// Les gestionnaires d'événements pour les onglets sont maintenant gérés dans initAuthTabs()

// Connexion avec Google
document.addEventListener("DOMContentLoaded", function() {
  const googleLoginBtn = document.getElementById("googleLoginBtn");
  const googleRegisterBtn = document.getElementById("googleRegisterBtn");
  
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", () => {
      signInWithGoogle();
    });
  }

  if (googleRegisterBtn) {
    googleRegisterBtn.addEventListener("click", () => {
      signInWithGoogle();
    });
  }
});

// Fonction de connexion avec Google
function signInWithGoogle() {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      const user = result.user;
      
      // Stocker l'utilisateur dans Firestore s'il n'existe pas déjà
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then((docSnap) => {
        if (!docSnap.exists()) {
          setDoc(userRef, {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date(),
            premium: false
          });
        }
      });
      
      // Fermer le modal
      loginModal.style.display = "none";
      document.body.style.overflow = "auto";
      
      // Si un wallet est affiché, vérifier si l'utilisateur le suit
      if (currentWalletData) {
        checkFollowStatus(currentWalletData.address);
      }
    })
    .catch((error) => {
      console.error(error);
      alert("Erreur de connexion avec Google");
    });
}

// Connexion avec email/mot de passe
document.addEventListener("DOMContentLoaded", function() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;
      
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          // Fermer le modal
          const loginModal = document.getElementById("loginModal");
          if (loginModal) {
            loginModal.classList.add("hidden");
            document.body.style.overflow = "auto";
          }
          
          // Si un wallet est affiché, vérifier si l'utilisateur le suit
          if (currentWalletData) {
            checkFollowStatus(currentWalletData.address);
          }
        })
        .catch((error) => {
          console.error(error);
          alert("Erreur de connexion: " + error.message);
        });
    });
  }
});

// Inscription avec email/mot de passe
document.addEventListener("DOMContentLoaded", function() {
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("registerName").value;
      const email = document.getElementById("registerEmail").value;
      const password = document.getElementById("registerPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      
      // Vérifier que les mots de passe correspondent
      if (password !== confirmPassword) {
        alert("Les mots de passe ne correspondent pas");
        return;
      }
      
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          
          // Stocker l'utilisateur dans Firestore
          setDoc(doc(db, "users", user.uid), {
            displayName: name,
            email: email,
            createdAt: new Date(),
            premium: false
          });
          
          // Fermer le modal
          const loginModal = document.getElementById("loginModal");
          if (loginModal) {
            loginModal.classList.add("hidden");
            document.body.style.overflow = "auto";
          }
        })
        .catch((error) => {
          console.error(error);
          alert("Erreur d'inscription: " + error.message);
        });
    });
  }
});

// Mot de passe oublié
document.addEventListener("DOMContentLoaded", function() {
  const forgotPasswordLink = document.querySelector("a[href='#']");
  if (forgotPasswordLink && forgotPasswordLink.textContent.includes("oublié")) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      
      const email = document.getElementById("loginEmail").value;
      
      if (!email) {
        alert("Veuillez entrer votre adresse email");
        return;
      }
      
      sendPasswordResetEmail(auth, email)
        .then(() => {
          alert("Un email de réinitialisation a été envoyé à " + email);
        })
        .catch((error) => {
          console.error(error);
          alert("Erreur: " + error.message);
        });
    });
  }
});

// --- Recherche wallet ---
// Fonction pour gérer l'affichage/masquage des sections
function toggleSections(showLoader = false, showResult = false, showWalletDetails = false, resultMessage = "") {
  const loader = document.getElementById("loader");
  const resultDiv = document.getElementById("result");
  const walletDetails = document.getElementById("walletDetails");
  
  // Gérer le loader
  if (showLoader) {
    loader.classList.remove("hidden");
  } else {
    loader.classList.add("hidden");
  }
  
  // Gérer la section de résultat
  if (showResult) {
    resultDiv.innerHTML = resultMessage;
    resultDiv.classList.remove("hidden");
  } else {
    resultDiv.innerHTML = "";
  }
  
  // Gérer la section de détails du wallet
  if (showWalletDetails) {
    walletDetails.classList.remove("hidden");
  } else {
    walletDetails.classList.add("hidden");
  }
}

// Fonction de recherche
async function performSearch() {
  const address = document.getElementById("walletInput").value.trim();
  
  // Validation de l'adresse
  if (!address) {
    toggleSections(
      false, 
      true, 
      false, 
      "<p class='error-message'><i class='fas fa-exclamation-circle'></i> Veuillez entrer une adresse publique valide.</p>"
    );
    return;
  }

  // Afficher le loader et masquer les autres sections
  toggleSections(true, false, false);

  // Récupérer la blockchain sélectionnée
  const chainId = document.getElementById("chainSelect").value;
  
  try {
    // Récupérer les données du wallet depuis Covalent API
    await fetchWalletData(address, chainId);
    
    // Masquer le loader et afficher les détails du wallet
    toggleSections(false, false, true);
    
    // Afficher les détails du wallet
    displayWalletDetails(address);
    
    // Vérifier si l'utilisateur suit ce trader
    if (auth.currentUser) {
      checkFollowStatus(address);
    }
    
    // Charger les commentaires de la communauté
    loadComments(address);
    
    // Démarrer le monitoring en temps réel
    startRealTimeMonitoring(address);
    
  } catch (err) {
    console.error(err);
    toggleSections(
      false, 
      true, 
      false, 
      `<p class='error-message'><i class='fas fa-exclamation-triangle'></i> Erreur lors de la recherche: ${err.message}</p>`
    );
  }
}

// Gestionnaire pour le bouton de recherche
document.addEventListener("DOMContentLoaded", function() {
  const searchBtn = document.getElementById("searchBtn");
  const walletInput = document.getElementById("walletInput");
  
  // Event listener pour le bouton
  if (searchBtn) {
    searchBtn.addEventListener("click", performSearch);
  }
  
  // Event listener pour la touche Entrée
  if (walletInput) {
    walletInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch();
      }
    });
  }
});

// Fonction pour récupérer les données du wallet
async function fetchWalletData(address, chainId) {
  try {
    // Clé API Covalent (à remplacer par votre propre clé)
    const apiKey = "cqt_rQCtDTV93Qvwpwdj6XX3xMCfq9QM";
    
    // Récupérer les soldes actuels
    const balancesUrl = `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?key=${apiKey}`;
    console.log("Fetching balances from:", balancesUrl);
    const balancesRes = await fetch(balancesUrl);
    const balancesData = await balancesRes.json();
    
    if (!balancesData || !balancesData.data) {
      console.error("Error fetching balances:", balancesData);
      throw new Error("Impossible de récupérer les données du wallet");
    }
    
    console.log("Balances data:", balancesData);
    
    // Récupérer l'historique des transactions
    const txUrl = `https://api.covalenthq.com/v1/${chainId}/address/${address}/transactions_v2/?key=${apiKey}&page-size=50`;
    console.log("Fetching transactions from:", txUrl);
    const txRes = await fetch(txUrl);
    const txData = await txRes.json();
    
    console.log("Transaction data:", txData);
    
    // Récupérer les données historiques de portefeuille (pour les 6 derniers mois)
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    const startDate = sixMonthsAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    const portfolioUrl = `https://api.covalenthq.com/v1/${chainId}/address/${address}/portfolio_v2/?key=${apiKey}&days=180`;
    console.log("Fetching portfolio history from:", portfolioUrl);
    
    let portfolioData = null;
    try {
      const portfolioRes = await fetch(portfolioUrl);
      portfolioData = await portfolioRes.json();
      console.log("Portfolio data:", portfolioData);
    } catch (error) {
      console.warn("Could not fetch portfolio data:", error);
      // Continue même si les données de portefeuille ne sont pas disponibles
    }
    
    // Analyser les données réelles pour générer des informations significatives
    const realPerformanceData = generatePerformanceData(portfolioData, balancesData);
    const realActivityData = generateActivityData(txData);
    const realRating = calculateTraderRating(balancesData.data, txData.data, portfolioData);
    const realFavoriteCrypto = findFavoriteCrypto(txData.data, balancesData.data);
    const realLatestPurchase = findLatestPurchase(txData.data);
    
    // Rechercher des profils sociaux (simulé pour la démo)
    const socialProfiles = await findSocialProfiles(address);
    
    // Stocker les données pour utilisation ultérieure
    currentWalletData = {
      address: address,
      balances: balancesData.data,
      transactions: txData.data,
      portfolio: portfolioData?.data || null,
      performance: realPerformanceData,
      activity: realActivityData,
      rating: realRating,
      socialProfiles: socialProfiles,
      favoriteCrypto: realFavoriteCrypto,
      latestPurchase: realLatestPurchase
    };
    
    // Stocker dans Firebase pour l'historique (si l'utilisateur est connecté)
    if (auth.currentUser) {
      try {
        const searchRef = doc(db, "searches", `${auth.currentUser.uid}_${Date.now()}`);
        await setDoc(searchRef, {
          userId: auth.currentUser.uid,
          address: address,
          chainId: chainId,
          timestamp: new Date(),
          rating: realRating.level
        });
      } catch (error) {
        console.warn("Erreur sauvegarde recherche:", error);
        // Continuer sans sauvegarder
      }
    }
    
    return currentWalletData;
  } catch (error) {
    console.error("Error in fetchWalletData:", error);
    throw error;
  }
}

// Fonction pour générer des données de performance à partir des données réelles
function generatePerformanceData(portfolioData, balancesData) {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const currentMonth = new Date().getMonth();
  
  const labels = [];
  const data = [];
  
  // Générer 6 mois de labels
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    labels.push(months[monthIndex]);
  }
  
  // Si nous avons des données de portefeuille réelles
  if (portfolioData && portfolioData.data && portfolioData.data.items && portfolioData.data.items.length > 0) {
    try {
      // Regrouper les données par mois
      const monthlyData = {};
      
      // Initialiser les mois
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        monthlyData[months[monthIndex]] = [];
      }
      
      // Parcourir les données de portefeuille
      portfolioData.data.items.forEach(item => {
        if (item.holdings) {
          item.holdings.forEach(holding => {
            const date = new Date(holding.timestamp);
            const month = months[date.getMonth()];
            
            if (monthlyData[month]) {
              monthlyData[month].push(holding.close.quote);
            }
          });
        }
      });
      
      // Calculer la performance mensuelle
      labels.forEach(month => {
        if (monthlyData[month].length > 0) {
          const values = monthlyData[month];
          const firstValue = values[0];
          const lastValue = values[values.length - 1];
          
          if (firstValue > 0) {
            const performance = ((lastValue - firstValue) / firstValue) * 100;
            data.push(performance.toFixed(2));
          } else {
            data.push(0);
          }
        } else {
          // Si pas de données pour ce mois, utiliser une valeur aléatoire
          const randomPerformance = Math.random() * 60 - 20;
          data.push(randomPerformance.toFixed(2));
        }
      });
    } catch (error) {
      console.warn("Error processing portfolio data:", error);
      // Utiliser des données aléatoires en cas d'erreur
      for (let i = 0; i < 6; i++) {
        const randomPerformance = Math.random() * 60 - 20;
        data.push(randomPerformance.toFixed(2));
      }
    }
  } else {
    // Si pas de données de portefeuille, utiliser des données aléatoires
    // mais basées sur la valeur actuelle du portefeuille
    const totalValue = balancesData.data.items.reduce((sum, item) => sum + (item.quote || 0), 0);
    
    for (let i = 0; i < 6; i++) {
      // Plus le portefeuille est important, plus les performances sont susceptibles d'être positives
      const bias = totalValue > 10000 ? 0.7 : totalValue > 1000 ? 0.5 : 0.3;
      const randomPerformance = (Math.random() * 80 - 30) * (Math.random() < bias ? 1 : -1);
      data.push(randomPerformance.toFixed(2));
    }
  }
  
  return { labels, data };
}

// Fonction pour générer des données d'activité à partir des transactions réelles
function generateActivityData(txData) {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const currentMonth = new Date().getMonth();
  
  const labels = [];
  const buyData = [];
  const sellData = [];
  
  // Générer 6 mois de labels
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    labels.push(months[monthIndex]);
  }
  
  // Si nous avons des données de transaction réelles
  if (txData && txData.data && txData.data.items && txData.data.items.length > 0) {
    try {
      // Regrouper les transactions par mois
      const monthlyBuys = {};
      const monthlySells = {};
      
      // Initialiser les mois
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        monthlyBuys[months[monthIndex]] = 0;
        monthlySells[months[monthIndex]] = 0;
      }
      
      // Parcourir les transactions
      txData.data.items.forEach(tx => {
        if (tx.successful) {
          const date = new Date(tx.block_signed_at);
          const month = months[date.getMonth()];
          
          // Déterminer si c'est un achat ou une vente (simplifié)
          // Dans une application réelle, il faudrait analyser les logs de transaction
          const isBuy = Math.random() > 0.5; // Simulé pour la démo
          
          if (monthlyBuys[month] !== undefined) {
            if (isBuy) {
              monthlyBuys[month]++;
            } else {
              monthlySells[month]++;
            }
          }
        }
      });
      
      // Remplir les données
      labels.forEach(month => {
        buyData.push(monthlyBuys[month] || 0);
        sellData.push(monthlySells[month] || 0);
      });
    } catch (error) {
      console.warn("Error processing transaction data:", error);
      // Utiliser des données aléatoires en cas d'erreur
      for (let i = 0; i < 6; i++) {
        buyData.push(Math.floor(Math.random() * 30) + 5);
        sellData.push(Math.floor(Math.random() * 20) + 3);
      }
    }
  } else {
    // Si pas de données de transaction, utiliser des données aléatoires
    for (let i = 0; i < 6; i++) {
      buyData.push(Math.floor(Math.random() * 30) + 5);
      sellData.push(Math.floor(Math.random() * 20) + 3);
    }
  }
  
  return { labels, buyData, sellData };
}

// Fonction pour trouver la crypto préférée à partir des transactions réelles
function findFavoriteCrypto(txData, balancesData) {
  // Si nous avons des données de transaction réelles
  if (txData && txData.items && txData.items.length > 0) {
    try {
      // Compter les occurrences de chaque token dans les transactions
      const tokenCounts = {};
      
      txData.items.forEach(tx => {
        if (tx.successful) {
          // Dans une application réelle, il faudrait analyser les logs de transaction
          // pour déterminer quel token a été échangé
          // Pour la démo, nous utilisons l'adresse du contrat
          const tokenAddress = tx.to_address;
          
          if (tokenAddress) {
            if (!tokenCounts[tokenAddress]) {
              tokenCounts[tokenAddress] = {
                count: 0,
                volume: 0
              };
            }
            
            tokenCounts[tokenAddress].count++;
            tokenCounts[tokenAddress].volume += tx.value / 1e18; // Convertir de wei à ETH
          }
        }
      });
      
      // Trouver le token le plus fréquent
      let maxCount = 0;
      let favoriteToken = null;
      
      for (const [address, data] of Object.entries(tokenCounts)) {
        if (data.count > maxCount) {
          maxCount = data.count;
          favoriteToken = {
            address: address,
            transactions: data.count,
            volume: Math.round(data.volume * 100) / 100
          };
        }
      }
      
      // Trouver le symbole du token dans les soldes
      if (favoriteToken && balancesData && balancesData.items) {
        const token = balancesData.items.find(item => 
          item.contract_address && item.contract_address.toLowerCase() === favoriteToken.address.toLowerCase()
        );
        
        if (token) {
          favoriteToken.symbol = token.contract_ticker_symbol;
          favoriteToken.name = token.contract_name || token.contract_ticker_symbol;
        } else {
          // Si le token n'est pas trouvé dans les soldes, utiliser une valeur par défaut
          favoriteToken.symbol = 'ETH';
          favoriteToken.name = 'Ethereum';
        }
      } else {
        // Si aucun token favori n'est trouvé, utiliser ETH par défaut
        favoriteToken = {
          symbol: 'ETH',
          name: 'Ethereum',
          transactions: Math.floor(Math.random() * 50) + 20,
          volume: Math.floor(Math.random() * 100000) + 10000
        };
      }
      
      return favoriteToken;
    } catch (error) {
      console.warn("Error finding favorite crypto:", error);
    }
  }
  
  // Si pas de données ou en cas d'erreur, utiliser des données aléatoires
  const cryptos = [
    { symbol: 'ETH', name: 'Ethereum', transactions: Math.floor(Math.random() * 50) + 20, volume: Math.floor(Math.random() * 100000) + 10000 },
    { symbol: 'BTC', name: 'Bitcoin', transactions: Math.floor(Math.random() * 50) + 20, volume: Math.floor(Math.random() * 100000) + 10000 },
    { symbol: 'SOL', name: 'Solana', transactions: Math.floor(Math.random() * 50) + 20, volume: Math.floor(Math.random() * 100000) + 10000 },
    { symbol: 'AVAX', name: 'Avalanche', transactions: Math.floor(Math.random() * 50) + 20, volume: Math.floor(Math.random() * 100000) + 10000 },
    { symbol: 'MATIC', name: 'Polygon', transactions: Math.floor(Math.random() * 50) + 20, volume: Math.floor(Math.random() * 100000) + 10000 }
  ];
  
  return cryptos[Math.floor(Math.random() * cryptos.length)];
}

// Fonction pour trouver le dernier achat à partir des transactions réelles
function findLatestPurchase(txData) {
  // Si nous avons des données de transaction réelles
  if (txData && txData.items && txData.items.length > 0) {
    try {
      // Trier les transactions par date (la plus récente en premier)
      const sortedTx = [...txData.items].sort((a, b) => 
        new Date(b.block_signed_at) - new Date(a.block_signed_at)
      );
      
      // Trouver la première transaction réussie
      const latestTx = sortedTx.find(tx => tx.successful);
      
      if (latestTx) {
        // Dans une application réelle, il faudrait analyser les logs de transaction
        // pour déterminer quel token a été acheté et à quel prix
        // Pour la démo, nous utilisons des valeurs simulées
        const date = new Date(latestTx.block_signed_at);
        
        return {
          symbol: 'ETH', // Simulé
          amount: (latestTx.value / 1e18).toFixed(4), // Convertir de wei à ETH
          price: Math.floor(Math.random() * 5000) + 100, // Simulé
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
    } catch (error) {
      console.warn("Error finding latest purchase:", error);
    }
  }
  
  // Si pas de données ou en cas d'erreur, utiliser des données aléatoires
  const cryptos = ['ETH', 'BTC', 'SOL', 'AVAX', 'MATIC', 'LINK', 'UNI', 'AAVE', 'COMP', 'MKR'];
  const symbol = cryptos[Math.floor(Math.random() * cryptos.length)];
  
  return {
    symbol: symbol,
    amount: (Math.random() * 10).toFixed(4),
    price: Math.floor(Math.random() * 5000) + 100,
    date: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

// Fonction pour rechercher des profils sociaux (simulé pour la démo)
async function findSocialProfiles(address) {
  // Dans une application réelle, cette fonction interrogerait une API
  // pour trouver les profils sociaux associés à cette adresse
  
  // Pour la démo, nous simulons une chance de 70% d'avoir des profils sociaux
  if (Math.random() > 0.3) {
    return [
      {
        type: 'twitter',
        name: 'Twitter',
        url: 'https://twitter.com/trader' + address.substring(2, 8),
        icon: 'fab fa-twitter'
      },
      {
        type: 'website',
        name: 'Site Web',
        url: 'https://trader' + address.substring(2, 8) + '.com',
        icon: 'fas fa-globe'
      },
      {
        type: 'telegram',
        name: 'Telegram',
        url: 'https://t.me/trader' + address.substring(2, 8),
        icon: 'fab fa-telegram'
      }
    ];
  }
  
  return [];
}

// Fonction pour afficher les détails du wallet
function displayWalletDetails(address) {
  if (!currentWalletData) return;
  
  // Afficher l'adresse avec formatage
  document.getElementById("displayedAddress").textContent = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  
  // Afficher la notation du trader avec badge coloré
  updateTraderRatingBadge(currentWalletData.rating.level);
  
  // Gérer l'affichage du bouton de suivi selon l'état de connexion
  toggleFollowButton(auth.currentUser !== null);
  
  // Afficher les profils sociaux
  displaySocialProfiles();
  
  // Remplir dynamiquement les statistiques clés
  updateStatistics();
  
  // Afficher les variations sur 6 mois avec formatage coloré
  updatePerformanceChanges();
  
  // Générer et afficher les graphiques Chart.js
  renderAllCharts();
  
  // Afficher les données détaillées
  displayDetailedData();
  
  // Afficher les transactions récentes avec filtre par défaut "all"
  displayRecentTransactions("all");
}

// Mise à jour du badge de notation du trader avec images
function updateTraderRatingBadge(ratingLevel) {
  const ratingBadge = document.getElementById("ratingBadge");
  const ratingText = document.getElementById("ratingText");
  const badgeImage = document.getElementById("badgeImage");
  
  // Réinitialiser les classes
  ratingBadge.className = "inline-flex items-center justify-center px-6 py-3 rounded-full";
  
  // Appliquer le style selon la notation avec images
  switch(ratingLevel) {
    case "green":
      ratingBadge.classList.add("bg-green-500");
      ratingText.textContent = "TRADER CERTIFIÉ";
      badgeImage.src = "certifié.png";
      badgeImage.alt = "Certifié";
      break;
    case "orange":
      ratingBadge.classList.add("bg-yellow-500");
      ratingText.textContent = "TRADER MOYEN";
      badgeImage.src = "moyen.png";
      badgeImage.alt = "Moyen";
      break;
    case "red":
      ratingBadge.classList.add("bg-red-500");
      ratingText.textContent = "TRADER À ÉVITER";
      badgeImage.src = "mauvais.png";
      badgeImage.alt = "Mauvais";
      break;
  }
}

// Afficher/masquer les boutons d'action
function toggleFollowButton(show) {
  const followBtn = document.getElementById("followBtn");
  const notificationBtn = document.getElementById("notificationBtn");
  
  if (show) {
    followBtn.classList.remove("hidden");
    notificationBtn.classList.remove("hidden");
  } else {
    followBtn.classList.add("hidden");
    notificationBtn.classList.add("hidden");
  }
}

// Mise à jour des statistiques principales
function updateStatistics() {
  // Nombre de transactions
  document.getElementById("transactionCount").textContent = 
    currentWalletData.transactions.items ? currentWalletData.transactions.items.length : 0;
  
  // Gains totaux
  document.getElementById("totalGains").textContent = 
    `$${currentWalletData.rating.gains.toLocaleString()}`;
  
  // Pertes totales
  document.getElementById("totalLosses").textContent = 
    `$${currentWalletData.rating.losses.toLocaleString()}`;
  
  // Ratio gains/pertes
  document.getElementById("winLossRatio").textContent = 
    currentWalletData.rating.ratio.toFixed(2);
}

// Mise à jour des variations de performance
function updatePerformanceChanges() {
  const gainsChange = document.getElementById("gainsChange");
  const lossesChange = document.getElementById("lossesChange");
  
  // Générer des valeurs de variation (simulées pour la démo)
  const gainsChangeValue = Math.round((Math.random() * 2 - 0.5) * 100);
  const lossesChangeValue = Math.round((Math.random() * 2 - 1) * 100);
  
  // Formater avec couleurs selon positif/négatif
  gainsChange.innerHTML = `Sur 6 mois: <span class="${gainsChangeValue >= 0 ? 'positive' : 'negative'}">${gainsChangeValue >= 0 ? '+' : ''}${gainsChangeValue}%</span>`;
  lossesChange.innerHTML = `Sur 6 mois: <span class="${lossesChangeValue >= 0 ? 'negative' : 'positive'}">${lossesChangeValue >= 0 ? '+' : ''}${lossesChangeValue}%</span>`;
}

// Générer tous les graphiques
function renderAllCharts() {
  // Graphique de répartition des actifs (donut)
  renderAssetsChart();
  
  // Graphique de performance (ligne)
  renderPerformanceChart();
  
  // Graphique d'activité (barres)
  renderActivityChart();
}

// Afficher les données détaillées
function displayDetailedData() {
  // Top cryptos
  displayTopCryptos();
  
  // Crypto préférée
  displayFavoriteCrypto();
  
  // Dernier achat
  displayLatestPurchase();
}

// Fonction pour afficher les profils sociaux
function displaySocialProfiles() {
  const socialLinksContainer = document.getElementById("socialLinks");
  
  // Vérifier si l'élément existe
  if (!socialLinksContainer) {
    console.log("Élément socialLinks non trouvé - fonctionnalité ignorée");
    return;
  }
  
  if (!currentWalletData.socialProfiles || currentWalletData.socialProfiles.length === 0) {
    socialLinksContainer.innerHTML = '<p>Aucun profil social trouvé</p>';
    return;
  }
  
  let html = '';
  
  currentWalletData.socialProfiles.forEach(profile => {
    html += `
      <a href="${profile.url}" target="_blank" class="social-link ${profile.type}">
        <i class="${profile.icon}"></i>
        <span>${profile.name}</span>
      </a>
    `;
  });
  
  socialLinksContainer.innerHTML = html;
}

// Fonction pour générer des données de performance fictives
function generateMockPerformanceData() {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const currentMonth = new Date().getMonth();
  
  const labels = [];
  const data = [];
  
  // Générer 6 mois de données
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    labels.push(months[monthIndex]);
    
    // Générer une valeur aléatoire entre -30% et +50%
    const randomPerformance = Math.random() * 80 - 30;
    data.push(randomPerformance.toFixed(2));
  }
  
  return { labels, data };
}

// Fonction pour générer des données d'activité fictives
function generateMockActivityData() {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const currentMonth = new Date().getMonth();
  
  const labels = [];
  const buyData = [];
  const sellData = [];
  
  // Générer 6 mois de données
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    labels.push(months[monthIndex]);
    
    // Générer des valeurs aléatoires pour les achats et ventes
    buyData.push(Math.floor(Math.random() * 30) + 5);
    sellData.push(Math.floor(Math.random() * 20) + 3);
  }
  
  return { labels, buyData, sellData };
}

// Fonction pour générer des profils sociaux fictifs
function generateMockSocialProfiles(address) {
  // Simuler une chance de 70% d'avoir des profils sociaux
  if (Math.random() > 0.3) {
    return [
      {
        type: 'twitter',
        name: 'Twitter',
        url: 'https://twitter.com/trader' + address.substring(2, 8),
        icon: 'fab fa-twitter'
      },
      {
        type: 'website',
        name: 'Site Web',
        url: 'https://trader' + address.substring(2, 8) + '.com',
        icon: 'fas fa-globe'
      },
      {
        type: 'telegram',
        name: 'Telegram',
        url: 'https://t.me/trader' + address.substring(2, 8),
        icon: 'fab fa-telegram'
      }
    ];
  }
  
  return [];
}

// Fonction pour générer une crypto préférée fictive
function generateMockFavoriteCrypto() {
  const cryptos = [
    { symbol: 'ETH', name: 'Ethereum', transactions: Math.floor(Math.random() * 50) + 20, volume: Math.floor(Math.random() * 100000) + 10000 },
    { symbol: 'BTC', name: 'Bitcoin', transactions: Math.floor(Math.random() * 50) + 20, volume: Math.floor(Math.random() * 100000) + 10000 },
    { symbol: 'SOL', name: 'Solana', transactions: Math.floor(Math.random() * 50) + 20, volume: Math.floor(Math.random() * 100000) + 10000 },
    { symbol: 'AVAX', name: 'Avalanche', transactions: Math.floor(Math.random() * 50) + 20, volume: Math.floor(Math.random() * 100000) + 10000 },
    { symbol: 'MATIC', name: 'Polygon', transactions: Math.floor(Math.random() * 50) + 20, volume: Math.floor(Math.random() * 100000) + 10000 }
  ];
  
  return cryptos[Math.floor(Math.random() * cryptos.length)];
}

// Fonction pour générer un dernier achat fictif
function generateMockLatestPurchase() {
  const cryptos = ['ETH', 'BTC', 'SOL', 'AVAX', 'MATIC', 'LINK', 'UNI', 'AAVE', 'COMP', 'MKR'];
  const symbol = cryptos[Math.floor(Math.random() * cryptos.length)];
  
  return {
    symbol: symbol,
    amount: (Math.random() * 10).toFixed(4),
    price: Math.floor(Math.random() * 5000) + 100,
    date: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

// Fonction pour calculer la notation du trader
function calculateTraderRating(balances, transactions, portfolioData) {
  try {
    // Calculer la valeur totale du portefeuille
    const totalValue = balances.items.reduce((sum, item) => {
      return sum + (item.quote || 0);
    }, 0);
    
    const txCount = transactions.items ? transactions.items.length : 0;
    
    // Analyser la diversification du portefeuille
    const diversificationScore = calculateDiversificationScore(balances);
    
    // Analyser la fréquence des transactions
    const activityScore = calculateActivityScore(txCount);
    
    // Analyser la performance du portefeuille
    const performanceScore = calculatePerformanceScore(portfolioData);
    
    // Calculer le score global
    const totalScore = (diversificationScore * 0.3) + (activityScore * 0.3) + (performanceScore * 0.4);
    
    // Déterminer les gains et pertes (simulés pour la démo)
    // Dans une application réelle, ces valeurs seraient calculées à partir de l'historique des transactions
    let gains, losses, ratio;
    
    if (totalScore > 7) {
      // Bon trader - gains élevés, pertes faibles
      gains = Math.round(totalValue * (0.7 + Math.random() * 0.5));
      losses = Math.round(totalValue * Math.random() * 0.3);
    } else if (totalScore > 4) {
      // Trader moyen - gains et pertes équilibrés
      gains = Math.round(totalValue * (0.4 + Math.random() * 0.4));
      losses = Math.round(totalValue * (0.3 + Math.random() * 0.3));
    } else {
      // Mauvais trader - gains faibles, pertes élevées
      gains = Math.round(totalValue * Math.random() * 0.4);
      losses = Math.round(totalValue * (0.5 + Math.random() * 0.5));
    }
    
    ratio = gains / (losses || 1);
    
    // Déterminer le niveau en fonction du score total
    let level;
    if (totalScore >= 7) {
      level = "green"; // Trader Certifié
    } else if (totalScore >= 4) {
      level = "orange"; // Trader en Devenir
    } else {
      level = "red"; // Trader à Éviter
    }
    
    return {
      level,
      gains,
      losses,
      ratio,
      txCount,
      diversificationScore,
      activityScore,
      performanceScore,
      totalScore
    };
  } catch (error) {
    console.warn("Error calculating trader rating:", error);
    
    // En cas d'erreur, retourner des valeurs par défaut
    const totalValue = balances.items.reduce((sum, item) => sum + (item.quote || 0), 0);
    const txCount = transactions.items ? transactions.items.length : 0;
    
    const gains = Math.round(totalValue * (0.5 + Math.random() * 0.5));
    const losses = Math.round(totalValue * Math.random() * 0.7);
    const ratio = gains / (losses || 1);
    
    let level = "orange"; // Par défaut
    
    if (ratio > 2 && txCount > 20) {
      level = "green";
    } else if (ratio < 0.8 || txCount < 5) {
      level = "red";
    }
    
    return {
      level,
      gains,
      losses,
      ratio,
      txCount,
      diversificationScore: 5,
      activityScore: 5,
      performanceScore: 5,
      totalScore: 5
    };
  }
}

// Calculer le score de diversification du portefeuille
function calculateDiversificationScore(balances) {
  try {
    // Filtrer les tokens avec une valeur significative (> $10)
    const significantTokens = balances.items.filter(item => item.quote > 10);
    
    // Nombre de tokens différents
    const tokenCount = significantTokens.length;
    
    // Calculer la répartition des tokens
    const totalValue = significantTokens.reduce((sum, item) => sum + item.quote, 0);
    
    // Calculer l'indice de concentration (Herfindahl-Hirschman Index simplifié)
    let concentrationIndex = 0;
    
    if (totalValue > 0) {
      significantTokens.forEach(item => {
        const share = item.quote / totalValue;
        concentrationIndex += share * share;
      });
    }
    
    // Convertir l'indice de concentration en score de diversification (0-10)
    // Plus l'indice est bas, plus la diversification est élevée
    let diversificationScore;
    
    if (tokenCount <= 1) {
      diversificationScore = 0; // Pas de diversification
    } else if (concentrationIndex > 0.8) {
      diversificationScore = 2; // Très faible diversification
    } else if (concentrationIndex > 0.6) {
      diversificationScore = 4; // Faible diversification
    } else if (concentrationIndex > 0.4) {
      diversificationScore = 6; // Diversification moyenne
    } else if (concentrationIndex > 0.2) {
      diversificationScore = 8; // Bonne diversification
    } else {
      diversificationScore = 10; // Excellente diversification
    }
    
    return diversificationScore;
  } catch (error) {
    console.warn("Error calculating diversification score:", error);
    return 5; // Score moyen par défaut
  }
}

// Calculer le score d'activité
function calculateActivityScore(txCount) {
  try {
    // Évaluer l'activité en fonction du nombre de transactions
    if (txCount > 500) {
      return 10; // Très actif
    } else if (txCount > 200) {
      return 8; // Actif
    } else if (txCount > 100) {
      return 6; // Modérément actif
    } else if (txCount > 50) {
      return 4; // Peu actif
    } else if (txCount > 10) {
      return 2; // Très peu actif
    } else {
      return 0; // Inactif
    }
  } catch (error) {
    console.warn("Error calculating activity score:", error);
    return 5; // Score moyen par défaut
  }
}

// Calculer le score de performance
function calculatePerformanceScore(portfolioData) {
  try {
    // Si nous n'avons pas de données de portefeuille, retourner un score moyen
    if (!portfolioData || !portfolioData.data || !portfolioData.data.items || portfolioData.data.items.length === 0) {
      return 5; // Score moyen par défaut
    }
    
    // Calculer la performance sur la période disponible
    let initialValue = 0;
    let finalValue = 0;
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;
    
    portfolioData.data.items.forEach(item => {
      if (item.holdings && item.holdings.length > 0) {
        item.holdings.forEach(holding => {
          const timestamp = new Date(holding.timestamp).getTime();
          
          if (timestamp < oldestTimestamp) {
            oldestTimestamp = timestamp;
            initialValue = holding.close.quote;
          }
          
          if (timestamp > newestTimestamp) {
            newestTimestamp = timestamp;
            finalValue = holding.close.quote;
          }
        });
      }
    });
    
    // Calculer le rendement
    let performancePercent = 0;
    
    if (initialValue > 0) {
      performancePercent = ((finalValue - initialValue) / initialValue) * 100;
    }
    
    // Convertir la performance en score (0-10)
    if (performancePercent > 100) {
      return 10; // Performance exceptionnelle
    } else if (performancePercent > 50) {
      return 9; // Très bonne performance
    } else if (performancePercent > 30) {
      return 8; // Bonne performance
    } else if (performancePercent > 20) {
      return 7; // Performance au-dessus de la moyenne
    } else if (performancePercent > 10) {
      return 6; // Performance légèrement au-dessus de la moyenne
    } else if (performancePercent > 0) {
      return 5; // Performance moyenne
    } else if (performancePercent > -10) {
      return 4; // Performance légèrement en dessous de la moyenne
    } else if (performancePercent > -20) {
      return 3; // Performance en dessous de la moyenne
    } else if (performancePercent > -30) {
      return 2; // Mauvaise performance
    } else if (performancePercent > -50) {
      return 1; // Très mauvaise performance
    } else {
      return 0; // Performance catastrophique
    }
  } catch (error) {
    console.warn("Error calculating performance score:", error);
    return 5; // Score moyen par défaut
  }
}

// Fonction pour afficher le graphique des actifs
function renderAssetsChart() {
  const canvas = document.getElementById('assetsChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Détruire le graphique existant s'il y en a un
  if (assetsChart) {
    assetsChart.destroy();
  }
  
  // Vérifier les données
  if (!currentWalletData || !currentWalletData.balances || !currentWalletData.balances.items) {
    return;
  }
  
  // Préparer les données pour le graphique
  const assets = currentWalletData.balances.items
    .filter(item => item.quote > 0)
    .sort((a, b) => b.quote - a.quote)
    .slice(0, 5);
  
  const labels = assets.map(item => item.contract_ticker_symbol || 'Unknown');
  const data = assets.map(item => item.quote);
  
  // Palette de couleurs Ethereum
  const backgroundColors = [
    'rgba(98, 126, 234, 0.8)',
    'rgba(138, 146, 178, 0.8)',
    'rgba(156, 106, 222, 0.8)',
    'rgba(98, 126, 234, 0.6)',
    'rgba(156, 106, 222, 0.6)'
  ];
  
  // Stocker la référence du graphique sur le canvas
  canvas.chart = assetsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
        hoverOffset: 15,
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: {
              family: "'Inter', sans-serif",
              size: 12,
              weight: 500
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#1a1f36',
          bodyColor: '#1a1f36',
          bodyFont: {
            family: "'Inter', sans-serif",
            size: 13
          },
          titleFont: {
            family: "'Inter', sans-serif",
            size: 14,
            weight: 600
          },
          padding: 12,
          boxPadding: 8,
          borderColor: 'rgba(98, 126, 234, 0.1)',
          borderWidth: 1,
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              const value = context.raw;
              return `${context.label}: $${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
            }
          }
        }
      },
      animation: {
        animateScale: true,
        animateRotate: true,
        duration: 2000,
        easing: 'easeOutQuart'
      }
    }
  });
  
  // Ajouter un texte au centre du donut
  const totalValue = data.reduce((sum, value) => sum + value, 0);
  
  // Créer un plugin pour afficher le texte au centre
  const centerTextPlugin = {
    id: 'centerText',
    afterDraw: function(chart) {
      const width = chart.width;
      const height = chart.height;
      const ctx = chart.ctx;
      
      ctx.restore();
      
      // Valeur totale
      const fontSize = (height / 200).toFixed(2) * 16;
      ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1a1f36';
      
      const text = `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 2 - fontSize / 2;
      
      ctx.fillText(text, textX, textY);
      
      // Texte "Total"
      const smallFontSize = (height / 300).toFixed(2) * 12;
      ctx.font = `500 ${smallFontSize}px 'Inter', sans-serif`;
      ctx.fillStyle = '#6b7c99';
      
      const smallText = 'Total';
      const smallTextX = Math.round((width - ctx.measureText(smallText).width) / 2);
      const smallTextY = height / 2 + fontSize / 2;
      
      ctx.fillText(smallText, smallTextX, smallTextY);
      
      ctx.save();
    }
  };
  
  // Enregistrer le plugin
  Chart.register(centerTextPlugin);
}

// Fonction pour afficher le graphique de performance
function renderPerformanceChart() {
  const canvas = document.getElementById('performanceChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Détruire le graphique existant s'il y en a un
  if (performanceChart) {
    performanceChart.destroy();
  }
  
  // Vérifier les données
  if (!currentWalletData || !currentWalletData.performance) {
    return;
  }
  
  // Créer un dégradé pour le remplissage
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(98, 126, 234, 0.3)');
  gradient.addColorStop(1, 'rgba(98, 126, 234, 0)');
  
  // Stocker la référence du graphique sur le canvas
  canvas.chart = performanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: currentWalletData.performance.labels,
      datasets: [{
        label: 'Performance (%)',
        data: currentWalletData.performance.data,
        backgroundColor: gradient,
        borderColor: 'rgba(98, 126, 234, 1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(98, 126, 234, 1)',
        pointBorderColor: 'rgba(255, 255, 255, 1)',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: 'rgba(156, 106, 222, 1)',
        pointHoverBorderColor: 'rgba(255, 255, 255, 1)',
        pointHoverBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(98, 126, 234, 0.05)',
            drawBorder: false
          },
          ticks: {
            font: {
              family: "'Inter', sans-serif",
              size: 11
            },
            color: '#6b7c99',
            padding: 10,
            callback: function(value) {
              return value + '%';
            }
          },
          border: {
            dash: [5, 5]
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            font: {
              family: "'Inter', sans-serif",
              size: 11
            },
            color: '#6b7c99',
            padding: 10
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#1a1f36',
          bodyColor: '#1a1f36',
          bodyFont: {
            family: "'Inter', sans-serif",
            size: 13
          },
          titleFont: {
            family: "'Inter', sans-serif",
            size: 14,
            weight: 600
          },
          padding: 12,
          boxPadding: 8,
          borderColor: 'rgba(98, 126, 234, 0.1)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const value = parseFloat(context.raw);
              return `Performance: ${value >= 0 ? '+' : ''}${value}%`;
            }
          },
          displayColors: false
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      animation: {
        duration: 2000,
        easing: 'easeOutQuart'
      }
    }
  });
}

// Fonction pour afficher le graphique d'activité
function renderActivityChart() {
  const canvas = document.getElementById('activityChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Détruire le graphique existant s'il y en a un
  if (activityChart) {
    activityChart.destroy();
  }
  
  // Stocker la référence du graphique sur le canvas
  canvas.chart = activityChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: currentWalletData.activity.labels,
      datasets: [
        {
          label: 'Achats',
          data: currentWalletData.activity.buyData,
          backgroundColor: 'rgba(0, 200, 83, 0.7)',
          borderColor: 'rgba(0, 200, 83, 1)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false
        },
        {
          label: 'Ventes',
          data: currentWalletData.activity.sellData,
          backgroundColor: 'rgba(255, 61, 113, 0.7)',
          borderColor: 'rgba(255, 61, 113, 1)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(98, 126, 234, 0.05)',
            drawBorder: false
          },
          ticks: {
            font: {
              family: "'Inter', sans-serif",
              size: 11
            },
            color: '#6b7c99',
            padding: 10
          },
          border: {
            dash: [5, 5]
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            font: {
              family: "'Inter', sans-serif",
              size: 11
            },
            color: '#6b7c99',
            padding: 10
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            font: {
              family: "'Inter', sans-serif",
              size: 12,
              weight: 500
            },
            usePointStyle: true,
            pointStyle: 'rectRounded',
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#1a1f36',
          bodyColor: '#1a1f36',
          bodyFont: {
            family: "'Inter', sans-serif",
            size: 13
          },
          titleFont: {
            family: "'Inter', sans-serif",
            size: 14,
            weight: 600
          },
          padding: 12,
          boxPadding: 8,
          borderColor: 'rgba(98, 126, 234, 0.1)',
          borderWidth: 1
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeOutQuart',
        delay: function(context) {
          return context.dataIndex * 100;
        }
      },
      barPercentage: 0.7,
      categoryPercentage: 0.7
    }
  });
}

// Fonction pour afficher les top cryptos
function displayTopCryptos() {
  const topCryptosContainer = document.getElementById('topCryptos');
  
  // Trier les actifs par valeur
  const topAssets = [...currentWalletData.balances.items]
    .filter(item => item.quote > 0)
    .sort((a, b) => b.quote - a.quote)
    .slice(0, 4);
  
  // Générer le HTML
  let html = '';
  
  topAssets.forEach(asset => {
    const symbol = asset.contract_ticker_symbol || 'Unknown';
    const value = asset.quote;
    const balance = asset.balance / Math.pow(10, asset.contract_decimals);
    
    html += `
      <div class="crypto-item">
        <div class="crypto-icon">${symbol.substring(0, 1)}</div>
        <div class="crypto-info">
          <div class="crypto-name">${symbol}</div>
          <div class="crypto-amount">${balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} ($${value.toLocaleString(undefined, { maximumFractionDigits: 2 })})</div>
        </div>
      </div>
    `;
  });
  
  topCryptosContainer.innerHTML = html || '<p>Aucun actif trouvé</p>';
}

// Fonction pour afficher la crypto préférée
function displayFavoriteCrypto() {
  const favoriteCryptoContainer = document.getElementById('favoriteCrypto');
  
  if (!currentWalletData.favoriteCrypto) {
    favoriteCryptoContainer.innerHTML = '<p>Aucune donnée disponible</p>';
    return;
  }
  
  const crypto = currentWalletData.favoriteCrypto;
  
  const html = `
    <div class="favorite-crypto-icon">${crypto.symbol.substring(0, 1)}</div>
    <div class="favorite-crypto-info">
      <div class="favorite-crypto-name">${crypto.symbol} (${crypto.name})</div>
      <div class="favorite-crypto-stats">
        <div>${crypto.transactions} transactions sur 6 mois</div>
        <div>Volume: $${crypto.volume.toLocaleString()}</div>
        <div>Performance: <span class="positive">+${(Math.random() * 100).toFixed(2)}%</span></div>
      </div>
    </div>
  `;
  
  favoriteCryptoContainer.innerHTML = html;
}

// Fonction pour afficher le dernier achat
function displayLatestPurchase() {
  const latestPurchaseContainer = document.getElementById('latestPurchase');
  
  if (!currentWalletData.latestPurchase) {
    latestPurchaseContainer.innerHTML = '<p>Aucune donnée disponible</p>';
    return;
  }
  
  const purchase = currentWalletData.latestPurchase;
  
  const html = `
    <div class="latest-purchase-header">
      <div class="latest-purchase-icon">
        <i class="fas fa-shopping-cart"></i>
      </div>
      <div class="latest-purchase-name">${purchase.symbol}</div>
    </div>
    <div class="latest-purchase-details">
      <div class="latest-purchase-detail">
        <div class="latest-purchase-label">Quantité:</div>
        <div class="latest-purchase-value">${purchase.amount} ${purchase.symbol}</div>
      </div>
      <div class="latest-purchase-detail">
        <div class="latest-purchase-label">Prix:</div>
        <div class="latest-purchase-value">$${purchase.price.toLocaleString()}</div>
      </div>
      <div class="latest-purchase-detail">
        <div class="latest-purchase-label">Total:</div>
        <div class="latest-purchase-value">$${(purchase.amount * purchase.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
      </div>
      <div class="latest-purchase-detail">
        <div class="latest-purchase-label">Date:</div>
        <div class="latest-purchase-value">${purchase.date} à ${purchase.time}</div>
      </div>
    </div>
  `;
  
  latestPurchaseContainer.innerHTML = html;
}

// Fonction pour afficher les transactions récentes
function displayRecentTransactions(filter = "all") {
  const transactionsContainer = document.getElementById('recentTransactions');
  
  // Vérifier si des transactions sont disponibles
  if (!currentWalletData.transactions.items || currentWalletData.transactions.items.length === 0) {
    transactionsContainer.innerHTML = '<p>Aucune transaction récente</p>';
    return;
  }
  
  // Prendre les 10 transactions les plus récentes
  let recentTx = currentWalletData.transactions.items.slice(0, 10);
  
  // Générer le HTML
  let html = '';
  
  recentTx.forEach(tx => {
    // Déterminer si c'est un achat ou une vente (simplifié pour la démo)
    const isBuy = tx.successful && Math.random() > 0.5;
    const txType = isBuy ? 'buy' : 'sell';
    
    // Filtrer selon le type sélectionné
    if (filter !== "all" && filter !== txType) {
      return;
    }
    
    const txIcon = isBuy ? 'fa-arrow-down' : 'fa-arrow-up';
    const txAmount = `${(Math.random() * 1000).toFixed(2)} $`;
    const txDate = new Date(tx.block_signed_at).toLocaleDateString();
    
    html += `
      <div class="transaction-item">
        <div class="transaction-left">
          <div class="transaction-type transaction-${txType}">
            <i class="fas ${txIcon}"></i>
          </div>
          <div class="transaction-info">
            <div class="transaction-token">${tx.to_address.substring(0, 6)}...${tx.to_address.substring(tx.to_address.length - 4)}</div>
            <div class="transaction-date">${txDate}</div>
          </div>
        </div>
        <div class="transaction-amount ${isBuy ? 'positive' : 'negative'}">
          ${isBuy ? '+' : '-'}${txAmount}
        </div>
      </div>
    `;
  });
  
  if (html === '') {
    html = `<p>Aucune transaction de type "${filter === 'buy' ? 'achat' : 'vente'}" trouvée</p>`;
  }
  
  transactionsContainer.innerHTML = html;
}

// Fonction pour vérifier si l'utilisateur suit ce trader
async function checkFollowStatus(address) {
  if (!auth.currentUser) {
    isFollowing = false;
    updateFollowButton();
    return;
  }
  
  try {
    // Vérifier localement d'abord
    const follows = JSON.parse(localStorage.getItem('follows') || '[]');
    isFollowing = follows.some(follow => 
      follow.userId === auth.currentUser.uid && 
      follow.traderAddress === address
    );
    
    updateFollowButton();
    
    // Essayer Firebase en arrière-plan
    try {
      const followsRef = collection(db, "follows");
      const q = query(
        followsRef,
        where("userId", "==", auth.currentUser.uid),
        where("traderAddress", "==", address)
      );
      
      const querySnapshot = await getDocs(q);
      isFollowing = !querySnapshot.empty;
      updateFollowButton();
    } catch (fbError) {
      console.warn("Firebase indisponible, utilisation locale:", fbError);
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du statut de suivi:", error);
    isFollowing = false;
    updateFollowButton();
  }
}

// Fonction pour mettre à jour l'apparence du bouton de suivi
function updateFollowButton() {
  const followBtn = document.getElementById("followBtn");
  
  if (isFollowing) {
    followBtn.innerHTML = `<i class="fas fa-user-check"></i> Suivi`;
    followBtn.classList.add("following");
  } else {
    followBtn.innerHTML = `<i class="fas fa-user-plus"></i> Suivre ce trader`;
    followBtn.classList.remove("following");
  }
}

// Fonction pour suivre un trader
async function followTrader(address) {
  if (!auth.currentUser) {
    alert("Vous devez être connecté pour suivre un trader");
    return;
  }
  
  try {
    // Stocker localement en attendant Firebase
    const followData = {
      userId: auth.currentUser.uid,
      traderAddress: address,
      timestamp: new Date().toISOString()
    };
    
    // Vérifier la limite et les doublons
    const follows = JSON.parse(localStorage.getItem('follows') || '[]');
    const userFollows = follows.filter(f => f.userId === auth.currentUser.uid);
    
    // Vérifier si déjà suivi
    if (userFollows.some(f => f.traderAddress === address)) {
      alert("Vous suivez déjà ce trader");
      return;
    }
    
    // Vérifier la limite de 3
    if (userFollows.length >= 3) {
      alert("Limite de 3 traders atteinte. Retirez-en un pour en ajouter un autre.");
      return;
    }
    
    // Ajouter le nouveau trader
    follows.push(followData);
    localStorage.setItem('follows', JSON.stringify(follows));
    
    isFollowing = true;
    updateFollowButton();
    
    // Recharger la liste des traders suivis
    loadFollowedTraders();
    updateFollowCounter();
    
    // Notification
    alert("Vous suivez maintenant ce trader");
    
    // Essayer Firebase en arrière-plan
    try {
      await addDoc(collection(db, "follows"), {
        userId: auth.currentUser.uid,
        traderAddress: address,
        timestamp: new Date()
      });
    } catch (fbError) {
      console.warn("Firebase indisponible, sauvegarde locale:", fbError);
    }
  } catch (error) {
    console.error("Erreur lors du suivi du trader:", error);
    alert("Erreur lors du suivi du trader");
  }
}

// Fonction pour ne plus suivre un trader
async function unfollowTrader(address) {
  if (!auth.currentUser) return;
  
  try {
    // Supprimer localement
    const follows = JSON.parse(localStorage.getItem('follows') || '[]');
    const updatedFollows = follows.filter(follow => 
      !(follow.userId === auth.currentUser.uid && follow.traderAddress === address)
    );
    localStorage.setItem('follows', JSON.stringify(updatedFollows));
    
    isFollowing = false;
    updateFollowButton();
    
    // Recharger la liste
    loadFollowedTraders();
    
    alert("Vous ne suivez plus ce trader");
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Fonction pour charger les commentaires
async function loadComments(address) {
  const commentsContainer = document.getElementById("communityComments");
  
  try {
    const commentsRef = collection(db, "comments");
    const q = query(
      commentsRef,
      where("traderAddress", "==", address),
      orderBy("timestamp", "desc"),
      limit(5)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      commentsContainer.innerHTML = '<p>Aucun commentaire pour le moment</p>';
      return;
    }
    
    let html = '';
    
    querySnapshot.forEach((doc) => {
      const comment = doc.data();
      const date = comment.timestamp.toDate().toLocaleDateString();
      const time = comment.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      html += `
        <div class="comment-item">
          <div class="comment-header">
            <div class="comment-user">
              <div class="comment-user-avatar">${comment.userName.substring(0, 1)}</div>
              ${comment.userName}
            </div>
            <div class="comment-date">${date} à ${time}</div>
          </div>
          <div class="comment-content">${comment.text}</div>
        </div>
      `;
    });
    
    commentsContainer.innerHTML = html;
    
  } catch (error) {
    console.error("Erreur lors du chargement des commentaires:", error);
    commentsContainer.innerHTML = '<p>Erreur lors du chargement des commentaires</p>';
  }
}

// Fonction pour ajouter un commentaire
async function addComment(address, text) {
  if (!auth.currentUser) {
    alert("Vous devez être connecté pour ajouter un commentaire");
    return;
  }
  
  try {
    // Récupérer les informations de l'utilisateur
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    const userName = userSnap.exists() ? userSnap.data().displayName : auth.currentUser.displayName;
    
    // Ajouter le commentaire
    await addDoc(collection(db, "comments"), {
      userId: auth.currentUser.uid,
      userName: userName,
      traderAddress: address,
      text: text,
      timestamp: new Date()
    });
    
    // Vider le champ de commentaire
    document.getElementById("commentInput").value = "";
    
    // Recharger les commentaires
    loadComments(address);
    
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error);
    alert("Erreur lors de l'ajout du commentaire");
  }
}

// Charger les top traders par réseau
async function loadTopTraders() {
  const networks = [
    { id: 'eth-mainnet', container: 'ethTopTraders' },
    { id: 'bsc-mainnet', container: 'bscTopTraders' },
    { id: 'matic-mainnet', container: 'polyTopTraders' }
  ];
  
  for (const network of networks) {
    try {
      const topTraders = await getTopTradersForNetwork(network.id);
      displayTopTraders(network.container, topTraders);
    } catch (error) {
      console.error(`Erreur chargement top traders ${network.id}:`, error);
    }
  }
}

// Récupérer les top traders d'un réseau
async function getTopTradersForNetwork(chainId) {
  // Adresses Ethereum valides réelles
  const mockTraders = [
    { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', score: 95, profit: 250000 },
    { address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', score: 88, profit: 180000 },
    { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', score: 82, profit: 120000 }
  ];
  return mockTraders;
}

// Afficher les top traders
function displayTopTraders(containerId, traders) {
  const container = document.getElementById(containerId);
  let html = '';
  
  traders.forEach((trader, index) => {
    html += `
      <div class="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
        <div>
          <div class="font-semibold">#${index + 1} ${trader.address.substring(0, 6)}...${trader.address.substring(trader.address.length - 4)}</div>
          <div class="text-sm text-gray-300">Score: ${trader.score}/100</div>
          <div class="text-sm text-green-400">+$${trader.profit.toLocaleString()}</div>
        </div>
        <button class="follow-top-trader px-3 py-1 bg-yellow-400 text-gray-900 rounded text-sm font-semibold" data-address="${trader.address}">
          Suivre
        </button>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Ajouter les event listeners aux boutons
  container.querySelectorAll('.follow-top-trader').forEach(btn => {
    btn.addEventListener('click', () => {
      followTopTrader(btn.dataset.address);
    });
  });
}

// Suivre un top trader
async function followTopTrader(address) {
  if (!auth.currentUser) {
    document.getElementById("loginModal").classList.remove("hidden");
    return;
  }
  
  try {
    const followData = {
      userId: auth.currentUser.uid,
      traderAddress: address,
      timestamp: new Date().toISOString(),
      isTopTrader: true
    };
    
    // Vérifier la limite et les doublons
    const follows = JSON.parse(localStorage.getItem('follows') || '[]');
    const userFollows = follows.filter(f => f.userId === auth.currentUser.uid);
    
    // Vérifier si déjà suivi
    if (userFollows.some(f => f.traderAddress === address)) {
      alert("Vous suivez déjà ce trader");
      return;
    }
    
    // Vérifier la limite de 3
    if (userFollows.length >= 3) {
      alert("Limite de 3 traders atteinte. Retirez-en un pour en ajouter un autre.");
      return;
    }
    
    // Ajouter le nouveau trader
    follows.push(followData);
    localStorage.setItem('follows', JSON.stringify(follows));
    
    // Recharger la liste
    loadFollowedTraders();
    
    // Recharger la liste
    loadFollowedTraders();
    updateFollowCounter();
    
    alert("Top trader suivi avec succès!");
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Gestion du modal trader
document.addEventListener("DOMContentLoaded", function() {
  const closeTraderModal = document.querySelector(".close-trader-modal");
  
  if (closeTraderModal) {
    closeTraderModal.addEventListener("click", () => {
      document.getElementById("traderDetailsModal").classList.add("hidden");
    });
  }
  
  // Fermer en cliquant en dehors
  window.addEventListener("click", (e) => {
    const traderModal = document.getElementById("traderDetailsModal");
    if (e.target === traderModal) {
      traderModal.classList.add("hidden");
    }
  });
});

// Gestion des notifications
document.addEventListener("DOMContentLoaded", function() {
  const notificationBtn = document.getElementById("notificationBtn");
  const notificationModal = document.getElementById("notificationModal");
  const closeNotificationModal = document.querySelector(".close-notification-modal");
  const saveNotifications = document.getElementById("saveNotifications");
  
  if (notificationBtn) {
    notificationBtn.addEventListener("click", () => {
      if (!auth.currentUser) {
        alert("Connectez-vous pour configurer les notifications");
        return;
      }
      notificationModal.classList.remove("hidden");
    });
  }
  
  if (closeNotificationModal) {
    closeNotificationModal.addEventListener("click", () => {
      notificationModal.classList.add("hidden");
    });
  }
  
  if (saveNotifications) {
    saveNotifications.addEventListener("click", async () => {
      const emailNotif = document.getElementById("emailNotif").checked;
      const pushNotif = document.getElementById("pushNotif").checked;
      const telegramNotif = document.getElementById("telegramNotif").checked;
      const telegramId = document.getElementById("telegramId").value;
      
      try {
        await setDoc(doc(db, "notifications", auth.currentUser.uid), {
          email: emailNotif,
          push: pushNotif,
          telegram: telegramNotif,
          telegramId: telegramId,
          timestamp: new Date()
        });
        
        alert("Notifications configurées!");
        notificationModal.classList.add("hidden");
      } catch (error) {
        console.error("Erreur:", error);
      }
    });
  }
});

// Surveillance en temps réel des transactions
async function startRealTimeMonitoring(address) {
  if (!auth.currentUser) return;
  
  // Vérifier les nouvelles transactions toutes les 30 secondes
  setInterval(async () => {
    try {
      const newTx = await checkNewTransactions(address);
      if (newTx.length > 0) {
        await sendNotifications(address, newTx);
      }
    } catch (error) {
      console.error("Erreur monitoring:", error);
    }
  }, 30000);
}

// Vérifier les nouvelles transactions
async function checkNewTransactions(address) {
  const apiKey = "cqt_rQCtDTV93Qvwpwdj6XX3xMCfq9QM";
  const url = `https://api.covalenthq.com/v1/eth-mainnet/address/${address}/transactions_v2/?key=${apiKey}&page-size=5`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Comparer avec les dernières transactions stockées
    const lastCheck = localStorage.getItem(`lastCheck_${address}`);
    const newTransactions = [];
    
    if (data.data && data.data.items) {
      data.data.items.forEach(tx => {
        if (!lastCheck || new Date(tx.block_signed_at) > new Date(lastCheck)) {
          newTransactions.push(tx);
        }
      });
    }
    
    localStorage.setItem(`lastCheck_${address}`, new Date().toISOString());
    return newTransactions;
  } catch (error) {
    console.error("Erreur vérification transactions:", error);
    return [];
  }
}

// Envoyer les notifications
async function sendNotifications(address, transactions) {
  if (!auth.currentUser) return;
  
  try {
    const notifDoc = await getDoc(doc(db, "notifications", auth.currentUser.uid));
    if (!notifDoc.exists()) return;
    
    const settings = notifDoc.data();
    const message = `Nouvelle transaction détectée pour ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    
    // Email
    if (settings.email) {
      await sendEmailNotification(auth.currentUser.email, message);
    }
    
    // Push
    if (settings.push) {
      showPushNotification(message);
    }
    
    // Telegram
    if (settings.telegram && settings.telegramId) {
      await sendTelegramNotification(settings.telegramId, message);
    }
  } catch (error) {
    console.error("Erreur envoi notifications:", error);
  }
}

// Notification push
function showPushNotification(message) {
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification("CTC - Trader Alert", { body: message });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("CTC - Trader Alert", { body: message });
        }
      });
    }
  }
}

// Notification Telegram (nécessite un bot)
async function sendTelegramNotification(chatId, message) {
  const botToken = "YOUR_BOT_TOKEN"; // À configurer
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });
  } catch (error) {
    console.error("Erreur Telegram:", error);
  }
}

// Email notification (nécessite un service backend)
async function sendEmailNotification(email, message) {
  // À implémenter avec un service comme SendGrid, Nodemailer, etc.
  console.log(`Email à ${email}: ${message}`);
}

// Charger et afficher les traders suivis
async function loadFollowedTraders() {
  if (!auth.currentUser) {
    document.getElementById('followedTradersList').innerHTML = '<div class="text-center text-gray-400 col-span-full"><p>Connectez-vous pour voir vos traders suivis</p></div>';
    return;
  }
  
  const follows = JSON.parse(localStorage.getItem('follows') || '[]');
  const userFollows = follows.filter(f => f.userId === auth.currentUser.uid);
  
  if (userFollows.length === 0) {
    document.getElementById('followedTradersList').innerHTML = '<div class="text-center text-gray-400 col-span-full"><p>Aucun trader suivi pour le moment</p></div>';
    return;
  }
  
  let html = '';
  
  for (const follow of userFollows) {
    try {
      const traderData = await getTraderRealTimeData(follow.traderAddress);
      html += `
        <div class="bg-gray-700 p-4 rounded-lg">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold">${follow.traderAddress.substring(0, 6)}...${follow.traderAddress.substring(follow.traderAddress.length - 4)}</h3>
            <span class="text-xs text-gray-400">${new Date(follow.timestamp).toLocaleDateString()}</span>
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Dernière activité:</span>
              <span class="text-cyan-400">${traderData.lastActivity}</span>
            </div>
            <div class="flex justify-between">
              <span>Transactions 24h:</span>
              <span class="text-yellow-400">${traderData.txCount24h}</span>
            </div>
            <div class="flex justify-between">
              <span>P&L 24h:</span>
              <span class="${traderData.pnl24h >= 0 ? 'text-green-400' : 'text-red-400'}">
                ${traderData.pnl24h >= 0 ? '+' : ''}${traderData.pnl24h.toFixed(2)}%
              </span>
            </div>
          </div>
          <button class="expand-btn mt-3 w-full px-3 py-1 bg-blue-500 text-white rounded text-sm mb-2" data-address="${follow.traderAddress}">
            Voir Détails Complets
          </button>
          <button class="unfollow-btn w-full px-3 py-1 bg-red-500 text-white rounded text-sm" data-address="${follow.traderAddress}">
            Ne plus suivre
          </button>
        </div>
      `;
    } catch (error) {
      console.error('Erreur chargement trader:', error);
    }
  }
  
  document.getElementById('followedTradersList').innerHTML = html;
  
  // Ajouter les event listeners aux boutons "Ne plus suivre"
  document.querySelectorAll('.unfollow-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      unfollowTrader(btn.dataset.address);
    });
  });
  
  // Ajouter les event listeners aux boutons "Développer"
  document.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleTraderDetails(btn.dataset.address);
    });
  });
  
  // Ajouter les event listeners aux boutons "Copier" (délégué)
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn')) {
      const contract = e.target.dataset.contract;
      navigator.clipboard.writeText(contract).then(() => {
        e.target.textContent = 'Copié!';
        e.target.classList.add('bg-green-600');
        e.target.classList.remove('bg-blue-600');
        setTimeout(() => {
          e.target.textContent = 'Copier';
          e.target.classList.add('bg-blue-600');
          e.target.classList.remove('bg-green-600');
        }, 2000);
      }).catch(() => {
        alert('Erreur de copie');
      });
    }
  });
}

// Récupérer les données temps réel d'un trader
async function getTraderRealTimeData(address) {
  const apiKey = "cqt_rQCtDTV93Qvwpwdj6XX3xMCfq9QM";
  
  try {
    const response = await fetch(`https://api.covalenthq.com/v1/eth-mainnet/address/${address}/transactions_v2/?key=${apiKey}&page-size=10`);
    const data = await response.json();
    
    if (data.data && data.data.items && data.data.items.length > 0) {
      const lastTx = data.data.items[0];
      const last24h = data.data.items.filter(tx => {
        const txDate = new Date(tx.block_signed_at);
        const now = new Date();
        return (now - txDate) < 24 * 60 * 60 * 1000;
      });
      
      return {
        lastActivity: new Date(lastTx.block_signed_at).toLocaleString(),
        txCount24h: last24h.length,
        pnl24h: (Math.random() * 20 - 10) // Simulé pour la démo
      };
    }
  } catch (error) {
    console.error('Erreur API:', error);
  }
  
  return {
    lastActivity: 'Inconnue',
    txCount24h: 0,
    pnl24h: 0
  };
}

// Afficher les détails complets d'un trader dans un modal
async function toggleTraderDetails(address) {
  const modal = document.getElementById('traderDetailsModal');
  const title = document.getElementById('traderModalTitle');
  const content = document.getElementById('traderModalContent');
  const networkSelector = document.getElementById('networkSelector');
  
  // Afficher le modal
  modal.classList.remove('hidden');
  title.textContent = `Détails du Trader ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  content.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin text-2xl"></i><br>Chargement...</div>';
  
  // Stocker l'adresse pour le changement de réseau
  window.currentTraderAddress = address;
  
  // Event listener pour le changement de réseau
  networkSelector.onchange = () => loadTraderForNetwork(address, networkSelector.value);
  
  // Charger les détails pour le réseau par défaut
  await loadTraderForNetwork(address, networkSelector.value);
}

// Charger les détails d'un trader pour un réseau spécifique
async function loadTraderForNetwork(address, chainId) {
  const content = document.getElementById('traderModalContent');
  content.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin text-2xl"></i><br>Chargement...</div>';
  
  // Charger les détails complets
  const details = await getFullTraderDetails(address, chainId);
  
  content.innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Colonne 1: Portfolio -->
      <div class="space-y-4">
        <div class="bg-gray-700 p-4 rounded-lg">
          <h3 class="text-lg font-bold text-yellow-400 mb-3">Portfolio Total</h3>
          <div class="text-2xl font-bold">$${details.totalValue.toLocaleString()}</div>
          <div class="flex justify-between mt-2">
            <span>Gains 30j: <span class="${details.gains30d >= 0 ? 'text-green-400' : 'text-red-400'}">${details.gains30d >= 0 ? '+' : ''}${details.gains30d.toFixed(2)}%</span></span>
            <span>Win Rate: <span class="text-cyan-400">${details.winRate}%</span></span>
          </div>
        </div>
        
        <div class="bg-gray-700 p-4 rounded-lg">
          <h3 class="text-lg font-bold text-yellow-400 mb-3">Toutes les Cryptos (${details.allCryptos.length})</h3>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            ${details.allCryptos.map(crypto => 
              `<div class="p-3 bg-gray-600 rounded">
                <div class="flex justify-between mb-2">
                  <span class="font-semibold text-lg">${crypto.symbol}</span>
                  <span class="text-lg">$${crypto.value.toLocaleString()}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-300 font-mono">${crypto.contract}</span>
                  <button class="copy-btn ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded" data-contract="${crypto.contract}">
                    Copier
                  </button>
                </div>
              </div>`
            ).join('')}
          </div>
        </div>
      </div>
      
      <!-- Colonne 2: Transactions -->
      <div class="space-y-4">
        <div class="bg-gray-700 p-4 rounded-lg">
          <h3 class="text-lg font-bold text-yellow-400 mb-3">Crypto Préférée</h3>
          <div class="text-xl">${details.favoriteCrypto.symbol} <span class="text-sm text-gray-400">(${details.favoriteCrypto.transactions} transactions)</span></div>
        </div>
        
        <div class="bg-gray-700 p-4 rounded-lg">
          <h3 class="text-lg font-bold text-yellow-400 mb-3">Dernières Transactions</h3>
          <div class="space-y-3 max-h-64 overflow-y-auto">
            ${details.recentTx.map(tx => 
              `<div class="p-3 ${tx.type === 'Achat' ? 'bg-green-800' : 'bg-red-800'} rounded">
                <div class="flex justify-between mb-2">
                  <span class="font-semibold">${tx.type} ${tx.crypto}</span>
                  <span class="font-bold">${tx.amount}</span>
                </div>
                <div class="flex justify-between text-sm text-gray-300 mb-2">
                  <span>${tx.date}</span>
                  <span>${tx.time}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-300 font-mono">${tx.contract}</span>
                  <button class="copy-btn ml-2 px-2 py-1 bg-blue-600 text-white text-sm rounded" data-contract="${tx.contract}">
                    Copier
                  </button>
                </div>
              </div>`
            ).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Récupérer les détails complets d'un trader
async function getFullTraderDetails(address, chainId = 'eth-mainnet') {
  const apiKey = "cqt_rQCtDTV93Qvwpwdj6XX3xMCfq9QM";
  
  try {
    // Récupérer les soldes
    const balancesRes = await fetch(`https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?key=${apiKey}`);
    const balancesData = await balancesRes.json();
    
    // Récupérer les transactions
    const txRes = await fetch(`https://api.covalenthq.com/v1/${chainId}/address/${address}/transactions_v2/?key=${apiKey}&page-size=20`);
    const txData = await txRes.json();
    
    if (balancesData.data && txData.data) {
      const totalValue = balancesData.data.items.reduce((sum, item) => sum + (item.quote || 0), 0);
      
      const allCryptos = balancesData.data.items
        .filter(item => item.quote > 0)
        .sort((a, b) => b.quote - a.quote)
        .map(item => ({
          symbol: item.contract_ticker_symbol || 'ETH',
          value: item.quote,
          contract: item.contract_address || '0x0000000000000000000000000000000000000000'
        }));
      
      const recentTx = txData.data.items.slice(0, 5).map(tx => {
        const txDate = new Date(tx.block_signed_at);
        const cryptos = ['ETH', 'USDC', 'LINK', 'UNI', 'AAVE'];
        const contracts = {
          'ETH': '0x0000000000000000000000000000000000000000',
          'USDC': '0xA0b86a33E6441c8C06DD2b7c94b7E0e8c07e9433',
          'LINK': '0x514910771AF9Ca656af840dff83E8264EcF986CA',
          'UNI': '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
          'AAVE': '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'
        };
        const crypto = cryptos[Math.floor(Math.random() * cryptos.length)];
        return {
          type: Math.random() > 0.5 ? 'Achat' : 'Vente',
          crypto: crypto,
          amount: `${(Math.random() * 1000).toFixed(0)} $`,
          date: txDate.toLocaleDateString(),
          time: txDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          contract: contracts[crypto]
        };
      });
      
      return {
        totalValue,
        allCryptos,
        favoriteCrypto: { symbol: 'ETH', transactions: Math.floor(Math.random() * 50) + 10 },
        gains30d: (Math.random() * 60 - 20),
        winRate: Math.floor(Math.random() * 40) + 50,
        recentTx
      };
    }
  } catch (error) {
    console.error('Erreur détails trader:', error);
  }
  
  // Données par défaut selon le réseau
  const networkTokens = {
    'eth-mainnet': [
      { symbol: 'ETH', value: Math.floor(Math.random() * 50000) + 5000, contract: '0x0000000000000000000000000000000000000000' },
      { symbol: 'USDC', value: Math.floor(Math.random() * 30000) + 3000, contract: '0xA0b86a33E6441c8C06DD2b7c94b7E0e8c07e9433' },
      { symbol: 'LINK', value: Math.floor(Math.random() * 20000) + 2000, contract: '0x514910771AF9Ca656af840dff83E8264EcF986CA' }
    ],
    'bsc-mainnet': [
      { symbol: 'BNB', value: Math.floor(Math.random() * 40000) + 4000, contract: '0x0000000000000000000000000000000000000000' },
      { symbol: 'BUSD', value: Math.floor(Math.random() * 25000) + 2500, contract: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' },
      { symbol: 'CAKE', value: Math.floor(Math.random() * 15000) + 1500, contract: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82' }
    ],
    'matic-mainnet': [
      { symbol: 'MATIC', value: Math.floor(Math.random() * 30000) + 3000, contract: '0x0000000000000000000000000000000000000000' },
      { symbol: 'USDC', value: Math.floor(Math.random() * 20000) + 2000, contract: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' },
      { symbol: 'WETH', value: Math.floor(Math.random() * 25000) + 2500, contract: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619' }
    ]
  };
  
  return {
    totalValue: Math.floor(Math.random() * 100000) + 10000,
    allCryptos: networkTokens[chainId] || networkTokens['eth-mainnet'],
    favoriteCrypto: { symbol: 'ETH', transactions: Math.floor(Math.random() * 50) + 10 },
    gains30d: (Math.random() * 60 - 20),
    winRate: Math.floor(Math.random() * 40) + 50,
    recentTx: getNetworkTransactions(chainId)
  };
}

// Générer des transactions selon le réseau
function getNetworkTransactions(chainId) {
  const networkTx = {
    'eth-mainnet': [
      { type: 'Achat', crypto: 'ETH', amount: '500 $', date: 'Aujourd\'hui', time: '14:32', contract: '0x0000000000000000000000000000000000000000' },
      { type: 'Vente', crypto: 'USDC', amount: '1200 $', date: 'Hier', time: '09:15', contract: '0xA0b86a33E6441c8C06DD2b7c94b7E0e8c07e9433' },
      { type: 'Achat', crypto: 'LINK', amount: '800 $', date: 'Il y a 2j', time: '16:45', contract: '0x514910771AF9Ca656af840dff83E8264EcF986CA' }
    ],
    'bsc-mainnet': [
      { type: 'Achat', crypto: 'BNB', amount: '400 $', date: 'Aujourd\'hui', time: '15:20', contract: '0x0000000000000000000000000000000000000000' },
      { type: 'Vente', crypto: 'BUSD', amount: '800 $', date: 'Hier', time: '10:30', contract: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' },
      { type: 'Achat', crypto: 'CAKE', amount: '600 $', date: 'Il y a 2j', time: '13:15', contract: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82' }
    ],
    'matic-mainnet': [
      { type: 'Achat', crypto: 'MATIC', amount: '300 $', date: 'Aujourd\'hui', time: '16:45', contract: '0x0000000000000000000000000000000000000000' },
      { type: 'Vente', crypto: 'USDC', amount: '700 $', date: 'Hier', time: '11:20', contract: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' },
      { type: 'Achat', crypto: 'WETH', amount: '900 $', date: 'Il y a 2j', time: '14:10', contract: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619' }
    ]
  };
  
  return networkTx[chainId] || networkTx['eth-mainnet'];
}

// Mettre à jour le compteur de traders suivis
function updateFollowCounter() {
  if (!auth.currentUser) return;
  
  const follows = JSON.parse(localStorage.getItem('follows') || '[]');
  const userFollows = follows.filter(f => f.userId === auth.currentUser.uid);
  
  // Afficher le compteur dans le titre de la section
  const title = document.querySelector('#followedTraders h2');
  if (title) {
    title.innerHTML = `<i class="fas fa-users"></i> Mes Traders Suivis (${userFollows.length}/3)`;
  }
}

// Fonction pour sauvegarder une notation personnalisée (pour les utilisateurs premium)
async function saveCustomRating(address, rating, notes) {
  if (!auth.currentUser) {
    alert("Vous devez être connecté pour effectuer cette action");
    return;
  }
  
  try {
    const ratingRef = doc(db, "ratings", `${address}_${auth.currentUser.uid}`);
    await setDoc(ratingRef, {
      address: address,
      rating: rating,
      notes: notes,
      userId: auth.currentUser.uid,
      timestamp: new Date()
    });
    
    alert("Notation enregistrée avec succès");
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la notation:", error);
    alert("Erreur lors de l'enregistrement de la notation");
  }
}
