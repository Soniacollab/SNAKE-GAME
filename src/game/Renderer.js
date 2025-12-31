export class Renderer {
  constructor(canvas, gridSize) {
    
    this.ctx = canvas.getContext('2d'); // Get the 2D drawing context from the canvas
    this.canvas = canvas; // Canvas element to render the game
    this.gridSize = gridSize; // Size of each grid cell
    this.currentState = null; // Current state of the game
    this.imageCache = {}; // Cache for food images
  }



  // Update the current game state
  updateState(snake, food, score, level, gameOver, elapsedTime = 0, paused = false) {
    this.currentState = {
      snake: {
        body: snake.body.map(segment => ({ ...segment })), // copie du corps
        direction: snake.direction
      },
      food: { ...food.position, image: food.currentImage },
      score,
      level,
      gameOver,
      elapsedTime,
      paused
    };
  }

  // Render the game state
  render() {
    
    this.ctx.fillStyle = '#140c04'; // Background color
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // Fill the canvas with the background color

    this.renderFood(); // Render the food
    this.renderSnake(); // Render the snake
    this.renderUI(); // Update HUD DOM and show/hide overlays (no in-canvas UI)
  }

  // Render the food
  renderFood() {
    
    if (!this.currentState) return; // If no current state, do nothing

    const food = this.currentState.food;
    if (!this.imageCache[food.image]) { // If the food image is not in the cache, load it
      const img = new Image();
      img.src = food.image;
      this.imageCache[food.image] = img;
    }

    const img = this.imageCache[food.image];
    const sizeMultiplier = 1.5;
    const size = this.gridSize * sizeMultiplier;

    // Draw only when image is loaded; onload will ensure subsequent frames render it
    if (img.complete && img.naturalWidth !== 0) {
      this.ctx.drawImage(
        img,
        food.x * this.gridSize - (size - this.gridSize) / 2,
        food.y * this.gridSize - (size - this.gridSize) / 2,
        size,
        size
      );
    } else {
      img.onload = () => {
        // nothing special — next frame will draw the loaded image
      };
    }
  }



  // Render the snake
  renderSnake() {
    
    if (!this.currentState) return; // If no current state, do nothing

    const snake = this.currentState.snake;

    // Draw the snake's head as a circle
    this.ctx.fillStyle = '#00ff00'; // Color for the head
    const head = snake.body[0];
    this.ctx.beginPath();
    this.ctx.arc(
      head.x * this.gridSize + this.gridSize / 2, // x-coordinate of the center
      head.y * this.gridSize + this.gridSize / 2, // y-coordinate of the center
      this.gridSize / 2, // Radius of the circle (half the grid size)
      0,
      Math.PI * 2 // Ending angle (2 * PI radians, corresponds to a full circle or 360°)
    );
    this.ctx.fill();

    // Draw the rest of the snake's body as rectangles
    this.ctx.fillStyle = '#00cc00'; // Color for the body
    snake.body.slice(1).forEach(segment => {
      this.ctx.fillRect(
        segment.x * this.gridSize, // x-coordinate for the rectangle
        segment.y * this.gridSize, // y-coordinate for the rectangle
        this.gridSize - 1, // Width of the rectangle
        this.gridSize - 1 // Height of the rectangle
      );
    });
  }

  // Render the UI elements (score, level, and game over message)
  renderUI() {
    // Update HUD DOM elements if present (remove in-canvas UI)
    const hudScore = document.getElementById('hud-score');
    const hudTime = document.getElementById('hud-time');
    const hudLevel = document.getElementById('hud-level');

    const ms = this.currentState.elapsedTime || 0;
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');

    if (hudScore) hudScore.textContent = `Score: ${this.currentState.score}`;
    if (hudTime) hudTime.textContent = `Temps: ${minutes}:${seconds}`;
    if (hudLevel) hudLevel.textContent = `Niveau: ${this.currentState.level}`;

    // Manage a simple DOM overlay for Game Over instead of drawing inside canvas
    let overlay = document.getElementById('game-over-overlay');
    if (this.currentState.gameOver) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'game-over-overlay';
        overlay.className = 'overlay';
        overlay.innerHTML = `
          <div class="welcome-card" style="text-align:center;">
            <h1 style="font-size:40px;margin:8px 0;color:var(--accent)">Game Over !</h1>
            <p style="font-size:18px;color:rgba(255,255,255,0.9)">Appuyer sur Espace pour rejouer</p>
          </div>
        `;
        document.body.appendChild(overlay);
      } else {
        overlay.style.display = 'flex';
      }
    } else {
      if (overlay) overlay.style.display = 'none';
    }

    // Paused overlay (separate element)
    let pausedOverlay = document.getElementById('paused-overlay');
    if (this.currentState.paused) {
      if (!pausedOverlay) {
        pausedOverlay = document.createElement('div');
        pausedOverlay.id = 'paused-overlay';
        pausedOverlay.className = 'overlay';
        pausedOverlay.innerHTML = `
          <div class="welcome-card" style="text-align:center;">
            <h1 style="font-size:36px;margin:8px 0;color:var(--accent)">Paused</h1>
            <p style="font-size:16px;color:rgba(255,255,255,0.9)">Appuyer sur Espace pour reprendre</p>
          </div>
        `;
        document.body.appendChild(pausedOverlay);
      } else {
        pausedOverlay.style.display = 'flex';
      }
    } else {
      if (pausedOverlay) pausedOverlay.style.display = 'none';
    }
  }
}
