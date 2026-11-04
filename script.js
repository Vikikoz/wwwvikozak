// Logique du carrousel. Les projets sont définis dans projets.js.

// ignore les projets sans image
for (let i = projects.length - 1; i >= 0; i--) {
  if (!projects[i].images.length) projects.splice(i, 1);
}

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
  li.addEventListener("click", () => {
    if (moved) return;
    if (i === active && view === "list") openLB(i); else go(i); // photo active → plein écran
  });
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
let lbOpen = false; // visionneuse ouverte → carrousel à l'arrêt

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
  if (document.hidden || lbOpen) return;
  timer = setInterval(() => go(active + 1), AUTO_MS);
}
document.addEventListener("visibilitychange", restartAuto);

// clavier
addEventListener("keydown", e => {
  if (view === "gallery" || lbOpen) return;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") go(active + 1);
  if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(active - 1);
});
$("next").onclick = () => go(active + 1);
$("prev").onclick = () => go(active - 1);

// molette (verticale ou horizontale → navigation), verrouillée le temps de la transition
let lock = false;
addEventListener("wheel", e => {
  e.preventDefault();
  if (lock || view === "gallery" || lbOpen) return;
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

// ---------- visionneuse plein écran ----------
const lb = $("lb"), lbStage = $("lbStage"), lbImg = $("lbImg");
let lbIdx = 0, s = 1, tx = 0, ty = 0;
const MAXZ = 6;
const clampN = (v, a, b) => Math.min(b, Math.max(a, v));

function lbApply() {
  lbImg.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
}
function lbClamp() {
  const mx = Math.max(0, (lbImg.offsetWidth * s - lbStage.clientWidth) / 2);
  const my = Math.max(0, (lbImg.offsetHeight * s - lbStage.clientHeight) / 2);
  tx = clampN(tx, -mx, mx);
  ty = clampN(ty, -my, my);
  if (s <= 1) { tx = 0; ty = 0; }
}
// zoom autour d'un point de l'écran (cx, cy)
function lbZoom(ns, cx, cy, smooth = false) {
  ns = clampN(ns, 1, MAXZ);
  const r = lbStage.getBoundingClientRect();
  const px = cx - (r.left + r.width / 2), py = cy - (r.top + r.height / 2);
  const k = ns / s;
  tx = px - (px - tx) * k;
  ty = py - (py - ty) * k;
  s = ns;
  lbClamp();
  if (smooth) { lbImg.classList.add("smooth"); setTimeout(() => lbImg.classList.remove("smooth"), 280); }
  lbApply();
}
const lbCenter = () => { const r = lbStage.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

function lbLoad() {
  const im = images[lbIdx];
  s = 1; tx = 0; ty = 0; lbApply();
  lbImg.classList.add("loading");
  lbImg.onload = () => lbImg.classList.remove("loading");
  lbImg.src = im.img;
  lbImg.alt = projects[im.p].title;
  $("lbCount").textContent = `${projects[im.p].title} — ${pad(lbIdx + 1)}/${pad(images.length)}`;
  const next = new Image(); next.src = images[(lbIdx + 1) % images.length].img; // précharge
}
function lbNav(d) {
  lbIdx = (lbIdx + d + images.length) % images.length;
  lbLoad();
}
function openLB(i) {
  lbOpen = true;
  clearInterval(timer);
  lbIdx = i;
  lbLoad();
  lb.classList.add("open");
  lb.setAttribute("aria-hidden", "false");
}
function closeLB() {
  if (!lbOpen) return;
  lbOpen = false;
  lb.classList.remove("open");
  lb.setAttribute("aria-hidden", "true");
  if (lbIdx !== active) go(lbIdx); else restartAuto(); // le carrousel suit la dernière image vue
}

$("lbClose").onclick = closeLB;
$("lbPrev").onclick = () => lbNav(-1);
$("lbNext").onclick = () => lbNav(1);
$("lbIn").onclick = () => lbZoom(s * 1.6, ...lbCenter(), true);
$("lbOut").onclick = () => lbZoom(s / 1.6, ...lbCenter(), true);
$("lbReset").onclick = () => lbZoom(1, ...lbCenter(), true);

// molette = zoom
lbStage.addEventListener("wheel", e => {
  e.preventDefault();
  lbZoom(s * Math.exp(-e.deltaY * 0.0018), e.clientX, e.clientY);
}, { passive: false });

// clavier
addEventListener("keydown", e => {
  if (!lbOpen) return;
  if (e.key === "Escape") closeLB();
  else if (e.key === "ArrowRight") lbNav(1);
  else if (e.key === "ArrowLeft") lbNav(-1);
  else if (e.key === "+" || e.key === "=") lbZoom(s * 1.4, ...lbCenter(), true);
  else if (e.key === "-") lbZoom(s / 1.4, ...lbCenter(), true);
  else if (e.key === "0") lbZoom(1, ...lbCenter(), true);
});

// souris / doigts : déplacer (zoomé), balayer (non zoomé), pincer, double-tap
const pts = new Map();
let g = null, pinch = null, pinched = false, lastTap = { t: 0, x: 0, y: 0 };
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

lbStage.addEventListener("pointerdown", e => {
  lbStage.setPointerCapture(e.pointerId);
  pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pts.size === 2) {
    const [a, b] = [...pts.values()];
    pinch = { d: dist(a, b), s };
    pinched = true;
  }
  g = { x: e.clientX, y: e.clientY, tx, ty, t: Date.now() };
});
lbStage.addEventListener("pointermove", e => {
  if (!pts.has(e.pointerId)) return;
  pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pts.size === 2 && pinch) {
    const [a, b] = [...pts.values()];
    lbZoom(pinch.s * (dist(a, b) / pinch.d), (a.x + b.x) / 2, (a.y + b.y) / 2);
  } else if (pts.size === 1 && s > 1 && g) {
    tx = g.tx + (e.clientX - g.x);
    ty = g.ty + (e.clientY - g.y);
    lbClamp(); lbApply();
  }
});
const lbUp = e => {
  if (!pts.has(e.pointerId)) return;
  pts.delete(e.pointerId);
  if (pts.size === 1) { const p = [...pts.values()][0]; g = { x: p.x, y: p.y, tx, ty, t: Date.now() }; }
  if (pts.size > 0) return;
  pinch = null;
  if (pinched) { pinched = false; g = null; return; }
  if (!g) return;
  const dx = e.clientX - g.x, dy = e.clientY - g.y;
  const tap = Math.hypot(dx, dy) < 8 && Date.now() - g.t < 400;
  if (s <= 1 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    lbNav(dx < 0 ? 1 : -1);               // balayage horizontal = image suivante / précédente
  } else if (tap) {
    const now = Date.now();
    if (now - lastTap.t < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30) {
      lbZoom(s > 1 ? 1 : 2.5, e.clientX, e.clientY, true);  // double clic / double tap
      lastTap.t = 0;
    } else {
      lastTap = { t: now, x: e.clientX, y: e.clientY };
      if (e.target === lbStage) closeLB();  // tap sur le fond noir = fermer
    }
  }
  g = null;
};
lbStage.addEventListener("pointerup", lbUp);
lbStage.addEventListener("pointercancel", lbUp);
addEventListener("resize", () => { if (lbOpen) { lbClamp(); lbApply(); } });

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
