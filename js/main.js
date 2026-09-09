document.addEventListener('DOMContentLoaded', () => {
  const SITE_CONFIG = {
    showHadir: false
  };

  document.querySelectorAll('[data-feature="hadir"]').forEach((el) => {
    el.hidden = !SITE_CONFIG.showHadir;
  });

  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
    });
  }

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});
