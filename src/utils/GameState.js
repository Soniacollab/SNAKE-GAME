// Gestion de l'état du jeu
 
export class GameState {
  constructor() {
    this.reset();
  }

  // Réinitialise l'état du jeu
  reset() {
    this.score = 0;
    this.isGameOver = false;
  }

  // Incrémente le score
  incrementScore(points = 10) {
    this.score += points;
  }

  // Récupère le score actuel
  getScore() {
    return this.score;
  }

  // Définit l'état de fin de jeu
  setGameOver(value) {
    this.isGameOver = value;
  }

  // Vérifie si le jeu est terminé
  isOver() {
    return this.isGameOver;
  }
}