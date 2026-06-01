(function initializeFirebaseGroundwork() {
  const listeners = [];
  const STORE_KEY = 'frc10332-auth-local-v2';
  const localStore = {
    users: [],
    session: null
  };
  const base = {
    ready: false,
    mode: 'local',
    auth: null
  };

  function loadLocalStore() {
    try {
      const raw = window.localStorage?.getItem(STORE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;
      localStore.users = Array.isArray(parsed.users) ? parsed.users : [];
      localStore.session = parsed.session || null;
    } catch (error) {
      console.warn('Unable to load local auth store.', error);
    }
  }

  function persistLocalStore() {
    try {
      window.localStorage?.setItem(STORE_KEY, JSON.stringify(localStore));
    } catch (error) {
      console.warn('Unable to persist local auth store.', error);
    }
  }

  function readUsers() {
    return localStore.users.slice();
  }

  function saveUsers(users) {
    localStore.users = users.slice();
    persistLocalStore();
  }

  function readSession() {
    return localStore.session;
  }

  function setSession(user) {
    localStore.session = user || null;
    persistLocalStore();
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

  function toSessionUser(user) {
    if (!user) return null;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      isAdmin: Boolean(user.isAdmin),
      isApproved: Boolean(user.isApproved),
      teams: Array.isArray(user.teams) ? user.teams.slice() : []
    };
  }

  async function ensureAdminUser() {
    const users = readUsers();
    if (users.find((item) => item.email === 'admin@frc10332.org')) return;
    const secretDigest = await hashSecret('admin10332');
    users.push({
      uid: 'local-admin-10332',
      email: 'admin@frc10332.org',
      displayName: 'Team Admin',
      secretDigest,
      isAdmin: true,
      isApproved: true,
      teams: ['Leadership'],
      requestedTeams: ['Leadership'],
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString()
    });
    saveUsers(users);
  }

  async function ensureTestUser() {
    const users = readUsers();
    if (users.find((item) => item.email === 'test@test.com')) return;
    const secretDigest = await hashSecret('test123');
    users.push({
      uid: 'local-test-user',
      email: 'test@test.com',
      displayName: 'Test User',
      secretDigest,
      isAdmin: false,
      isApproved: true,
      teams: ['Control', 'Design', 'Fabrication', 'Strategy', 'Business/Media', 'Safety'],
      requestedTeams: ['Control'],
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString()
    });
    saveUsers(users);
  }

  async function signUpLocal(email, passcode, displayName, options = {}) {
    await ensureAdminUser();
    await ensureTestUser();
    const users = readUsers();
    const normalized = email.trim().toLowerCase();
    if (users.find((item) => item.email === normalized)) {
      throw new Error('Account already exists for this email.');
    }
    const requestedTeams = Array.isArray(options.teams)
      ? options.teams.map((item) => String(item || '').trim()).filter(Boolean)
      : [];
    if (!requestedTeams.length) {
      throw new Error('Select at least one team during sign-up.');
    }
    const secretDigest = await hashSecret(passcode);
    const user = {
      uid: `local-${Date.now()}`,
      email: normalized,
      displayName: displayName.trim(),
      secretDigest,
      isAdmin: false,
      isApproved: false,
      teams: [],
      requestedTeams,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    saveUsers(users);
    return { pendingApproval: true, uid: user.uid };
  }

  async function signInLocal(email, passcode) {
    await ensureAdminUser();
    await ensureTestUser();
    const normalized = email.trim().toLowerCase();
    const secretDigest = await hashSecret(passcode);
    const user = readUsers().find((item) => item.email === normalized && item.secretDigest === secretDigest);
    if (!user) {
      throw new Error('Invalid email or password.');
    }
    if (!user.isApproved) {
      throw new Error('This account is pending admin approval.');
    }
    setSession(toSessionUser(user));
    return readSession();
  }

  async function signOutLocal() {
    setSession(null);
  }

  function onAuthChange(cb) {
    listeners.push(cb);
    cb(readSession());
  }

  function listPendingMembersLocal() {
    return readUsers()
      .filter((item) => !item.isApproved && !item.isAdmin)
      .map((item) => ({
        uid: item.uid,
        email: item.email,
        displayName: item.displayName,
        requestedTeams: Array.isArray(item.requestedTeams) ? item.requestedTeams.slice() : []
      }));
  }

  async function approveMemberLocal(uid) {
    const users = readUsers();
    const index = users.findIndex((item) => item.uid === uid);
    if (index < 0) {
      throw new Error('Member request not found.');
    }
    users[index].isApproved = true;
    users[index].teams = Array.isArray(users[index].requestedTeams) ? users[index].requestedTeams.slice() : [];
    users[index].approvedAt = new Date().toISOString();
    saveUsers(users);
    const session = readSession();
    if (session?.uid === uid) {
      setSession(toSessionUser(users[index]));
    }
    return toSessionUser(users[index]);
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
        },
        listPendingMembers() {
          return [];
        },
        async approveMember() {
          throw new Error('Member approvals require local fallback mode in this prototype.');
        }
      };
      return;
    } catch (error) {
      console.warn('Firebase setup failed, using local fallback.', error);
    }
  }

  loadLocalStore();
  window.FirebaseSystems = {
    ...base,
    ready: true,
    mode: 'local',
    signUp: signUpLocal,
    signIn: signInLocal,
    signOut: signOutLocal,
    getCurrentUser: readSession,
    onAuthChange,
    listPendingMembers: listPendingMembersLocal,
    approveMember: approveMemberLocal
  };
})();
