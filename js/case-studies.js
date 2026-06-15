/* ============================================================
   NexaGrid — case-studies.js
   Filters · Counters · FAQ · Reveal · Progress Bars ·
   Modal · Mobile Nav · Active Nav · Smooth Scroll
   ============================================================ */
'use strict';

/* ============================================================
   FEATURE 1 — CASE STUDY FILTERING
   Buttons : .pf-filter-btn   [data-filter]
   Cards   : .cs-card         [data-category]
   ============================================================ */
function initFilters() {
  const buttons = document.querySelectorAll('.pf-filter-btn');
  const cards   = document.querySelectorAll('.cs-card');
  if (!buttons.length || !cards.length) return;

  function applyFilter(filter) {
    cards.forEach(card => {
      const cats = (card.dataset.category || '').toLowerCase();
      const show = filter === 'all' || cats.includes(filter.toLowerCase());

      if (show) {
        card.style.opacity    = '0';
        card.style.transform  = 'translateY(12px)';
        card.style.display    = '';          // unhide before animating in
        // Force reflow so transition fires
        void card.offsetWidth;
        card.style.transition = 'opacity 350ms ease, transform 350ms ease';
        card.style.opacity    = '1';
        card.style.transform  = 'translateY(0)';
      } else {
        card.style.transition = 'opacity 200ms ease, transform 200ms ease';
        card.style.opacity    = '0';
        card.style.transform  = 'translateY(8px)';
        // Hide after fade-out
        setTimeout(() => {
          if ((card.dataset.category || '').toLowerCase().includes(filter.toLowerCase()) ||
              filter === 'all') return; // guard race condition
          card.style.display = 'none';
        }, 210);
      }
    });
  }

  // Delegate clicks on filter container
  const container = buttons[0].closest('[role="tablist"]') || buttons[0].parentElement;
  container.addEventListener('click', e => {
    const btn = e.target.closest('.pf-filter-btn');
    if (!btn) return;

    const filter = btn.dataset.filter || 'all';

    buttons.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    applyFilter(filter);
  });

  // Keyboard: arrow navigation between tabs
  container.addEventListener('keydown', e => {
    const btns = [...buttons];
    const idx  = btns.indexOf(document.activeElement);
    if (idx === -1) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      btns[(idx + 1) % btns.length].focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      btns[(idx - 1 + btns.length) % btns.length].focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btns[idx].click();
    }
  });
}

/* ============================================================
   FEATURE 2 — COUNTER ANIMATION
   Targets : .pf-stat-number · .pf-metric-value · .cs-feat-metric-value
   Attrs   : data-count  data-suffix  data-decimals  data-prefix
   ============================================================ */
function initCounters() {
  const counters = document.querySelectorAll(
    '.pf-stat-number[data-count], .pf-metric-value[data-count], .cs-feat-metric-value[data-count]'
  );
  if (!counters.length) return;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.count);
    const suffix   = el.dataset.suffix   || '';
    const prefix   = el.dataset.prefix   || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    const duration = 2000;
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

/* ============================================================
   FEATURE 3 — FAQ ACCORDION
   Classes : .faq-item · .faq-question · .faq-answer · .faq-arrow
   ============================================================ */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  function closeItem(item) {
    item.classList.remove('open');
    const answer   = item.querySelector('.faq-answer');
    const question = item.querySelector('.faq-question');
    const arrow    = item.querySelector('.faq-arrow');
    if (answer)   answer.style.maxHeight = '0';
    if (question) question.setAttribute('aria-expanded', 'false');
    if (arrow)    arrow.style.transform  = '';
  }

  function openItem(item) {
    item.classList.add('open');
    const answer   = item.querySelector('.faq-answer');
    const question = item.querySelector('.faq-question');
    const arrow    = item.querySelector('.faq-arrow');
    if (answer)   answer.style.maxHeight = answer.scrollHeight + 'px';
    if (question) question.setAttribute('aria-expanded', 'true');
    if (arrow)    arrow.style.transform  = 'rotate(180deg)';
  }

  // Initialise — all closed
  items.forEach(item => {
    const answer = item.querySelector('.faq-answer');
    if (answer) {
      answer.style.overflow   = 'hidden';
      answer.style.maxHeight  = '0';
      answer.style.transition = 'max-height 350ms ease';
    }
    const arrow = item.querySelector('.faq-arrow');
    if (arrow) arrow.style.transition = 'transform 300ms ease';
  });

  // Delegate events to FAQ container for performance
  const faqLists = document.querySelectorAll('.faq-list, .cs-faq-list, [role="list"].faq-list');
  const containers = faqLists.length
    ? faqLists
    : [document]; // fallback to document

  containers.forEach(container => {
    container.addEventListener('click', e => {
      const question = e.target.closest('.faq-question');
      if (!question) return;
      const item   = question.closest('.faq-item');
      if (!item) return;
      const isOpen = item.classList.contains('open');

      // Close all
      items.forEach(closeItem);
      // Toggle clicked
      if (!isOpen) openItem(item);
    });

    container.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const question = e.target.closest('.faq-question');
      if (!question) return;
      e.preventDefault();
      question.click();
    });
  });
}

