export class Food {

  constructor() {
    // Position initiale de la nourriture
    this.position = { x: 0, y: 0 };

    // Liste d'images représentant différents aliments
    this.images = [
      './img/pomme.png',
      './img/mango.png',
      './img/fraise.png',
      './img/pineapple.png',
      './img/grape.png'
    ];

    // Image courante utilisée pour l'affichage
    this.currentImage = this.images[0];

  }

  generateFood(width, height, snake) {

    do {

      // Générer une position aléatoire sur la grille
      this.position.x = Math.floor(Math.random() * width);
      this.position.y = Math.floor(Math.random() * height);

      // Choisir aléatoirement une image pour la nourriture
      this.currentImage = this.images[Math.floor(Math.random() * this.images.length)];

      // Vérifier qu'on ne génère pas la nourriture sur le serpent
    } while (snake.body.some(segment =>
        segment.x === this.position.x && segment.y === this.position.y
      ));
  }



}
