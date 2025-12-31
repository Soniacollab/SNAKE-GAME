import { Food } from './food.js';
import { Snake } from './snake.js';
import { Renderer } from './Renderer.js';
import { saveScore, displayHighScores } from './localStorage.js';

export class Game {

  // Initialise le jeu. On accepte un GameState optionnel et un nom de joueur.
  // canvas: élément <canvas>
  // gameState: objet externe pour suivre score / état (facultatif)
  // playerName: pseudo du joueur (facultatif)
  constructor(canvas, gameState = null, playerName = 'Player') {

    this.canvas = canvas; // Élément canvas pour le rendu
    this.gridSize = 20; // Taille d'une cellule de la grille
    this.width = Math.floor(canvas.width / this.gridSize);
    this.height = Math.floor(canvas.height / this.gridSize);

    this.snake = new Snake();
    this.food = new Food();
    this.renderer = new Renderer(canvas, this.gridSize);
    this.food.generateFood(this.width, this.height, this.snake);

    // Réglages par défaut
    this.speed = 200;
    this.growthSize = 1;
    this.initialSpeed = null; // will be set by main.js to preserve difficulty across resets
    this.initialGrowth = null;

    // Timing et états
    this.lastUpdateTime = 0;
    this.gameOver = false;
    this.paused = false;
    this.score = 0;
    this.elapsedTime = 0; // ms écoulés depuis le début de la partie
    this.level = 1;

    // Intégration optionnelle d'un GameState externe
    this.gameState = gameState;
    this.playerName = playerName;

    this.initializeGame();
    this.setupControls();
  }



  // Initialize the game by setting up the snake, food, and other initial settings
  initializeGame() {
    // Remise à zéro de l'état interne
    this.snake = new Snake();
    this.food.generateFood(this.width, this.height, this.snake);
    // Preserve initial difficulty if provided (so replay keeps same difficulty)
    this.speed = (this.initialSpeed != null) ? this.initialSpeed : 300;
    this.growthSize = (this.initialGrowth != null) ? this.initialGrowth : 1;
    this.lastUpdateTime = 0;
    this.gameOver = false;
    this.score = 0;
    this.level = 1;
    this.elapsedTime = 0;

    // Si un GameState externe existe, on le réinitialise aussi
    if (this.gameState && typeof this.gameState.reset === 'function') {
      this.gameState.reset();
    }

    this.renderer.updateState(this.snake, this.food, this.score, this.level, this.gameOver, this.elapsedTime, this.paused);
  }

  // Start the game by initializing and starting the game loop
  startGame() {
    this.initializeGame(); // Initialize the game
    // Loop driven by main.js; do not start an internal RAF here
  }


  // Restart the game by initializing the game loop
  restartGame() {
    this.initializeGame(); // Initialize the game
  }

  // Méthode attendue par main.js pour réinitialiser le jeu
  reset() {
    this.initializeGame();
    this.gameOver = false;
    this.paused = false;
    this.lastUpdateTime = 0;
  }

  // Called by main when canvas size changed
  onResize() {
    // Recompute grid-based width/height from canvas logical size
    this.width = Math.max(4, Math.floor(this.canvas.width / this.gridSize));
    this.height = Math.max(4, Math.floor(this.canvas.height / this.gridSize));
    // Ensure food remains in bounds; regenerate if outside
    if (this.food && (this.food.position.x >= this.width || this.food.position.y >= this.height)) {
      this.food.generateFood(this.width, this.height, this.snake);
    }
    // Update renderer with current paused flag
    if (this.renderer && typeof this.renderer.updateState === 'function') {
      this.renderer.updateState(this.snake, this.food, this.score, this.level, this.gameOver, this.elapsedTime, this.paused);
    }
  }

  // Set up the controls for the user to interact with the game
  setupControls() {
    document.addEventListener('keydown', (e) => {
      if (!this.gameOver) {
        switch (e.key) {
          case 'ArrowUp':
            this.snake.changeDirection('up');
            break;
          case 'ArrowDown':
            this.snake.changeDirection('down');
            break;
          case 'ArrowLeft':
            this.snake.changeDirection('left');
            break;
          case 'ArrowRight':
            this.snake.changeDirection('right');
            break;
        }
      }
      // Espace géré globalement par main.js pour pause / restart
    });
  }



  // The main game loop, which updates and renders the game continuously
  gameLoop(currentTime = 0) {

    if (this.gameOver) return; // arrêter si terminé

    const deltaTime = currentTime - this.lastUpdateTime;
    this.update(deltaTime);
    this.draw();
    this.lastUpdateTime = currentTime;
    requestAnimationFrame((currentTime) => this.gameLoop(currentTime));
  }

  // Update the game state (move snake, check collisions, etc.)
  update(deltaTime) {

    if (this.gameOver) return;
    if (this.paused) return; // ne pas avancer le jeu si en pause

    // Toujours accumuler le temps écoulé pour le chrono
    this.elapsedTime += deltaTime;
    this.lastUpdateTime += deltaTime;

    if (this.lastUpdateTime >= this.speed) {
      // Déplacement de la tête
      this.snake.move();

      // Vérifier si on mange la nourriture
      if (this.snake.body[0].x === this.food.position.x && this.snake.body[0].y === this.food.position.y) {
        for (let i = 0; i < this.growthSize; i++) {
          this.snake.grow();
        }

        this.food.generateFood(this.width, this.height, this.snake);
        // Incrémenter le score local et dans GameState si présent
        this.incrementScore();
        if (this.gameState && typeof this.gameState.incrementScore === 'function') {
          this.gameState.incrementScore(10);
        }

        // Ralentissement progressif limité
        this.speed = Math.max(50, this.speed - 2);

        if (this.speed % 10 === 0) {
          this.incrementLevel();
        }
      }

      // Collision avec mur ou corps
      if (this.snake.checkCollision(this.width, this.height)) {
        this.gameOver = true;
        if (this.gameState && typeof this.gameState.setGameOver === 'function') {
          this.gameState.setGameOver(true);
        }

        // Sauvegarder le score une seule fois
        try {
          saveScore({ surname: this.playerName, score: this.score });
          displayHighScores();
        } catch (e) {
          // Ne pas planter le jeu si localStorage n'est pas disponible
          console.warn('Impossible de sauvegarder le score:', e);
        }
      }

      this.renderer.updateState(this.snake, this.food, this.score, this.level, this.gameOver, this.elapsedTime, this.paused);
      this.lastUpdateTime = 0;
    }
  }

  // Draw the current game state on the canvas
  draw() {
    this.renderer.render(); // Render the game state (utilise this.currentState mis à jour)
  }

  // Pause / resume helpers
  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    // reset timing accumulator to avoid large jump after pause
    this.lastUpdateTime = 0;
  }

  togglePause() {
    if (this.paused) this.resume(); else this.pause();
  }

  // Increment the score
  incrementScore() {
    this.score += 10; // Increase score by 10
  }

  // Increment the level
  incrementLevel() {
    this.level += 1; // Increase level by 1
  }
}
