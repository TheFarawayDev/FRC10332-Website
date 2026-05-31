function toCleanPath(pathname) {
  if (pathname.endsWith('/index.html')) return pathname.slice(0, -'index.html'.length) || '/';
  if (pathname.endsWith('.html')) return pathname.slice(0, -'.html'.length) || '/';
  return pathname || '/';
}

function toPrettyHref(href) {
  if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return href;
  if (href === 'index.html' || href === '/') return '/';
  if (href.endsWith('.html')) return href.slice(0, -'.html'.length);
  return href;
}

function toRuntimeHref(href) {
  if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return href;
  if (href === '/') return 'index.html';
  const cleanHref = href.endsWith('/') ? `${href}index` : href;
  return cleanHref.endsWith('.html') ? cleanHref : `${cleanHref}.html`;
}

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = toCleanPath(window.location.pathname);
  if (window.location.pathname.endsWith('.html')) {
    const nextPath = toCleanPath(window.location.pathname);
    window.history.replaceState({}, '', `${nextPath}${window.location.search}${window.location.hash}`);
  }

  document.querySelectorAll('a[href]').forEach((link) => {
    const originalHref = link.getAttribute('href');
    if (!originalHref) return;

    const prettyHref = toPrettyHref(originalHref);
    const runtimeHref = toRuntimeHref(prettyHref);
    if (prettyHref) link.setAttribute('href', prettyHref);

    if (runtimeHref && !runtimeHref.startsWith('http')) {
      link.addEventListener('click', (event) => {
        const target = event.currentTarget;
        if (!(target instanceof HTMLAnchorElement)) return;
        const href = target.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#')) return;
        event.preventDefault();
        window.location.href = toRuntimeHref(href);
      });
    }

    if (link.closest('.top-nav')) {
      const linkPath = toCleanPath(new URL(runtimeHref || originalHref, window.location.origin).pathname);
      if (linkPath === currentPath || (linkPath === '/' && currentPath === '/')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    }
  });
});
