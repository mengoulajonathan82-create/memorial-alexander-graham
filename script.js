'use strict';
const $ = (id) => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

/* 1. Apparition au défilement */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

/* 2. Épitaphe interactive */
const epitaph = $('epitaph');
epitaph.addEventListener('click', () =>
  epitaph.setAttribute('aria-expanded', epitaph.getAttribute('aria-expanded') !== 'true'));

/* 3. Bougie du souvenir
   Compteur de base simulé (GitHub Pages n'a pas de serveur) + bougies allumées sur cet appareil. */
const BASE_COUNT = 41;
const candle = $('candle'), lightBtn = $('lightBtn'), countEl = $('count'), thanks = $('thanks');
let lit = store.get('candleLit', false);
let total = BASE_COUNT + (lit ? 1 : 0);

function render(bump) {
  countEl.textContent = total;
  if (bump) { countEl.classList.remove('bump'); void countEl.offsetWidth; countEl.classList.add('bump'); }
  if (lit) {
    candle.classList.add('lit');
    lightBtn.disabled = true;
    lightBtn.textContent = 'Bougie allumée';
  }
}
lightBtn.addEventListener('click', () => {
  if (lit) return;
  lit = true; total += 1;
  store.set('candleLit', true);
  render(true);
  thanks.textContent = 'Votre bougie a été allumée avec succès. Merci pour votre pensée.';
});
render(false);
if (lit) thanks.textContent = 'Votre bougie brille déjà pour Alexander. Merci.';

/* 4. Lightbox */
const lb = $('lightbox'), lbImg = $('lbImg');
let lastFocus = null;
function openLb(src, alt) {
  lastFocus = document.activeElement;
  lbImg.src = src; lbImg.alt = alt;
  lb.hidden = false;
  requestAnimationFrame(() => lb.classList.add('open'));
  $('close').focus();
  document.body.style.overflow = 'hidden';
}
function closeLb() {
  lb.classList.remove('open');
  setTimeout(() => { lb.hidden = true; lbImg.removeAttribute('src'); }, 350);
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}
document.querySelectorAll('.thumb').forEach((t) =>
  t.addEventListener('click', () => openLb(t.dataset.full, t.querySelector('img').alt)));
$('close').addEventListener('click', closeLb);
lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

/* 5. Livre d'or (DOM dynamique, sauvegardé localement) */
const list = $('messages');
const seed = [
  { name: 'Marie L.', text: 'Merci pour tout, Alexander. Ton sourire nous accompagne.', date: '12 nov. 2024' },
  { name: 'Thomas', text: 'Un homme bon, un ami fidèle. Repose en paix.', date: '5 nov. 2024' }
];
function addMessage(m, animate) {
  const li = document.createElement('li');
  if (animate) li.className = 'new';
  const strong = document.createElement('strong'); strong.textContent = m.name;
  const time = document.createElement('time'); time.textContent = m.date;
  const p = document.createElement('p'); p.textContent = m.text;   // textContent : pas d'injection HTML
  li.append(strong, time, p);
  list.prepend(li);
}
[...seed, ...store.get('guestbook', [])].forEach((m) => addMessage(m, false));

$('bookForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('name').value.trim(), text = $('msg').value.trim();
  if (!name || !text) return;
  const m = { name, text, date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) };
  addMessage(m, true);
  store.set('guestbook', [...store.get('guestbook', []), m]);
  e.target.reset();
});
