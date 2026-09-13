/* Admin panel interactions */
(function () {
  'use strict';

  /* Sidebar (mobile) */
  const menuBtn = document.querySelector('.menu-btn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.overlay');

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay?.classList.toggle('show');
    });
    overlay?.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }

  /* Confirm destructive actions */
  document.querySelectorAll('[data-confirm]').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (!window.confirm(el.dataset.confirm || 'Are you sure?')) e.preventDefault();
    });
  });

  /* Auto-generate slug from title */
  const titleInput = document.querySelector('[data-slug-source]');
  const slugInput = document.querySelector('[data-slug-target]');

  if (titleInput && slugInput && !slugInput.value) {
    const slugify = (s) =>
      s.toString().toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    let touched = false;
    slugInput.addEventListener('input', () => { touched = true; });
    titleInput.addEventListener('input', () => {
      if (!touched) slugInput.value = slugify(titleInput.value);
    });
  }

  /* Image input preview */
  document.querySelectorAll('input[type="file"][data-preview]').forEach((input) => {
    input.addEventListener('change', () => {
      const preview = document.querySelector(input.dataset.preview);
      const file = input.files?.[0];
      if (preview && file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
      }
    });
  });

  /* Alerts auto-dismiss */
  document.querySelectorAll('.alert[data-auto]').forEach((alert) => {
    setTimeout(() => {
      alert.style.transition = 'opacity .4s ease';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 450);
    }, 4200);
  });
})();
