/* Syed Ashir Azeem — Portfolio frontend interactions */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Page loader -------------------------------------------------------- */
  const loader = document.querySelector('.page-loader');
  if (loader) {
    const finish = () => {
      loader.classList.add('done');
      setTimeout(() => loader.remove(), 600);
    };
    if (prefersReduced) finish();
    else setTimeout(finish, 350);
  }

  /* Navbar scroll state -------------------------------------------------- */
  const navbar = document.querySelector('.navbar');
  const progress = document.querySelector('.scroll-progress');
  const backTop = document.querySelector('.back-top');

  function onScroll() {
    const y = window.scrollY;

    if (navbar) navbar.classList.toggle('scrolled', y > 24);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = max > 0 ? (y / max) * 100 + '%' : '0%';
    }

    if (backTop) backTop.classList.toggle('show', y > 640);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));
  }

  /* Mobile menu ------------------------------------------------------------ */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });

    mobileMenu.querySelectorAll('a').forEach((link) =>
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
      })
    );
  }

  /* Scroll reveal ------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* Stat counters --------------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');

  if (counters.length) {
    const animate = (el) => {
      const target = el.dataset.count;
      // Count numeric part, keep suffix/prefix (e.g. "5+", "1+")
      const match = target.match(/^(\d+)(.*)$/);
      if (!match || prefersReduced) { el.textContent = target; return; }

      const end = parseInt(match[1], 10);
      const suffix = match[2];
      const dur = 1400;
      const start = performance.now();

      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => cio.observe(el));
  }

  /* Active nav link ----------------------------------------------------------- */
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || !href.startsWith('/')) return;
    const clean = href.split('#')[0] || '/';
    if (clean === currentPath) link.classList.add('active');
  });

  /* Magnetic buttons (subtle) ---------------------------------------------------- */
  if (!prefersReduced && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.14}px, ${y * 0.18}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* Theme toggle (saved locally) ------------------------------------------------ */
  const themeBtn = document.querySelector('.theme-toggle');

  if (themeBtn) {
    if (localStorage.getItem('theme') === 'light') document.documentElement.classList.add('light');
    themeBtn.addEventListener('click', () => {
      const light = document.documentElement.classList.toggle('light');
      localStorage.setItem('theme', light ? 'light' : 'dark');
    });
  }

  /* AJAX contact form --------------------------------------------------------------- */
  const form = document.querySelector('[data-contact-form]');

  if (form) {
    const statusBox = form.querySelector('[data-form-status]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnLabel = submitBtn ? submitBtn.innerHTML : '';

    const showStatus = (type, msg) => {
      if (!statusBox) return;
      statusBox.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
      statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (submitBtn) { submitBtn.classList.add('loading'); submitBtn.innerHTML = 'Sending…'; }

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': form.querySelector('input[name="_token"]').value,
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/json',
          },
          body: new FormData(form),
        });

        const data = await res.json();

        if (res.status === 422) {
          const first = Object.values(data.errors)[0][0];
          showStatus('error', first);
          form.querySelectorAll('.field-error').forEach((n) => n.remove());
          Object.entries(data.errors).forEach(([field, messages]) => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
              const note = document.createElement('div');
              note.className = 'field-error';
              note.textContent = messages[0];
              input.closest('.form-group')?.appendChild(note);
            }
          });
        } else if (res.ok && data.status === 'success') {
          form.reset();
          showStatus('success', data.message);
        } else {
          showStatus('error', 'Something went wrong. Please try again.');
        }
      } catch {
        showStatus('error', 'Network error — please check your connection and try again.');
      } finally {
        if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.innerHTML = btnLabel; }
      }
    });
  }
})();
