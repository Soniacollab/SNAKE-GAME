# SNAKEFINAL

Jeu Snake en JavaScript (ES Modules) avec écran d’accueil (pseudo + difficulté), HUD (Score / Temps / Niveau) et tableau des meilleurs scores (localStorage).

## Démo locale

Le jeu utilise des imports ES (`type="module"`) → il est recommandé de lancer un petit serveur HTTP (ouvrir le fichier HTML “en local” peut bloquer les modules selon le navigateur).

### Option 1 — Serveur rapide (Node)

```powershell
cd C:\Users\sokhn\Downloads\projects\SNAKEFINAL
npx --yes http-server -p 8080 -c-1
```

Puis ouvrir : `http://127.0.0.1:8080/`

### Option 2 — Si vous servez tout le dossier `projects/`

```powershell
cd C:\Users\sokhn\Downloads\projects
npx --yes http-server -p 8080 -c-1
```

Puis ouvrir : `http://127.0.0.1:8080/SNAKEFINAL/`

## Contrôles

- Flèches : déplacer le serpent
- Espace : pause / reprise, et rejouer après un Game Over
- Entrée (sur l’écran d’accueil) : lancer la partie

## Fonctionnalités

- Écran d’accueil : pseudo + choix de difficulté (vitesse / croissance)
- HUD : score, temps, niveau
- Meilleurs scores : sauvegarde locale via `localStorage`

## Structure

- `index.html` : layout + overlays
- `assets/style.css` : styles
- `main.js` : boot + boucle de jeu
- `src/game/*` : logique (Game / Snake / Food / Renderer)
- `src/ui/WelcomeScreen.js` : écran d’accueil

## Notes

- Les scores sont stockés uniquement dans le navigateur (aucun envoi en ligne).
- Les assets (images) sont dans `img/`.
