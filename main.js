import { Game } from './src/game/game.js';
import { WelcomeScreen } from './src/ui/WelcomeScreen.js';
import { displayHighScores } from './src/game/localStorage.js';
import { GameState } from './src/utils/GameState.js';

// Le pseudo est maintenant demandé via l'écran d'accueil DOM

// Fonction pour initialiser le jeu une fois la page chargée
window.onload = async function() {

  // Afficher l'écran de bienvenue (await garantit qu'il se termine avant de continuer)
     const welcome = await WelcomeScreen.show();
     const surname = welcome.name;

  // Obtenir l'élément canvas où le jeu sera dessiné
  const canvas = document.getElementById('gameCanvas');

  // Créer une nouvelle instance de GameState pour suivre l'état du jeu
  const gameState = new GameState();

  // afficher les meilleurs scores déjà présents
  displayHighScores();

  // Créer une nouvelle instance de Game et passer le canvas et gameState
    const game = new Game(canvas, gameState, surname || 'Player');
  // Preserve difficulty so reset keeps the same level
  const speed = welcome.speed || 150;
  const growth = welcome.growth || 2;
  game.initialSpeed = speed;
  game.initialGrowth = growth;
  game.speed = speed;
  game.growthSize = growth;

  // Resize canvas to fit viewport responsively (keeps square)
  function fitCanvas() {
    const hud = document.getElementById('hud');
    const hudH = hud ? Math.ceil(hud.getBoundingClientRect().height) : 0;
    const bodyStyles = getComputedStyle(document.body);
    const padY = (parseFloat(bodyStyles.paddingTop) || 0) + (parseFloat(bodyStyles.paddingBottom) || 0);
    const padX = (parseFloat(bodyStyles.paddingLeft) || 0) + (parseFloat(bodyStyles.paddingRight) || 0);

    // keep a small gap between HUD and canvas
    const gap = 14;

    const maxW = window.innerWidth - padX;
    const maxH = window.innerHeight - padY - hudH - gap;
    const maxSize = Math.min(maxW, maxH, 1200);
    const size = Math.max(240, Math.floor(maxSize));
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    // set logical canvas size to css pixel size (no DPR scaling for simplicity)
    canvas.width = size;
    canvas.height = size;
    if (typeof game.onResize === 'function') game.onResize();
  }

  // simple debounce
  function debounce(fn, ms = 120){
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(()=>fn(...a), ms); };
  }

  window.addEventListener('resize', debounce(fitCanvas, 120));
  // initial fit
  fitCanvas();

  // Initialiser le suivi du temps pour la boucle de jeu
  let lastTime = performance.now();

  // Fonction de boucle de jeu
  function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime; // Mettre à jour le suivi du dernier temps
    game.update(deltaTime); // Mettre à jour le temps
    game.draw(); // Dessiner les visuels du jeu sur le canvas

    // Planifier la prochaine frame pour la boucle de jeu
    requestAnimationFrame(gameLoop);
  }

  // Vérifier si le pseudo est nul ou vide, .trim supprime les espaces en début et fin
    // `surname` fourni par le WelcomeScreen; valeur garantie

  // Ajouter un écouteur pour la touche `Espace` afin de redémarrer le jeu lorsqu'il est terminé
  document.addEventListener('keydown', (e) => {
    // Ignorer si on tape dans un champ texte
    const tgt = e.target && e.target.tagName;
    if (tgt === 'INPUT' || tgt === 'TEXTAREA') return;

    if (e.code === 'Space') {
      if (gameState.isOver()) {
        gameState.reset(); // Réinitialiser l'état du jeu
        game.reset(); // Réinitialiser le jeu lui-même
        // éviter un grand delta au prochain frame
        lastTime = performance.now();
      } else {
        // bascule pause / reprise
        if (typeof game.togglePause === 'function') {
          game.togglePause();
        } else {
          // fallback simple
          game.paused = !game.paused;
        }
        // remettre le compteur du loop principal à zéro pour éviter gros sauts
        lastTime = performance.now();
      }
      e.preventDefault();
    }
  });

  // Démarrer directement la partie avec la difficulté choisie dans l'écran d'accueil
  // Démarrer la boucle de jeu
  requestAnimationFrame(gameLoop);
}
