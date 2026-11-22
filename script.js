/**
 * @typedef {Object} ProjectItem
 * @property {string} id
 * @property {string} code
 * @property {string} title
 * @property {string} category
 * @property {string} location
 * @property {string} area
 * @property {string} year
 * @property {string} image
 * @property {string} summary
 * @property {string} role
 * @property {string[]} scope
 * @property {string} result
 */

(function () {
  'use strict';

  const WHATSAPP_BASE = 'https://wa.me/62811232421?text=';

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
        currentId = id === 'testimonials' ? 'about' : id;
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

  // 5. Copy to Clipboard Buttons
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

  // 6. Dynamic Portfolio (JSON-driven) + Category Filter + Detail Modal
  const filtersContainer = document.getElementById('portfolio-filters');
  const portfolioGrid = document.getElementById('portfolio-grid');

  const modalBackdrop = document.getElementById('project-modal');
  const modalDialog = document.getElementById('project-modal-dialog');
  const modalCode = document.getElementById('modal-code');
  const modalCategory = document.getElementById('modal-category');
  const modalCategoryVal = document.getElementById('modal-category-val');
  const modalTitle = document.getElementById('modal-title');
  const modalImg = /** @type {HTMLImageElement | null} */ (document.getElementById('modal-img'));
  const modalLocation = document.getElementById('modal-location');
  const modalArea = document.getElementById('modal-area');
  const modalYear = document.getElementById('modal-year');
  const modalSummary = document.getElementById('modal-summary');
  const modalRole = document.getElementById('modal-role');
  const modalScope = document.getElementById('modal-scope');
  const modalResult = document.getElementById('modal-result');
  const modalWaLink = /** @type {HTMLAnchorElement | null} */ (
    document.getElementById('modal-wa-link')
  );
  const modalPrev = document.getElementById('modal-prev');
  const modalNext = document.getElementById('modal-next');
  const modalClose = document.getElementById('modal-close');

  /** @type {ProjectItem[]} */
  let allProjects = [];
  /** @type {ProjectItem[]} */
  let filteredProjects = [];
  let activeCategory = 'Semua';
  let currentModalIndex = -1;

  function renderFilterTabs() {
    if (!filtersContainer) return;
    filtersContainer.innerHTML = '';

    const categories = ['Semua'];
    allProjects.forEach(function (project) {
      if (project.category && !categories.includes(project.category)) {
        categories.push(project.category);
      }
    });

    categories.forEach(function (category) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', category === activeCategory ? 'true' : 'false');
      btn.className = 'filter-tab' + (category === activeCategory ? ' is-active' : '');
      btn.textContent = category;

      btn.addEventListener('click', function () {
        if (activeCategory === category) return;
        activeCategory = category;
        renderFilterTabs();
        renderPortfolioCards();
      });

      filtersContainer.appendChild(btn);
    });
  }

  /** @param {string} title */
  function createFallbackMedia(title) {
    const fallback = document.createElement('div');
    fallback.className = 'project-img-fallback';
    const icon = document.createElement('i');
    icon.className = 'fa-regular fa-building';
    const label = document.createElement('span');
    label.textContent = title;
    fallback.appendChild(icon);
    fallback.appendChild(label);
    return fallback;
  }

  function renderPortfolioCards() {
    if (!portfolioGrid) return;
    portfolioGrid.innerHTML = '';

    filteredProjects =
      activeCategory === 'Semua'
        ? allProjects.slice()
        : allProjects.filter(function (p) {
            return p.category === activeCategory;
          });

    if (filteredProjects.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'portfolio-status';
      empty.textContent = 'Belum ada proyek pada kategori "' + activeCategory + '".';
      portfolioGrid.appendChild(empty);
      return;
    }

    filteredProjects.forEach(function (project, index) {
      const cardBtn = document.createElement('button');
      cardBtn.type = 'button';
      cardBtn.className = 'project-card';
      cardBtn.setAttribute('aria-label', 'Lihat detail proyek ' + project.title);

      // Media wrapper
      const media = document.createElement('div');
      media.className = 'project-media';

      const img = document.createElement('img');
      img.src = project.image;
      img.alt = project.title + ' — ' + project.location;
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      img.className = 'project-img';
      img.addEventListener('error', function () {
        media.innerHTML = '';
        media.appendChild(createFallbackMedia(project.title));
      });
      media.appendChild(img);

      // Body
      const body = document.createElement('div');
      body.className = 'project-body';

      // Clean unboxed metadata line
      const metaLine = document.createElement('div');
      metaLine.className = 'project-meta-line';

      const catSpan = document.createElement('span');
      catSpan.className = 'project-meta-cat';
      catSpan.textContent = project.category;

      const sep1 = document.createElement('span');
      sep1.setAttribute('aria-hidden', 'true');
      sep1.textContent = '·';

      const yearSpan = document.createElement('span');
      yearSpan.className = 'tabular-nums';
      yearSpan.textContent = project.year;

      metaLine.appendChild(catSpan);
      metaLine.appendChild(sep1);
      metaLine.appendChild(yearSpan);

      // Title
      const titleEl = document.createElement('h3');
      titleEl.className = 'project-title';
      titleEl.textContent = project.title;

      // Summary
      const summaryEl = document.createElement('p');
      summaryEl.className = 'project-summary';
      summaryEl.textContent = project.summary;

      // Bottom specs row: location + building area + detail affordance
      const specsRow = document.createElement('div');
      specsRow.className = 'project-specs-inline';

      const specsGroup = document.createElement('div');
      specsGroup.className = 'project-specs-group';

      const locSpan = document.createElement('span');
      locSpan.textContent = project.location;

      const sep2 = document.createElement('span');
      sep2.setAttribute('aria-hidden', 'true');
      sep2.textContent = '·';

      const areaSpan = document.createElement('span');
      areaSpan.className = 'project-area';
      areaSpan.textContent = project.area;

      specsGroup.appendChild(locSpan);
      specsGroup.appendChild(sep2);
      specsGroup.appendChild(areaSpan);

      const hint = document.createElement('span');
      hint.className = 'project-cta-hint';
      hint.innerHTML = 'Detail <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';

      specsRow.appendChild(specsGroup);
      specsRow.appendChild(hint);

      body.appendChild(metaLine);
      body.appendChild(titleEl);
      body.appendChild(summaryEl);
      body.appendChild(specsRow);

      cardBtn.appendChild(media);
      cardBtn.appendChild(body);

      cardBtn.addEventListener('click', function () {
        openProjectModal(index);
      });

      portfolioGrid.appendChild(cardBtn);
    });
  }

  /** @param {number} index */
  function openProjectModal(index) {
    if (!modalBackdrop || filteredProjects.length === 0) return;

    const total = filteredProjects.length;
    currentModalIndex = ((index % total) + total) % total;
    const project = filteredProjects[currentModalIndex];

    if (modalCode) modalCode.textContent = project.code;
    if (modalCategory) modalCategory.textContent = project.category;
    if (modalCategoryVal) modalCategoryVal.textContent = project.category;
    if (modalTitle) modalTitle.textContent = project.title;
    if (modalLocation) modalLocation.textContent = project.location;
    if (modalArea) modalArea.textContent = project.area;
    if (modalYear) modalYear.textContent = project.year;
    if (modalSummary) modalSummary.textContent = project.summary;
    if (modalRole) modalRole.textContent = project.role;
    if (modalResult) modalResult.textContent = project.result;

    if (modalImg) {
      modalImg.src = project.image;
      modalImg.alt = project.title + ' — ' + project.location;
    }

    if (modalScope) {
      modalScope.innerHTML = '';
      (project.scope || []).forEach(function (item) {
        const li = document.createElement('li');
        li.textContent = item;
        modalScope.appendChild(li);
      });
    }

    if (modalWaLink) {
      const waMsg =
        'Halo Saiful - Edo Design & Build, saya tertarik berkonsultasi mengenai proyek serupa "' +
        project.title +
        '" (' +
        project.area +
        ').';
      modalWaLink.href = WHATSAPP_BASE + encodeURIComponent(waMsg);
    }

    const showNav = total > 1;
    if (modalPrev) modalPrev.classList.toggle('is-hidden', !showNav);
    if (modalNext) modalNext.classList.toggle('is-hidden', !showNav);

    modalBackdrop.classList.remove('is-hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.add('is-hidden');
    document.body.style.overflow = '';
    currentModalIndex = -1;
  }

  if (modalPrev) {
    modalPrev.addEventListener('click', function () {
      if (currentModalIndex !== -1) openProjectModal(currentModalIndex - 1);
    });
  }

  if (modalNext) {
    modalNext.addEventListener('click', function () {
      if (currentModalIndex !== -1) openProjectModal(currentModalIndex + 1);
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeProjectModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeProjectModal);
  }

  if (modalDialog) {
    modalDialog.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (currentModalIndex === -1) return;
    if (e.key === 'Escape') {
      closeProjectModal();
    } else if (e.key === 'ArrowLeft') {
      openProjectModal(currentModalIndex - 1);
    } else if (e.key === 'ArrowRight') {
      openProjectModal(currentModalIndex + 1);
    }
  });

  // Load projects from separate JSON file (/data/projects.json)
  async function loadPortfolioData() {
    try {
      const response = await fetch('/data/projects.json');
      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Format JSON tidak valid');
      }
      allProjects = data;
      renderFilterTabs();
      renderPortfolioCards();
    } catch {
      if (portfolioGrid) {
        portfolioGrid.innerHTML = '';
        const err = document.createElement('p');
        err.className = 'portfolio-status';
        err.textContent = 'Gagal memuat data proyek portofolio. Silakan muat ulang halaman.';
        portfolioGrid.appendChild(err);
      }
    }
  }

  loadPortfolioData();
})();
