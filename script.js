/* =========================================================
   ZION HILL SCHOOL — script.js
   Fast, reliable, GitHub-Pages safe
   ========================================================= */
(function () {
  'use strict';

  /* =========================================================
     PRELOADER — dismiss as soon as page is interactive
     ========================================================= */
  function dismissPreloader() {
    const pre = document.getElementById('preloader');
    if (!pre) return;
    // Minimum 1.4s so the animation feels intentional, not a flash
    const minTime = 1400;
    const start   = Date.now();
    function hide() {
      const elapsed = Date.now() - start;
      const delay   = Math.max(0, minTime - elapsed);
      setTimeout(() => {
        pre.classList.add('done');
        // Remove from DOM after fade finishes
        setTimeout(() => pre.remove(), 550);
      }, delay);
    }
    if (document.readyState === 'complete') {
      hide();
    } else {
      window.addEventListener('load', hide, { once: true });
      // Safety net: never show more than 4s even if load is very slow
      setTimeout(hide, 4000);
    }
  }
  dismissPreloader();

  /* ---- Init Lucide icons immediately ---- */
  if (window.lucide) lucide.createIcons();

  /* ---- DOM refs ---- */
  const topBar      = document.getElementById('topBar');
  const header      = document.getElementById('siteHeader');
  const mainContent = document.getElementById('mainContent');
  const hamburger   = document.getElementById('hamburger');
  const drawer      = document.getElementById('mobileDrawer');
  const overlay     = document.getElementById('navOverlay');
  const drawerClose = document.getElementById('drawerClose');
  const searchBtn   = document.getElementById('searchBtn');
  const searchPanel = document.getElementById('searchPanel');
  const searchClose = document.getElementById('searchClose');
  const searchClear = document.getElementById('searchClear');
  const searchInput = document.getElementById('searchInput');
  const navLinks    = document.querySelectorAll('.nav-link');

  /* =========================================================
     1. FIXED HEADER — set top precisely, update on every scroll
     ========================================================= */
  let lastY   = 0;
  let ticking = false;
  let tbH     = topBar ? topBar.offsetHeight : 0;   // cache topbar height

  function setHeaderTop(topbarVisible) {
    if (!header) return;
    header.style.top = topbarVisible ? tbH + 'px' : '0px';
  }

  function updateHeaderHeight() {
    /* Keep #mainContent padding matching actual fixed header stack */
    if (!mainContent || !header) return;
    const topbarVisible = !topBar.classList.contains('hide');
    const total = (topbarVisible ? tbH : 0) + header.offsetHeight;
    mainContent.style.paddingTop = total + 'px';
  }

  function onScroll() {
    const y = window.scrollY;

    /* Shrink/grow header */
    header.classList.toggle('scrolled', y > 50);

    /* Hide topbar on scroll-down, show on scroll-up */
    if (y > lastY && y > 90) {
      topBar.classList.add('hide');
      setHeaderTop(false);
    } else {
      topBar.classList.remove('hide');
      setHeaderTop(true);
    }
    lastY = y < 0 ? 0 : y;

    updateHeaderHeight();
    highlightNav();
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* =========================================================
     2. ACTIVE NAV HIGHLIGHT
     ========================================================= */
  function highlightNav() {
    const mid = window.scrollY + 120;
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href[0] !== '#') return;
      const sec = document.querySelector(href);
      if (!sec) return;
      const top = sec.offsetTop;
      const bot = top + sec.offsetHeight;
      link.classList.toggle('active', mid >= top && mid < bot);
    });
  }

  /* =========================================================
     3. HAMBURGER / DRAWER
     ========================================================= */
  function openDrawer() {
    hamburger.classList.add('open');
    drawer.classList.add('open');
    overlay.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    staggerDrawerLinks();
  }

  function closeDrawer() {
    hamburger.classList.remove('open');
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    drawer.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function staggerDrawerLinks() {
    drawer.querySelectorAll('.drawer-link').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(14px)';
      el.style.transition = 'none';
      setTimeout(() => {
        el.style.transition = 'opacity 0.28s ease, transform 0.28s ease, background 0.22s, color 0.22s, padding-left 0.22s';
        el.style.opacity = '1';
        el.style.transform = 'translateX(0)';
      }, 40 + i * 40);
    });
  }

  hamburger.addEventListener('click', () => drawer.classList.contains('open') ? closeDrawer() : openDrawer());
  drawerClose.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.querySelectorAll('[data-close-drawer]').forEach(el => el.addEventListener('click', closeDrawer));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeDrawer(); closeSearch(); }
  });

  window.addEventListener('resize', () => {
    tbH = topBar ? topBar.offsetHeight : 0;
    if (window.innerWidth > 900) closeDrawer();
    setHeaderTop(!topBar.classList.contains('hide'));
    updateHeaderHeight();
  }, { passive: true });

  /* =========================================================
     4. SMOOTH SCROLL — accounts for fixed header height
     ========================================================= */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const topbarVisible = !topBar.classList.contains('hide');
      const offset = (topbarVisible ? tbH : 0) + header.offsetHeight + 8;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* =========================================================
     5. SEARCH PANEL
     ========================================================= */
  function openSearch() {
    searchPanel.classList.add('open');
    setTimeout(() => searchInput && searchInput.focus(), 200);
  }
  function closeSearch() {
    searchPanel.classList.remove('open');
    if (searchInput) { searchInput.value = ''; }
    if (searchClear) { searchClear.classList.remove('show'); }
  }

  searchBtn  && searchBtn.addEventListener('click', openSearch);
  searchClose && searchClose.addEventListener('click', closeSearch);
  document.querySelectorAll('[data-close-search]').forEach(el => el.addEventListener('click', closeSearch));

  searchInput && searchInput.addEventListener('input', () => {
    searchClear.classList.toggle('show', searchInput.value.length > 0);
  });
  searchClear && searchClear.addEventListener('click', () => {
    searchInput.value = ''; searchClear.classList.remove('show'); searchInput.focus();
  });

  /* =========================================================
     6. HERO ANIMATIONS — safe fallback if IntersectionObserver
        not supported or items already in view
     ========================================================= */
  function initHeroAnimations() {
    /* Mark body so CSS knows JS is running */
    document.body.classList.add('js-ready');

    const items = document.querySelectorAll('.anim-item');
    if (!items.length) return;

    if (!window.IntersectionObserver) {
      /* Fallback: just show everything immediately */
      items.forEach(el => el.classList.add('visible'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = parseInt(el.dataset.delay || '0');
        setTimeout(() => el.classList.add('visible'), delay);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    /* Set animation delays on hero items */
    const content = document.querySelectorAll('.hero__content .anim-item');
    content.forEach((el, i) => { el.dataset.delay = i * 110; });

    const cards = document.querySelectorAll('.hero__cards .anim-item');
    cards.forEach((el, i) => { el.dataset.delay = 400 + i * 90; });

    items.forEach(el => io.observe(el));

    /* Safety net: if page is already scrolled (e.g. reload mid-page),
       force all hero items visible after 800ms */
    setTimeout(() => {
      items.forEach(el => {
        if (!el.classList.contains('visible')) el.classList.add('visible');
      });
    }, 1200);
  }

  /* =========================================================
     7. FLOATING PARTICLES
     ========================================================= */
  function initParticles() {
    const c = document.getElementById('heroParticles');
    if (!c) return;
    const n = window.innerWidth < 600 ? 10 : 18;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('div');
      p.className = 'hero__particle';
      const size = Math.random() * 2.5 + 1.5;
      p.style.cssText = [
        `width:${size}px`, `height:${size}px`,
        `left:${Math.random()*100}%`,
        `animation-duration:${Math.random()*12+9}s`,
        `animation-delay:-${Math.random()*10}s`,
        `background:${Math.random()>0.55 ? 'rgba(244,180,0,0.55)' : 'rgba(255,255,255,0.35)'}`,
      ].join(';');
      c.appendChild(p);
    }
  }

  /* =========================================================
     8. COUNTER ANIMATION (stats)
     ========================================================= */
  function initCounters() {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length || !window.IntersectionObserver) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el  = entry.target;
        const end = parseInt(el.dataset.count);
        let cur   = 0;
        const step = end / 35;
        const t = setInterval(() => {
          cur += step;
          if (cur >= end) { cur = end; clearInterval(t); }
          el.textContent = Math.floor(cur);
        }, 30);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(el => io.observe(el));
  }

  /* =========================================================
     9. INIT
     ========================================================= */
  /* Run immediately for header positioning */
  setHeaderTop(true);
  updateHeaderHeight();

  /* Run on DOM ready */
  document.addEventListener('DOMContentLoaded', () => {
    tbH = topBar ? topBar.offsetHeight : 0;
    setHeaderTop(true);
    updateHeaderHeight();
    highlightNav();
    if (window.lucide) lucide.createIcons();
    initHeroAnimations();
    initParticles();
    initCounters();
    initTestiSlider();
    initCBCExplorer();
    initShowcaseStats();
    initHeroVideo();
    initFooterYear();
  });

  /* Re-run after everything loads (fonts, images) */
  window.addEventListener('load', () => {
    tbH = topBar ? topBar.offsetHeight : 0;
    setHeaderTop(true);
    updateHeaderHeight();
  });

  /* =========================================================
     TESTIMONIALS SLIDER
     ========================================================= */
  function initTestiSlider() {
    const track  = document.getElementById('testiTrack');
    const dotsEl = document.getElementById('testiDots');
    const prev   = document.getElementById('testiPrev');
    const next   = document.getElementById('testiNext');
    if (!track) return;

    const cards   = track.querySelectorAll('.testi__card');
    const total   = cards.length;
    let current   = 0;
    let perView   = getPerView();
    let maxIndex  = Math.max(0, total - perView);
    let autoTimer;

    function getPerView() {
      return window.innerWidth <= 600 ? 1 : window.innerWidth <= 900 ? 2 : 3;
    }

    function buildDots() {
      dotsEl.innerHTML = '';
      const pages = Math.ceil(total / perView);
      for (let i = 0; i < pages; i++) {
        const btn = document.createElement('button');
        btn.className = 'testi__dot' + (i === 0 ? ' active' : '');
        btn.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        btn.addEventListener('click', () => goTo(i * perView));
        dotsEl.appendChild(btn);
      }
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, maxIndex));
      const cardWidth = cards[0].offsetWidth;
      const gap       = 24;
      track.style.transform = 'translateX(-' + (current * (cardWidth + gap)) + 'px)';
      const dots       = dotsEl.querySelectorAll('.testi__dot');
      const activePage = Math.floor(current / perView);
      dots.forEach((d, i) => d.classList.toggle('active', i === activePage));
    }

    function goPrev() { goTo(current - perView); resetAuto(); }
    function goNext() {
      const n = current + perView;
      goTo(n > maxIndex ? 0 : n);
      resetAuto();
    }

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => {
        const n = current + perView;
        goTo(n > maxIndex ? 0 : n);
      }, 5000);
    }

    prev && prev.addEventListener('click', goPrev);
    next && next.addEventListener('click', goNext);

    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
    });

    window.addEventListener('resize', () => {
      perView  = getPerView();
      maxIndex = Math.max(0, total - perView);
      current  = Math.min(current, maxIndex);
      buildDots();
      goTo(current);
    }, { passive: true });

    buildDots();
    resetAuto();
  }

  /* =========================================================
     ADMISSIONS FORM — composes & opens WhatsApp message
     ========================================================= */

  /* =========================================================
     CBC EXPLORER — tab switcher
     ========================================================= */
  function initCBCExplorer() {
    const tabs = document.querySelectorAll('.cbc-tab');
    if (!tabs.length) return;
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.cbc-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById('tab-' + tab.dataset.tab);
        if (panel) panel.classList.add('active');
        if (window.lucide) lucide.createIcons();
      });
    });
  }

  /* =========================================================
     SHOWCASE STATS — animated counters
     ========================================================= */
  function initShowcaseStats() {
    const els = document.querySelectorAll('.showcase__stat-num[data-count]');
    if (!els.length || !window.IntersectionObserver) {
      els.forEach(el => { el.textContent = el.dataset.count; });
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el  = entry.target;
        const end = parseInt(el.dataset.count);
        let cur = 0;
        const step = end / 40;
        const t = setInterval(() => {
          cur += step;
          if (cur >= end) { cur = end; clearInterval(t); }
          el.textContent = Math.floor(cur);
        }, 30);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(el => io.observe(el));
  }

  /* =========================================================
     HERO VIDEO MODAL
     To use your own video: replace eVKPFCd7b4c in heroVideoSrc below
     with your YouTube video ID. Make sure embedding is ON in YouTube Studio.
     ========================================================= */
  function initHeroVideo() {
    const btn      = document.getElementById('heroVideoBtn');
    const modal    = document.getElementById('heroVideoModal');
    const frame    = document.getElementById('heroVideoFrame');
    const closeBtn = document.getElementById('videoClose');
    const backdrop = document.getElementById('videoBackdrop');
    if (!btn || !modal || !frame) return;

    /* ── REPLACE THIS VIDEO ID WITH YOUR OWN WHEN READY ── */
    const heroVideoSrc = 'https://www.youtube.com/embed/eVKPFCd7b4c?autoplay=1&rel=0&modestbranding=1&playsinline=1';

    function openModal() {
      frame.src = heroVideoSrc;
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if (window.lucide) lucide.createIcons();
    }
    function closeModal() {
      modal.style.display = 'none';
      frame.src = '';
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', openModal);
    if (closeBtn)  closeBtn.addEventListener('click', closeModal);
    if (backdrop)  backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.style.display !== 'none') closeModal();
    });
  }

  /* =========================================================
     FOOTER YEAR
     ========================================================= */
  function initFooterYear() {
    const el = document.getElementById('footerYear');
    if (el) el.textContent = new Date().getFullYear();
  }

})();