(function setupAuthFlows() {
  function getAuth() {
    return window.FirebaseSystems;
  }

  function status(message, isError = false) {
    const host = document.querySelector('[data-auth-status]');
    if (!host) return;
    host.textContent = message;
    host.classList.toggle('error', isError);
  }

  function getRedirectPath() {
    const params = new URLSearchParams(window.location.search);
    return params.get('next') || 'members-dashboard.html';
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
        status('Creating account...');
        await auth.signUp(
          String(payload.get('email') || ''),
          String(payload.get('password') || ''),
          String(payload.get('displayName') || '')
        );
        status('Account created. Redirecting...');
        window.location.href = getRedirectPath();
      } catch (error) {
        status(error.message || 'Unable to sign up.', true);
      }
    });
  }

  function guardDashboard() {
    const auth = getAuth();
    if (!auth) return;
    auth.onAuthChange((user) => {
      if (!user) {
        window.location.href = 'auth.html?next=members-dashboard.html';
        return;
      }
      const userHost = document.querySelector('[data-auth-user]');
      if (userHost) {
        userHost.textContent = `${user.displayName || 'Member'} · ${user.email || ''}`;
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
    const page = document.body.dataset.page;
    if (page === 'auth') {
      redirectIfAuthenticated();
      bindTabs();
      bindAuthForms();
      status(`Ready (${window.FirebaseSystems?.mode || 'local'} mode).`);
    } else if (page === 'dashboard') {
      guardDashboard();
    }
  });
})();
