# Portfolio Viktor Kozak — guide de mise à jour

Site statique : pas d'installation, pas de serveur. Ouvre `index.html` dans un navigateur pour voir le résultat.

## Structure

```
wwwvikozak/
├─ index.html     structure de la page (contact, boutons…)
├─ style.css      apparence (couleurs, tailles de texte…)
├─ projets.js     ← LA LISTE DES PROJETS (le fichier à modifier le plus souvent)
├─ script.js      logique du carrousel / galerie (à ne pas toucher)
└─ img/
   ├─ projet-01/  images du projet 1
   ├─ projet-02/  images du projet 2
   └─ …
```

> Un site statique ne peut pas lire le contenu d'un dossier : les dossiers servent à ranger les fichiers, mais c'est la liste dans `projets.js` qui déclare les projets et les images.

## Règles pour les images

- Format : `.jpg` ou `.webp`, ratio **4/3** (ex. 1600×1200 px). Un autre ratio est recadré.
- Poids : moins de 500 Ko par image.
- Nom : minuscules, sans espaces ni accents, numérotées sur deux chiffres : `01.jpg`, `02.jpg`…
- Respecte exactement le nom et la casse écrits dans `projets.js` (`01.JPG` ≠ `01.jpg`).

## Projets vides

Un projet dont `images: []` est vide est ignoré (il n'apparaît pas sur le site). Tu peux donc garder des blocs prêts et ajouter les chemins des images quand elles sont là.

## Templates à copier-coller

### Ajouter un projet
1. Crée le dossier `img/projet-08/` (numéro suivant) et mets-y tes images.
2. Colle ce bloc **à la fin** de la liste `projects` dans `projets.js` (avant le `];`) :

```js
  {
    title: "Titre du projet",
    cat: "Catégorie",
    year: "2025",
    images: [
      "img/projet-08/01.jpg",
      "img/projet-08/02.jpg",
    ],
  },
```

### Ajouter une image à un projet existant
1. Mets le fichier dans le dossier du projet (ex. `img/projet-03/04.jpg`).
2. Ajoute une ligne dans le tableau `images` de ce projet :

```js
      "img/projet-03/04.jpg",
```

### Supprimer une image ou un projet
Supprime la ligne de l'image (ou le bloc `{ … },` du projet) dans `projets.js`. Tu peux ensuite supprimer le fichier du dossier.

### Changer l'ordre
L'ordre dans `projets.js` = l'ordre dans la liste de gauche, le carrousel et la galerie. Déplace les lignes ou les blocs.

### Renommer un projet / changer catégorie ou année
Modifie `title`, `cat` ou `year` dans le bloc du projet.

## Ce qui se met à jour tout seul

Après toute modification de `projets.js`, recharge la page (`Ctrl + F5`) : la liste de gauche, le carrousel, la grille de la galerie (colonnes et tailles recalculées), le compteur `01/30` et les repères d'angle s'adaptent au nombre de projets et d'images.

Limite : la galerie n'a pas de scroll. Au-delà d'environ 60 images, les vignettes deviennent très petites.

## Autres réglages

| Quoi | Où |
|---|---|
| Vitesse du défilement automatique | `script.js` : `AUTO_MS` (en millisecondes, 5000 = 5 s) |
| Taille des textes | `style.css` : `font-size` du `body`, `.credit` pour « Conçu par » |
| Numéro de téléphone, email, Instagram | `index.html` : bloc `contact__list` (téléphone, email, Instagram) |
| Nom en haut à gauche | `index.html` : `<span class="brand">` |
| Couleurs | `style.css` : variables `--bg`, `--ink`, `--mute` en haut du fichier |

## Mettre en ligne (GitHub Pages)

1. Mets tous les fichiers à la racine du dépôt (`index.html` à la racine).
2. `git add . && git commit -m "Mise à jour" && git push`
3. Sur GitHub : Settings → Pages → branche `main`, dossier `/ (root)`.

## Dépannage

- **Image grise / vide** : le chemin dans `projets.js` ne correspond pas au fichier (nom, casse, extension).
- **Page blanche** : erreur de syntaxe dans `projets.js` (virgule ou accolade oubliée). Ouvre la console du navigateur (`F12`) pour voir la ligne.
- **Modification invisible** : rafraîchis sans cache avec `Ctrl + F5`.
