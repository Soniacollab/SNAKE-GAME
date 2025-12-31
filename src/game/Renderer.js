export class Renderer {
  constructor(canvas, gridSize) {
    
    this.ctx = canvas.getContext('2d'); // Get the 2D drawing context from the canvas
    this.canvas = canvas; // Canvas element to render the game
    this.gridSize = gridSize; // Size of each grid cell
    this.currentState = null; // Current state of the game
    this.imageCache = {}; // Cache for food images

    // Cached palette (keep aligned with CSS theme)
    this.colors = {
      bgTop: '#07101a',
      bgBottom: '#0b1622',
      grid: 'rgba(255,255,255,0.05)',
      gridBold: 'rgba(255,255,255,0.08)',
      head: '#6ef3b8',
      headStroke: '#044b2f',
      body: '#2de17c',
      bodyStroke: 'rgba(0,0,0,0.28)'
    };
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
    
    this.renderBackground();
    this.renderGrid();

    this.renderFood(); // Render the food
    this.renderSnake(); // Render the snake
    this.renderUI(); // Update HUD DOM and show/hide overlays (no in-canvas UI)
  }

  renderBackground() {
    const { width, height } = this.canvas;
    const g = this.ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, this.colors.bgTop);
    g.addColorStop(1, this.colors.bgBottom);
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, width, height);

    // Soft vignette
    const r = Math.max(width, height) * 0.75;
    const vg = this.ctx.createRadialGradient(width / 2, height / 2, r * 0.25, width / 2, height / 2, r);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.35)');
    this.ctx.fillStyle = vg;
    this.ctx.fillRect(0, 0, width, height);
  }

  renderGrid() {
    const { width, height } = this.canvas;
    const step = this.gridSize;

    this.ctx.save();
    this.ctx.lineWidth = 1;
    this.ctx.translate(0.5, 0.5);

    // Vertical lines
    for (let x = 0; x <= width; x += step) {
      const bold = (x / step) % 5 === 0;
      this.ctx.strokeStyle = bold ? this.colors.gridBold : this.colors.grid;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += step) {
      const bold = (y / step) % 5 === 0;
      this.ctx.strokeStyle = bold ? this.colors.gridBold : this.colors.grid;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    this.ctx.restore();
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

    // Subtle glow behind the food
    const cx = food.x * this.gridSize + this.gridSize / 2;
    const cy = food.y * this.gridSize + this.gridSize / 2;
    this.ctx.save();
    const glow = this.ctx.createRadialGradient(cx, cy, this.gridSize * 0.15, cx, cy, this.gridSize * 0.9);
    glow.addColorStop(0, 'rgba(123,208,255,0.20)');
    glow.addColorStop(1, 'rgba(123,208,255,0)');
    this.ctx.fillStyle = glow;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, this.gridSize * 0.9, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

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

    const radius = Math.max(4, Math.floor(this.gridSize * 0.28));
    const inset = Math.max(1, Math.floor(this.gridSize * 0.08));

    const drawRoundedCell = (x, y, size, r) => {
      if (typeof this.ctx.roundRect === 'function') {
        this.ctx.roundRect(x, y, size, size, r);
        return;
      }
      // Fallback path
      const rr = Math.min(r, size / 2);
      this.ctx.moveTo(x + rr, y);
      this.ctx.arcTo(x + size, y, x + size, y + size, rr);
      this.ctx.arcTo(x + size, y + size, x, y + size, rr);
      this.ctx.arcTo(x, y + size, x, y, rr);
      this.ctx.arcTo(x, y, x + size, y, rr);
    };

    const drawSegment = (segment, isHead) => {
      const x = segment.x * this.gridSize + inset;
      const y = segment.y * this.gridSize + inset;
      const size = this.gridSize - inset * 2;

      this.ctx.save();
      this.ctx.shadowColor = 'rgba(0,0,0,0.35)';
      this.ctx.shadowBlur = isHead ? 10 : 6;
      this.ctx.shadowOffsetY = 2;

      // Slight shading with a diagonal gradient
      const grad = this.ctx.createLinearGradient(x, y, x + size, y + size);
      if (isHead) {
        grad.addColorStop(0, '#90ffd7');
        grad.addColorStop(1, this.colors.head);
      } else {
        grad.addColorStop(0, '#5bffb2');
        grad.addColorStop(1, this.colors.body);
      }

      this.ctx.beginPath();
      drawRoundedCell(x, y, size, isHead ? radius : Math.max(3, Math.floor(radius * 0.85)));
      this.ctx.closePath();

      this.ctx.fillStyle = grad;
      this.ctx.fill();

      this.ctx.shadowBlur = 0;
      this.ctx.lineWidth = Math.max(1, Math.floor(this.gridSize * 0.08));
      this.ctx.strokeStyle = isHead ? this.colors.headStroke : this.colors.bodyStroke;
      this.ctx.stroke();

      this.ctx.restore();
    };

    const head = snake.body[0];
    drawSegment(head, true);

    // Eyes on head (based on direction)
    const centerX = head.x * this.gridSize + this.gridSize / 2;
    const centerY = head.y * this.gridSize + this.gridSize / 2;
    const eyeOffset = this.gridSize * 0.18;
    const eyeR = Math.max(2, Math.floor(this.gridSize * 0.09));

    let ex1 = centerX, ey1 = centerY, ex2 = centerX, ey2 = centerY;
    switch (snake.direction) {
      case 'up':
        ex1 = centerX - eyeOffset;
        ex2 = centerX + eyeOffset;
        ey1 = ey2 = centerY - eyeOffset;
        break;
      case 'down':
        ex1 = centerX - eyeOffset;
        ex2 = centerX + eyeOffset;
        ey1 = ey2 = centerY + eyeOffset;
        break;
      case 'left':
        ey1 = centerY - eyeOffset;
        ey2 = centerY + eyeOffset;
        ex1 = ex2 = centerX - eyeOffset;
        break;
      case 'right':
      default:
        ey1 = centerY - eyeOffset;
        ey2 = centerY + eyeOffset;
        ex1 = ex2 = centerX + eyeOffset;
        break;
    }

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255,255,255,0.9)';
    this.ctx.beginPath();
    this.ctx.arc(ex1, ey1, eyeR, 0, Math.PI * 2);
    this.ctx.arc(ex2, ey2, eyeR, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = 'rgba(3, 12, 10, 0.9)';
    this.ctx.beginPath();
    this.ctx.arc(ex1 + eyeR * 0.25, ey1 + eyeR * 0.2, Math.max(1, Math.floor(eyeR * 0.55)), 0, Math.PI * 2);
    this.ctx.arc(ex2 + eyeR * 0.25, ey2 + eyeR * 0.2, Math.max(1, Math.floor(eyeR * 0.55)), 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    // Body segments
    snake.body.slice(1).forEach(segment => drawSegment(segment, false));
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
