document.addEventListener('DOMContentLoaded', () => {
  const SITE_CONFIG = { showHadir: false };

  document.querySelectorAll('[data-feature="hadir"]').forEach((el) => {
    el.hidden = !SITE_CONFIG.showHadir;
  });

  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /*
   * Lightweight image intelligence:
   * read the natural dimensions and classify the source as
   * landscape / standard / portrait / square.
   * No external AI/API is required.
   */
  const classifyRatio = (width, height) => {
    if (!width || !height) return 'unknown';
    const ratio = width / height;
    if (ratio >= 1.45) return 'landscape';
    if (ratio <= 0.80) return 'portrait';
    if (Math.abs(ratio - 1) <= 0.06) return 'square';
    return 'standard';
  };

  const prepareImage = (img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.dataset.smartImageReady === 'true') return;

    const applyClassification = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;

      const ratio = img.naturalWidth / img.naturalHeight;
      const type = classifyRatio(img.naturalWidth, img.naturalHeight);

      img.dataset.smartImageReady = 'true';
      img.dataset.imageOrientation = type;
      img.dataset.imageRatio = ratio.toFixed(4);

      const wrapper = img.closest(
        '.image-card,.media,.smart-media,.world-card,.editorial-cover,' +
        '.featured-story-media,.editorial-card-media,.article-hero,' +
        '.preview,.preview-image,.story-thumb,.archival,.cta-panel'
      );

      if (wrapper) {
        wrapper.classList.remove(
          'is-landscape','is-standard','is-portrait','is-square'
        );
        wrapper.classList.add(`is-${type}`);
        wrapper.style.setProperty('--image-ratio', ratio.toFixed(4));
      }
    };

    if (img.complete && img.naturalWidth) {
      applyClassification();
    } else {
      img.addEventListener('load', applyClassification, { once: true });
    }

    img.addEventListener('error', () => {
      img.dataset.smartImageError = 'true';
    }, { once: true });
  };

  document.querySelectorAll('img').forEach(prepareImage);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches?.('img')) prepareImage(node);
        node.querySelectorAll?.('img').forEach(prepareImage);
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  document.querySelectorAll('img').forEach((img) => {
    const isCritical = img.closest('.hero-media,.article-hero,.login-image');
    if (!isCritical && !img.hasAttribute('loading')) img.loading = 'lazy';
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
  });
});
