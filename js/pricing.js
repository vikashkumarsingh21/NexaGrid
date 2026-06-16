/* ============================================================
   NexaGrid — pricing.js
   Pricing toggle, counters, ROI calculator, FAQ, reveal,
   progress bars, mobile nav, smooth scroll, CTA tracking
   ============================================================ */

'use strict';

/* ---- Helper: Format Indian currency ---- */
function formatINR(value) {
  return '₹' + Math.round(value).toLocaleString('en-IN');
}

/* ---- CTA Tracking (future GA integration) ---- */
function trackCTA(action) {
  if (typeof gtag === 'function') {
    gtag('event', 'cta_click', { event_category: 'CTA', event_label: action });
  }
  if (typeof dataLayer !== 'undefined') {
    dataLayer.push({ event: 'cta_click', action: action });
  }
  // console.log('[CTA Track]', action); // Uncomment for debugging
}

/* ============================================================
   FEATURE 1 — PRICING TOGGLE (Monthly ↔ Yearly)
   ============================================================ */
function initPricingToggle() {
  const btnMonthly = document.getElementById('toggleMonthly');
  const btnYearly  = document.getElementById('toggleYearly');
  const track      = document.getElementById('prToggle');
  const amounts    = document.querySelectorAll('.pr-plan-amount');
  const saveBadge  = document.querySelector('.pr-toggle-save');

  if (!btnMonthly || !btnYearly || !track) return;

  let isYearly = false;

  function animateAmount(el, newValue) {
    const formatted = Number(newValue).toLocaleString('en-IN');
    el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px)';
    setTimeout(() => {
      el.textContent = formatted;
      el.style.transform = 'translateY(6px)';
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }, 200);
  }

  function setYearly(yearly) {
    isYearly = yearly;

    btnMonthly.classList.toggle('active', !yearly);
    btnYearly.classList.toggle('active', yearly);
    btnMonthly.setAttribute('aria-pressed', String(!yearly));
    btnYearly.setAttribute('aria-pressed', String(yearly));

    track.classList.toggle('annual', yearly);
    track.setAttribute('aria-checked', String(yearly));
    saveBadge?.classList.toggle('hidden', yearly);

    amounts.forEach(el => {
      const val = yearly ? el.dataset.yearly : el.dataset.monthly;
      if (val !== undefined) animateAmount(el, val);
    });

    trackCTA(yearly ? 'toggle_yearly' : 'toggle_monthly');
  }

  btnMonthly.addEventListener('click', () => setYearly(false));
  btnYearly.addEventListener('click',  () => setYearly(true));

  track.addEventListener('click', () => setYearly(!isYearly));

  track.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setYearly(!isYearly);
    }
  });

  btnMonthly.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setYearly(false); }
  });
  btnYearly.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setYearly(true); }
  });
}

/* ============================================================
   FEATURE 2 — COUNTER ANIMATION
   ============================================================ */
function initCounters() {
  const counters = document.querySelectorAll('.pr-stat-num[data-count]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.count);
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const duration = 1800;
    const start    = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

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

/* ============================================================
   FEATURE 3 — ROI CALCULATOR
   ============================================================ */
function initROICalculator() {
  const btnCalc       = document.getElementById('roiCalcBtn');
  const elResult1     = document.getElementById('roiResult1');
  const elResult2     = document.getElementById('roiResult2');
  const elResult3     = document.getElementById('roiResult3');
  const elNote        = document.getElementById('roiNote');
  const elCTA         = document.getElementById('roiCTA');
  const elBusinessType = document.getElementById('roiBusinessType');
  const elLeads       = document.getElementById('roiLeads');
  const elSaleValue   = document.getElementById('roiSaleValue');
  const elGrowth      = document.getElementById('roiGrowth');

  if (!btnCalc) return;

  /* Business type multipliers (conversion rate factor) */
  const typeMultipliers = {
    'retail':        0.25,
    'service':       0.30,
    'ecommerce':     0.35,
    'restaurant':    0.20,
    'real-estate':   0.15,
    'education':     0.28,
    'healthcare':    0.22,
    'manufacturing': 0.18
  };

  /* Estimated project cost for payback calculation */
  const typeCosts = {
    'retail':        25000,
    'service':       25000,
    'ecommerce':     35000,
    'restaurant':    20000,
    'real-estate':   30000,
    'education':     25000,
    'healthcare':    30000,
    'manufacturing': 50000
  };

  /* Business-type friendly labels */
  const typeLabels = {
    'retail':        'retail business',
    'service':       'service business',
    'ecommerce':     'e-commerce store',
    'restaurant':    'restaurant / food business',
    'real-estate':   'real estate business',
    'education':     'education / coaching centre',
    'healthcare':    'healthcare / clinic',
    'manufacturing': 'manufacturing / B2B company'
  };

  function animateValue(el, value) {
    el.style.transition = 'opacity 0.3s ease';
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = value;
      el.style.opacity = '1';
    }, 150);
  }

  function calculate() {
    const businessType  = elBusinessType.value;
    const leads         = parseInt(elLeads.value);
    const saleValue     = parseInt(elSaleValue.value);
    const growthPct     = parseInt(elGrowth.value) / 100;
    const convRate      = typeMultipliers[businessType] || 0.25;
    const projectCost   = typeCosts[businessType] || 25000;

    /* Core calculations */
    const currentMonthlyRevenue = leads * convRate * saleValue;
    const newLeads              = leads * (1 + growthPct);
    const newMonthlyRevenue     = newLeads * convRate * saleValue;
    const monthlyROI            = newMonthlyRevenue - currentMonthlyRevenue;
    const annualIncrease        = monthlyROI * 12;
    const paybackMonths         = monthlyROI > 0 ? projectCost / monthlyROI : Infinity;

    /* Format results */
    const r1 = formatINR(monthlyROI) + '/mo';
    const r2 = formatINR(annualIncrease);
    const r3 = paybackMonths < 1
      ? '< 1 month'
      : paybackMonths <= 24
        ? Math.ceil(paybackMonths) + ' month' + (Math.ceil(paybackMonths) > 1 ? 's' : '')
        : '2+ years';

    animateValue(elResult1, r1);
    animateValue(elResult2, r2);
    animateValue(elResult3, r3);

    /* Personalised note */
    const growthLabel = Math.round(growthPct * 100) + '%';
    const note = `Based on your ${typeLabels[businessType]} with ${leads} leads/month and ₹${saleValue.toLocaleString('en-IN')} average sale value, a ${growthLabel} digital growth can add ${formatINR(monthlyROI)} per month to your revenue. Your investment typically pays back in ${r3}.`;
    elNote.textContent = note;

    /* Show CTA */
    elCTA.style.display = 'block';
    elCTA.style.opacity = '0';
    void elCTA.offsetHeight; /* force layout so display:block is committed before the transition starts */
    elCTA.style.transition = 'opacity 0.4s ease';
    requestAnimationFrame(() => {
      elCTA.style.opacity = '1';
    });

    trackCTA('roi_calculated');
  }

  btnCalc.addEventListener('click', calculate);

  btnCalc.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); calculate(); }
  });
}

