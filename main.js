/* ═══════════════════════════════════════════════
   NEXAGRID — main.js
   All interactivity: loader, nav, scroll, filters,
   form, animations, back-to-top
   ═══════════════════════════════════════════════ */

/* ── 1. LOADER ── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hide');
    document.body.style.overflow = '';
    initAnimations();
  }, 1800);
});
document.body.style.overflow = 'hidden';

/* ── 2. NAVBAR SCROLL + HAMBURGER ── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  toggleBackToTop();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── 3. SMOOTH SCROLL for all anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── 4. ACTIVE NAV HIGHLIGHT ── */
const sections = document.querySelectorAll('section[id], header[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const observerNav = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === '#' + entry.target.id) {
          a.style.color = 'var(--blue)';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => observerNav.observe(s));

/* ── 5. WORK PORTFOLIO FILTER ── */
const filterBtns = document.querySelectorAll('.filter-btn');
const workCards  = document.querySelectorAll('.work-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    workCards.forEach(card => {
      if (filter === 'all' || card.dataset.cat === filter) {
        card.classList.remove('hidden');
        card.style.animation = 'none';
        card.offsetHeight; // reflow
        card.style.animation = 'fadeIn 0.4s ease';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

/* ── 6. SCROLL ANIMATIONS (Intersection Observer) ── */
function initAnimations() {
  // Add fade-up class to animate elements
  const animTargets = [
    '.svc-card',
    '.work-card',
    '.process-step',
    '.testi-card',
    '.about-stat-card',
    '.price-card',
    '.contact-row',
    '.value-item',
    '.section-header',
    '.hero-badge',
    '.hero-title',
    '.hero-sub',
    '.hero-actions',
    '.hero-metrics',
  ];

  animTargets.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('fade-up');
      // Stagger delay for grids
      const delay = (i % 4) * 80;
      el.style.transitionDelay = delay + 'ms';
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

/* ── 7. BACK TO TOP ── */
const backToTop = document.getElementById('backToTop');

function toggleBackToTop() {
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── 8. CONTACT FORM ── */
const contactForm = document.getElementById('contactForm');
const formMsg     = document.getElementById('formMsg');

contactForm.addEventListener('submit', e => {
  e.preventDefault();

  const btn = contactForm.querySelector('button[type="submit"]');
  const original = btn.innerHTML;

  // Loading state
  btn.innerHTML = '<span style="opacity:0.7">Sending...</span>';
  btn.disabled = true;

  // Simulate send (replace with real API/EmailJS/formspree)
  setTimeout(() => {
    btn.innerHTML = original;
    btn.disabled = false;

    // Show success
    formMsg.className = 'form-msg success';
    formMsg.innerHTML = '✓ Message sent! We will reply within 24 hours.';
    contactForm.reset();

    // Hide after 5s
    setTimeout(() => {
      formMsg.className = 'form-msg';
      formMsg.innerHTML = '';
    }, 5000);
  }, 1500);
});

/* ── 9. TYPING COUNTER ANIMATION for metrics ── */
function animateCounters() {
  const counters = document.querySelectorAll('.metric strong');
  counters.forEach(counter => {
    const text    = counter.textContent;
    const numMatch = text.match(/\d+/);
    if (!numMatch) return;

    const target  = parseInt(numMatch[0]);
    const prefix  = text.split(numMatch[0])[0];
    const suffix  = counter.querySelector('span') ? counter.querySelector('span').outerHTML : '';
    const suffixText = counter.querySelector('span') ? counter.querySelector('span').textContent : '';
    let current   = 0;
    const step    = Math.ceil(target / 30);

    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      counter.innerHTML = prefix + current + suffix;
      if (current >= target) clearInterval(timer);
    }, 40);
  });
}

// Trigger counter when hero is visible
const heroObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCounters(); heroObs.disconnect(); }
  });
}, { threshold: 0.5 });

const heroMetrics = document.querySelector('.hero-metrics');
if (heroMetrics) heroObs.observe(heroMetrics);

/* ── 10. SERVICE CARD HOVER TILT ── */
document.querySelectorAll('.svc-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect  = card.getBoundingClientRect();
    const x     = (e.clientX - rect.left) / rect.width  - 0.5;
    const y     = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) scale(1.01)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ── 11. MARQUEE pause on hover ── */
const marqueeInner = document.querySelectorAll('.marquee-inner');
const marqueeWrap  = document.querySelector('.marquee-wrap');
if (marqueeWrap) {
  marqueeWrap.addEventListener('mouseenter', () => {
    marqueeInner.forEach(m => m.style.animationPlayState = 'paused');
  });
  marqueeWrap.addEventListener('mouseleave', () => {
    marqueeInner.forEach(m => m.style.animationPlayState = 'running');
  });
}

/* ── 12. FOOTER CURRENT YEAR ── */
const yearEl = document.querySelector('.footer-bottom span');
if (yearEl) {
  yearEl.textContent = yearEl.textContent.replace('2025', new Date().getFullYear());
}

/* ── CSS for fadeIn animation (injected) ── */
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);