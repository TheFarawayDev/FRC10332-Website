(function initializeFirebaseGroundwork() {
  const listeners = [];
  const localStore = {
    users: [],
    session: null
  };
  const base = {
    ready: false,
    mode: 'local',
    auth: null
  };

  function readUsers() {
    return localStore.users.slice();
  }

  function saveUsers(users) {
    localStore.users = users.slice();
  }

  function readSession() {
    return localStore.session;
  }

  function setSession(user) {
    localStore.session = user || null;
    listeners.forEach((listener) => listener(user));
  }

  async function hashSecret(secret) {
    const normalized = secret.trim();
    if (window.crypto?.subtle && window.TextEncoder) {
      const payload = new TextEncoder().encode(normalized);
      const digest = await window.crypto.subtle.digest('SHA-256', payload);
      return Array.from(new Uint8Array(digest)).map((item) => item.toString(16).padStart(2, '0')).join('');
    }
    return btoa(unescape(encodeURIComponent(normalized)));
  }

  async function signUpLocal(email, passcode, displayName) {
    const users = readUsers();
    const normalized = email.trim().toLowerCase();
    if (users.find((item) => item.email === normalized)) {
      throw new Error('Account already exists for this email.');
    }
    const secretDigest = await hashSecret(passcode);
    const user = {
      uid: `local-${Date.now()}`,
      email: normalized,
      displayName: displayName.trim(),
      secretDigest
    };
    users.push(user);
    saveUsers(users);
    setSession({ uid: user.uid, email: user.email, displayName: user.displayName });
    return readSession();
  }

  async function signInLocal(email, passcode) {
    const normalized = email.trim().toLowerCase();
    const secretDigest = await hashSecret(passcode);
    const user = readUsers().find((item) => item.email === normalized && item.secretDigest === secretDigest);
    if (!user) {
      throw new Error('Invalid email or password.');
    }
    setSession({ uid: user.uid, email: user.email, displayName: user.displayName });
    return readSession();
  }

  async function signOutLocal() {
    setSession(null);
  }

  function onAuthChange(cb) {
    listeners.push(cb);
    cb(readSession());
  }

  const cfg = window.__FIREBASE_CONFIG__ || {};
  const hasConfig = Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);
  const firebaseGlobal = window.firebase;

  if (hasConfig && firebaseGlobal?.initializeApp && firebaseGlobal?.auth) {
    try {
      const app = firebaseGlobal.initializeApp(cfg);
      const auth = firebaseGlobal.auth(app);
      window.FirebaseSystems = {
        ...base,
        ready: true,
        mode: 'firebase',
        auth,
        async signUp(email, password, displayName) {
          const creds = await firebaseGlobal.auth().createUserWithEmailAndPassword(email, password);
          if (displayName) {
            await creds.user.updateProfile({ displayName });
          }
          return creds.user;
        },
        async signIn(email, password) {
          const creds = await firebaseGlobal.auth().signInWithEmailAndPassword(email, password);
          return creds.user;
        },
        async signOut() {
          await firebaseGlobal.auth().signOut();
        },
        getCurrentUser() {
          return firebaseGlobal.auth().currentUser;
        },
        onAuthChange(cb) {
          firebaseGlobal.auth().onAuthStateChanged(cb);
        }
      };
      return;
    } catch (error) {
      console.warn('Firebase setup failed, using local fallback.', error);
    }
  }

  window.FirebaseSystems = {
    ...base,
    ready: true,
    mode: 'local',
    signUp: signUpLocal,
    signIn: signInLocal,
    signOut: signOutLocal,
    getCurrentUser: readSession,
    onAuthChange
  };
})();
