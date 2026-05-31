(function setupAuthFlows() {
  function cleanVisibleUrl() {
    const { pathname, search, hash } = window.location;
    if (!pathname.endsWith('.html')) return;
    const cleanPath = pathname.endsWith('/index.html')
      ? pathname.slice(0, -'index.html'.length) || '/'
      : pathname.slice(0, -'.html'.length);
    window.history.replaceState({}, '', `${cleanPath || '/'}${search}${hash}`);
  }

  function getAuth() {
    return window.FirebaseSystems;
  }

  function wireExtensionlessLinks() {
    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
      if (href.endsWith('.html')) return;

      const runtimeHref = href === '/' ? 'index.html' : `${href}.html`;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = runtimeHref;
      });
    });
  }

  function status(message, isError = false) {
    const host = document.querySelector('[data-auth-status]');
    if (!host) return;
    host.textContent = message;
    host.classList.toggle('error', isError);
  }

  function getRedirectPath() {
    const allowed = new Set(['members-dashboard.html', 'portal.html', 'account.html', 'admin-approvals.html']);
    const fallback = 'members-dashboard.html';
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    if (!next) return fallback;

    try {
      const resolved = new URL(next, window.location.origin);
      if (resolved.origin !== window.location.origin) return fallback;
      const target = resolved.pathname.split('/').filter(Boolean).pop() || '';
      return allowed.has(target) ? target : fallback;
    } catch {
      return fallback;
    }
  }

  function bindTabs() {
    const tabs = Array.from(document.querySelectorAll('[data-auth-tab]'));
    const forms = Array.from(document.querySelectorAll('[data-auth-form]'));
    if (!tabs.length || !forms.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.authTab;
        tabs.forEach((entry) => entry.classList.toggle('active', entry === tab));
        forms.forEach((form) => form.classList.toggle('hidden', form.dataset.authForm !== target));
      });
    });
  }

  function bindAuthForms() {
    const loginForm = document.querySelector('[data-auth-form="login"]');
    const signupForm = document.querySelector('[data-auth-form="signup"]');
    const auth = getAuth();
    if (!loginForm || !signupForm || !auth) return;

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = new FormData(loginForm);
      try {
        status('Signing in...');
        await auth.signIn(String(payload.get('email') || ''), String(payload.get('password') || ''));
        status('Signed in. Redirecting...');
        window.location.href = getRedirectPath();
      } catch (error) {
        status(error.message || 'Unable to sign in.', true);
      }
    });

    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = new FormData(signupForm);
      try {
        const displayName = String(payload.get('displayName') || '').trim();
        if (!/^[\p{L}\p{N} .'-]{2,48}$/u.test(displayName)) {
          status('Use a valid display name (letters, numbers, spaces, apostrophes, periods, or hyphens).', true);
          return;
        }
        const requestedTeams = payload.getAll('teams').map((item) => String(item || '').trim()).filter(Boolean);
        if (!requestedTeams.length) {
          status('Please select at least one team to apply for.', true);
          return;
        }
        if (!payload.get('conduct')) {
          status('You must agree to the conduct statement to continue.', true);
          return;
        }
        status('Creating account...');
        await auth.signUp(
          String(payload.get('email') || ''),
          String(payload.get('password') || ''),
          displayName,
          { teams: requestedTeams }
        );
        signupForm.reset();
        status('Account created and queued for admin approval. Sign in after approval.');
      } catch (error) {
        status(error.message || 'Unable to sign up.', true);
      }
    });
  }

  function setAdminStatus(message, isError = false) {
    const host = document.querySelector('[data-admin-status]');
    if (!host) return;
    host.textContent = message;
    host.classList.toggle('error', isError);
  }

  function renderPendingMembers() {
    const auth = getAuth();
    const host = document.querySelector('[data-admin-pending]');
    if (!auth || !host || typeof auth.listPendingMembers !== 'function') return;

    const pending = auth.listPendingMembers();
    host.innerHTML = '';
    if (!pending.length) {
      host.innerHTML = '<article class="tile-card"><h4>No pending members</h4><p>Queue is clear.</p></article>';
      return;
    }

    pending.forEach((member) => {
      const card = document.createElement('article');
      card.className = 'tile-card';
      card.innerHTML = `
        <h4>${member.displayName || 'Member'} (${member.email})</h4>
        <p class="kicker">Request ID: ${member.uid}</p>
        <p><strong>Requested teams:</strong> ${member.requestedTeams?.join(', ') || 'None selected'}</p>
      `;
      const approve = document.createElement('button');
      approve.type = 'button';
      approve.textContent = 'Approve Member';
      approve.addEventListener('click', async () => {
        try {
          await auth.approveMember(member.uid);
          setAdminStatus(`Approved ${member.email}.`);
          renderPendingMembers();
        } catch (error) {
          setAdminStatus(error.message || 'Approval failed.', true);
        }
      });
      card.append(approve);
      host.append(card);
    });
  }

  function guardAdminPage() {
    const auth = getAuth();
    if (!auth) return;
    auth.onAuthChange((user) => {
      if (!user) {
        window.location.href = 'auth.html?next=admin-approvals.html';
        return;
      }
      const userHost = document.querySelector('[data-auth-user]');
      if (userHost) {
        userHost.textContent = `${user.displayName || 'Member'} · ${user.email || ''}`;
      }
      if (!user.isAdmin) {
        setAdminStatus('Admin access required for this page.', true);
        return;
      }
      setAdminStatus('Admin signed in. Review pending members.');
      renderPendingMembers();
    });

    const logoutButton = document.querySelector('[data-auth-logout]');
    if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
        await auth.signOut();
        window.location.href = 'auth.html';
      });
    }
  }

  function guardDashboard() {
    const auth = getAuth();
    if (!auth) return;
    auth.onAuthChange((user) => {
      if (!user) {
        window.location.href = 'auth.html?next=members-dashboard.html';
        return;
      }
      if (user.isApproved === false) {
        auth.signOut();
        window.location.href = 'auth.html';
        return;
      }
      const userHost = document.querySelector('[data-auth-user]');
      if (userHost) {
        const teams = Array.isArray(user.teams) && user.teams.length ? ` · Teams: ${user.teams.join(', ')}` : '';
        userHost.textContent = `${user.displayName || 'Member'} · ${user.email || ''}${teams}`;
      }
      const adminLink = document.querySelector('[data-admin-link]');
      if (adminLink) {
        adminLink.classList.toggle('hidden', !user.isAdmin);
      }
    });

    const logoutButton = document.querySelector('[data-auth-logout]');
    if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
        await auth.signOut();
        window.location.href = 'auth.html';
      });
    }
  }

  function redirectIfAuthenticated() {
    const auth = getAuth();
    const user = auth?.getCurrentUser?.();
    if (user) {
      window.location.href = getRedirectPath();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    cleanVisibleUrl();
    wireExtensionlessLinks();
    const page = document.body.dataset.page;
    if (page === 'auth') {
      redirectIfAuthenticated();
      bindTabs();
      bindAuthForms();
      status(`Ready (${window.FirebaseSystems?.mode || 'local'} mode).`);
    } else if (page === 'dashboard') {
      guardDashboard();
    } else if (page === 'admin') {
      guardAdminPage();
    }
  });
})();
