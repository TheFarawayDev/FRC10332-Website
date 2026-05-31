document.addEventListener('DOMContentLoaded', () => {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.top-nav a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#')) return;
    if (href === current) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
});
