/**
 * @typedef {Object} ProjectItem
 * @property {string} [id]
 * @property {string} [code]
 * @property {string} title
 * @property {string} category
 * @property {string} location
 * @property {string} area
 * @property {string} year
 * @property {string} image
 * @property {string} summary
 * @property {string} role
 * @property {string | string[]} scope
 * @property {string} result
 */

/**
 * Data cadangan (fallback) apabila kedua file JSON tidak dapat dimuat.
 * Data utama diambil secara dinamis dari ./public/data/projects.json (atau ./data/projects.json)
 * agar kompatibel penuh dengan Pages CMS (Git-based CMS).
 * @type {ProjectItem[]}
 */
const PROJECTS_DATA = [
  {
    title: 'Pembangunan Rumah Tinggal 2 Lantai',
    category: 'Bangun Baru',
    location: 'Tangerang, Banten',
    area: '140 m²',
    year: '2024',
    image: './public/assets/aistudio/Project_Portofolio_page-0007_7e5b8611.jpg',
    summary:
      'Pembangunan rumah tinggal 2 lantai untuk perorangan dari tahap fondasi hingga serah terima kunci.',
    role: 'Mengelola proyek dan tim dari tahap fondasi hingga penyelesaian akhir, memastikan kualitas bangunan sesuai desain dan kepuasan klien.',
    scope:
      'Perencanaan gambar kerja & 3D, Struktur beton bertulang 2 lantai, Atap pelana modern, Finishing arsitektur & MEP',
    result:
      'Selesai sesuai jadwal dengan feedback positif dari klien terkait efisiensi anggaran dan kualitas bangunan.',
  },
  {
    title: 'Renovasi Penambahan Lantai 3 SMK PGRI 1 Tangerang',
    category: 'Renovasi',
    location: 'Kota Tangerang',
    area: '450 m²',
    year: '2024',
    image: './public/assets/aistudio/Project_Portofolio_page-0008_0052feda.jpg',
    summary:
      'Renovasi penambahan lantai 3 gedung sekolah mencakup penguatan struktur eksisting dan konstruksi atap baru.',
    role: 'Sebagai subkontraktor pelaksana yang memastikan renovasi berjalan aman tanpa mengganggu operasional sekolah yang sedang berlangsung.',
    scope:
      'Audit & perkuatan struktur eksisting, Pembangunan lantai 3, Modifikasi konstruksi atap, Pengamanan area kerja sekolah',
    result:
      'Selesai tepat waktu sesuai desain dan standar perbaikan gedung pendidikan yang diinginkan.',
  },
  {
    title: 'Pembangunan Gedung Masjid & Infrastruktur',
    category: 'Bangun Baru',
    location: 'Tangerang, Banten',
    area: '320 m²',
    year: '2023',
    image: './public/assets/aistudio/Project_Portofolio_page-0009_6f841e3d.jpg',
    summary:
      'Pembangunan gedung masjid 2 lantai beserta penataan halaman dan sistem drainase lingkungan.',
    role: 'Pemborong utama yang mengelola seluruh proses dari konstruksi bangunan hingga penyelesaian infrastruktur seperti halaman masjid dan sistem drainase.',
    scope:
      'Struktur utama 2 lantai & pilar interior, Arsitektur ruang ibadah & plafon, Penataan halaman paving block, Sistem drainase lingkungan',
    result: 'Proyek selesai lebih cepat dari jadwal dengan anggaran yang tepat dan terkendali.',
  },
  {
    title: 'Renovasi Rumah Tinggal 2 Lantai',
    category: 'Renovasi',
    location: 'Tangerang Selatan',
    area: '130 m²',
    year: '2023',
    image: './public/assets/aistudio/Project_Portofolio_page-0010_ae50de89.jpg',
    summary:
      'Pekerjaan renovasi menyeluruh dan peremajaan fasad rumah tinggal 2 lantai untuk perorangan.',
    role: 'Mengelola proyek dan tim mulai dari penguatan struktur hingga penyelesaian akhir agar sesuai dengan desain arsitektur.',
    scope:
      'Penguatan struktur bangunan, Penataan ulang ruang dalam, Peremajaan fasad batu alam & kusen aluminium, Finishing & pemeliharaan',
    result:
      'Selesai dengan feedback positif dari klien terkait efisiensi waktu dan kualitas bangunan.',
  },
];

