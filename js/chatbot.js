/* ============================================================
   Axivon Technologies — chatbot.js
   Floating Communication Hub + AI Assistant
   Independent module. No dependencies. Modern ES6+, no jQuery.
   ============================================================ */

'use strict';

(function () {
  const root = document.getElementById('axvChatRoot');
  if (!root) return;

  /* ---------------------------------------------------------
     Element refs
     --------------------------------------------------------- */
  const dock        = document.getElementById('axvDock');
  const avatarBtn   = document.getElementById('axvAvatarBtn');
  const panel       = document.getElementById('axvChatPanel');
  const header      = document.getElementById('axvPanelHeader');
  const closeBtn    = document.getElementById('axvCloseBtn');
  const backdrop    = document.getElementById('axvBackdrop');
  const messages    = document.getElementById('axvMessages');
  const suggestions = document.getElementById('axvSuggestions');
  const form        = document.getElementById('axvForm');
  const input       = document.getElementById('axvInput');
  const sendBtn     = document.getElementById('axvSendBtn');
  const teaser      = document.getElementById('axvTeaser');
  const teaserClose = document.getElementById('axvTeaserClose');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let isOpen = false;
  let hasInteracted = false;
  let typingTimer = null;

  /* ---------------------------------------------------------
     Canned assistant knowledge base
     --------------------------------------------------------- */
  const REPLIES = [
    {
      test: /^\s*(hi|hello|hey|yo)\b/i,
      text: 'Hey there 👋 Good to see you. What can I help you with — services, pricing, or booking a quick call?'
    },
    {
      test: /price|pricing|cost|budget|quote|how much|afford|expensive|cheap/i,
      text: 'Pricing depends on scope and platform. Our <a href="pricing.html">Pricing page</a> has starting packages — or tell me a bit about your project and I\'ll point you to the right plan.'
    },
    {
      test: /call|consult|meeting|book|schedule|appointment/i,
      text: 'Happy to set that up — tap "Book a Call" in the dock, or head to our <a href="contact.html">Contact page</a> to pick a slot that works for you.'
    },
    {
      test: /where|location|address|based|office|patna|bihar/i,
      text: 'We\'re based in Patna, Bihar, and work with clients across India and beyond — most of our collaboration happens remotely either way.'
    },
    {
      test: /contact|email|phone number|reach you|whatsapp/i,
      text: 'You can email us, message us on WhatsApp, or use the contact form — all available right from this dock, or on our <a href="contact.html">Contact page</a>.'
    },
    {
      test: /portfolio|case stud|past work|previous project|example of/i,
      text: 'Take a look at <a href="portfolio.html">our Portfolio</a> and <a href="case-studies.html">Case Studies</a> — they cover real launches across web, app and e-commerce projects.'
    },
    {
      test: /hour|reply time|response time|how fast|turnaround/i,
      text: 'Our team typically replies within a few hours on business days. For anything urgent, WhatsApp is the fastest way to reach us.'
    },
    {
      test: /service|offer|develop|ecommerce|e-commerce|iot|mobile app|website|app\b/i,
      text: 'We build custom websites, mobile apps, e-commerce stores and IoT solutions, plus run SEO and digital marketing campaigns — everything a growing business needs to show up and convert online. Want a closer look at <a href="services.html">our services</a>?'
    }
  ];

  const FALLBACK = 'Good question — I\'ll pass that along to the team. In the meantime, feel free to explore our <a href="services.html">Services</a> or <a href="portfolio.html">Portfolio</a>, or book a quick call and we\'ll dig into the details together.';

  function getReply(text) {
    const match = REPLIES.find(r => r.test.test(text));
    return match ? match.text : FALLBACK;
  }

  /* ---------------------------------------------------------
     Open / close
     --------------------------------------------------------- */
  function openChat() {
    if (isOpen) return;
    isOpen = true;
    root.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    avatarBtn.setAttribute('aria-expanded', 'true');
    hideTeaser(true);
    document.addEventListener('keydown', onKeydown);
    setTimeout(() => {
    document.addEventListener('click', onOutsideClick);
}, 100);
    window.setTimeout(() => input && input.focus({ preventScroll: true }), prefersReducedMotion ? 0 : 480);
  }

  function closeChat() {
    if (!isOpen) return;
    isOpen = false;
    root.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    avatarBtn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('click', onOutsideClick);
    avatarBtn.focus({ preventScroll: true });
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeChat();
  }

  function onOutsideClick(e) {
    if (!isOpen) return;
    if (panel.contains(e.target) || dock.contains(e.target)) return;
    closeChat();
  }

  if (avatarBtn) {
    avatarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("Avatar Clicked");

        openChat();
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', closeChat);
}

if (backdrop) {
    backdrop.addEventListener('click', closeChat);
}

  /* ---------------------------------------------------------
     Proactive teaser bubble
     --------------------------------------------------------- */
  let teaserDismissed = false;
  let teaserTimeoutId = null;

  function showTeaser() {
    if (teaserDismissed || isOpen || !teaser) return;
    teaser.classList.add('is-visible');
    teaserTimeoutId = window.setTimeout(() => hideTeaser(), 9000);
  }

  function hideTeaser(permanent) {
    if (!teaser) return;
    teaser.classList.remove('is-visible');
    if (permanent) teaserDismissed = true;
    if (teaserTimeoutId) { window.clearTimeout(teaserTimeoutId); teaserTimeoutId = null; }
  }

  if (teaserClose) {
    teaserClose.addEventListener('click', (e) => { e.stopPropagation(); hideTeaser(true); });
  }
  if (teaser) {
    teaser.addEventListener('click', () => { hideTeaser(true); openChat(); });
  }

  window.setTimeout(showTeaser, 6000);

  /* ---------------------------------------------------------
     Messages
     --------------------------------------------------------- */
  function timeNow() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function appendMessage(text, sender) {
    const el = document.createElement('div');
    el.className = `axv-msg axv-msg--${sender}`;
    el.innerHTML = `${text}<span class="axv-msg-time">${timeNow()}</span>`;
    messages.appendChild(el);
    scrollToBottom();
    return el;
  }

  function scrollToBottom() {
    messages.scrollTo({ top: messages.scrollHeight, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'axv-typing';
    el.id = 'axvTypingIndicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(el);
    scrollToBottom();
    return el;
  }

  function hideTyping() {
    const el = document.getElementById('axvTypingIndicator');
    if (el) el.remove();
  }

  function botRespond(userText) {
    showTyping();
    window.clearTimeout(typingTimer);
    typingTimer = window.setTimeout(() => {
      hideTyping();
      appendMessage(getReply(userText), 'bot');
    }, 900 + Math.random() * 500);
  }

  function handleUserMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!hasInteracted) {
      hasInteracted = true;
      suggestions.classList.add('is-hidden');
    }
    appendMessage(escapeHtml(trimmed), 'user');
    botRespond(trimmed);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value;
    if (!text.trim()) return;
    handleUserMessage(text);
    input.value = '';
  });

  suggestions.addEventListener('click', (e) => {
    const chip = e.target.closest('.axv-chip');
    if (!chip) return;
    handleUserMessage(chip.textContent);
  });

  /* ---------------------------------------------------------
     Ripple effect on send button
     --------------------------------------------------------- */
  sendBtn.addEventListener('click', (e) => {
    const rect = sendBtn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'axv-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${(e.clientX || rect.left + rect.width / 2) - rect.left - size / 2}px`;
    ripple.style.top  = `${(e.clientY || rect.top + rect.height / 2) - rect.top - size / 2}px`;
    sendBtn.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 650);
  });

  /* ---------------------------------------------------------
     Magnetic hover for dock buttons
     --------------------------------------------------------- */
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    dock.querySelectorAll('.axv-dock-btn, .axv-avatar-btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------
     Cursor-tracking spotlight in panel header
     --------------------------------------------------------- */
  if (!prefersReducedMotion && header) {
    header.addEventListener('mousemove', (e) => {
      const rect = header.getBoundingClientRect();
      header.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
      header.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
    });
  }

})();