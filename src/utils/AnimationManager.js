// Gestion des animations et des interpolations
export class AnimationManager {
  static lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }

  // Fonction d'interpolation avec easing (accélération/décélération)
  static easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
}