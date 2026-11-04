// Logique du carrousel. Les projets sont définis dans projets.js.

// liste à plat de toutes les images (ordre du carrousel / de la galerie)
const images = projects.flatMap((p, pi) => p.images.map(img => ({ p: pi, img })));
// index de la première image de chaque projet
const firstOf = projects.map((_, pi) => images.findIndex(x => x.p === pi));

const track = document.getElementById("track");
const stage = document.querySelector(".stage");
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, "0");
const mobileMQ = matchMedia("(max-width: 720px)");
let active = 0;

images.forEach((im, i) => {
  const p = projects[im.p];
  const li = document.createElement("li");
  li.className = "slide";
  li.dataset.i = i;
  li.innerHTML = im.img
    ? `<img src="${im.img}" alt="${p.title}" draggable="false">`
    : `<span class="ph">${pad(i + 1)}</span>`;
  li.addEventListener("click", () => { if (!moved) go(i); });
  track.appendChild(li);
});
const slides = [...track.children];

const vars = () => {
  const cs = getComputedStyle(slides[0]);
  const gap = parseFloat(getComputedStyle(track).columnGap) || 18;
  // largeur cible calculée depuis la variable --w
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;visibility:hidden;width:var(--w)";
  document.body.appendChild(probe);
  const W = probe.getBoundingClientRect().width;
  probe.remove();
  return { W, w: W * 0.26, gap };
};

function layout(animate = true) {
  const { W, w, gap } = vars();
  const vertical = !mobileMQ.matches; // PC = vertical, téléphone = horizontal
  // taille sur l'axe du carrousel (hauteur en 4/3 si vertical)
  const k = vertical ? 0.75 : 1;
  // centre de la slide active = somme des tailles avant + gaps + moitié de l'active
  const x = active * (w * k + gap) + (W * k) / 2;
  const offset = (vertical ? window.innerHeight : window.innerWidth) / 2 - x;
  track.style.transition = animate ? "" : "none";
  track.style.transform = vertical
    ? `translate3d(-50%,${offset}px,0)`
    : `translate3d(${offset}px,-50%,0)`;
  $("prev").textContent = vertical ? "↑" : "←";
  $("next").textContent = vertical ? "↓" : "→";
  if (!animate) requestAnimationFrame(() => (track.style.transition = ""));
  slides.forEach((s, i) => s.classList.toggle("is-active", i === active));
}

// liste à gauche
const plist = $("plist");
const items = projects.map((p, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = p.title;
  b.onclick = () => go(firstOf[i]);
  plist.appendChild(b);
  return b;
});

// galerie (vue grille, sans scroll)
const gallery = $("gallery");
const grid = document.createElement("div");
grid.className = "gal-grid";
images.forEach((im, i) => {
  const p = projects[im.p];
  const t = document.createElement("div");
  t.className = "slide";
  t.title = p.title;
  t.innerHTML = im.img
    ? `<img src="${im.img}" alt="${p.title}" draggable="false">`
    : `<span class="ph">${pad(i + 1)}</span>`;
  t.onclick = () => { go(i); setView("list"); };
  grid.appendChild(t);
});
const frame = document.createElement("div");
frame.className = "gal-frame";
grid.appendChild(frame);
gallery.appendChild(grid);

// place les repères d'angle autour de la vignette active
// dimensionne la grille pour que TOUTES les vignettes tiennent à l'écran (sans scroll)
function fitGallery() {
  const n = images.length, gap = 18, mobile = mobileMQ.matches;
  const AW = innerWidth * (mobile ? 0.88 : 0.6);
  const AH = innerHeight - (mobile ? 200 : 238);
  let best = { s: 0, c: 1 };
  for (let c = 1; c <= n; c++) {
    const rows = Math.ceil(n / c);
    const s = Math.min((AW - gap * (c - 1)) / c, ((AH - gap * (rows - 1)) / rows) * 4 / 3);
    if (s > best.s) best = { s, c };
  }
  grid.style.gridTemplateColumns = `repeat(${best.c}, ${best.s}px)`;
  grid.style.width = "auto";
}