/* ============================================================
   FEATURE 4 — SCROLL REVEAL
   Class : .reveal
   Stagger via : .reveal-delay-1/2/3 (handled in CSS)
   ============================================================ */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}

/* ============================================================
   FEATURE 5 — PROGRESS BAR ANIMATION
   Elements : .cs-why-bar-fill   [data-width]
   ============================================================ */
function initProgressBars() {
  const bars = document.querySelectorAll('.cs-why-bar-fill[data-width]');
  if (!bars.length) return;

  bars.forEach(b => {
    b.style.width      = '0%';
    b.style.transition = 'width 900ms cubic-bezier(0.16,1,0.3,1)';
  });

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
   FEATURE 6 — MODAL SYSTEM
   openModal(id) / closeModal()
   Overlay : #csModalOverlay   Modal : #csModal   Close : #csModalClose
   Body    : #csModalBody
   ============================================================ */

/* Case study data — extend as needed */
const CS_DATA = {
  medicare: {
    tag:     'Healthcare · Mobile App · Web Portal',
    title:   'MediCare Plus Patient Booking Platform',
    summary: 'Patna multi-specialty clinic chain with 4 locations had zero digital presence. Over 60% of after-hours appointment inquiries were lost because patients could not book online. NexaGrid designed and built a full patient management ecosystem: a cross-platform mobile app, web portal, WhatsApp integration and automated reminders.',
    metrics: [
      { value: '3X',     label: 'Appointment Growth'  },
      { value: '12,000+',label: 'Active App Users'    },
      { value: '50%',    label: 'No-show Reduction'   },
    ],
    results: [
      '24/7 online booking — no more missed after-hours calls',
      '4.8★ rating on App Store & Google Play',
      'WhatsApp reminders cut no-show rate by 50%',
      'Revenue up ₹4.2L/month within 6 months',
    ],
    tech: ['React Native', 'Node.js', 'Firebase', 'WhatsApp API', 'Razorpay'],
  },
  eduspark: {
    tag:     'Education · LMS · Mobile App',
    title:   'EduSpark Online Learning Platform',
    summary: 'Bihar coaching institute needed to serve students digitally during and post-pandemic. The existing setup was entirely offline with no way to deliver content, track progress or collect fees online. NexaGrid built a full-stack LMS with video delivery, live classes, quiz engine and a mobile app.',
    metrics: [
      { value: '5X',    label: 'Student Reach'          },
      { value: '8,500+',label: 'Enrolled Students'      },
      { value: '92%',   label: 'Course Completion Rate' },
    ],
    results: [
      '₹45L revenue generated in year 1',
      'Students reached across 12 districts of Bihar',
      'Live class attendance 3× higher than in-person',
      'Fee collection fully automated via UPI & cards',
    ],
    tech: ['Next.js', 'Django', 'PostgreSQL', 'AWS S3', 'Razorpay', 'WebRTC'],
  },
  grillhouse: {
    tag:     'Restaurant · Website · Online Ordering',
    title:   'GrillHouse Online Ordering & Table Booking',
    summary: 'Premium restaurant in Patna had zero online orders and relied on phone-only reservations — staff spent 3 hours/day managing calls. NexaGrid built a branded ordering site, integrated Zomato-style menu management, table reservation and WhatsApp order notifications.',
    metrics: [
      { value: '4X',    label: 'Online Revenue'     },
      { value: '₹12L',  label: 'Monthly Orders'     },
      { value: '70%',   label: 'Phone Call Reduction'},
    ],
    results: [
      '4.9★ Google Maps rating after launch',
      'Table booking rate up 200% in 3 months',
      'Zero third-party commission on direct orders',
      'Staff time on phone reduced from 3hr to 30min/day',
    ],
    tech: ['React', 'Node.js', 'MongoDB', 'Stripe', 'WhatsApp Business API'],
  },
  shopnova: {
    tag:     'E-Commerce · Multi-Vendor · UI/UX',
    title:   'ShopNova Multi-Vendor Marketplace',
    summary: 'Local retail chain wanted to expand online but had no tech capability. They needed a scalable multi-vendor platform similar to Amazon — vendor onboarding, inventory management, payments and delivery tracking all in one place.',
    metrics: [
      { value: '₹2Cr',  label: 'Year-1 GMV'           },
      { value: '350+',  label: 'Vendors Onboarded'     },
      { value: '22%',   label: 'Cart Abandonment Drop' },
    ],
    results: [
      'Page load time reduced from 3.8s to 1.2s',
      'Mobile conversion rate increased by 180%',
      '350+ vendors onboarded in first 90 days',
      'Integrated with Shiprocket for real-time tracking',
    ],
    tech: ['React', 'Laravel', 'MySQL', 'Redis', 'Razorpay', 'Shiprocket API'],
  },
  stayease: {
    tag:     'Hospitality · Hotel Booking · Mobile App',
    title:   'StayEase Direct Booking Platform',
    summary: '3-property hotel group was paying 18% OTA commission on every booking — over ₹8L/year lost to platforms. NexaGrid built a direct booking engine with dynamic pricing, WhatsApp check-in, loyalty points and a management dashboard.',
    metrics: [
      { value: '65%',  label: 'Direct Bookings'      },
      { value: '₹8L',  label: 'OTA Commission Saved' },
      { value: '28%',  label: 'Revenue Growth (6mo)' },
    ],
    results: [
      'WhatsApp check-in system live within 2 weeks',
      'Loyalty programme added 1,200 repeat guests',
      'Booking engine integrated with Google Hotel Ads',
      'RevPAR increased by 22% in 6 months',
    ],
    tech: ['Vue.js', 'Node.js', 'PostgreSQL', 'Stripe', 'WhatsApp API', 'Google Hotel Ads'],
  },
  factoryos: {
    tag:     'IoT · Manufacturing · AI Alerts',
    title:   'FactoryOS Machine Monitoring Platform',
    summary: 'Patna-based manufacturing unit was losing ₹3L/month to unexpected machine failures with no early-warning system. NexaGrid deployed 200+ IoT sensors, built a real-time monitoring dashboard and trained an ML model to predict failures 48 hours in advance.',
    metrics: [
      { value: '42%',  label: 'Downtime Reduction' },
      { value: '200+', label: 'Sensors Connected'  },
      { value: '₹2.8L',label: 'Saved Per Month'   },
    ],
    results: [
      'Predictive alerts 48 hours before failure',
      'Real-time dashboard on mobile and web',
      'Maintenance cost down 35% in 3 months',
      'ROI achieved in under 4 months post-launch',
    ],
    tech: ['Raspberry Pi', 'MQTT', 'Node.js', 'InfluxDB', 'Grafana', 'TensorFlow'],
  },
  leadbot: {
    tag:     'AI · Chatbot · CRM Automation',
    title:   'LeadBot AI Lead Capture Automation',
    summary: 'Real estate company was missing 70% of leads that arrived after business hours — no one was answering inquiries at night. NexaGrid built an AI chatbot integrated with their CRM, WhatsApp and email, qualifying leads and booking site visits automatically 24/7.',
    metrics: [
      { value: '3.2X', label: 'Lead Conversion'    },
      { value: '70%',  label: 'After-hours Capture' },
      { value: '₹18L', label: 'Pipeline Added (mo)' },
    ],
    results: [
      'Chatbot qualifies and scores leads automatically',
      'Site visit bookings increased by 240%',
      'Sales team saves 4 hours/day on manual follow-up',
      'WhatsApp drip campaigns added to nurture pipeline',
    ],
    tech: ['React', 'Node.js', 'OpenAI API', 'WhatsApp Business API', 'HubSpot CRM'],
  },
};

function buildModalHTML(data) {
  const resultItems = data.results
    .map(r => `<li style="margin-bottom:0.5rem;color:var(--clr-text-2)">✅ ${r}</li>`)
    .join('');
  const techTags = data.tech
    .map(t => `<span style="display:inline-block;padding:4px 12px;background:var(--clr-surface-2);border:1px solid var(--clr-border-2);border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:600;color:var(--clr-text-2);margin:3px">${t}</span>`)
    .join('');
  const metricsHTML = data.metrics
    .map(m => `<div class="cs-modal-metric"><strong>${m.value}</strong><span>${m.label}</span></div>`)
    .join('');

  return `
    <div class="cs-modal-tag">${data.tag}</div>
    <h2 class="cs-modal-title" id="csModalTitle">${data.title}</h2>
    <p class="cs-modal-summary">${data.summary}</p>

    <p class="cs-modal-section-title">Key Results</p>
    <div class="cs-modal-metrics">${metricsHTML}</div>

    <p class="cs-modal-section-title">What We Delivered</p>
    <ul style="margin-bottom:var(--space-8);padding-left:0">${resultItems}</ul>

    <p class="cs-modal-section-title">Technology Stack</p>
    <div style="margin-bottom:var(--space-4)">${techTags}</div>

    <div class="cs-modal-cta">
      <a class="btn btn-primary" href="contact.html">Start a Similar Project</a>
      <a class="btn btn-secondary" href="contact.html#consultation">Get Free Consultation</a>
    </div>
  `;
}

function openModal(id) {
  const overlay = document.getElementById('csModalOverlay');
  const body    = document.getElementById('csModalBody');
  if (!overlay || !body) return;

  const data = CS_DATA[id];
  body.innerHTML = data
    ? buildModalHTML(data)
    : `<p style="color:var(--clr-muted);padding:2rem;text-align:center">Case study details coming soon.</p>`;

  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Focus close button for accessibility
  const closeBtn = document.getElementById('csModalClose');
  if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
}

function closeModal() {
  const overlay = document.getElementById('csModalOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Expose globally (used via inline onclick attributes in HTML)
window.openModal  = openModal;
window.closeModal = closeModal;

function initModal() {
  const overlay  = document.getElementById('csModalOverlay');
  const closeBtn = document.getElementById('csModalClose');
  const modal    = document.getElementById('csModal');
  if (!overlay) return;

  // Close button
  closeBtn?.addEventListener('click', closeModal);

  // Click outside modal box
  overlay.addEventListener('click', e => {
    if (modal && !modal.contains(e.target)) closeModal();
  });

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });
}

/* ============================================================
   FEATURE 7 — MOBILE NAVIGATION
   IDs : #navToggle  #navMobile
   ============================================================ */
function initMobileNav() {
  const toggle      = document.getElementById('navToggle');
  const mobileMenu  = document.getElementById('navMobile');
  const navbar      = document.getElementById('navbar');
  if (!toggle || !mobileMenu) return;

  function openMenu() {
    toggle.classList.add('open');
    mobileMenu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggle.classList.remove('open');
    mobileMenu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Scrolled state for navbar
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });
  }
}

/* ============================================================
   FEATURE 8 — ACTIVE NAVIGATION
   Highlights case-studies.html link automatically
   ============================================================ */
function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path) {
      link.classList.add('active');
    } else if (path !== 'case-studies.html') {
      // If already hardcoded in HTML, don't double-mark
      link.classList.remove('active');
    }
  });
}

/* ============================================================
   FEATURE 9 — SMOOTH SCROLLING
   Handles all <a href="#section"> anchor links
   Offset accounts for sticky navbar height
   ============================================================ */
function initSmoothScroll() {
  const NAV_HEIGHT = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '72',
    10
  );

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const hash   = link.getAttribute('href');
    if (hash === '#') return;

    const target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT - 16;
    window.scrollTo({ top, behavior: 'smooth' });

    // Update URL without triggering scroll
    history.pushState(null, '', hash);
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initFilters();
  initCounters();
  initFAQ();
  initReveal();
  initProgressBars();
  initModal();
  initMobileNav();
  initActiveNav();
  initSmoothScroll();
});