/* ============================================================
   FEATURE 4 — LIVE RANGE VALUES
   ============================================================ */
function initRangeDisplays() {
  const leadsRange  = document.getElementById('roiLeads');
  const saleRange   = document.getElementById('roiSaleValue');
  const growthRange = document.getElementById('roiGrowth');
  const leadsVal    = document.getElementById('roiLeadsVal');
  const saleVal     = document.getElementById('roiSaleVal');
  const growthVal   = document.getElementById('roiGrowthVal');

  if (!leadsRange || !saleRange || !growthRange) return;

function setFill(input) {
    const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
    input.style.setProperty('--roi-fill', pct + '%');
  }

  function updateLeads() {
    leadsVal.textContent = leadsRange.value;
    leadsRange.setAttribute('aria-valuenow', leadsRange.value);
    setFill(leadsRange);
  }

  function updateSale() {
    saleVal.textContent = '₹' + Number(saleRange.value).toLocaleString('en-IN');
    saleRange.setAttribute('aria-valuenow', saleRange.value);
    setFill(saleRange);
  }

  function updateGrowth() {
    growthVal.textContent = growthRange.value + '%';
    growthRange.setAttribute('aria-valuenow', growthRange.value);
    setFill(growthRange);
  }

  leadsRange.addEventListener('input',  updateLeads);
  saleRange.addEventListener('input',   updateSale);
  growthRange.addEventListener('input', updateGrowth);

  /* Initialise displayed values */
  updateLeads();
  updateSale();
  updateGrowth();
}

/* ============================================================
   FEATURE 5 — FAQ ACCORDION
   ============================================================ */
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

    /* Ensure initial state */
    const answer = item.querySelector('.faq-answer');
    if (answer) answer.style.maxHeight = '0';
    question.setAttribute('aria-expanded', 'false');

    question.addEventListener('click', () => toggle(item));

    question.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(item);
      }
      /* Arrow navigation between FAQ items */
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = item.nextElementSibling;
        const nq = next && next.querySelector('.faq-question');
        if (nq) nq.focus();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = item.previousElementSibling;
        const pq = prev && prev.querySelector('.faq-question');
        if (pq) pq.focus();
      }
    });
  });
}

/* ============================================================
   FEATURE 6 — SCROLL REVEAL
   ============================================================ */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const delayMap = {
    'reveal-delay-1': 100,
    'reveal-delay-2': 200,
    'reveal-delay-3': 300
  };

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
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}

/* ============================================================
   FEATURE 7 — PROGRESS BAR ANIMATION
   ============================================================ */
function initProgressBars() {
  const bars = document.querySelectorAll('.why-bar-fill[data-width]');
  if (!bars.length) return;

  bars.forEach(b => { b.style.width = '0%'; });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.width;
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });

  bars.forEach(b => io.observe(b));
}

/* ============================================================
   FEATURE 8 — MOBILE NAVIGATION
   ============================================================ */
function initMobileNav() {
  const navToggle  = document.getElementById('navToggle');
  const navMobile  = document.getElementById('navMobile');

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

  navToggle.addEventListener('click', () => {
    navMobile.classList.contains('open') ? closeMenu() : openMenu();
  });

  /* Close on link click */
  navMobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* Close on outside click */
  document.addEventListener('click', e => {
    if (
      navMobile.classList.contains('open') &&
      !navMobile.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      closeMenu();
    }
  });

  /* Close on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMobile.classList.contains('open')) {
      closeMenu();
      navToggle.focus();
    }
  });
}

/* ============================================================
   FEATURE 9 — ACTIVE PAGE DETECTION
   ============================================================ */
function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ============================================================
   FEATURE 10 — SMOOTH SCROLL
   ============================================================ */
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

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initPricingToggle();
  initCounters();
  initROICalculator();
  initRangeDisplays();
  initFAQ();
  initReveal();
  initProgressBars();
  initMobileNav();
  initSmoothScroll();
});