function frameTo() {
  fitGallery();
  const t = grid.querySelectorAll(".slide")[active];
  if (!t) return;
  const m = 10; // marge autour de l'image
  frame.style.left = t.offsetLeft - m + "px";
  frame.style.top = t.offsetTop - m + "px";
  frame.style.width = t.offsetWidth + 2 * m + "px";
  frame.style.height = t.offsetHeight + 2 * m + "px";
}

// bascule LIST / GALLERY (droite)
const toggles = document.querySelectorAll(".viewtog button");
function setView(v) {
  view = v;
  gallery.classList.toggle("open", v === "gallery");
  toggles.forEach(b => b.classList.toggle("on", b.dataset.view === v));
}
toggles.forEach(b => (b.onclick = () => setView(b.dataset.view)));

function caption() {
  const p = projects[images[active].p];
  items.forEach((b, i) => b.classList.toggle("on", i === images[active].p));
  document.body.classList.add("swap");
  setTimeout(() => {
    $("count").textContent = `${pad(active + 1)}/${pad(images.length)}`;
    $("num").textContent = `${pad(active + 1)}/${pad(images.length)}`;
    $("title").textContent = p.title;
    $("cat").textContent = p.cat;
    $("year").textContent = p.year;
    document.body.classList.remove("swap");
  }, 150);
}

// relance l'animation des repères d'angle (une fois par changement d'image)
function ping(el) {
  el.classList.remove("pulse");
  void el.offsetWidth; // reflow pour redémarrer l'animation
  el.classList.add("pulse");
}

const AUTO_MS = 5000; // délai entre deux slides (défilement lent)
let timer = null;
let view = "list";

function go(i) {
  const n = images.length;
  active = ((i % n) + n) % n; // boucle : après le dernier → premier
  layout();
  caption();
  frameTo();
  ping(stage);
  ping(frame);
  restartAuto();
}

function restartAuto() {
  clearInterval(timer);
  if (document.hidden) return;
  timer = setInterval(() => go(active + 1), AUTO_MS);
}
document.addEventListener("visibilitychange", restartAuto);

// clavier
addEventListener("keydown", e => {
  if (view === "gallery") return;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") go(active + 1);
  if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(active - 1);
});
$("next").onclick = () => go(active + 1);
$("prev").onclick = () => go(active - 1);

// molette (verticale ou horizontale → navigation), verrouillée le temps de la transition
let lock = false;
addEventListener("wheel", e => {
  e.preventDefault();
  if (lock || view === "gallery") return;
  const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  if (Math.abs(d) < 8) return;
  lock = true;
  go(active + (d > 0 ? 1 : -1));
  setTimeout(() => (lock = false), 550);
}, { passive: false });

// glisser / swipe
let startX = null, moved = false;
const pos = e => (mobileMQ.matches ? e.clientX : e.clientY);
stage.addEventListener("pointerdown", e => { startX = pos(e); moved = false; });
addEventListener("pointermove", e => {
  if (startX !== null && Math.abs(pos(e) - startX) > 6) moved = true;
});
addEventListener("pointerup", e => {
  if (startX === null) return;
  const dx = pos(e) - startX;
  startX = null;
  if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
  setTimeout(() => (moved = false), 0);
});

addEventListener("resize", () => { layout(false); frameTo(); });
document.fonts?.ready.then(() => { layout(false); frameTo(); });
layout(false);
frameTo();
restartAuto();
items[0].classList.add("on");
$("count").textContent = `${pad(1)}/${pad(images.length)}`;
$("num").textContent = `${pad(1)}/${pad(images.length)}`;
$("title").textContent = projects[0].title;
$("cat").textContent = projects[0].cat;
$("year").textContent = projects[0].year;

// curseur personnalisé : croix verticale/horizontale
if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const cur = $("cursor");
  addEventListener("pointermove", e => {
    cur.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
    cur.classList.add("on");
    cur.classList.toggle("hover", !!e.target.closest("a, button, .slide"));
  });
  document.addEventListener("pointerleave", () => cur.classList.remove("on"));
}
