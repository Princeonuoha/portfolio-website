// ---------- Theme toggle ----------
const root = document.documentElement;
document.getElementById('themeBtn').addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
  draw();
});

// ---------- Network background: drifting nodes linked like a cluster ----------
const canvas = document.getElementById('net');
const ctx = canvas.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let nodes = [];
const LINK = 150;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(90, Math.round((innerWidth * innerHeight) / 16000));
  nodes = Array.from({ length: count }, (_, i) => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    r: Math.random() * 1.4 + 0.8,
    hot: i % 9 === 0,
    t: Math.random() * Math.PI * 2,
  }));
  draw();
}

function draw() {
  const cs = getComputedStyle(root);
  const rgb = cs.getPropertyValue('--node').trim();
  const acc = cs.getPropertyValue('--node-accent').trim();
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    for (let k = i + 1; k < nodes.length; k++) {
      const b = nodes[k];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = Math.hypot(dx, dy);
      if (d < LINK) {
        const alpha = (1 - d / LINK) * 0.18;
        ctx.strokeStyle = (a.hot || b.hot) ? `rgba(${acc},${alpha * 1.6})` : `rgba(${rgb},${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
  }
  for (const n of nodes) {
    const pulse = n.hot ? 0.55 + 0.45 * Math.sin(n.t) : 1;
    ctx.fillStyle = n.hot ? `rgba(${acc},${0.9 * pulse})` : `rgba(${rgb},0.35)`;
    ctx.beginPath(); ctx.arc(n.x, n.y, n.hot ? n.r + 1 : n.r, 0, Math.PI * 2); ctx.fill();
  }
}

function tick() {
  for (const n of nodes) {
    n.x += n.vx; n.y += n.vy; n.t += 0.03;
    if (n.x < -20) n.x = innerWidth + 20; else if (n.x > innerWidth + 20) n.x = -20;
    if (n.y < -20) n.y = innerHeight + 20; else if (n.y > innerHeight + 20) n.y = -20;
  }
  draw();
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
