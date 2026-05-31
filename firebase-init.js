(function initializeFirebaseGroundwork() {
  const USERS_KEY = 'frc10332.localUsers';
  const SESSION_KEY = 'frc10332.sessionUser';
  const listeners = [];
  const base = {
    ready: false,
    mode: 'local',
    auth: null
  };

  function readUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function setSession(user) {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    listeners.forEach((listener) => listener(user));
  }

  async function signUpLocal(email, password, displayName) {
    const users = readUsers();
    const normalized = email.trim().toLowerCase();
    if (users.find((item) => item.email === normalized)) {
      throw new Error('Account already exists for this email.');
    }
    const user = {
      uid: `local-${Date.now()}`,
      email: normalized,
      displayName: displayName.trim(),
      password
    };
    users.push(user);
    saveUsers(users);
    setSession({ uid: user.uid, email: user.email, displayName: user.displayName });
    return readSession();
  }

  async function signInLocal(email, password) {
    const normalized = email.trim().toLowerCase();
    const user = readUsers().find((item) => item.email === normalized && item.password === password);
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
