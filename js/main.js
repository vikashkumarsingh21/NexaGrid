/* ============================================================
   NexaGrid — main.js
   Navigation, animations, counters, canvas, FAQ, scroll reveal
   ============================================================ */

'use strict';

/* ---- Navbar ---- */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ---- Hero Canvas (dot grid) ---- */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, dots = [], mouse = { x: -999, y: -999 };
  const DOT_SPACING = 42;
  const DOT_RADIUS  = 1.4;
  const CONNECT_DIST = 120;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildDots();
  }

  function buildDots() {
    dots = [];
    const cols = Math.ceil(W / DOT_SPACING) + 1;
    const rows = Math.ceil(H / DOT_SPACING) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          x: c * DOT_SPACING,
          y: r * DOT_SPACING,
          ox: c * DOT_SPACING,
          oy: r * DOT_SPACING,
          vx: 0, vy: 0,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
  }

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame += 0.008;

    dots.forEach(d => {
      // Gentle ambient drift
      d.x = d.ox + Math.sin(frame + d.phase) * 3;
      d.y = d.oy + Math.cos(frame + d.phase * 1.3) * 3;

      // Mouse repulsion
      const dx = d.x - mouse.x, dy = d.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        const force = (80 - dist) / 80;
        d.x += dx / dist * force * 18;
        d.y += dy / dist * force * 18;
      }

      // Draw dot
      const alpha = 0.15 + (dist < 150 ? (150 - Math.min(dist, 150)) / 150 * 0.45 : 0);
      ctx.beginPath();
      ctx.arc(d.x, d.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(91,110,245,${alpha})`;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i], b = dots[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECT_DIST) {
          const alpha = (1 - d / CONNECT_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(91,110,245,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  draw();
})();

/* ---- Scroll Reveal ---- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();






/* ---- Active nav link ---- */
(function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === 'index.html' && href === '#')) {
      link.classList.add('active');
    }
  });
})();

/* ---- Sticky CTA mini bar (optional: shows after hero passes) ---- */
(function initStickyCTA() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const io = new IntersectionObserver(entries => {
    // Could toggle a bottom sticky bar here — kept minimal for performance
  }, { threshold: 0 });

  io.observe(hero);
})();