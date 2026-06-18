/* ============================================================
   Axivon Technologies — main.js
   Consolidated Shared Functionality
   ============================================================ */
'use strict';

/* ---- Chatbot Initialization ---- */
(function initChatbot() {
    if (document.getElementById('axvChatRoot')) return; // Already exists
    fetch('chatbot.html')
    .then(res => res.text())
    .then(html => {
        document.body.insertAdjacentHTML('beforeend', html);
        const script = document.createElement('script');
        script.src = 'js/chatbot.js';
        script.defer = true;
        document.body.appendChild(script);
    })
    .catch(err => console.error('Chatbot Load Error:', err));
})();

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
          x: c * DOT_SPACING, y: r * DOT_SPACING,
          ox: c * DOT_SPACING, oy: r * DOT_SPACING,
          vx: 0, vy: 0, phase: Math.random() * Math.PI * 2
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
      d.x = d.ox + Math.sin(frame + d.phase) * 3;
      d.y = d.oy + Math.cos(frame + d.phase * 1.3) * 3;
      const dx = d.x - mouse.x, dy = d.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        const force = (80 - dist) / 80;
        d.x += dx / dist * force * 18;
        d.y += dy / dist * force * 18;
      }
      const alpha = 0.15 + (dist < 150 ? (150 - Math.min(dist, 150)) / 150 * 0.45 : 0);
      ctx.beginPath();
      ctx.arc(d.x, d.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(91,110,245,${alpha})`;
      ctx.fill();
    });

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
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const delayMap = { 'reveal-delay-1': 100, 'reveal-delay-2': 200, 'reveal-delay-3': 300 };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      let delay = 0;
      for (const [cls, ms] of Object.entries(delayMap)) {
        if (el.classList.contains(cls)) { delay = ms; break; }
      }
      setTimeout(() => el.classList.add('revealed'), delay);
      io.unobserve(el);
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
}

/* ---- Active nav link ---- */
function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

/* ---- Mobile Navigation ---- */
function initMobileNav() {
  const navToggle  = document.getElementById('navToggle');
  const navMobile  = document.getElementById('navMobile');
  const navbar     = document.getElementById('navbar');
  if (!navToggle || !navMobile) return;

  function openMenu() {
    navToggle.classList.add('open');
    navMobile.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navToggle.classList.remove('open');
    navMobile.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => navMobile.classList.contains('open') ? closeMenu() : openMenu());
  navMobile.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', e => {
    if (navMobile.classList.contains('open') && !navMobile.contains(e.target) && !navToggle.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMobile.classList.contains('open')) { closeMenu(); navToggle.focus(); }
  });
  if (navbar) {
    window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 30), { passive: true });
  }
}

/* ---- Counters ---- */
function initCounters() {
  const counters = document.querySelectorAll('.pf-stat-number[data-count], .pf-metric-value[data-count], .cs-feat-metric-value[data-count], .pr-stat-num[data-count]');
  if (!counters.length) return;
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function animateCounter(el) {
    const target   = parseFloat(el.dataset.count);
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const duration = 1800;
    const start    = performance.now();
    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = target * easeOut(progress);
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => io.observe(el));
}

/* ---- FAQ Accordion ---- */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;
  function closeAll() {
    items.forEach(item => {
      item.classList.remove('open');
      const q = item.querySelector('.faq-question');
      const a = item.querySelector('.faq-answer');
      if (q) q.setAttribute('aria-expanded', 'false');
      if (a) a.style.maxHeight = '0';
    });
  }
  function openItem(item) {
    const q = item.querySelector('.faq-question');
    const a = item.querySelector('.faq-answer');
    item.classList.add('open');
    if (q) q.setAttribute('aria-expanded', 'true');
    if (a) a.style.maxHeight = a.scrollHeight + 'px';
  }
  function toggle(item) {
    const isOpen = item.classList.contains('open');
    closeAll();
    if (!isOpen) openItem(item);
  }
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    const answer = item.querySelector('.faq-answer');
    if (answer) answer.style.maxHeight = '0';
    question.setAttribute('aria-expanded', 'false');
    question.addEventListener('click', () => toggle(item));
    question.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(item); }
    });
  });
}

/* ---- Progress Bars ---- */
function initProgressBars() {
  const bars = document.querySelectorAll('.why-bar-fill[data-width], .cs-why-bar-fill[data-width]');
  if (!bars.length) return;
  bars.forEach(b => { b.style.width = '0%'; b.style.transition = 'width 900ms cubic-bezier(0.16,1,0.3,1)'; });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.style.width = e.target.dataset.width; io.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  bars.forEach(b => io.observe(b));
}

/* ---- Smooth Scroll ---- */
function initSmoothScroll() {
  const navbar = document.getElementById('navbar');
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const offset    = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initActiveNav();
  initMobileNav();
  initCounters();
  initFAQ();
  initProgressBars();
  initSmoothScroll();
});
