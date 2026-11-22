(function () {
  'use strict';

  // 1. Tahun hak cipta otomatis di footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // 2. Mobile Navigation Toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  /** @param {boolean} [forceClose] */
  function toggleMobileMenu(forceClose) {
    if (!mobileMenu || !mobileBtn || !iconOpen || !iconClose) return;
    const isHidden = mobileMenu.classList.contains('is-hidden');
    const shouldOpen = forceClose ? false : isHidden;

    mobileMenu.classList.toggle('is-hidden', !shouldOpen);
    iconOpen.classList.toggle('is-hidden', shouldOpen);
    iconClose.classList.toggle('is-hidden', !shouldOpen);
    mobileBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
  }

  if (mobileBtn) {
    mobileBtn.addEventListener('click', function () {
      toggleMobileMenu(false);
    });
  }

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      toggleMobileMenu(true);
    });
  });

  // 3. Navbar Shadow & Scroll Spy Active Indicator
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    const scrollY = window.scrollY || window.pageYOffset;

    if (navbar) {
      navbar.classList.toggle('is-scrolled', scrollY > 12);
    }

    let currentId = 'home';
    sections.forEach(function (section) {
      const el = /** @type {HTMLElement} */ (section);
      const sectionTop = el.offsetTop - 130;
      const sectionHeight = el.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        const id = el.getAttribute('id') || 'home';
        currentId = id === 'testimonials' ? 'portfolio' : id;
      }
    });

    navLinks.forEach(function (link) {
      const target = link.getAttribute('data-nav');
      link.classList.toggle('is-active', target === currentId);
    });

    mobileLinks.forEach(function (link) {
      const target = link.getAttribute('data-mobile-nav');
      link.classList.toggle('is-active', target === currentId);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  window.addEventListener('load', updateActiveNav);
  updateActiveNav();

  // 4. Toast Notification Helper
  let toastTimeout = null;

  /** @param {string} message */
  function showToast(message) {
    const toast = document.getElementById('copy-toast');
    const toastText = document.getElementById('copy-toast-text');
    if (!toast || !toastText) return;

    toastText.textContent = message;
    toast.classList.remove('is-hidden');

    if (toastTimeout !== null) {
      window.clearTimeout(toastTimeout);
    }
    toastTimeout = window.setTimeout(function () {
      toast.classList.add('is-hidden');
    }, 3000);
  }

  // 5. Copy to Clipboard Buttons (with fallback for iframes)
  /**
   * @param {string} text
   * @param {string} label
   */
  async function copyToClipboard(text, label) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast(label + ' berhasil disalin');
        return;
      }
    } catch {
      // Fallback below
    }

    try {
      const tempInput = document.createElement('textarea');
      tempInput.value = text;
      tempInput.setAttribute('readonly', '');
      tempInput.style.position = 'absolute';
      tempInput.style.left = '-9999px';
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      showToast(label + ' berhasil disalin');
    } catch {
      showToast('Gagal menyalin ' + label.toLowerCase());
    }
  }

  document.querySelectorAll('.btn-copy').forEach(function (button) {
    button.addEventListener('click', function () {
      const text = button.getAttribute('data-copy-text') || '';
      const label = button.getAttribute('data-copy-label') || 'Teks';
      if (text) {
        copyToClipboard(text, label);
      }
    });
  });

  // 6. Lightbox Modal with Prev / Next Navigation & Keyboard Support
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxDialog = document.getElementById('lightbox-dialog');
  const lightboxImg = /** @type {HTMLImageElement | null} */ (
    document.getElementById('lightbox-img')
  );
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxClose = document.getElementById('lightbox-close');
  const projectButtons = Array.from(document.querySelectorAll('.project-media-btn'));

  let currentLightboxIndex = -1;

  /** @param {number} index */
  function openLightboxAt(index) {
    if (!lightboxModal || !lightboxImg || !lightboxCaption) return;
    const total = projectButtons.length;
    if (total === 0) return;

    currentLightboxIndex = ((index % total) + total) % total;
    const targetBtn = projectButtons[currentLightboxIndex];
    const imgEl = /** @type {HTMLImageElement | null} */ (targetBtn.querySelector('img'));
    const caption = targetBtn.getAttribute('data-caption') || 'Dokumentasi Proyek';

    if (imgEl) {
      lightboxImg.src = imgEl.src;
      lightboxImg.alt = caption;
    }
    lightboxCaption.textContent = caption;

    if (lightboxCounter) {
      lightboxCounter.textContent = currentLightboxIndex + 1 + ' / ' + total;
    }

    lightboxModal.classList.remove('is-hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.add('is-hidden');
    document.body.style.overflow = '';
    currentLightboxIndex = -1;
  }

  projectButtons.forEach(function (btn, idx) {
    btn.addEventListener('click', function () {
      openLightboxAt(idx);
    });
  });

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', function () {
      if (currentLightboxIndex !== -1) {
        openLightboxAt(currentLightboxIndex - 1);
      }
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', function () {
      if (currentLightboxIndex !== -1) {
        openLightboxAt(currentLightboxIndex + 1);
      }
    });
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', closeLightbox);
  }

  if (lightboxDialog) {
    lightboxDialog.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (currentLightboxIndex === -1) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      openLightboxAt(currentLightboxIndex - 1);
    } else if (e.key === 'ArrowRight') {
      openLightboxAt(currentLightboxIndex + 1);
    }
  });

  // 7. Pemilih 4 Foto Proyek (.jpg) untuk Pratinjau Langsung di Browser
  const multiPhotoBtn = document.getElementById('multi-photo-btn');
  const multiPhotoInput = /** @type {HTMLInputElement | null} */ (
    document.getElementById('multi-photo-input')
  );
  const photoBtnLabel = document.getElementById('photo-btn-label');

  if (multiPhotoBtn && multiPhotoInput) {
    multiPhotoBtn.addEventListener('click', function () {
      multiPhotoInput.click();
    });

    multiPhotoInput.addEventListener('change', function () {
      const files = Array.from(multiPhotoInput.files || []);
      if (files.length === 0) return;

      const projectTargets = [
        { id: 'img-proyek-01', keys: ['0007', '1000720682'] },
        { id: 'img-proyek-02', keys: ['0008', '1000720681'] },
        { id: 'img-proyek-03', keys: ['0009', '1000720683'] },
        { id: 'img-proyek-04', keys: ['0010', '1000720685'] },
      ];

      let fallbackIdx = 0;

      files.forEach(function (file) {
        const reader = new FileReader();
        reader.onload = function (ev) {
          const dataUrl = ev.target && typeof ev.target.result === 'string' ? ev.target.result : '';
          if (!dataUrl) return;

          let matched = projectTargets.find(function (target) {
            return target.keys.some(function (key) {
              return file.name.includes(key);
            });
          });

          if (!matched && fallbackIdx < projectTargets.length) {
            matched = projectTargets[fallbackIdx++];
          }

          if (matched) {
            const imgEl = /** @type {HTMLImageElement | null} */ (
              document.getElementById(matched.id)
            );
            if (imgEl) {
              imgEl.src = dataUrl;
            }
          }
        };
        reader.readAsDataURL(file);
      });

      if (photoBtnLabel) {
        photoBtnLabel.textContent = files.length + ' Foto Proyek Dimuat';
      }
      showToast('Foto proyek asli berhasil ditampilkan');
      multiPhotoInput.value = '';
    });
  }
})();
