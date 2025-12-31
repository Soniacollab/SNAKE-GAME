export class Snake {

  constructor() {
    // Position initiale du serpent (tableau de segments)
    this.body = [{ x: 10, y: 10 }];

    // Direction initiale
    this.direction = 'right';

    // Nombre de segments à ajouter lorsque le serpent mange
    this.growing = 0; // Par défaut, pas de croissance

  }

  move() {
    // Position courante de la tête
    const head = { ...this.body[0] };

    // Calcul de la nouvelle position selon la direction
    switch (this.direction) {
      case 'up':
        head.y--;
        break;
      case 'down':
        head.y++;
        break;
      case 'left':
        head.x--;
        break;
      case 'right':
        head.x++;
        break;
    }


    // Ajouter la nouvelle tête au début du tableau
    this.body.unshift(head);

    this.maintainSize();


  }

  maintainSize() {
    // Si le serpent doit grandir, décrémente le compteur de croissance
    if (this.growing > 0) {
      this.growing--;
    }

    // Sinon, retirer la dernière case (queue)
    else {
      this.body.pop();
    }
  }

  grow() {

    // Augmente le compteur pour ajouter un segment
    this.growing += 1;
  }

  checkCollision(width, height) {

    // Récupère la position de la tête
    const head = this.body[0];

    // Collision avec les murs
    if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
      return true; // The head is out of bounds
    }

    // Collision avec le corps (vérifier les segments sauf la tête)
    return this.body.slice(1).some(segment =>
      segment.x === head.x && segment.y === head.y
    );
  }


  // change Direction
  changeDirection(direction) {
    // Define opposite directions to prevent the snake from turning back
    const opposites = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };

    // Empêcher de faire demi-tour si le serpent comporte plusieurs segments
    if (this.body.length > 1 && direction === opposites[this.direction]) {
      return;
    }

    // Update the direction
    this.direction = direction;
  }


  // Draw the snake head
  draw(ctx, gridSize) {
    ctx.fillStyle = '#00ff00';
    const head = this.body[0];
    ctx.beginPath();
    ctx.arc(
      head.x * gridSize + gridSize / 2,
      head.y * gridSize + gridSize / 2,
      gridSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw the snake body
    ctx.fillStyle = '#00cc00';
    this.body.slice(1).forEach(segment => {
      ctx.fillRect(
        segment.x * gridSize,
        segment.y * gridSize,
        gridSize - 1,
        gridSize - 1
      );
    });
  }

}
