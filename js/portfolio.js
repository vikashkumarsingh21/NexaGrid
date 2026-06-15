/* ============================================================
   NexaGrid — portfolio.js
   Portfolio filter system
   ============================================================ */
'use strict';

(function initPortfolioFilter() {
  const buttons = document.querySelectorAll('.pf-filter-btn');
  const cards   = document.querySelectorAll('.pf-card');
  if (!buttons.length || !cards.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active state & ARIA
      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filter cards
      cards.forEach(card => {
        const cats = card.dataset.category || '';
        if (filter === 'all' || cats.includes(filter)) {
          card.classList.remove('hidden');
          card.classList.add('filter-show');
          setTimeout(() => card.classList.remove('filter-show'), 400);
        } else {
          card.classList.add('hidden');
        }
      });
    });

    // Keyboard support
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
})();