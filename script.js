// ---------- Theme toggle ----------
const root = document.documentElement;
document.getElementById('themeBtn').addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
  drawStars();
});

// ---------- Starfield ----------
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.round((innerWidth * innerHeight) / 5500);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.3 + 0.2,
    a: Math.random() * 0.7 + 0.15,
    s: Math.random() * 0.15 + 0.02,
    t: Math.random() * Math.PI * 2,
  }));
  drawStars();
}

function drawStars() {
  const rgb = getComputedStyle(root).getPropertyValue('--star').trim();
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const s of stars) {
    const tw = 0.6 + 0.4 * Math.sin(s.t);
    ctx.fillStyle = `rgba(${rgb},${s.a * tw})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function tick() {
  for (const s of stars) {
    s.t += 0.02;
    s.y -= s.s;
    if (s.y < -2) { s.y = innerHeight + 2; s.x = Math.random() * innerWidth; }
  }
  drawStars();
  requestAnimationFrame(tick);
}

addEventListener('resize', resize);
resize();
if (!reduceMotion) requestAnimationFrame(tick);

// ---------- Reveal on scroll ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// ---------- Active nav state ----------
const navLinks = [...document.querySelectorAll('.nav-btn')];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href')));
const navIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach((s) => s && navIO.observe(s));

// ---------- Architecture diagrams: trace path on hover ----------
document.querySelectorAll('[data-flow]').forEach((diagram) => {
  const rows = [...diagram.querySelectorAll('.d-row')];
  diagram.querySelectorAll('.node').forEach((node) => {
    node.addEventListener('mouseenter', () => {
      const idx = rows.indexOf(node.closest('.d-row'));
      rows.forEach((row, i) => {
        row.querySelectorAll('.node').forEach((n) => n.classList.toggle('lit', i < idx ? !n.classList.contains('alt') : n === node));
      });
    });
  });
  diagram.addEventListener('mouseleave', () => diagram.querySelectorAll('.lit').forEach((n) => n.classList.remove('lit')));
});

// ---------- Quick contact panel ----------
const chatBtn = document.getElementById('chatBtn');
const chatPanel = document.getElementById('chatPanel');
chatBtn.addEventListener('click', () => {
  const open = chatPanel.hidden;
  chatPanel.hidden = !open;
  chatBtn.setAttribute('aria-expanded', String(open));
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { chatPanel.hidden = true; chatBtn.setAttribute('aria-expanded', 'false'); } });

document.getElementById('year').textContent = new Date().getFullYear();
