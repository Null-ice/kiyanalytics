(function() {
  const backdrop = document.querySelector('[data-lb-backdrop]');
  const stage = document.querySelector('[data-lb-stage]');
  const closeBtn = document.querySelector('[data-lb-close]');
  const FOCUSABLE = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';

  let lastActiveEl = null;

  function openLightbox(sourceEl) {
    if (!backdrop || !stage) return;

    lastActiveEl = document.activeElement;

    // Clone media for isolation
    const clone = sourceEl.cloneNode(true);

    // For videos: ensure controls in lightbox
    if (clone.tagName.toLowerCase() === 'video') {
      clone.controls = true;
      clone.muted = false;      // user can unmute
      clone.playsInline = true;
      // Optional autoplay inside lightbox:
      // clone.play?.().catch(() => {});
    }

    stage.innerHTML = '';
    stage.appendChild(clone);

    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lb-open');

    closeBtn?.focus();

    document.addEventListener('keydown', onKeydown);
    backdrop.addEventListener('click', onBackdropClick);
  }

  function closeLightbox() {
    if (!backdrop) return;

    const v = stage.querySelector('video');
    if (v && !v.paused) { v.pause(); }

    backdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lb-open');
    stage.innerHTML = '';

    if (lastActiveEl && typeof lastActiveEl.focus === 'function') {
      lastActiveEl.focus();
    }

    document.removeEventListener('keydown', onKeydown);
    backdrop.removeEventListener('click', onBackdropClick);
  }

  function onBackdropClick(e) {
    const dialog = backdrop.querySelector('.lb-dialog');
    if (dialog && !dialog.contains(e.target)) {
      closeLightbox();
    }
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
      return;
    }
    if (e.key === 'Tab') {
      const dialog = backdrop.querySelector('.lb-dialog');
      const focusables = dialog ? Array.from(dialog.querySelectorAll(FOCUSABLE)) : [];
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }

  function bindTriggers(scope = document) {
    scope.querySelectorAll('img[data-lightbox], video[data-lightbox]').forEach(el => {
      el.style.cursor = 'zoom-in';
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', () => openLightbox(el));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(el);
        }
      });
    });
  }

  closeBtn?.addEventListener('click', closeLightbox);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => bindTriggers());
  } else {
    bindTriggers();
  }

  // Expose a tiny hook if you inject media dynamically later
  window.KiyLightbox = { bind: bindTriggers, close: closeLightbox };
})();