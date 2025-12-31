export class WelcomeScreen {
  // Affiche un overlay d'accueil qui renvoie le pseudo saisi
  // Retourne une Promise qui résout le pseudo (string)
  static show() {
    return new Promise(resolve => {
      const overlay = document.getElementById('welcome-screen');
      const input = document.getElementById('player-name');
      const startBtn = document.getElementById('welcome-start');
      const easyBtn = document.getElementById('easy');
      const medBtn = document.getElementById('medium');
      const hardBtn = document.getElementById('hard');

      if (!overlay || !input || !startBtn || !easyBtn || !medBtn || !hardBtn) {
        resolve({ name: 'Player', speed: 150, growth: 2 });
        return;
      }

      // On montre l'overlay
      overlay.style.display = 'flex';
      input.value = '';
      input.focus();

      // difficulté par défaut
      let selected = medBtn;
      function select(btn) {
        [easyBtn, medBtn, hardBtn].forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selected = btn;
      }
      // sélectionner par défaut le mode moyen
      select(medBtn);

      function start() {
        let name = input.value.trim();
        if (!name) name = 'Player';
        // Récupérer les valeurs de vitesse et de croissance depuis les attributs data
        const speed = Number(selected.dataset.speed) || 150;
        const growth = Number(selected.dataset.growth) || 2;
        overlay.style.display = 'none';
        cleanup();
        resolve({ name, speed, growth });
      }

      function onKey(e) {
        if (e.key === 'Enter') start();
      }

      function cleanup() {
        startBtn.removeEventListener('click', start);
        input.removeEventListener('keydown', onKey);
        easyBtn.removeEventListener('click', onEasy);
        medBtn.removeEventListener('click', onMed);
        hardBtn.removeEventListener('click', onHard);
      }

      function onEasy() { select(easyBtn); }
      function onMed() { select(medBtn); }
      function onHard() { select(hardBtn); }

      startBtn.addEventListener('click', start);
      input.addEventListener('keydown', onKey);
      easyBtn.addEventListener('click', onEasy);
      medBtn.addEventListener('click', onMed);
      hardBtn.addEventListener('click', onHard);
    });
  }
}