(function () {
  'use strict';

  const WHATSAPP_BASE = 'https://wa.me/62811232421?text=';

  /**
   * Menormalkan jalur gambar dari Pages CMS (baik "public/...", "/public/...",
   * "./public/...", maupun "./assets/...") agar selalu terbaca di GitHub Pages
   * maupun preview Vite/AI Studio.
   * @param {string} rawPath
   * @returns {string[]}
   */
  function resolveImageCandidates(rawPath) {
    const trimmed = (rawPath || '').trim();
    if (!trimmed) return [];

    if (/^(?:https?:|data:|blob:)/i.test(trimmed)) {
      return [trimmed];
    }

    const clean = trimmed.replace(/^(?:\.\/|\/)+/, '');
    if (clean.startsWith('public/')) {
      const primary = './' + clean;
      const fallback = './' + clean.replace(/^public\//, '');
      return primary === fallback ? [primary] : [primary, fallback];
    }

    const primary = './public/' + clean;
    const fallback = './' + clean;
    return [primary, fallback];
  }

  /**
   * Memecah field scope (baik string dipisah koma/baris baru maupun array) menjadi daftar rapi.
   * @param {string | string[] | undefined} scopeValue
   * @returns {string[]}
   */
  function normalizeScope(scopeValue) {
    if (Array.isArray(scopeValue)) {
      return scopeValue
        .map(function (item) {
          return String(item || '').trim();
        })
        .filter(Boolean);
    }
    if (typeof scopeValue === 'string') {
      return scopeValue
        .split(/[\n,;]+/)
        .map(function (item) {
          return item.trim();
        })
        .filter(Boolean);
    }
    return [];
  }

  /**
   * Memastikan setiap item proyek memiliki kode nomor yang konsisten.
   * @param {ProjectItem} project
   * @param {number} index
   * @returns {string}
   */
  function getProjectCode(project, index) {
    if (project.code && project.code.trim()) {
      return project.code.trim();
    }
    return 'PROYEK ' + String(index + 1).padStart(2, '0');
  }

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

  // 6. Dynamic Portfolio (Pages CMS JSON + Dual Fallback) + Filter + Detail Modal
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
  /** @type {string[]} */
  let currentModalImgCandidates = [];
  let currentModalImgAttempt = 0;

  if (modalImg) {
    modalImg.addEventListener('error', function () {
      currentModalImgAttempt += 1;
      if (currentModalImgAttempt < currentModalImgCandidates.length) {
        modalImg.src = currentModalImgCandidates[currentModalImgAttempt];
      }
    });
  }

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

      const imgCandidates = resolveImageCandidates(project.image);
      let imgAttempt = 0;

      if (imgCandidates.length > 0) {
        const img = document.createElement('img');
        img.src = imgCandidates[0];
        img.alt = project.title + (project.location ? ' — ' + project.location : '');
        img.loading = 'lazy';
        img.referrerPolicy = 'no-referrer';
        img.className = 'project-img';
        img.onerror = function () {
          imgAttempt += 1;
          if (imgAttempt < imgCandidates.length) {
            img.src = imgCandidates[imgAttempt];
          } else {
            media.innerHTML = '';
            media.appendChild(createFallbackMedia(project.title));
          }
        };
        media.appendChild(img);
      } else {
        media.appendChild(createFallbackMedia(project.title));
      }

      // Body
      const body = document.createElement('div');
      body.className = 'project-body';

      // Clean unboxed metadata line
      const metaLine = document.createElement('div');
      metaLine.className = 'project-meta-line';

      const catSpan = document.createElement('span');
      catSpan.className = 'project-meta-cat';
      catSpan.textContent = project.category || 'Proyek';

      const sep1 = document.createElement('span');
      sep1.setAttribute('aria-hidden', 'true');
      sep1.textContent = '·';

      const yearSpan = document.createElement('span');
      yearSpan.className = 'tabular-nums';
      yearSpan.textContent = project.year || '';

      metaLine.appendChild(catSpan);
      if (project.year) {
        metaLine.appendChild(sep1);
        metaLine.appendChild(yearSpan);
      }

      // Title
      const titleEl = document.createElement('h3');
      titleEl.className = 'project-title';
      titleEl.textContent = project.title;

      // Summary
      const summaryEl = document.createElement('p');
      summaryEl.className = 'project-summary';
      summaryEl.textContent = project.summary || '';

      // Bottom specs row: location + building area + detail affordance
      const specsRow = document.createElement('div');
      specsRow.className = 'project-specs-inline';

      const specsGroup = document.createElement('div');
      specsGroup.className = 'project-specs-group';

      const locSpan = document.createElement('span');
      locSpan.textContent = project.location || '';

      const sep2 = document.createElement('span');
      sep2.setAttribute('aria-hidden', 'true');
      sep2.textContent = '·';

      const areaSpan = document.createElement('span');
      areaSpan.className = 'project-area';
      areaSpan.textContent = project.area || '';

      if (project.location) specsGroup.appendChild(locSpan);
      if (project.location && project.area) specsGroup.appendChild(sep2);
      if (project.area) specsGroup.appendChild(areaSpan);

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
    const globalIdx = allProjects.indexOf(project);

    if (modalCode) modalCode.textContent = getProjectCode(project, globalIdx >= 0 ? globalIdx : currentModalIndex);
    if (modalCategory) modalCategory.textContent = project.category || '';
    if (modalCategoryVal) modalCategoryVal.textContent = project.category || '-';
    if (modalTitle) modalTitle.textContent = project.title || '';
    if (modalLocation) modalLocation.textContent = project.location || '-';
    if (modalArea) modalArea.textContent = project.area || '-';
    if (modalYear) modalYear.textContent = project.year || '-';
    if (modalSummary) modalSummary.textContent = project.summary || '-';
    if (modalRole) modalRole.textContent = project.role || '-';
    if (modalResult) modalResult.textContent = project.result || '-';

    if (modalImg) {
      currentModalImgCandidates = resolveImageCandidates(project.image);
      currentModalImgAttempt = 0;
      modalImg.src = currentModalImgCandidates[0] || '';
      modalImg.alt = project.title + (project.location ? ' — ' + project.location : '');
    }

    if (modalScope) {
      modalScope.innerHTML = '';
      normalizeScope(project.scope).forEach(function (item) {
        const li = document.createElement('li');
        li.textContent = item;
        modalScope.appendChild(li);
      });
    }

    if (modalWaLink) {
      const waMsg =
        'Halo Saiful - Edo Design & Build, saya tertarik berkonsultasi mengenai proyek serupa "' +
        project.title +
        '"' +
        (project.area ? ' (' + project.area + ')' : '') +
        '.';
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

  /**
   * Mengambil array proyek dari struktur Pages CMS ({ projects: [...] }) atau array langsung.
   * @param {string} url
   * @returns {Promise<ProjectItem[] | null>}
   */
  async function fetchProjectsFrom(url) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) return null;
      const payload = await response.json();
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray(payload.projects)) return payload.projects;
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Urutan pemuatan data:
   * 1. ./public/data/projects.json (GitHub Pages root branch / Pages CMS)
   * 2. ./data/projects.json (Vite build / preview AI Studio)
   * 3. PROJECTS_DATA (cadangan bawaan di script.js)
   */
  async function loadPortfolioData() {
    let loaded = await fetchProjectsFrom('./public/data/projects.json');
    if (!loaded) {
      loaded = await fetchProjectsFrom('./data/projects.json');
    }

    allProjects = loaded && loaded.length > 0 ? loaded : PROJECTS_DATA.slice();
    renderFilterTabs();
    renderPortfolioCards();
  }

  loadPortfolioData();
})();
