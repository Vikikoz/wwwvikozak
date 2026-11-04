// ============================================================
//  PROJETS — seul fichier à modifier pour mettre le site à jour.
//  Voir README.md pour les modèles à copier-coller.
//
//  Modèle d'un projet (à copier dans la liste `projects`) :
//  {
//    title: "Nom du projet",
//    cat:   "Photographie",
//    year:  "2025",
//    images: [
//      "img/projet-01/01.jpg",
//      "img/projet-01/02.jpg",
//    ],
//  },
// ============================================================

// ---- DONNÉES DE TEST (7 projets, 30 images générées) ----
// Pour passer à tes vraies images : supprime tout ce bloc jusqu'à
// « FIN DES DONNÉES DE TEST » et remplace-le par la liste du README.
const CATS = ["Photographie", "Cartographie", "Branding", "Web design", "SIG"];
const placeholder = (i, n) => {
  const h = Math.round((i * 360) / n);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${h},35%,82%)"/><stop offset="1" stop-color="hsl(${(h + 50) % 360},40%,52%)"/>
    </linearGradient></defs>
    <rect width="400" height="300" fill="url(#g)"/>
    <circle cx="${90 + (i * 37) % 220}" cy="${90 + (i * 53) % 120}" r="${40 + (i * 7) % 40}" fill="#fff" fill-opacity=".35"/>
    <text x="24" y="276" font-family="monospace" font-size="34" fill="#000" fill-opacity=".55">${String(i + 1).padStart(2, "0")}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
};
// Un projet = plusieurs images. Pour tes vraies images, remplace `placeholder(...)`
// par des chemins, ex. images: ["img/projet-1/a.jpg", "img/projet-1/b.jpg"].
const COUNTS = [6, 4, 5, 3, 5, 4, 3]; // nombre d'images par projet (total 30)
const N = COUNTS.reduce((a, b) => a + b, 0);
let n0 = 0;
const projects = COUNTS.map((c, pi) => ({
  title: `Projet ${String(pi + 1).padStart(2, "0")}`,
  cat: CATS[pi % CATS.length],
  year: String(2025 - Math.floor(pi / 3)),
  images: Array.from({ length: c }, () => placeholder(n0++, N)),
}));
// ---- FIN DES DONNÉES DE TEST ----
