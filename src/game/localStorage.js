// Fonctions utilitaires pour gérer les meilleurs scores dans localStorage

function saveScore(newScore) {
    // Récupérer la liste existante ou initialiser
    const scores = JSON.parse(localStorage.getItem('highScores')) || [];

    // Ajouter le nouveau score
    scores.push(newScore);

    // Éviter les doublons basés sur la valeur du score
    const uniqueScores = scores.filter((value, index, self) =>
        index === self.findIndex((s) => s.score === value.score)
    );

    // Trier par score décroissant et conserver les 5 premiers
    uniqueScores.sort((a, b) => b.score - a.score);
    const top5scores = uniqueScores.slice(0, 5);

    // Enregistrer dans localStorage
    localStorage.setItem('highScores', JSON.stringify(top5scores));
}

function getHighScores() {
    return JSON.parse(localStorage.getItem('highScores')) || [];
}

function displayHighScores() {
    const highScoresList = document.getElementById('high-scores-list');
    const scores = getHighScores();

    // Vider la liste et remplir avec les meilleurs scores
    highScoresList.innerHTML = '';
    scores.forEach((result) => {
        const li = document.createElement('li');
        li.textContent = `${result.surname} : ${result.score} pts`;
        highScoresList.appendChild(li);
    });
}

export { saveScore, getHighScores, displayHighScores };
