# SNAKEFINAL

Petit jeu Snake en JavaScript (module ESM). Améliorations : commentaires en français, gestion du score centralisée, et fix d'import circulaire.

Exécution locale

- Ouvrir `index.html` directement dans un navigateur moderne (Chrome/Edge/Firefox). Si vous avez des problèmes de modules ou de chargement d'images, lancez un serveur HTTP simple :

PowerShell (npx http-server si Node installé) :

```powershell
cd C:\Users\sokhn\Downloads\projects\SNAKEFINAL
npx http-server -c-1
```

Ou avec Python 3 (serveur simple) :

```powershell
cd C:\Users\sokhn\Downloads\projects\SNAKEFINAL
python -m http.server 8000
```

Puis ouvrez `http://localhost:8000` dans votre navigateur.

Notes importantes

- Le pseudo est demandé au démarrage via `prompt()`.
- Le score est sauvegardé dans `localStorage` à la fin d'une partie et les 5 meilleurs scores sont affichés.
- Si vous voulez que je modifie le style (CSS) ou le comportement (vitesse, dimensions, images), dis-moi ce que tu souhaites.
