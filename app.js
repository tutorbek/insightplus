(function () {
  if (window.__insightPlusReady) return;
  window.__insightPlusReady = true;

  const pageCache = new Map();
  const pjaxStyleSelector = 'style[data-pjax-style="true"]';

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function setBodyLocked(isLocked) {
    document.body.classList.toggle('overflow-hidden', isLocked);
  }

  function closeMobileMenu() {
    const drawer = qs('#mobile-drawer') || qs('#mobile-menu-drawer');
    const backdrop = qs('#mobile-backdrop') || qs('#mobile-menu-backdrop');
    const openButton = qs('#mobile-menu-open');

    drawer?.classList.add('hidden');
    backdrop?.classList.add('hidden');
    drawer?.classList.remove('opacity-100', 'pointer-events-auto');
    backdrop?.classList.remove('opacity-100', 'pointer-events-auto');
    openButton?.setAttribute('aria-expanded', 'false');
    setBodyLocked(false);
  }

  function openMobileMenu() {
    const drawer = qs('#mobile-drawer') || qs('#mobile-menu-drawer');
    const backdrop = qs('#mobile-backdrop') || qs('#mobile-menu-backdrop');
    const openButton = qs('#mobile-menu-open');

    drawer?.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    backdrop?.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    drawer?.classList.add('opacity-100', 'pointer-events-auto');
    backdrop?.classList.add('opacity-100', 'pointer-events-auto');
    openButton?.setAttribute('aria-expanded', 'true');
    setBodyLocked(true);
  }

  function closeContact() {
    const modal = qs('#contact-modal');
    modal?.classList.add('hidden');
    modal?.classList.remove('flex');
    setBodyLocked(false);
  }

  function openContact() {
    const modal = qs('#contact-modal');
    modal?.classList.remove('hidden');
    modal?.classList.add('flex');
    closeMobileMenu();
    setBodyLocked(true);
  }

  function initNavigation(root = document) {
    const bindOnce = (element, eventName, handler, key) => {
      if (!element || element.dataset[key] === 'true') return;
      element.dataset[key] = 'true';
      element.addEventListener(eventName, handler);
    };

    bindOnce(qs('#mobile-menu-open', root), 'click', openMobileMenu, 'menuReady');
    bindOnce(qs('#mobile-menu-close', root), 'click', closeMobileMenu, 'menuReady');
    bindOnce(qs('#mobile-backdrop', root) || qs('#mobile-menu-backdrop', root), 'click', closeMobileMenu, 'menuReady');
    qsa('.mobile-link, .mobile-nav-link', root).forEach((link) => bindOnce(link, 'click', closeMobileMenu, 'menuReady'));
    qsa('[data-open-contact]', root).forEach((button) => bindOnce(button, 'click', openContact, 'contactReady'));
    qsa('[data-close-contact]', root).forEach((el) => bindOnce(el, 'click', closeContact, 'contactReady'));
  }

  function initHeader() {
    const header = qs('#site-header');
    if (!header) return;
    header.classList.toggle('shadow-soft', window.scrollY > 8);
  }

  function initSectionScroll(root = document) {
    qsa('[data-scroll-to]', root).forEach((link) => {
      if (link.dataset.scrollReady === 'true') return;
      link.dataset.scrollReady = 'true';
      link.addEventListener('click', (event) => {
        const targetId = link.dataset.scrollTo;
        const target = targetId ? document.getElementById(targetId) : null;
        if (!target) return;

        event.preventDefault();
        closeMobileMenu();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (history.pushState) history.pushState(null, '', `#${targetId}`);
      });
    });
  }

  function updateActiveNavigation(pathname = window.location.pathname) {
    const currentPage = pathname.split('/').pop() || 'index.html';

    qsa('.nav-link').forEach((link) => {
      const linkPage = new URL(link.href, window.location.href).pathname.split('/').pop() || 'index.html';
      const isActive = linkPage === currentPage;
      link.classList.toggle('active', isActive);
      link.classList.toggle('text-primary', isActive);
      link.classList.toggle('text-slate-700', !isActive);
    });

    qsa('.mobile-link').forEach((link) => {
      const linkPage = new URL(link.href, window.location.href).pathname.split('/').pop() || 'index.html';
      const isActive = linkPage === currentPage;
      link.classList.toggle('bg-skysoft', isActive);
      link.classList.toggle('text-primary', isActive);
      link.classList.toggle('text-slate-700', !isActive);
    });
  }

  function initReveal(root = document) {
    const targets = qsa('.reveal', root).filter((el) => el.dataset.revealReady !== 'true');
    targets.forEach((el) => {
      el.dataset.revealReady = 'true';
    });

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('show'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    targets.forEach((el) => observer.observe(el));
  }

  function initFaqAccordion(root = document) {
    qsa('details', root).forEach((details) => {
      if (details.dataset.accordionReady === 'true') return;
      details.dataset.accordionReady = 'true';
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        const parent = details.parentElement;
        qsa('details', parent || root).forEach((other) => {
          if (other !== details) other.open = false;
        });
      });
    });
  }

  function initContactForm(root = document) {
    const form = qs('#contactForm', root);
    if (!form || form.dataset.formReady === 'true') return;
    form.dataset.formReady = 'true';

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const button = qs('button[type="submit"], button', form);
      if (!button) return;

      const originalHTML = button.innerHTML;
      button.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Yuborilmoqda...';
      button.disabled = true;

      window.setTimeout(() => {
        button.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Xabar yuborildi!';
        button.classList.add('bg-green-600');
        form.reset();

        window.setTimeout(() => {
          button.innerHTML = originalHTML;
          button.classList.remove('bg-green-600');
          button.disabled = false;
        }, 2200);
      }, 900);
    });
  }

  function initMapHover(root = document) {
    const iframe = qs('iframe', root);
    const mapContainer = iframe?.parentElement;
    if (!mapContainer || mapContainer.dataset.mapHoverReady === 'true') return;
    mapContainer.dataset.mapHoverReady = 'true';
    mapContainer.addEventListener('mouseenter', () => {
      mapContainer.style.transform = 'translateY(-4px)';
      mapContainer.style.transition = 'transform .35s ease';
    });
    mapContainer.addEventListener('mouseleave', () => {
      mapContainer.style.transform = 'translateY(0)';
    });
  }

  function initPage(root = document) {
    initNavigation(root);
    initHeader();
    updateActiveNavigation();
    initSectionScroll(root);
    initReveal(root);
    initFaqAccordion(root);
    initContactForm(root);
    initMapHover(root);
  }

  function isPlainNavigationClick(event) {
    return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }

  function isPjaxUrl(url) {
    const isFileNavigation = window.location.protocol === 'file:' && url.protocol === 'file:';
    if (!isFileNavigation && url.origin !== window.location.origin) return false;
    if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) return false;
    return url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  }

  function syncPageStyles(nextDocument) {
    document.querySelectorAll(pjaxStyleSelector).forEach((style) => style.remove());
    nextDocument.head.querySelectorAll('style').forEach((style) => {
      const clone = style.cloneNode(true);
      clone.setAttribute('data-pjax-style', 'true');
      document.head.appendChild(clone);
    });
  }

  function syncCachedStyles(styles) {
    document.querySelectorAll(pjaxStyleSelector).forEach((style) => style.remove());
    const template = document.createElement('template');
    template.innerHTML = styles || '';
    template.content.querySelectorAll('style').forEach((style) => {
      const clone = style.cloneNode(true);
      clone.setAttribute('data-pjax-style', 'true');
      document.head.appendChild(clone);
    });
  }

  function syncBodyClass(nextDocument) {
    document.body.setAttribute('class', nextDocument.body.getAttribute('class') || '');
  }

  function getPageKey(url) {
    return url.pathname.split('/').pop() || 'index.html';
  }

  function capturePayload(nextDocument) {
    return {
      bodyClass: nextDocument.body.getAttribute('class') || '',
      main: nextDocument.querySelector('main')?.outerHTML || '',
      styles: Array.from(nextDocument.head.querySelectorAll('style')).map((style) => style.outerHTML).join('\n'),
      title: nextDocument.title,
    };
  }

  function applyPagePayload(payload, url, shouldPush) {
    const currentMain = qs('main');
    if (!payload?.main || !currentMain) return false;

    const template = document.createElement('template');
    template.innerHTML = payload.main.trim();
    const nextMain = template.content.querySelector('main');
    if (!nextMain) return false;

    syncCachedStyles(payload.styles);
    document.body.setAttribute('class', payload.bodyClass);
    document.title = payload.title;
    currentMain.replaceWith(nextMain);

    closeMobileMenu();
    closeContact();
    initPage(document);
    updateActiveNavigation(url.pathname);

    if (shouldPush) window.history.pushState({ pjax: true }, '', url.href);
    window.scrollTo(0, 0);
    return true;
  }

  async function loadPage(url, options = {}) {
    const shouldPush = options.push !== false;
    const key = getPageKey(url);
    const cached = pageCache.get(key);
    if (cached && applyPagePayload(cached, url, shouldPush)) return;

    try {
      const response = await fetch(url.href, { headers: { 'X-PJAX': 'true' } });
      if (!response.ok) throw new Error(`Page request failed: ${response.status}`);

      const html = await response.text();
      const nextDocument = new DOMParser().parseFromString(html, 'text/html');
      const currentMain = qs('main');
      const nextMain = nextDocument.querySelector('main');
      if (!currentMain || !nextMain) throw new Error('Main content not found');

      syncPageStyles(nextDocument);
      syncBodyClass(nextDocument);
      document.title = nextDocument.title;
      currentMain.replaceWith(nextMain);

      pageCache.set(key, capturePayload(nextDocument));
      closeMobileMenu();
      closeContact();
      initPage(document);
      updateActiveNavigation(url.pathname);

      if (shouldPush) window.history.pushState({ pjax: true }, '', url.href);
      window.scrollTo(0, 0);
    } catch (error) {
      window.location.href = url.href;
    }
  }

  document.addEventListener('click', (event) => {
    if (!isPlainNavigationClick(event)) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target || link.hasAttribute('download') || link.dataset.noPjax === 'true') return;

    const url = new URL(link.href, window.location.href);
    if (!isPjaxUrl(url)) return;

    event.preventDefault();
    loadPage(url);
  });

  window.addEventListener('popstate', () => loadPage(new URL(window.location.href), { push: false }));
  window.addEventListener('scroll', initHeader, { passive: true });
  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeMobileMenu();
    closeContact();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initPage(document));
  } else {
    initPage(document);
  }
})();
