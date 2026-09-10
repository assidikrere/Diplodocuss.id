document.addEventListener('DOMContentLoaded', () => {
  const SITE_CONFIG = {
    showHadir: false
  };

  document.querySelectorAll('[data-feature="hadir"]').forEach((el) => {
    el.hidden = !SITE_CONFIG.showHadir;
  });

  /* =========================================================
     NAVIGATION
     ========================================================= */

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

  /* =========================================================
     YEAR
     ========================================================= */

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* =========================================================
     SMART IMAGE ART DIRECTION — V3
     ---------------------------------------------------------
     Lightweight. No external AI service.

     1. Reads the natural image ratio.
     2. Classifies orientation.
     3. Adds an orientation class.
     4. Applies a sensible default focal point.
     5. Applies asset-specific focal points where we know the
        composition needs art direction.

     Existing HTML does NOT need data attributes.
     ========================================================= */

  const focalPresets = {
    'drive.jpg': ['52%', '31%'],
    'door-friends.jpg': ['50%', '46%'],
    '2018-group.jpg': ['50%', '52%'],
    '2018-night-booth.jpg': ['50%', '54%'],
    '2018-lapangan-pemda.jpg': ['50%', '50%'],
    '2018-booth-worker.jpg': ['50%', '46%'],
    'now-working.jpg': ['50%', '46%'],
    'now-friends.jpg': ['50%', '48%'],
    'archival-2018.png': ['50%', '50%'],
    'founder-contact-sheet.png': ['50%', '50%']
  };

  const classifyRatio = (width, height) => {
    if (!width || !height) return 'unknown';

    const ratio = width / height;

    if (Math.abs(ratio - 1) <= 0.06) return 'square';
    if (ratio >= 1.45) return 'landscape';
    if (ratio <= 0.80) return 'portrait';
    return 'standard';
  };

  const assetNameFromSrc = (src) => {
    try {
      return decodeURIComponent(
        new URL(src, window.location.href).pathname.split('/').pop()
      );
    } catch {
      return String(src || '').split('/').pop();
    }
  };

  const applyImageArtDirection = (img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (!img.naturalWidth || !img.naturalHeight) return;

    const type = classifyRatio(img.naturalWidth, img.naturalHeight);
    const ratio = img.naturalWidth / img.naturalHeight;

    img.dataset.imageOrientation = type;
    img.dataset.imageRatio = ratio.toFixed(4);

    const assetName = assetNameFromSrc(img.currentSrc || img.src);
    const preset = focalPresets[assetName];

    /*
      Generic defaults:
      - Portraits: slightly upper than center because human faces
        / subjects are often above the geometric center.
      - Landscape: center.
      - Square: center.
    */
    let focusX = '50%';
    let focusY = type === 'portrait' ? '42%' : '50%';

    if (preset) {
      [focusX, focusY] = preset;
    }

    img.style.setProperty('--focus-x', focusX);
    img.style.setProperty('--focus-y', focusY);

    const wrapper = img.closest(
      '.image-card,' +
      '.media,' +
      '.smart-media,' +
      '.world-card,' +
      '.editorial-cover,' +
      '.featured-story-media,' +
      '.editorial-card-media,' +
      '.article-hero,' +
      '.preview,' +
      '.preview-image,' +
      '.story-thumb,' +
      '.archival,' +
      '.cta-panel'
    );

    if (wrapper) {
      wrapper.classList.remove(
        'is-landscape',
        'is-standard',
        'is-portrait',
        'is-square'
      );

      wrapper.classList.add(`is-${type}`);
      wrapper.style.setProperty('--image-ratio', ratio.toFixed(4));
      wrapper.style.setProperty('--focus-x', focusX);
      wrapper.style.setProperty('--focus-y', focusY);
    }
  };

  const prepareImage = (img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.dataset.artDirectionReady === 'true') return;

    const run = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      img.dataset.artDirectionReady = 'true';
      applyImageArtDirection(img);
    };

    if (img.complete && img.naturalWidth) {
      run();
    } else {
      img.addEventListener('load', run, { once: true });
    }

    img.addEventListener(
      'error',
      () => {
        img.dataset.smartImageError = 'true';
      },
      { once: true }
    );
  };

  document.querySelectorAll('img').forEach(prepareImage);

  /*
    Supabase-driven article/admin images can appear after page load.
  */
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;

        if (node.matches?.('img')) {
          prepareImage(node);
        }

        node.querySelectorAll?.('img').forEach(prepareImage);
      });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  /* =========================================================
     IMAGE LOADING
     ========================================================= */

  document.querySelectorAll('img').forEach((img) => {
    const isCritical = img.closest(
      '.hero-media,.article-hero,.login-image'
    );

    if (!isCritical && !img.hasAttribute('loading')) {
      img.loading = 'lazy';
    }

    if (!img.hasAttribute('decoding')) {
      img.decoding = 'async';
    }
  });
});
