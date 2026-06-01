const STORAGE_KEY = "forge-training-state-v1";
const MIN_READ_SECONDS = 150;
const MODAL_ROOT_ID = "forge-modal-root";

// ─── Fallback / Resilience Helpers ───────────────────────────────────────────

/** True when localStorage is actually available (some browsers block it). */
const _storageAvailable = (() => {
  try {
    const k = "__forge_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch (e) {
    return false;
  }
})();

let _storageWarningShown = false;
function _warnStorageUnavailable() {
  if (_storageWarningShown) return;
  _storageWarningShown = true;
  _showSystemNotice(
    "Your browser is blocking local storage — training progress and sign-in will not be saved this session. Try disabling private/incognito mode or checking your browser settings.",
    "warn"
  );
}

function _showSystemNotice(message, level = "info") {
  const id = "forge-system-notice";
  let bar = document.getElementById(id);
  if (!bar) {
    bar = document.createElement("div");
    bar.id = id;
    bar.className = "system-notice";
    document.body.prepend(bar);
  }
  bar.className = `system-notice notice-${level}`;
  bar.textContent = message;
  bar.hidden = false;
  // Auto-dismiss after 10 s unless it's a persistent warn/error
  if (level === "info") {
    setTimeout(() => { bar.hidden = true; }, 10000);
  }
}

function _renderDataError(host, context) {
  host.innerHTML = `
    <div class="forge-error-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="48" height="48" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" opacity="0.4"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <h2>Training data unavailable</h2>
      <p>The FORGE program data could not be loaded. This is usually a temporary network issue.</p>
      <div class="button-row" style="justify-content:center;margin-top:20px">
        <button class="btn primary" type="button" onclick="location.reload()">Reload Page</button>
        <a class="btn alt" href="./">Back to Home</a>
      </div>
      <p class="forge-error-detail" style="font-size:0.75rem;color:var(--muted);margin-top:16px">Context: ${context} · data.js may have failed to load</p>
    </div>
  `;
}

// ─── Cookie Consent ───────────────────────────────────────────────────────────
const COOKIE_CONSENT_KEY = "frc10332-cookie-consent";

function getCookieConsent() {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (raw === null) return null; // no decision yet
    const parsed = JSON.parse(raw);
    return parsed?.accepted === true;
  } catch (e) {
    return null;
  }
}

function setCookieConsent(accepted) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ accepted, ts: Date.now() }));
  } catch (e) { /* silent */ }
}

function renderCookieBanner() {
  if (getCookieConsent() !== null) return; // already decided
  if (document.getElementById("cookie-banner")) return;
  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.id = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie consent");
  banner.innerHTML = `
    <div class="cookie-banner-inner">
      <div class="cookie-banner-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="28" height="28" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="8.5" cy="13.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="14" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.25" fill="currentColor" stroke="none"/></svg>
      </div>
      <div class="cookie-banner-text">
        <strong>Cookies &amp; Local Storage</strong>
        <p>We use local storage for your login session, training progress, and settings. Required for sign-in and the FORGE training system.</p>
      </div>
      <div class="cookie-banner-actions">
        <button class="btn alt cookie-deny-btn" type="button">Deny</button>
        <button class="btn primary cookie-accept-btn" type="button">Accept &amp; Continue</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add("cookie-banner-visible"));
  banner.querySelector(".cookie-accept-btn").addEventListener("click", () => {
    setCookieConsent(true);
    _dismissCookieBanner(banner);
    if (getPageKind() === "account") renderAccountContent();
  });
  banner.querySelector(".cookie-deny-btn").addEventListener("click", () => {
    setCookieConsent(false);
    _dismissCookieBanner(banner);
    // Sign out any active session — consent is required for auth storage
    if (window.FirebaseSystems?.getCurrentUser()) {
      window.FirebaseSystems.signOut().catch(() => {});
    }
    if (getPageKind() === "account") renderAccountContent();
  });
}

function _dismissCookieBanner(banner) {
  banner.classList.remove("cookie-banner-visible");
  setTimeout(() => banner.remove(), 350);
}

// ─── YouTube Player Registry ──────────────────────────────────────────────────
const VIDEO_PLAYERS = {};

window.onYouTubeIframeAPIReady = function () {
  initYouTubePlayers();
};

function extractVideoId(url) {
  const m = url.match(/embed\/([^?&"'>\s]+)/);
  return m ? m[1] : url;
}

function getVideoWatched(sectionKey) {
  try {
    const state = readState();
    return Boolean(state.readSections?.[sectionKey] || state.watchedVideos?.[sectionKey]);
  } catch (e) {
    return false;
  }
}

function markVideoWatched(sectionKey) {
  try {
    const state = readState();
    state.readSections = state.readSections || {};
    state.readSections[sectionKey] = true;
    state.watchedVideos = state.watchedVideos || {};
    state.watchedVideos[sectionKey] = true;
    saveState(state);
    unlockQuizGate(sectionKey);
  } catch (e) {
    console.warn("[FORGE] markVideoWatched failed:", e);
    _showSystemNotice("Could not save reading completion — progress may not persist.", "warn");
  }
}

function unlockQuizGate(sectionKey) {
  const badge = document.querySelector(`[data-vbadge="${sectionKey}"]`);
  if (badge) {
    badge.className = "video-watch-badge watched just-unlocked";
    badge.innerHTML = "&#x2713;&ensp;Read complete &mdash; quiz unlocked";
    badge.addEventListener("animationend", () => badge.classList.remove("just-unlocked"), { once: true });
  }
  const gate = document.querySelector(`[data-quiz-gate="${sectionKey}"]`);
  if (!gate || gate.dataset.locked !== "true") return;
  gate.dataset.locked = "false";
  const [moduleKey, sectionId] = sectionKey.split(":");
  const module = FORGE_PROGRAM.modules.find((m) => m.key === moduleKey);
  const section = module?.sections.find((s) => s.id === sectionId);
  if (module && section) {
    gate.innerHTML = renderQuizForm(section, module);
    wireInlineQuizForms(gate);
  }
  const quizSubitem = gate.closest(".quiz-subitem");
  if (quizSubitem) {
    quizSubitem.classList.remove("quiz-locked");
    quizSubitem.querySelector(".subitem-badge.locked")?.remove();
  }
  const summaryVideoBadge = document.querySelector(`[data-subitem-vbadge="${sectionKey}"]`);
  if (summaryVideoBadge) {
    summaryVideoBadge.className = "subitem-badge watched";
    summaryVideoBadge.innerHTML = "&#x2713;&nbsp;Read";
  }
}

function loadYouTubeAPI() {
  if (document.getElementById("yt-api-script")) return;
  const script = document.createElement("script");
  script.id = "yt-api-script";
  script.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(script);
}

function initYouTubePlayers() {
  if (typeof YT === "undefined" || !YT.Player) return;
  document.querySelectorAll("[data-player-key]").forEach((wrap) => {
    const key = wrap.dataset.playerKey;
    if (VIDEO_PLAYERS[key]) return;
    const vid = wrap.dataset.videoId;
    const elemId = "yt-" + key.replace(/[^a-z0-9]/gi, "-");
    const target = document.getElementById(elemId);
    if (!target || !vid) return;
    VIDEO_PLAYERS[key] = new YT.Player(elemId, {
      videoId: vid,
      playerVars: { modestbranding: 1, rel: 0, color: "white" },
      events: {
        onStateChange: (evt) => {
          if (evt.data === YT.PlayerState.ENDED) markVideoWatched(key);
        },
      },
    });
  });
}

function getSectionReadSeconds(section) {
  return Math.max(MIN_READ_SECONDS, Number(section?.minimumReadSeconds || 0) || MIN_READ_SECONDS);
}

function getOrCreateModalRoot() {
  let root = document.getElementById(MODAL_ROOT_ID);
  if (root) return root;
  root = document.createElement("div");
  root.id = MODAL_ROOT_ID;
  document.body.appendChild(root);
  return root;
}

function closeModal() {
  const root = document.getElementById(MODAL_ROOT_ID);
  if (!root) return;
  root.innerHTML = "";
  document.body.classList.remove("modal-open");
}

function renderExpandedNotes(section) {
  const prompts = (section.quiz || [])
    .slice(0, 3)
    .map((question, index) => `<li><strong>Memory prompt ${index + 1}:</strong> ${question.q}</li>`)
    .join("");

  return `
    ${section.notes}
    <div class="notes-boost">
      <h5>Study Boost</h5>
      <p>Use this quick pass before the quiz so details stick on match day.</p>
      <ul>
        ${prompts}
        <li><strong>Recall drill:</strong> Explain this lesson in your own words without peeking.</li>
      </ul>
    </div>
  `;
}

function openReadingModal(section, module) {
  const key = getSectionStorageKey(module, section);
  const readSeconds = getSectionReadSeconds(section);
  const referenceUrl = section.frcReference || "https://www.firstinspires.org/robotics/frc";
  const root = getOrCreateModalRoot();

  root.innerHTML = `
    <div class="forge-modal-overlay reading-modal" role="dialog" aria-modal="true" aria-label="Reading session">
      <div class="forge-modal-card">
        <header class="forge-modal-head">
          <div>
            <h3>${section.title} — Reading Session</h3>
            <p>Read everything here and stay in session for at least ${Math.round(readSeconds / 60)} minutes.</p>
          </div>
          <button type="button" class="btn" data-close-modal>Close</button>
        </header>
        <div class="forge-modal-scroll" data-read-scroll>
          <p><strong>Official FRC reference:</strong> <a href="${referenceUrl}" target="_blank" rel="noopener noreferrer">Open source link</a></p>
          <div class="rich-notes">${renderExpandedNotes(section)}</div>
        </div>
        <footer class="forge-modal-foot">
          <span class="quiz-meta" data-read-status>Scroll to the bottom and keep reading until the timer completes.</span>
          <button class="btn primary" type="button" data-read-complete disabled>Finish Reading</button>
        </footer>
      </div>
    </div>
  `;

  document.body.classList.add("modal-open");

  const scrollHost = root.querySelector("[data-read-scroll]");
  const status = root.querySelector("[data-read-status]");
  const completeButton = root.querySelector("[data-read-complete]");
  const closeButton = root.querySelector("[data-close-modal]");

  if (!scrollHost || !status || !completeButton || !closeButton) return;

  let timerDone = false;
  let reachedBottom = false;
  let secondsLeft = readSeconds;

  const updateStatus = () => {
    const timerText = timerDone ? "timer complete" : `${secondsLeft}s remaining`;
    const bottomText = reachedBottom ? "bottom reached" : "scroll to bottom";
    status.textContent = `Reading check: ${bottomText} • ${timerText}`;
    completeButton.disabled = !(timerDone && reachedBottom);
  };

  const timer = window.setInterval(() => {
    secondsLeft -= 1;
    if (secondsLeft <= 0) {
      timerDone = true;
      secondsLeft = 0;
      window.clearInterval(timer);
      // If content was never scrollable, ensure bottom is marked when timer ends
      checkScrollability();
    }
    updateStatus();
  }, 1000);

  const onScroll = () => {
    const threshold = 8;
    if (scrollHost.scrollTop + scrollHost.clientHeight >= scrollHost.scrollHeight - threshold) {
      reachedBottom = true;
      updateStatus();
    }
  };

  scrollHost.addEventListener("scroll", onScroll);

  // Bug fix: if content is too short to scroll, mark bottom as reached immediately
  // Also re-check whenever the timer ticks (content may have reflowed)
  const checkScrollability = () => {
    if (reachedBottom) return;
    const threshold = 8;
    if (scrollHost.scrollHeight <= scrollHost.clientHeight + threshold) {
      reachedBottom = true;
      updateStatus();
    }
  };
  checkScrollability();
  // Defer one frame in case content renders async (e.g. rich-notes images)
  requestAnimationFrame(checkScrollability);

  updateStatus();

  closeButton.addEventListener("click", () => {
    window.clearInterval(timer);
    closeModal();
  });

  completeButton.addEventListener("click", () => {
    if (!(timerDone && reachedBottom)) return;
    window.clearInterval(timer);
    markVideoWatched(key);
    closeModal();
  });
}

function renderVideoPanel(section, module) {
  const key = getSectionStorageKey(module, section);
  const watched = getVideoWatched(key);
  const readSeconds = getSectionReadSeconds(section);
  return `
    <div class="video-player-wrap read-player-wrap" data-read-key="${key}">
      <div class="read-this-panel">
        <p><strong>Required reading:</strong> Open the reading session modal and finish both checks: timer + scroll completion.</p>
        <p><strong>Minimum read time:</strong> ${Math.round(readSeconds / 60)} minutes.</p>
      </div>
      <div class="video-watch-badge ${watched ? "watched" : ""}" data-vbadge="${key}">
        ${watched ? "&#x2713;&ensp;Read complete &mdash; quiz unlocked" : "&#x23F1;&ensp;Complete reading checks to unlock the quiz"}
      </div>
      ${watched ? "" : `<button class="btn primary" type="button" data-open-reading="${key}">Open Reading Session</button>`}
    </div>
  `;
}

function wireReadCountdownTimers(root = document) {
  root.querySelectorAll("[data-open-reading]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      const key = button.dataset.openReading;
      if (!key) return;
      const [moduleKey, sectionId] = key.split(":");
      const module = FORGE_PROGRAM.modules.find((entry) => entry.key === moduleKey);
      const section = module?.sections.find((entry) => entry.id === sectionId);
      if (!module || !section) return;
      openReadingModal(section, module);
    });
  });
}

const UI_ICONS = {
  dashboard:
    '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1" opacity="0.4"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1" opacity="0.4"/></svg>',
  business:
    '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" opacity="0.4"/></svg>',
  safety:
    '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  strategy:
    '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" opacity="0.4"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" opacity="0.4"/></svg>',
  design:
    '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  control:
    '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  fabrication:
    '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  art:
    '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2" opacity="0.5"/><circle cx="9" cy="9" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.2" fill="currentColor" stroke="none"/></svg>',
  account:
    '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" opacity="0.4"/><circle cx="12" cy="7" r="4"/></svg>'
};

const FORGE_RAIL_LINKS = [
  { href: "portal.html", label: "Forge Backend", icon: "dashboard" },
  { href: "modules/business-media.html", label: "Business", icon: "business" },
  { href: "modules/safety.html", label: "Safety", icon: "safety" },
  { href: "modules/strategy.html", label: "Strategy", icon: "strategy" },
  { href: "modules/design.html", label: "Design", icon: "design" },
  { href: "modules/control.html", label: "Control", icon: "control" },
  { href: "modules/fabrication.html", label: "Fabrication", icon: "fabrication" },
  { href: "modules/art.html", label: "Art", icon: "art" },
  { href: "modules/site-maintenance.html", label: "Site Maintenance", icon: "design" },
  { href: "account.html", label: "Account", icon: "account" }
];

const MAIN_SITE_RAIL_LINKS = [
  { href: "index.html", label: "Chargebotic Home", icon: "dashboard" },
  { href: "account.html", label: "Member Access", icon: "account" }
];

function assetPrefix() {
  const path = window.location.pathname;
  if (path.includes("/modules/") || path.includes("/quizzes/")) {
    return "../";
  }
  return "";
}

function cleanVisibleUrl() {
  const { pathname, search, hash } = window.location;
  if (!pathname.endsWith(".html")) return;
  const cleaned = pathname.endsWith("/index.html")
    ? pathname.slice(0, -10) || "/"
    : pathname.slice(0, -".html".length);
  window.history.replaceState({}, "", `${cleaned || "/"}${search}${hash}`);
}

function resolveAppHref(href) {
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) {
    return href;
  }

  const path = window.location.pathname;
  const inNestedFolder = path.includes("/modules/") || path.includes("/quizzes/");
  if (!inNestedFolder) {
    return href;
  }

  if (href.startsWith("modules/")) {
    return href.replace("modules/", "");
  }

  if (href.startsWith("quizzes/")) {
    return href.replace("quizzes/", "");
  }

  return `../${href}`;
}

function wireExtensionlessNavigation() {
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) return;
    if (href.endsWith(".html")) {
      const clean = href === "index.html" ? "/" : href.replace(".html", "");
      link.setAttribute("href", clean);
      link.dataset.runtimeHref = href;
    }
    link.addEventListener("click", (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLAnchorElement)) return;
      const runtime = target.dataset.runtimeHref;
      if (!runtime) return;
      event.preventDefault();
      window.location.href = resolveAppHref(runtime);
    });
  });
}

function normalizeExtensionlessLinks() {
  if (!window.location.pathname.endsWith(".html")) return;
  cleanVisibleUrl();
}

function renderCanvasRail() {
  // Canvas rail navigation removed - Forge now uses main site topbar navigation
  return;
  
  if (document.querySelector(".canvas-rail")) return;

  const rail = document.createElement("nav");
  rail.className = "canvas-rail";
  rail.setAttribute("aria-label", "Primary Navigation");

  const current = window.location.pathname;
  const isRoot = current === "/" || current === "";
  const onForgeSite =
    current.includes("/portal")
    || current.includes("/modules/")
    || current.includes("/quizzes/");
  const railLinks = onForgeSite ? FORGE_RAIL_LINKS : MAIN_SITE_RAIL_LINKS;
  rail.innerHTML = `
    <div class="rail-logo"><img src="${assetPrefix()}favicon.svg" alt="FORGE" /></div>
    ${railLinks.map((link) => {
      const pageKey = link.href.replace(".html", "");
      const active =
        (pageKey === "index" && isRoot) ||
        current.includes(`/${pageKey}`) ||
        current.endsWith(link.href);
      return `
        <a class="rail-link ${active ? "active" : ""}" href="${resolveAppHref(link.href)}" aria-label="${link.label}">
          ${UI_ICONS[link.icon]}
          <span>${link.label}</span>
        </a>
      `;
    }).join("")}
  `;

  document.body.prepend(rail);
}

const FORGE_BOTTOM_NAV = [
  { href: "portal.html",                      label: "Dashboard",  key: "portal",          icon: "dashboard"    },
  { href: "modules/safety.html",              label: "Safety",     key: "safety",          icon: "safety"       },
  { href: "modules/business-media.html",      label: "Business",   key: "business-media",  icon: "business"     },
  { href: "modules/control.html",             label: "Control",    key: "control",         icon: "control"      },
  { href: "modules/design.html",              label: "Design",     key: "design",          icon: "design"       },
  { href: "modules/fabrication.html",         label: "Fabrication",key: "fabrication",     icon: "fabrication"  },
  { href: "modules/art.html",                 label: "Art",        key: "art",             icon: "art"          },
  { href: "modules/strategy.html",            label: "Strategy",   key: "strategy",        icon: "strategy"     },
  { href: "account.html",                     label: "Account",    key: "account",         icon: "account"      },
];

function injectTabletNav() {
  // Only applies to Forge pages
  if (document.body.dataset.page !== "forge") return;

  const current = window.location.pathname;
  const prefix = assetPrefix();

  const items = FORGE_BOTTOM_NAV.map(({ href, label, key, icon }) => {
    const active = current.includes(`/${key}`);
    return `<a href="${resolveAppHref(href)}" class="bottom-nav-item${active ? " active" : ""}">
      ${UI_ICONS[icon] || UI_ICONS.dashboard}
      <span class="nav-label">${label}</span>
    </a>`;
  }).join("");

  const existing = document.querySelector("nav.bottom-nav");
  if (existing) {
    existing.innerHTML = items;
  } else {
    const nav = document.createElement("nav");
    nav.className = "bottom-nav";
    nav.setAttribute("aria-label", "Primary");
    nav.innerHTML = items;
    document.body.appendChild(nav);
  }
}

function injectMobileNavToggle() {
  // Legacy — bottom nav replaces this
}

function decorateSideNav() {
  const map = [
    ["Dashboard", "dashboard"],
    ["Business", "business"],
    ["Safety", "safety"],
    ["Strategy", "strategy"],
    ["Design", "design"],
    ["Control", "control"],
    ["Fabrication", "fabrication"],
    ["Art", "art"],
    ["Site Maintenance", "design"],
    ["Account", "account"],
    ["Role", "account"]
  ];

  document.querySelectorAll(".side-nav a").forEach((link) => {
    if (link.dataset.decorated === "true") return;
    const key = map.find(([name]) => link.textContent.includes(name))?.[1] || "dashboard";
    link.insertAdjacentHTML("afterbegin", `<span class="nav-icon">${UI_ICONS[key]}</span>`);
    link.dataset.decorated = "true";
  });
}

function ensureFavicon() {
  const href = `${assetPrefix()}favicon.svg`;
  let iconLink = document.querySelector("link[rel='icon']");
  if (!iconLink) {
    iconLink = document.createElement("link");
    iconLink.rel = "icon";
    document.head.appendChild(iconLink);
  }
  iconLink.type = "image/svg+xml";
  iconLink.href = href;
}

function readState() {
  if (!_storageAvailable) {
    _warnStorageUnavailable();
    return _defaultState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return _defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed.watchedVideos) parsed.watchedVideos = {};
    if (!parsed.readSections) parsed.readSections = { ...(parsed.watchedVideos || {}) };
    if (parsed.team === undefined) parsed.team = null;
    return parsed;
  } catch (error) {
    console.warn("[FORGE] readState parse error — resetting to defaults:", error);
    return _defaultState();
  }
}

function _defaultState() {
  return {
    role: "rookie",
    team: null,
    overrideRequired: false,
    completedQuizzes: {},
    watchedVideos: {},
    readSections: {}
  };
}

function saveState(state) {
  if (!_storageAvailable) { _warnStorageUnavailable(); return; }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("[FORGE] saveState failed (quota/permissions):", e);
    _showSystemNotice("Could not save training progress — your storage may be full or restricted.", "warn");
  }
}

function setRole(roleValue) {
  const state = readState();
  state.role = roleValue;
  saveState(state);
}

function setTeam(teamKey) {
  const state = readState();
  state.team = teamKey || null;
  saveState(state);
}

function getTeamData(state) {
  if (!state.team || !FORGE_PROGRAM.teams) return null;
  return FORGE_PROGRAM.teams[state.team] || null;
}

function getModuleTeamStatus(moduleKey, state) {
  const team = getTeamData(state);
  if (!team) return "available";
  if (team.required && team.required.includes(moduleKey)) return "required";
  if (team.optional && team.optional.includes(moduleKey)) return "optional";
  return "available";
}

function setOverride(enabled) {
  const state = readState();
  state.overrideRequired = enabled;
  saveState(state);
}

function markQuizResult(quizFile, passed, score) {
  const state = readState();
  state.completedQuizzes[quizFile] = {
    passed,
    score,
    completedAt: new Date().toISOString()
  };
  saveState(state);
}

function getModuleSections(module) {
  return Array.isArray(module.sections) && module.sections.length
    ? module.sections
    : [];
}

function getSectionStorageKey(module, section) {
  return `${module.key}:${section.id}`;
}

function isExempt(state) {
  const roleData = FORGE_PROGRAM.roles[state.role];
  if (!roleData) return false;
  if (state.overrideRequired) return false;
  return roleData.exempt;
}

function getModuleProgress(module, state) {
  const sections = getModuleSections(module);

  if (isExempt(state)) {
    const roleData = FORGE_PROGRAM.roles[state.role];
    return {
      complete: true,
      passedCount: sections.length,
      totalCount: sections.length,
      percentage: 100,
      statusText: `Exempt — ${roleData?.label || "veteran member"}`
    };
  }

  const passedCount = sections.filter((section) => {
    const row = state.completedQuizzes[getSectionStorageKey(module, section)];
    return row && row.passed;
  }).length;

  const totalCount = sections.length;
  const percentage = Math.round((passedCount / totalCount) * 100);
  const complete = passedCount === totalCount;

  return {
    complete,
    passedCount,
    totalCount,
    percentage,
    statusText: complete ? "Complete" : "In Progress"
  };
}

function getOverallProgress(state) {
  const moduleProgress = FORGE_PROGRAM.modules.map((module) =>
    getModuleProgress(module, state)
  );

  const completedModules = moduleProgress.filter((m) => m.complete).length;
  const percentage = Math.round(
    (completedModules / FORGE_PROGRAM.modules.length) * 100
  );

  return {
    completedModules,
    totalModules: FORGE_PROGRAM.modules.length,
    percentage
  };
}

function getSortedModulesForState(state) {
  const rank = { required: 0, optional: 1, available: 2 };
  return [...FORGE_PROGRAM.modules].sort((a, b) => {
    const aStatus = getModuleTeamStatus(a.key, state);
    const bStatus = getModuleTeamStatus(b.key, state);
    const aComplete = getModuleProgress(a, state).complete;
    const bComplete = getModuleProgress(b, state).complete;
    return (rank[aStatus] || 2) - (rank[bStatus] || 2) || Number(aComplete) - Number(bComplete);
  });
}

function getRecommendedModules(state, limit = 3) {
  const sorted = getSortedModulesForState(state);
  const incomplete = sorted.filter((module) => !getModuleProgress(module, state).complete);
  
  // First, get all incomplete required modules
  const incompleteRequired = incomplete.filter((module) => getModuleTeamStatus(module.key, state) === "required");
  
  // If there are incomplete required modules, only show those
  if (incompleteRequired.length > 0) {
    return incompleteRequired.slice(0, limit);
  }
  
  // If all required modules are complete, show optional modules
  const incompleteOptional = incomplete.filter((module) => getModuleTeamStatus(module.key, state) === "optional");
  return incompleteOptional.slice(0, limit);
}

function getTrainingExpectation(state) {
  const requiredCount = FORGE_PROGRAM.modules.filter((module) => getModuleTeamStatus(module.key, state) === "required").length;
  const optionalCount = FORGE_PROGRAM.modules.filter((module) => getModuleTeamStatus(module.key, state) === "optional").length;

  if (isExempt(state)) {
    return {
      title: "Exempt by default",
      body: "This profile can browse the full library immediately. Leaders can still enforce the standard track with mentor override."
    };
  }

  return {
    title: requiredCount ? `${requiredCount} required modules` : "Program-wide training path",
    body: optionalCount
      ? `${optionalCount} more modules are available as optional follow-up training after the required path is complete.`
      : "All visible modules currently contribute to operational readiness for this profile."
  };
}

function renderCommonHeader() {
  const target = document.querySelector("[data-forge-header]");
  if (!target) return;

  const state = readState();
  const roleData = FORGE_PROGRAM.roles[state.role] || FORGE_PROGRAM.roles.rookie;
  const roleLabel = roleData.label;
  const teamData = getTeamData(state);
  const summary = getOverallProgress(state);

  target.innerHTML = `
    <div class="hero-card forge-profile-card" style="padding: 24px;">
      <div class="profile-header-row">
        <div class="profile-initials-badge" style="background:${(roleData.color || '#0070f3')}18;color:${roleData.color || '#0070f3'};border:2px solid ${(roleData.color || '#0070f3')}30">${FORGE_PROGRAM.demo.initials}</div>
        <div class="profile-header-text">
          <h3 class="profile-role-title">${roleLabel}</h3>
          ${teamData ? `<p class="profile-team-subtitle">${teamData.label} Team</p>` : '<p class="profile-team-subtitle">No Sub-Team Assigned</p>'}
        </div>
      </div>
      <div class="badge-row" style="margin-top:12px">
        ${teamData ? `<span class="badge team-badge" style="--role-color:${teamData.color};border-left-color:${teamData.color}">[${teamData.code}]</span>` : ""}
        <span class="badge pass-mark-badge">Pass Mark: ${FORGE_PROGRAM.passingScore}%</span>
        ${isExempt(state) ? '<span class="badge exempt-badge">Training Exempt</span>' : ''}
        <span class="badge" style="margin-left:auto;background:rgba(0,112,243,0.1);color:var(--accent);border:1px solid rgba(0,112,243,0.2)">${summary.percentage}% complete</span>
      </div>
    </div>
  `;
  
  // Update Forge navigation active states
  updateForgeNavActiveStates();
}

function updateForgeNavActiveStates() {
  const forgeNav = document.querySelector("[data-forge-nav]");
  if (!forgeNav) return;
  
  const currentPath = window.location.pathname;
  const links = forgeNav.querySelectorAll("a");
  
  links.forEach(link => {
    const href = link.getAttribute("href");
    link.classList.remove("active");
    
    if (currentPath.includes("portal") && href.includes("portal")) {
      link.classList.add("active");
    } else if (currentPath.includes("account") && href.includes("account")) {
      link.classList.add("active");
    }
  });
}

function renderRoleControls() {
  const scope = document.querySelector("[data-role-form]");
  if (!scope || scope.dataset.bound === "true") return;

  const state = readState();
  const roleControls = scope.querySelectorAll("[name='memberRole']");
  const overrideControl = scope.querySelector("[name='mentorOverride']");
  const syncRoleCardState = () => {
    scope.querySelectorAll(".role-card").forEach((card) => {
      const radio = card.querySelector("input[type='radio']");
      card.classList.toggle("selected", Boolean(radio?.checked));
    });
  };

  roleControls.forEach((control) => {
    if (control.type === "radio") {
      control.checked = control.value === state.role;
    } else {
      control.value = state.role;
    }
  });

  if (overrideControl) {
    overrideControl.checked = state.overrideRequired;
  }

  syncRoleCardState();

  scope.addEventListener("change", () => {
    const selectedRole = scope.querySelector("[name='memberRole']:checked")?.value
      || scope.querySelector("[name='memberRole']")?.value
      || state.role;
    const overrideValue = Boolean(scope.querySelector("[name='mentorOverride']")?.checked);
    syncRoleCardState();
    setRole(selectedRole);
    setOverride(overrideValue);
    window.location.reload();
  });

  scope.dataset.bound = "true";
}

function renderModuleCards() {
  const host = document.querySelector("[data-module-grid]");
  if (!host) return;

  const state = readState();

  host.innerHTML = FORGE_PROGRAM.modules
    .map((module) => {
      const progress = getModuleProgress(module, state);

      return `
        <article class="card">
          <h3>${module.title}</h3>
          <p>${module.outcome}</p>
          <div class="tag-row">
            <span class="tag">Owner: ${module.owner}</span>
            <span class="tag">Quizzes: ${module.quizzes.length}</span>
          </div>
          <div class="progress-track" aria-hidden="true">
            <div class="progress-fill" style="width: ${progress.percentage}%"></div>
          </div>
          <p><strong>${progress.statusText}</strong> • ${progress.passedCount}/${progress.totalCount} complete</p>
          <div class="button-row">
            <a class="btn primary" href="${module.modulePage}">Open Module</a>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderPortalMetrics() {
  const host = document.querySelector("[data-portal-metrics]");
  if (!host) return;

  const state = readState();
  const summary = getOverallProgress(state);

  host.innerHTML = `
    <article class="stat">
      <span class="value">${summary.percentage}%</span>
      <span>Program completion</span>
    </article>
    <article class="stat">
      <span class="value">${summary.completedModules}/${summary.totalModules}</span>
      <span>Sub-categories complete</span>
    </article>
    <article class="stat">
      <span class="value">${Object.keys(state.completedQuizzes).length}</span>
      <span>Quiz attempts logged</span>
    </article>
    <article class="stat">
      <span class="value">${isExempt(state) ? "Yes" : "No"}</span>
      <span>Exempt from required flow</span>
    </article>
  `;
}

function renderHomeContent() {
  const state = readState();
  const roleData = FORGE_PROGRAM.roles[state.role] || FORGE_PROGRAM.roles.rookie;
  const teamData = getTeamData(state);
  const summary = getOverallProgress(state);
  const videosWatched = Object.keys(state.readSections || state.watchedVideos || {}).length;
  const quizAttempts = Object.keys(state.completedQuizzes).length;
  const recommendedModules = getRecommendedModules(state, 3);
  const expectation = getTrainingExpectation(state);

  const pulseHost = document.querySelector("[data-home-pulse]");
  if (pulseHost) {
    pulseHost.innerHTML = `
      <div class="preview-card">
        <span class="preview-kicker">Live training snapshot</span>
        <h3>${FORGE_PROGRAM.demo.name}</h3>
        <p>${roleData.label}${teamData ? ` · ${teamData.label}` : " · Unassigned track"}</p>
        <div class="preview-metric-row">
          <div class="preview-metric">
            <strong>${summary.percentage}%</strong>
            <span>Completion</span>
          </div>
          <div class="preview-metric">
            <strong>${videosWatched}</strong>
            <span>Reads completed</span>
          </div>
          <div class="preview-metric">
            <strong>${quizAttempts}</strong>
            <span>Checks logged</span>
          </div>
        </div>
        <ul class="preview-list">
          ${recommendedModules.length
            ? recommendedModules.map((module) => `<li><span>${module.title}</span><strong>${module.estimatedTime || "Ready"}</strong></li>`).join("")
            : '<li><span>All current modules complete</span><strong>Ready</strong></li>'}
        </ul>
      </div>
    `;
  }

  const workflowHost = document.querySelector("[data-home-workflow]");
  if (workflowHost) {
    workflowHost.innerHTML = `
      <article class="workflow-card">
        <span class="workflow-step">01</span>
        <h4>Explain the program</h4>
        <p>Present FRC 10332 values, expectations, and team operations so members and families understand how the program runs.</p>
      </article>
      <article class="workflow-card">
        <span class="workflow-step">02</span>
        <h4>Route members to systems</h4>
        <p>Give students one place to reach Chargebotic Sites info, then move into Forge for backend training.</p>
      </article>
      <article class="workflow-card">
        <span class="workflow-step">03</span>
        <h4>Track readiness</h4>
        <p>Use role-based modules, completion checks, and leadership visibility so only prepared members gain advanced shop access.</p>
      </article>
    `;
  }

  const roadmapHost = document.querySelector("[data-home-roadmap]");
  if (roadmapHost) {
    roadmapHost.innerHTML = `
      <article class="workflow-card">
        <span class="workflow-step">Phase 1</span>
        <h4>Core curriculum live</h4>
        <p>Keep mandatory safety and sub-team fundamentals in Forge with standardized lessons and readiness checks.</p>
      </article>
      <article class="workflow-card">
        <span class="workflow-step">Phase 2</span>
        <h4>Curriculum expansion</h4>
        <p>Add advanced modules for leadership, offseason projects, and deeper role tracks across mechanical, software, and media.</p>
      </article>
      <article class="workflow-card">
        <span class="workflow-step">Phase 3</span>
        <h4>Systems online</h4>
        <p>Bring member tools online through Chargebotic Sites while Forge stays dedicated to training workflows.</p>
      </article>
    `;
  }

  const memberSystemsHost = document.querySelector("[data-home-member-systems]");
  if (memberSystemsHost) {
    memberSystemsHost.innerHTML = `
      <article class="feature-card">
        <div class="feature-topline">
          <span class="feature-dot" style="background:#78c8a0"></span>
          <span class="feature-code">MEMBER</span>
        </div>
        <h4>Profile and Access</h4>
        <p>Manage member role settings, exemptions, and the only main-site route into Forge backend training.</p>
        <div class="button-row">
          <a class="btn primary" href="account.html">Open Profile</a>
        </div>
      </article>
      <article class="feature-card">
        <div class="feature-topline">
          <span class="feature-dot" style="background:#a855f7"></span>
          <span class="feature-code">ROBOTICS</span>
        </div>
        <h4>External Robotics Systems</h4>
        <p>Quick links for event schedules and technical docs while internal team systems continue moving online.</p>
        <div class="button-row">
          <a class="btn" href="https://frc-events.firstinspires.org/" target="_blank" rel="noreferrer">FIRST Events</a>
          <a class="btn" href="https://docs.wpilib.org/" target="_blank" rel="noreferrer">WPILib Docs</a>
        </div>
      </article>
    `;
  }

  const trackHost = document.querySelector("[data-home-tracks]");
  if (trackHost) {
    trackHost.innerHTML = Object.entries(FORGE_PROGRAM.teams)
      .slice(0, 4)
      .map(([, team]) => `
        <article class="feature-card">
          <div class="feature-topline">
            <span class="feature-dot" style="background:${team.color}"></span>
            <span class="feature-code">${team.code}</span>
          </div>
          <h4>${team.label}</h4>
          <p>${team.description}</p>
          <div class="feature-pill-row">
            <span class="track-pill primary">${team.required.length} required</span>
            <span class="track-pill">${team.optional.length} optional</span>
          </div>
        </article>
      `)
      .join("");
  }

  const summaryHost = document.querySelector("[data-home-role-summary]");
  if (summaryHost) {
    summaryHost.innerHTML = `
      <span class="preview-kicker">Current policy</span>
      <h3>${expectation.title}</h3>
      <p>${expectation.body}</p>
      <ul class="preview-list dense">
        <li><span>Selected role</span><strong>${roleData.label}</strong></li>
        <li><span>Exempt status</span><strong>${isExempt(state) ? "Exempt" : "Required"}</strong></li>
        <li><span>Mentor override</span><strong>${state.overrideRequired ? "Enabled" : "Off"}</strong></li>
      </ul>
    `;
  }
}

function getPageKind() {
  const path = window.location.pathname;
  if (path.includes("/modules/")) return "module";
  if (path.includes("/account")) return "account";
  if (path.includes("/portal")) return "portal";
  return "home";
}

function getModuleFromPath() {
  const key = window.location.pathname.split("/").filter(Boolean).pop()?.replace(/\.html$/, "");
  return FORGE_PROGRAM.modules.find((module) => module.key === key) || FORGE_PROGRAM.modules[0];
}

function renderMetricTiles(state) {
  const summary = getOverallProgress(state);
  const checksLogged = Object.keys(state.completedQuizzes).length;
  const videosWatched = Object.keys(state.readSections || state.watchedVideos || {}).length;
  const totalSections = FORGE_PROGRAM.modules.reduce((sum, m) => sum + getModuleSections(m).length, 0);
  const completionBar = summary.percentage;
  const modulesBar = summary.totalModules ? Math.round((summary.completedModules / summary.totalModules) * 100) : 0;
  const checksBar = totalSections ? Math.min(Math.round((checksLogged / totalSections) * 100), 100) : 0;
  const readsBar = totalSections ? Math.min(Math.round((videosWatched / totalSections) * 100), 100) : 0;

  return `
    <article class="stat enhanced-stat">
      <div class="stat-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <span class="value" data-count="${summary.percentage}" data-suffix="%">${summary.percentage}%</span>
      <span>Program completion</span>
      <div class="stat-mini-bar"><div style="width:${completionBar}%"></div></div>
    </article>
    <article class="stat enhanced-stat">
      <div class="stat-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      </div>
      <span class="value">${summary.completedModules}/${summary.totalModules}</span>
      <span>Modules complete</span>
      <div class="stat-mini-bar"><div style="width:${modulesBar}%"></div></div>
    </article>
    <article class="stat enhanced-stat">
      <div class="stat-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      </div>
      <span class="value" data-count="${checksLogged}">${checksLogged}</span>
      <span>Checks logged</span>
      <div class="stat-mini-bar"><div style="width:${checksBar}%"></div></div>
    </article>
    <article class="stat enhanced-stat">
      <div class="stat-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      </div>
      <span class="value" data-count="${videosWatched}">${videosWatched}</span>
      <span>Reads completed</span>
      <div class="stat-mini-bar"><div style="width:${readsBar}%"></div></div>
    </article>
  `;
}

function renderQuizForm(section, module) {
  const storageKey = getSectionStorageKey(module, section);
  const total = section.quiz.length;

  return `
    <div class="quiz-launch-card" data-inline-quiz data-quiz-key="${storageKey}">
      <p>Launch a fullscreen one-way quiz. You cannot go backward during an attempt.</p>
      <div class="button-row">
        <button class="btn primary" type="button" data-start-quiz="${storageKey}">Start Fullscreen Quiz</button>
        <span class="quiz-meta">${total} questions • unlimited retakes</span>
      </div>
      <div class="result" data-quiz-result>Pass score: ${FORGE_PROGRAM.passingScore}%.</div>
    </div>
  `;
}

const FILE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="10" y1="12" x2="16" y2="12"/><line x1="10" y1="16" x2="16" y2="16"/></svg>`;
const LOCK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" opacity="0.4"/></svg>`;
const VIDEO_PLAY_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
const NOTES_SUB_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;
const QUIZ_CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`;

function renderCanvasItemRow(section, module, index, state) {
  const quizKey = getSectionStorageKey(module, section);
  const quizState = state.completedQuizzes[quizKey];
  const passed = quizState && quizState.passed;
  const watched = getVideoWatched(quizKey);

  const quizContent = watched
    ? renderQuizForm(section, module)
    : `<div class="quiz-lock-overlay">
         <span class="quiz-lock-icon">${LOCK_ICON}</span>
         <p>Finish the reading session checks (timer + bottom scroll) to unlock this assessment.</p>
       </div>`;

  return `
    <details class="canvas-item-row">
      <summary>
        <span class="cir-grip">&#x22EE;&#x22EE;</span>
        <span class="cir-icon">${FILE_ICON}</span>
        <span class="cir-title">${index + 1}. ${section.title}</span>
        <span class="cir-right">
          <span class="cir-check ${passed ? "done" : ""}" aria-label="${passed ? "Complete" : "Incomplete"}">${passed ? "&#x2713;" : ""}</span>
          <span class="cir-dots">&#x22EE;</span>
        </span>
      </summary>
      <div class="cir-body">
        <div class="section-subitems">

          <details class="section-subitem video-subitem">
            <summary class="subitem-summary">
              <span class="subitem-icon video">${VIDEO_PLAY_ICON}</span>
              <span class="subitem-title">Read This</span>
              <span class="subitem-badge ${watched ? "watched" : ""}" data-subitem-vbadge="${quizKey}">${watched ? "&#x2713;&nbsp;Read" : "Required"}</span>
            </summary>
            <div class="subitem-body">
              ${renderVideoPanel(section, module)}
            </div>
          </details>

          <details class="section-subitem notes-subitem">
            <summary class="subitem-summary">
              <span class="subitem-icon notes">${NOTES_SUB_ICON}</span>
              <span class="subitem-title">Explanation &amp; Notes</span>
            </summary>
            <div class="subitem-body">
              <div class="rich-notes">${renderExpandedNotes(section)}</div>
            </div>
          </details>

          <details class="section-subitem quiz-subitem ${watched ? "" : "quiz-locked"}">
            <summary class="subitem-summary">
              <span class="subitem-icon quiz">${QUIZ_CHECK_ICON}</span>
              <span class="subitem-title">Knowledge Test</span>
              ${!watched
                ? `<span class="subitem-badge locked">${LOCK_ICON}&nbsp;Locked</span>`
                : passed
                  ? `<span class="subitem-badge passed">&#x2713;&nbsp;Passed</span>`
                  : ""}
            </summary>
            <div class="subitem-body">
              <div data-quiz-gate="${quizKey}" ${watched ? "" : 'data-locked="true"'}>
                ${quizContent}
              </div>
            </div>
          </details>

        </div>
      </div>
    </details>
  `;
}

function renderModuleAccordion(module, state, defaultOpen = false) {
  const progress = getModuleProgress(module, state);
  const teamStatus = getModuleTeamStatus(module.key, state);
  const sections = getModuleSections(module)
    .map((section, index) => renderCanvasItemRow(section, module, index, state))
    .join("");

  // Team status tag
  let tagHtml = "";
  if (teamStatus === "required") {
    tagHtml = `<span class="cmr-tag req">REQUIRED</span>`;
  } else if (teamStatus === "optional") {
    tagHtml = `<span class="cmr-tag opt">OPTIONAL</span>`;
  }

  // Metadata chips
  const diffColor = { beginner: "#22c55e", intermediate: "#f59e0b", advanced: "#ef4444" };
  const diffChip = module.difficulty
    ? `<span style="font-size:0.65rem;font-family:var(--mono);font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${diffColor[module.difficulty]||"#9db0c4"}">${module.difficulty}</span>`
    : "";
  const timeChip = module.estimatedTime
    ? `<span class="cmr-meta">${module.estimatedTime}</span>`
    : "";

  // Progress fill
  const pct = progress.percentage || 0;
  const fillClass = progress.complete ? "cmr-progress-fill complete" : "cmr-progress-fill";

  // Team class on the row
  const rowClass = teamStatus === "required" ? " team-required" : teamStatus === "optional" ? " team-optional" : "";

  return `
    <details class="canvas-module-row${rowClass}" ${defaultOpen ? "open" : ""}>
      <summary>
        <span class="cmr-arrow">▶</span>
        <span class="cmr-title">${module.title}${tagHtml}</span>
        <span class="cmr-right">
          ${diffChip}
          ${timeChip}
          <span class="cmr-progress-wrap" title="${pct}% complete">
            <span class="${fillClass}" style="width:${pct}%"></span>
          </span>
          <span class="cmr-score">${progress.passedCount}/${progress.totalCount}</span>
          <span class="cmr-check ${progress.complete ? "done" : ""}" aria-label="${progress.complete ? "Complete" : "In Progress"}">${progress.complete ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg>' : ""}</span>
        </span>
      </summary>
      <div class="canvas-module-items">
        <div class="canvas-text-header">${module.outcome}</div>
        ${sections}
      </div>
    </details>
  `;
}

function renderDashboardContent() {
  const host = document.querySelector("[data-dashboard-content], .content-area");
  if (!host) return;
  if (!window.FORGE_PROGRAM) { _renderDataError(host, "portal"); return; }

  const state = readState();
  const teamData = getTeamData(state);
  const sortedModules = getSortedModulesForState(state);
  const recommendedModules = getRecommendedModules(state, 3);
  const expectation = getTrainingExpectation(state);
  const videosWatched = Object.keys(state.readSections || state.watchedVideos || {}).length;
  const quizAttempts = Object.keys(state.completedQuizzes).length;
  const summary = getOverallProgress(state);
  const roleData = FORGE_PROGRAM.roles[state.role] || FORGE_PROGRAM.roles.rookie;
  const nextModule = sortedModules.find(m => !getModuleProgress(m, state).complete);

  host.innerHTML = `
    <article class="panel hero dashboard-hero forge-hero-v2">
      <div class="hero-grid dashboard-hero-grid">
        <div class="hero-copy">
          <span class="eyebrow">FORGE Training Platform</span>
          <h2>Training Hub</h2>
          <p class="hero-subtitle">Focused Operations for Robotics Growth &amp; Excellence</p>
          <p>Master safety, technical skills, and team operations. Complete assigned modules and pass assessments to advance your training status.</p>
          <div class="hero-chip-row">
            ${teamData
              ? `<span class="glass-chip" style="background:${teamData.color}18;color:${teamData.color};border-color:${teamData.color}30">[${teamData.code}] ${teamData.label}</span>`
              : `<span class="glass-chip">All Modules</span>`}
            <span class="glass-chip">${summary.completedModules}/${summary.totalModules} Complete</span>
            ${quizAttempts > 0 ? `<span class="glass-chip">${quizAttempts} Assessments</span>` : ""}
          </div>
          <div class="button-row" style="margin-top:8px">
            <a class="btn primary" href="${nextModule ? nextModule.modulePage : `${assetPrefix()}modules/safety`}">Continue Training</a>
            <a class="btn alt" href="${assetPrefix()}account">My Account</a>
          </div>
        </div>
        <aside class="hero-side">
          <div class="preview-card compact forge-status-card">
            <span class="preview-kicker">Training Status</span>
            <div style="display:flex;align-items:center;gap:20px;margin-bottom:14px">
              <div class="mbr-dash-progress-ring">
                <svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6"/>
                  <circle cx="32" cy="32" r="26" fill="none" stroke="${roleData.color || 'var(--accent)'}" stroke-width="6"
                    stroke-dasharray="${2 * Math.PI * 26}" stroke-dashoffset="${2 * Math.PI * 26 * (1 - summary.percentage / 100)}"
                    stroke-linecap="round" transform="rotate(-90 32 32)"/>
                </svg>
                <span class="ring-label">${summary.percentage}%</span>
              </div>
              <div>
                <strong style="display:block;font-size:0.95rem;color:var(--text)">${expectation.title}</strong>
                <span style="font-size:0.8rem;color:var(--muted)">${summary.completedModules} of ${summary.totalModules} modules</span>
              </div>
            </div>
            <p style="margin:0 0 12px;font-size:0.825rem;color:var(--muted);line-height:1.5">${expectation.body}</p>
            <div class="status-progress-wrap">
              <div class="status-progress-bar">
                <div class="status-progress-fill" style="width: ${summary.percentage}%"></div>
              </div>
              <span class="status-progress-text">${videosWatched} reads · ${quizAttempts} assessments</span>
            </div>
          </div>
        </aside>
      </div>
    </article>

    <section class="panel stats-overview-panel">
      <div class="section-head compact">
        <h3>Performance Metrics</h3>
        <p>Your progress across all training modules and assessments</p>
      </div>
      <div class="quick-grid">
        ${renderMetricTiles(state)}
      </div>
    </section>

    ${recommendedModules.length > 0 ? `
    <section class="panel recommended-modules-panel">
      <div class="section-head compact">
        <h3>Next Steps</h3>
        <p>Recommended modules to continue your training journey</p>
      </div>
      <div class="recommended-grid">
        ${recommendedModules.map((module) => {
          const progress = getModuleProgress(module, state);
          const teamStatus = getModuleTeamStatus(module.key, state);
          const statusBadge = teamStatus === "required"
            ? '<span class="rec-badge required">REQUIRED</span>'
            : teamStatus === "optional"
            ? '<span class="rec-badge optional">OPTIONAL</span>'
            : '';
          return `
            <article class="recommended-card">
              <div class="rec-header">
                <span class="rec-icon">${UI_ICONS[module.icon] || UI_ICONS.dashboard}</span>
                ${statusBadge}
              </div>
              <h4>${module.title}</h4>
              <p>${module.outcome}</p>
              <div class="rec-meta">
                <span style="display:flex;align-items:center;gap:4px">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="13" height="13" aria-hidden="true"><circle cx="12" cy="12" r="10" opacity="0.4"/><polyline points="12 6 12 12 16 14"/></svg>
                  ${module.estimatedTime || "60 min"}
                </span>
                <span style="display:flex;align-items:center;gap:4px">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="13" height="13" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" opacity="0.4"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1" opacity="0.4"/></svg>
                  ${getModuleSections(module).length} sections
                </span>
                ${progress.passedCount > 0 ? `<span style="color:var(--accent)">${progress.passedCount}/${progress.totalCount} done</span>` : ""}
              </div>
              <div class="button-row">
                <a class="btn primary" href="${module.modulePage}">Start Module</a>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
    ` : ''}

    <section class="panel">
      <div class="section-head">
        <h3>All Training Modules</h3>
        <p>Complete curriculum organized by role, sub-team, and skill level. Expand any module to view lessons and begin training.</p>
      </div>
      <div class="module-accordion-list">
        ${sortedModules.map((module, index) => renderModuleAccordion(module, state, index === 0)).join("")}
      </div>
    </section>

    <section class="panel">
      <div class="section-head compact">
        <h3>Quick Access</h3>
        <p>Jump directly to any training area</p>
      </div>
      <div class="mbr-quick-grid">
        <a class="mbr-quick-card mbr-quick-primary" href="${assetPrefix()}account">
          <div class="mbr-quick-icon" aria-hidden="true">${UI_ICONS.account}</div>
          <div class="mbr-quick-body"><strong>Member Account</strong><span>Profile, progress &amp; settings</span></div>
          <svg class="mbr-quick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19" opacity="0.5"/></svg>
        </a>
        <a class="mbr-quick-card" href="${assetPrefix()}modules/safety">
          <div class="mbr-quick-icon" aria-hidden="true">${UI_ICONS.safety}</div>
          <div class="mbr-quick-body"><strong>Safety</strong><span>Required for all members · PPE &amp; shop zones</span></div>
          <svg class="mbr-quick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19" opacity="0.5"/></svg>
        </a>
        <a class="mbr-quick-card" href="${assetPrefix()}modules/control">
          <div class="mbr-quick-icon" aria-hidden="true">${UI_ICONS.control}</div>
          <div class="mbr-quick-body"><strong>Control</strong><span>Wiring, code practices &amp; CAN bus</span></div>
          <svg class="mbr-quick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19" opacity="0.5"/></svg>
        </a>
        <a class="mbr-quick-card" href="${assetPrefix()}modules/design">
          <div class="mbr-quick-icon" aria-hidden="true">${UI_ICONS.design}</div>
          <div class="mbr-quick-body"><strong>Design</strong><span>CAD standards &amp; DFM practices</span></div>
          <svg class="mbr-quick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19" opacity="0.5"/></svg>
        </a>
        <a class="mbr-quick-card" href="${assetPrefix()}modules/fabrication">
          <div class="mbr-quick-icon" aria-hidden="true">${UI_ICONS.fabrication}</div>
          <div class="mbr-quick-body"><strong>Fabrication</strong><span>Machine ops &amp; measurement</span></div>
          <svg class="mbr-quick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19" opacity="0.5"/></svg>
        </a>
        <a class="mbr-quick-card" href="${assetPrefix()}modules/strategy">
          <div class="mbr-quick-icon" aria-hidden="true">${UI_ICONS.strategy}</div>
          <div class="mbr-quick-body"><strong>Strategy</strong><span>Match planning &amp; scouting</span></div>
          <svg class="mbr-quick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19" opacity="0.5"/></svg>
        </a>
        <a class="mbr-quick-card" href="${assetPrefix()}modules/business-media">
          <div class="mbr-quick-icon" aria-hidden="true">${UI_ICONS.business}</div>
          <div class="mbr-quick-body"><strong>Business &amp; Media</strong><span>Branding, outreach &amp; communications</span></div>
          <svg class="mbr-quick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19" opacity="0.5"/></svg>
        </a>
        <a class="mbr-quick-card" href="${assetPrefix()}modules/art">
          <div class="mbr-quick-icon" aria-hidden="true">${UI_ICONS.art}</div>
          <div class="mbr-quick-body"><strong>Art &amp; Brand Visuals</strong><span>Identity, pit presentation</span></div>
          <svg class="mbr-quick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19" opacity="0.5"/></svg>
        </a>
      </div>
    </section>
  `;
}

function renderModuleContent() {
  const host = document.querySelector("[data-module-content], .content-area");
  if (!host) return;
  if (!window.FORGE_PROGRAM) { _renderDataError(host, "module"); return; }

  const module = getModuleFromPath();
  const state = readState();
  const progress = getModuleProgress(module, state);
  const sections = getModuleSections(module);

  host.innerHTML = `
    <article class="panel hero module-hero">
      <div>
        <h2>${module.title}</h2>
        <p>${module.outcome}</p>
      </div>
      <div class="quick-grid">
        <article class="stat"><span class="value">${progress.passedCount}/${progress.totalCount}</span><span>Sections complete</span></article>
        <article class="stat"><span class="value">${sections.length}</span><span>Sections available</span></article>
        <article class="stat"><span class="value">${isExempt(state) ? "Exempt" : "Required"}</span><span>Current rule</span></article>
      </div>
    </article>
    <div class="module-accordion-list single-module">
      ${renderModuleAccordion(module, state, true)}
    </div>
  `;
  
  // Wire the reading session buttons after rendering
  wireReadCountdownTimers();
}

// ─── Auth Form Rendering ──────────────────────────────────────────────────────

function renderAuthShell(activeTab) {
  const tab = activeTab || "sign-in";
  const teams = Object.entries(FORGE_PROGRAM.teams || {}).map(([, t]) => ({
    label: t.label,
    color: t.color,
  }));
  const teamCheckboxes = teams
    .map(
      (t) => `
    <label class="team-choice">
      <input type="checkbox" name="teams" value="${t.label}" />
      <span class="team-choice-dot" style="background:${t.color}"></span>
      <span>${t.label}</span>
    </label>`
    )
    .join("");
  const gradeOpts = [
    "Freshman (9th)",
    "Sophomore (10th)",
    "Junior (11th)",
    "Senior (12th)",
    "Alumni",
    "Mentor / Coach",
    "Other",
  ]
    .map((g) => `<option>${g}</option>`)
    .join("");
  const expOpts = ["First year", "2 years", "3 years", "4 years", "5+ years"]
    .map((e, i) => `<option value="${i + 1}">${e}</option>`)
    .join("");

  return `
    <div class="auth-shell">
      <div class="auth-hero">
        <span class="kicker">Member Access</span>
        <h1>FORGE<br>Training</h1>
        <p>Log in to access your personalized training dashboard, track module progress, and manage your team assignments.</p>
        <ul class="auth-highlights">
          <li>Progress tracking across all modules</li>
          <li>Quiz scores &amp; certifications</li>
          <li>Sub-team assignment &amp; role management</li>
          <li>Competition preparation resources</li>
        </ul>
      </div>
      <div class="auth-card">
        <div class="auth-tabs" role="tablist">
          <button class="${tab === "sign-in" ? "active" : ""}" data-auth-tab="sign-in" role="tab" aria-selected="${tab === "sign-in"}">Sign In</button>
          <button class="${tab === "sign-up" ? "active" : ""}" data-auth-tab="sign-up" role="tab" aria-selected="${tab === "sign-up"}">Create Account</button>
        </div>

        <div data-auth-panel="sign-in"${tab !== "sign-in" ? " hidden" : ""}>
          <form class="auth-form" id="sign-in-form" novalidate>
            <h2 class="auth-form-title">Welcome back</h2>
            <p class="auth-form-note">Sign in with your team credentials to access FORGE.</p>
            <label>
              Email address
              <input type="email" name="email" autocomplete="username" placeholder="you@example.com" required />
            </label>
            <label>
              Password
              <div class="input-with-toggle">
                <input type="password" name="password" autocomplete="current-password" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" required />
                <button type="button" class="input-toggle-btn" aria-label="Show password" data-toggle-password>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" opacity="0.5"/></svg>
              <button type="button" class="link-btn" data-auth-forgot>Forgot password?</button>
            </div>
            <button type="submit" class="btn primary btn-full" id="sign-in-submit">
              <span class="btn-label">Sign In</span>
            </button>
            <p class="status" id="sign-in-status" aria-live="polite"></p>
          </form>
        </div>

        <div data-auth-panel="sign-up"${tab !== "sign-up" ? " hidden" : ""}>
          <form class="auth-form" id="sign-up-form" novalidate>
            <h2 class="auth-form-title">Create account</h2>
            <p class="auth-form-note">New members: request access below. An admin will review and approve your application.</p>
            <div class="auth-form-cols">
              <label>
                First name
                <input type="text" name="firstName" autocomplete="given-name" placeholder="Alex" required />
              </label>
              <label>
                Last name
                <input type="text" name="lastName" autocomplete="family-name" placeholder="Johnson" required />
              </label>
            </div>
            <label>
              Team email address
              <input type="email" name="email" autocomplete="username" placeholder="ajohnson@example.com" required />
            </label>
            <div class="auth-form-cols">
              <label>
                Grade / Level
                <select name="grade">
                  <option value="">Select&hellip;</option>
                  ${gradeOpts}
                </select>
              </label>
              <label>
                FRC experience
                <select name="experience">
                  <option value="">Select&hellip;</option>
                  ${expOpts}
                </select>
              </label>
            </div>
            <div class="auth-form-cols">
              <label>
                Password
                <div class="input-with-toggle">
                  <input type="password" name="password" autocomplete="new-password" placeholder="Min. 8 characters" required minlength="8" />
                  <button type="button" class="input-toggle-btn" aria-label="Show password" data-toggle-password>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" opacity="0.5"/></svg>
                  </button>
                </div>
              </label>
              <label>
                Confirm password
                <input type="password" name="confirmPassword" autocomplete="new-password" placeholder="Repeat password" required />
              </label>
            </div>
            <fieldset>
              <legend>Sub-team interest <span style="font-weight:400;color:var(--muted)">(select all that apply)</span></legend>
              <div class="team-choices-grid">
                ${teamCheckboxes}
              </div>
            </fieldset>
            <label class="policy-check">
              <input type="checkbox" name="terms" required />
              <span>I agree to the <a href="#" data-policy="terms">Terms of Service</a> and <a href="#" data-policy="privacy">Privacy Policy</a>, and consent to my training data being stored for team use.</span>
            </label>
            <button type="submit" class="btn primary btn-full" id="sign-up-submit">
              <span class="btn-label">Request Access</span>
            </button>
            <p class="status" id="sign-up-status" aria-live="polite"></p>
          </form>
        </div>
      </div>
    </div>
  `;
}

function wireAuthForms() {
  const host = document.querySelector("[data-account-content], .content-area");
  if (!host) return;

  // Tab switching
  host.querySelectorAll("[data-auth-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.authTab;
      host.querySelectorAll("[data-auth-tab]").forEach((b) => {
        b.classList.toggle("active", b.dataset.authTab === tab);
        b.setAttribute("aria-selected", String(b.dataset.authTab === tab));
      });
      host.querySelectorAll("[data-auth-panel]").forEach((p) => {
        p.hidden = p.dataset.authPanel !== tab;
      });
    });
  });

  // Password visibility toggles
  host.querySelectorAll("[data-toggle-password]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input");
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      btn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
    });
  });

  // Forgot password (placeholder)
  host.querySelector("[data-auth-forgot]")?.addEventListener("click", () => {
    _showAuthToast("Password reset is coming soon. Contact your team admin for access help.");
  });

  // Policy links (placeholder)
  host.querySelectorAll("[data-policy]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      _showAuthToast("Full policy documents coming soon. Contact your team admin for details.");
    });
  });

  // Sign-in
  const signInForm = host.querySelector("#sign-in-form");
  if (signInForm) {
    signInForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const statusEl = signInForm.querySelector("#sign-in-status");
      const submitBtn = signInForm.querySelector("#sign-in-submit");
      const email = signInForm.querySelector('[name="email"]').value.trim();
      const password = signInForm.querySelector('[name="password"]').value;
      if (!email || !password) {
        _setAuthStatus(statusEl, "Please fill in all fields.", "error");
        return;
      }
      _setAuthBusy(submitBtn, true, "Signing in\u2026");
      _setAuthStatus(statusEl, "", "");
      try {
        const fs = window.FirebaseSystems;
        if (!fs) throw new Error("Auth system unavailable \u2014 try refreshing the page.");
        await fs.signIn(email, password);
        // onAuthChange will trigger re-render
      } catch (err) {
        _setAuthStatus(statusEl, err.message || "Sign-in failed. Please try again.", "error");
        _setAuthBusy(submitBtn, false, "Sign In");
      }
    });
  }

  // Sign-up
  const signUpForm = host.querySelector("#sign-up-form");
  if (signUpForm) {
    signUpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const statusEl = signUpForm.querySelector("#sign-up-status");
      const submitBtn = signUpForm.querySelector("#sign-up-submit");
      const firstName = signUpForm.querySelector('[name="firstName"]').value.trim();
      const lastName = signUpForm.querySelector('[name="lastName"]').value.trim();
      const email = signUpForm.querySelector('[name="email"]').value.trim();
      const password = signUpForm.querySelector('[name="password"]').value;
      const confirmPw = signUpForm.querySelector('[name="confirmPassword"]').value;
      const teams = [...signUpForm.querySelectorAll('[name="teams"]:checked')].map((cb) => cb.value);
      const terms = signUpForm.querySelector('[name="terms"]').checked;

      if (!firstName || !lastName || !email || !password) {
        _setAuthStatus(statusEl, "Please fill in all required fields.", "error");
        return;
      }
      if (password.length < 8) {
        _setAuthStatus(statusEl, "Password must be at least 8 characters.", "error");
        return;
      }
      if (password !== confirmPw) {
        _setAuthStatus(statusEl, "Passwords do not match.", "error");
        return;
      }
      if (!teams.length) {
        _setAuthStatus(statusEl, "Select at least one sub-team interest.", "error");
        return;
      }
      if (!terms) {
        _setAuthStatus(statusEl, "You must agree to the Terms of Service to continue.", "error");
        return;
      }

      _setAuthBusy(submitBtn, true, "Submitting\u2026");
      _setAuthStatus(statusEl, "", "");
      try {
        const fs = window.FirebaseSystems;
        if (!fs) throw new Error("Auth system unavailable \u2014 try refreshing the page.");
        await fs.signUp(email, password, `${firstName} ${lastName}`, { teams });
        _setAuthStatus(
          statusEl,
          "\u2713 Request submitted! An admin will review your application. You\u2019ll receive access once approved.",
          "ok"
        );
        signUpForm.reset();
        _setAuthBusy(submitBtn, false, "Request Access");
      } catch (err) {
        _setAuthStatus(statusEl, err.message || "Sign-up failed. Please try again.", "error");
        _setAuthBusy(submitBtn, false, "Request Access");
      }
    });
  }
}

function _setAuthStatus(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.className = `status${type ? " " + type : ""}`;
}

function _setAuthBusy(btn, busy, label) {
  if (!btn) return;
  btn.disabled = busy;
  const labelEl = btn.querySelector(".btn-label");
  if (labelEl) labelEl.textContent = label;
}

function _showAuthToast(message) {
  const existing = document.querySelector(".auth-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "auth-toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("auth-toast-visible"));
  setTimeout(() => {
    toast.classList.remove("auth-toast-visible");
    setTimeout(() => toast.remove(), 350);
  }, 4500);
}

// ─── Account Management Section ───────────────────────────────────────────────

function renderAccountManagementSection(user) {
  const displayName = user?.displayName || user?.email || "Team Member";
  const email = user?.email || "";
  return `
    <section class="account-mgmt">
      <header class="account-mgmt-header">
        <h3>Privacy &amp; Account Management</h3>
        <p>Manage your personal data, account access, and privacy preferences. Requests are processed by team admins within 5&ndash;7 school days.</p>
      </header>
      <div class="account-mgmt-grid">
        <div class="mgmt-card">
          <div class="mgmt-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
          <h4>Export My Data</h4>
          <p>Download a copy of your training records, quiz scores, and account details in a portable format.</p>
          <button class="btn alt mgmt-btn" data-mgmt-action="export" type="button">Request Data Export</button>
        </div>
        <div class="mgmt-card">
          <div class="mgmt-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" opacity="0.4"/></svg>
          </div>
          <h4>Change Password</h4>
          <p>Update your account password. Instructions will be sent to your registered email address.</p>
          <button class="btn alt mgmt-btn" data-mgmt-action="password" type="button">Send Reset Email</button>
        </div>
        <div class="mgmt-card mgmt-card-danger">
          <div class="mgmt-card-icon mgmt-card-icon-danger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </div>
          <h4>Delete Account</h4>
          <p>Permanently remove your account and all associated training data. This cannot be undone.</p>
          <button class="btn alt mgmt-btn mgmt-btn-danger" data-mgmt-action="delete" type="button">Request Deletion</button>
        </div>
      </div>
      <div class="mgmt-privacy-settings">
        <h4>Privacy Preferences</h4>
        <label class="privacy-toggle">
          <input type="checkbox" name="analyticsConsent" checked />
          <span>Allow my anonymized training progress to be included in team analytics</span>
        </label>
        <label class="privacy-toggle">
          <input type="checkbox" name="leaderboardConsent" />
          <span>Show my name on team progress leaderboards</span>
        </label>
        <label class="privacy-toggle">
          <input type="checkbox" name="emailNotifications" checked />
          <span>Receive notifications about account status changes</span>
        </label>
      </div>
      <div class="mgmt-sign-out-row">
        <p class="mgmt-session-info">Signed in as <strong>${displayName}</strong>${email ? ` &mdash; ${email}` : ""}</p>
        <button class="btn alt" data-sign-out type="button">Sign Out</button>
      </div>
    </section>
  `;
}

function wireAccountManagement() {
  const host = document.querySelector("[data-account-content], .content-area");
  if (!host) return;

  host.querySelector("[data-sign-out]")?.addEventListener("click", async () => {
    const fs = window.FirebaseSystems;
    if (!fs) return;
    await fs.signOut();
    // onAuthChange will re-render to show sign-in form
  });

  host.querySelector('[data-mgmt-action="export"]')?.addEventListener("click", () => {
    _showMgmtModal(
      "data-export",
      "Export My Data",
      "Your data export request has been noted. A team admin will compile your training records and contact you at your registered email within 5\u20137 school days.",
      "Got it",
      false
    );
  });

  host.querySelector('[data-mgmt-action="password"]')?.addEventListener("click", () => {
    _showMgmtModal(
      "password-reset",
      "Change Password",
      "Password reset via email will be available once email authentication is fully configured. For now, contact your team admin to update your password.",
      "Got it",
      false
    );
  });

  host.querySelector('[data-mgmt-action="delete"]')?.addEventListener("click", () => {
    _showMgmtModal(
      "account-delete",
      "Request Account Deletion",
      "Submitting this request will notify a team admin. Your account and all training data will be permanently deleted within 30 days. This action cannot be undone.",
      "Submit Deletion Request",
      true
    );
  });
}

function _showMgmtModal(id, title, body, btnLabel, isDanger) {
  document.querySelector(".mgmt-modal")?.remove();
  const modal = document.createElement("div");
  modal.className = "site-modal mgmt-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.innerHTML = `
    <div class="site-modal-card" style="max-width:420px;padding:28px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:12px">
        <h3 style="margin:0;font-size:18px">${title}</h3>
        <button class="modal-close-btn" aria-label="Close" data-modal-close type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <p style="color:var(--muted);font-size:14px;margin:0 0 24px;line-height:1.6">${body}</p>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button class="btn alt" data-modal-close type="button">Cancel</button>
        <button class="btn${isDanger ? "" : " primary"}" style="${isDanger ? "background:#e53935;color:#fff" : ""}" data-modal-confirm type="button">${btnLabel}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelectorAll("[data-modal-close],[data-modal-confirm]").forEach((btn) => {
    btn.addEventListener("click", () => {
      modal.style.transition = "opacity 0.2s ease";
      modal.style.opacity = "0";
      setTimeout(() => modal.remove(), 220);
    });
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.transition = "opacity 0.2s ease";
      modal.style.opacity = "0";
      setTimeout(() => modal.remove(), 220);
    }
  });
}

function renderAccountContent() {
  const host = document.querySelector("[data-account-content], .content-area");
  if (!host) return;

  // ── Auth gate: require cookie consent ─────────────────────────────────────
  const consent = getCookieConsent();
  const fs = window.FirebaseSystems;
  const currentUser = fs ? fs.getCurrentUser() : null;

  if (consent !== true) {
    host.innerHTML = `
      <div class="auth-consent-wall">
        <div class="auth-consent-wall-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="48" height="48"><circle cx="12" cy="12" r="10"/><circle cx="8.5" cy="13.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="14" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.25" fill="currentColor" stroke="none"/></svg>
        </div>
        <h2>Cookies &amp; Storage Required</h2>
        <p>FORGE uses local storage to save your login session and training progress. You must accept cookies to sign in or create an account.</p>
        <button class="btn primary" id="open-cookie-settings" type="button">Review Cookie Settings</button>
      </div>
    `;
    host.querySelector("#open-cookie-settings")?.addEventListener("click", () => {
      document.getElementById("cookie-banner")?.remove();
      try { localStorage.removeItem(COOKIE_CONSENT_KEY); } catch (e) { /* ignore */ }
      renderCookieBanner();
    });
    return;
  }

  // ── Auth gate: require sign-in ────────────────────────────────────────────
  if (!currentUser) {
    host.innerHTML = renderAuthShell();
    wireAuthForms();
    return;
  }

  // ── Logged-in: render full member dashboard ───────────────────────────────
  renderMemberDashboard(host, currentUser);
}

// ─── Member Dashboard ─────────────────────────────────────────────────────────

function renderMemberDashboard(host, currentUser) {
  const state = readState();
  const summary = getOverallProgress(state);
  const demo = FORGE_PROGRAM.demo;
  const teamData = getTeamData(state);
  const roleData = FORGE_PROGRAM.roles[state.role] || FORGE_PROGRAM.roles.rookie;
  const isAdmin = ["captain", "lead", "mentor"].includes(state.role);
  const teamsObj = FORGE_PROGRAM.teams || {};

  // Compute a few extra metrics for the dashboard
  const readCount = Object.keys(state.readSections || state.watchedVideos || {}).length;
  const quizPassCount = Object.values(state.completedQuizzes || {}).filter(r => r.passed).length;
  const totalQuizzes = FORGE_PROGRAM.modules.reduce((n, m) => n + getModuleSections(m).length, 0);
  const urgentModules = FORGE_PROGRAM.modules.filter(m => getModuleTeamStatus(m.key, state) === "required" && getModuleProgress(m, state).passedCount < getModuleProgress(m, state).totalCount);
  const nextModule = urgentModules[0] || getSortedModulesForState(state).find(m => getModuleProgress(m, state).passedCount < getModuleProgress(m, state).totalCount);

  // Recent completions (last 3)
  const recentQuizzes = Object.entries(state.completedQuizzes || {})
    .filter(([, r]) => r.completedAt)
    .sort(([, a], [, b]) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 3);

  // Team assignment card
  const teamCard = `
    <section class="account-card">
      <h3>Sub-Team Assignment</h3>
      <p style="font-size:0.78rem;color:var(--muted);margin:0 0 10px;">Your assigned sub-team controls which modules are marked Required or Optional on your dashboard.</p>
      <div class="team-card-list" data-team-form>
        <label class="team-card ${!state.team ? "selected" : ""}">
          <input type="radio" name="memberTeam" value="" ${!state.team ? "checked" : ""} />
          <span class="team-card-dot" style="background:var(--muted)"></span>
          <span class="team-card-text">
            <strong>No Sub-Team</strong>
            <small>All modules listed without priority</small>
          </span>
        </label>
        ${Object.entries(teamsObj).map(([key, t]) => `
          <label class="team-card ${state.team === key ? "selected" : ""}" style="border-left-color:${state.team === key ? t.color : "transparent"}">
            <input type="radio" name="memberTeam" value="${key}" ${state.team === key ? "checked" : ""} />
            <span class="team-card-dot" style="background:${t.color}"></span>
            <span class="team-card-text">
              <strong>${t.label}</strong>
              <small>${t.description}</small>
            </span>
            <span class="team-code-pill" style="color:${t.color};border-color:${t.color}20;background:${t.color}12">${t.code}</span>
          </label>
        `).join("")}
      </div>
    </section>
  `;

  // Role card
  const roleCard = `
    <section class="account-card">
      <h3>Role &amp; Access Level</h3>
      <div class="role-selector" data-role-form>
        <label class="override-toggle switch-row">
          <input type="checkbox" name="mentorOverride" ${state.overrideRequired ? "checked" : ""} />
          <span class="switch-control" aria-hidden="true"></span>
          <span class="switch-copy">
            <strong>Mentor override</strong>
            <small>Require the full training track regardless of role.</small>
          </span>
        </label>
        <div class="role-card-list">
          ${Object.entries(FORGE_PROGRAM.roles).map(([key, role]) => `
            <label class="role-card ${state.role === key ? "selected" : ""}" style="border-left-color:${state.role === key ? role.color : "transparent"}">
              <input type="radio" name="memberRole" value="${key}" ${state.role === key ? "checked" : ""} />
              <span class="role-card-dot" style="background:${role.color}"></span>
              <span class="role-card-text">
                <strong>${role.label}</strong>
                <small>${role.description}</small>
              </span>
              <span class="role-level-pip" style="border-color:${role.color};color:${role.color}">L${role.level}</span>
            </label>
          `).join("")}
        </div>
      </div>
    </section>
  `;

  // Admin panel
  const adminPanel = isAdmin ? `
    <div class="admin-panel">
      <h3>Admin — Module Requirement Matrix</h3>
      <p style="font-size:0.78rem;color:var(--muted);margin:4px 0 0;">Shows which modules each sub-team must complete. Assign teams to members via the roster (coming soon).</p>
      <table class="admin-matrix">
        <thead><tr><th>Sub-Team</th><th>Required Modules</th><th>Optional Modules</th></tr></thead>
        <tbody>
          ${Object.entries(teamsObj).map(([, t]) => `
            <tr>
              <td><span style="font-family:var(--mono);font-weight:700;font-size:0.78rem;color:${t.color}">[${t.code}]</span> ${t.label}</td>
              <td>${t.required.map(k => `<span class="mod-tag req">${k}</span>`).join("")}</td>
              <td>${t.optional.map(k => `<span class="mod-tag opt">${k}</span>`).join("")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  ` : "";

  host.innerHTML = `
    <!-- ── Dashboard Hero ── -->
    <article class="mbr-dash-hero">
      <div class="mbr-dash-hero-left">
        <div class="mbr-dash-avatar" style="background:${roleData.color}18;color:${roleData.color};border-color:${roleData.color}40">${demo.initials}</div>
        <div class="mbr-dash-greet">
          <span class="mbr-dash-eyebrow">Member Dashboard</span>
          <h2>Welcome back, ${demo.name.split(" ")[0]}</h2>
          <div class="mbr-dash-meta">
            <span class="badge role-badge" style="--role-color:${roleData.color}">${roleData.label}</span>
            ${teamData ? `<span class="badge" style="background:${teamData.color}18;color:${teamData.color};border:1px solid ${teamData.color}30">[${teamData.code}] ${teamData.label}</span>` : ""}
            <span style="color:var(--muted);font-size:0.8rem">${demo.memberId}</span>
          </div>
        </div>
      </div>
      <div class="mbr-dash-progress-wrap">
        <div class="mbr-dash-progress-ring" style="--prog:${summary.percentage}">
          <svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6"/>
            <circle cx="32" cy="32" r="26" fill="none" stroke="${roleData.color}" stroke-width="6"
              stroke-dasharray="${2 * Math.PI * 26}" stroke-dashoffset="${2 * Math.PI * 26 * (1 - summary.percentage / 100)}"
              stroke-linecap="round" transform="rotate(-90 32 32)"/>
          </svg>
          <span class="ring-label">${summary.percentage}%</span>
        </div>
        <div>
          <strong style="display:block;font-size:0.95rem">${summary.completedModules}/${summary.totalModules} modules</strong>
          <span style="color:var(--muted);font-size:0.8rem">${isExempt(state) ? "Exempt track" : urgentModules.length > 0 ? `${urgentModules.length} required remaining` : "All required done"}</span>
        </div>
      </div>
    </article>

    <!-- ── Quick Access ── -->
    <section class="panel mbr-dash-section">
      <div class="section-head compact">
        <h3>Quick Access</h3>
        <p>Jump to where you need to go</p>
      </div>
      <div class="mbr-quick-grid">
        <a class="mbr-quick-card mbr-quick-primary" href="${assetPrefix()}portal">
          <div class="mbr-quick-icon" aria-hidden="true">${UI_ICONS.dashboard}</div>
          <div class="mbr-quick-body">
            <strong>FORGE Training Portal</strong>
            <span>Full training dashboard, all modules &amp; assessments</span>
          </div>
          <svg class="mbr-quick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19" opacity="0.5"/></svg>
        </a>
        ${nextModule ? `
        <a class="mbr-quick-card" href="${nextModule.modulePage}">
          <div class="mbr-quick-icon" aria-hidden="true">${UI_ICONS[nextModule.icon] || UI_ICONS.dashboard}</div>
          <div class="mbr-quick-body">
            <strong>Continue: ${nextModule.title}</strong>
            <span>${getModuleProgress(nextModule, state).passedCount}/${getModuleProgress(nextModule, state).totalCount} sections done</span>
          </div>
          <svg class="mbr-quick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19" opacity="0.5"/></svg>
        </a>
        ` : ""}
        <a class="mbr-quick-card" href="${assetPrefix()}modules/safety">
          <div class="mbr-quick-icon" aria-hidden="true">${UI_ICONS.safety}</div>
          <div class="mbr-quick-body">
            <strong>Safety Modules</strong>
            <span>Required for all members · PPE &amp; shop zones</span>
          </div>
          <svg class="mbr-quick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19" opacity="0.5"/></svg>
        </a>
        <a class="mbr-quick-card" href="${assetPrefix()}logs">
          <div class="mbr-quick-icon" aria-hidden="true">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><line x1="9" y1="12" x2="15" y2="12" opacity="0.4"/><line x1="9" y1="16" x2="15" y2="16" opacity="0.4"/></svg>
          </div>
          <div class="mbr-quick-body">
            <strong>Sub-Team Logs</strong>
            <span>Progress updates &amp; notes from every sub-team</span>
          </div>
          <svg class="mbr-quick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19" opacity="0.5"/></svg>
        </a>
        <a class="mbr-quick-card" href="${assetPrefix()}calendar">
          <div class="mbr-quick-icon" aria-hidden="true">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6" opacity="0.4"/><line x1="8" y1="2" x2="8" y2="6" opacity="0.4"/><line x1="3" y1="10" x2="21" y2="10" opacity="0.4"/></svg>
          </div>
          <div class="mbr-quick-body">
            <strong>Team Calendar</strong>
            <span>Build sessions, outreach milestones &amp; comp windows</span>
          </div>
          <svg class="mbr-quick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19" opacity="0.5"/></svg>
        </a>
        <a class="mbr-quick-card" href="${assetPrefix()}members">
          <div class="mbr-quick-icon" aria-hidden="true">${UI_ICONS.account}</div>
          <div class="mbr-quick-body">
            <strong>Member Directory</strong>
            <span>Public directory &amp; sub-team highlights</span>
          </div>
          <svg class="mbr-quick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19" opacity="0.5"/></svg>
        </a>
      </div>
    </section>

    <!-- ── Training Metrics ── -->
    <section class="panel mbr-dash-section">
      <div class="section-head compact">
        <h3>Training Overview</h3>
        <p>Your progress across all FORGE program modules</p>
      </div>
      <div class="mbr-metric-grid">
        <div class="mbr-metric-tile">
          <span class="mbr-metric-value" data-count="${summary.completedModules}" data-suffix="">${summary.completedModules}</span>
          <span class="mbr-metric-label">Modules Complete</span>
          <div class="mbr-metric-sub">${summary.totalModules} total</div>
        </div>
        <div class="mbr-metric-tile">
          <span class="mbr-metric-value" data-count="${quizPassCount}" data-suffix="">${quizPassCount}</span>
          <span class="mbr-metric-label">Quizzes Passed</span>
          <div class="mbr-metric-sub">${totalQuizzes} available</div>
        </div>
        <div class="mbr-metric-tile">
          <span class="mbr-metric-value" data-count="${readCount}" data-suffix="">${readCount}</span>
          <span class="mbr-metric-label">Reading Sessions</span>
          <div class="mbr-metric-sub">Sections read</div>
        </div>
        <div class="mbr-metric-tile">
          <span class="mbr-metric-value" data-count="${summary.percentage}" data-suffix="%">${summary.percentage}%</span>
          <span class="mbr-metric-label">Overall Progress</span>
          <div class="mbr-metric-sub-bar"><div style="width:${summary.percentage}%;background:${roleData.color}"></div></div>
        </div>
      </div>
    </section>

    <!-- ── Recent Activity ── -->
    ${recentQuizzes.length > 0 ? `
    <section class="panel mbr-dash-section">
      <div class="section-head compact">
        <h3>Recent Activity</h3>
        <p>Your latest quiz completions</p>
      </div>
      <div class="mbr-activity-list">
        ${recentQuizzes.map(([key, r]) => {
          const d = new Date(r.completedAt);
          const dStr = isNaN(d) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const [, sectionId] = key.split(":");
          return `
            <div class="mbr-activity-row">
              <div class="mbr-activity-icon ${r.passed ? "pass" : "fail"}" aria-hidden="true">
                ${r.passed ? "&#x2713;" : "&#x2715;"}
              </div>
              <div class="mbr-activity-body">
                <strong>${sectionId || key}</strong>
                <span>${r.passed ? `Passed · ${r.score}%` : `Needs review · ${r.score}%`}</span>
              </div>
              ${dStr ? `<span class="mbr-activity-date">${dStr}</span>` : ""}
            </div>
          `;
        }).join("")}
        <a class="btn alt" style="margin-top:8px" href="${assetPrefix()}portal">View All Progress</a>
      </div>
    </section>
    ` : `
    <section class="panel mbr-dash-section mbr-dash-empty">
      <div class="mbr-dash-empty-inner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="40" height="40" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" opacity="0.4"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <h4>No training activity yet</h4>
        <p>Head to the FORGE Training Portal to start your first module.</p>
        <a class="btn primary" href="${assetPrefix()}portal">Open Training Portal</a>
      </div>
    </section>
    `}

    <!-- ── Announcements ── -->
    <section class="panel mbr-dash-section">
      <div class="section-head compact">
        <h3>Team Announcements</h3>
        <p>Latest updates from team leadership</p>
      </div>
      <div class="mbr-announce-list">
        <div class="mbr-announce-item">
          <div class="mbr-announce-meta"><span class="mbr-announce-tag">Safety</span><span class="mbr-announce-date">May 30</span></div>
          <strong>Safety refresh due — all members</strong>
          <p>All pit crew and drive team members must complete the safety module re-check before the next build session. PPE is always in style.</p>
        </div>
        <div class="mbr-announce-item">
          <div class="mbr-announce-meta"><span class="mbr-announce-tag">Training</span><span class="mbr-announce-date">May 28</span></div>
          <strong>New FORGE modules now live</strong>
          <p>Design DFM and Strategy Scouting modules have been updated with new content. Complete them to keep your progress current.</p>
        </div>
        <div class="mbr-announce-item">
          <div class="mbr-announce-meta"><span class="mbr-announce-tag">Competition</span><span class="mbr-announce-date">May 25</span></div>
          <strong>Scrimmage prep packet posted</strong>
          <p>Review autonomous priorities and communication callouts in the strategy module. Drive smooth, think faster.</p>
        </div>
      </div>
    </section>

    <!-- ── Settings (collapsible) ── -->
    <details class="panel mbr-settings-accordion">
      <summary class="mbr-settings-summary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" opacity="0.4"/></svg>
        Role &amp; Team Settings
        <svg class="mbr-settings-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
      </summary>
      <div class="mbr-settings-body">
        <div class="account-grid">
          <section class="account-card">
            <h3>Profile</h3>
            <div class="account-row"><span>Email</span><strong>${demo.email}</strong></div>
            <div class="account-row"><span>Joined</span><strong>${demo.joined}</strong></div>
            <div class="account-row"><span>Sub-team</span><strong>${teamData ? teamData.label : demo.subteam}</strong></div>
          </section>
          ${roleCard}
          ${teamCard}
        </div>
        ${adminPanel}
      </div>
    </details>

    <!-- ── Account Management ── -->
    ${renderAccountManagementSection(currentUser)}
  `;

  renderRoleControls();
  wireTeamControls();
  wireAccountManagement();

  // Animate metric counters
  host.querySelectorAll(".mbr-metric-value[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || "";
    if (target === 0) { el.textContent = "0" + suffix; return; }
    const duration = Math.min(800, 300 + target * 10);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function wireTeamControls() {
  const scope = document.querySelector("[data-team-form]");
  if (!scope || scope.dataset.bound === "true") return;
  scope.dataset.bound = "true";

  scope.addEventListener("change", () => {
    const selected = scope.querySelector("[name='memberTeam']:checked");
    const teamKey = selected ? selected.value : null;
    setTeam(teamKey || null);

    // Update card highlight immediately
    scope.querySelectorAll(".team-card").forEach((card) => {
      const radio = card.querySelector("input[type='radio']");
      const isSelected = radio && radio.checked;
      card.classList.toggle("selected", isSelected);
      const teamsObj = FORGE_PROGRAM.teams || {};
      const teamColor = teamsObj[radio?.value]?.color || "";
      card.style.borderLeftColor = isSelected && teamColor ? teamColor : "transparent";
    });

    renderCommonHeader();
  });
}

function createMemoryDeck(section) {
  return section.quiz.flatMap((question, index) => {
    const id = `pair-${index}`;
    const answerText = question.options[question.answer];
    return [
      { id, label: `Q${index + 1}: ${question.q}`, type: "question" },
      { id, label: `A${index + 1}: ${answerText}`, type: "answer" }
    ];
  });
}

function shuffleList(values) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapWith]] = [copy[swapWith], copy[index]];
  }
  return copy;
}

function renderMemoryGame(section, gameState) {
  const status = gameState.matches === gameState.totalPairs
    ? "Memory game complete. Nice recall."
    : `Matches: ${gameState.matches}/${gameState.totalPairs}`;

  const cards = gameState.deck
    .map((card, index) => {
      const open = gameState.openCards.includes(index) || gameState.matchedCards.has(index);
      return `
        <button type="button" class="memory-card ${open ? "open" : ""}" data-memory-card="${index}">
          <span>${open ? card.label : "?"}</span>
        </button>
      `;
    })
    .join("");

  return `
    <div class="memory-game-wrap">
      <h4>Post-Quiz Memory Match</h4>
      <p>Match each question card with its correct answer card.</p>
      <div class="memory-game-grid">${cards}</div>
      <div class="quiz-meta">${status}</div>
      <button type="button" class="btn" data-memory-reset>Shuffle Game</button>
    </div>
  `;
}

function launchMemoryGame(section, sectionKey) {
  const root = getOrCreateModalRoot();
  let gameState = {
    deck: shuffleList(createMemoryDeck(section)),
    openCards: [],
    matchedCards: new Set(),
    matches: 0,
    totalPairs: section.quiz.length
  };

  const drawGame = () => {
    const cards = gameState.deck
      .map((card, index) => {
        const open = gameState.openCards.includes(index) || gameState.matchedCards.has(index);
        return `
          <button type="button" class="memory-card ${open ? "open" : ""}" data-memory-card="${index}">
            <span>${open ? card.label : "?"}</span>
          </button>
        `;
      })
      .join("");

    const status = gameState.matches === gameState.totalPairs
      ? "Memory game complete! Nice recall."
      : `Matches: ${gameState.matches}/${gameState.totalPairs}`;

    root.innerHTML = `
      <div class="forge-modal-overlay quiz-fullscreen-modal" role="dialog" aria-modal="true" aria-label="Memory game">
        <div class="forge-modal-card quiz-fullscreen-card">
          <header class="forge-modal-head">
            <div>
              <h3>${section.title} — Memory Match</h3>
              <p>Match each question card with its correct answer card.</p>
            </div>
            <button type="button" class="btn" data-close-modal>Close</button>
          </header>
          <div class="quiz-fullscreen-body">
            <div class="memory-game-wrap">
              <div class="memory-game-grid">${cards}</div>
              <div class="quiz-meta">${status}</div>
              <div class="button-row">
                <button type="button" class="btn" data-memory-reset>Shuffle Game</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    bindGameInteractions();
  };

  const bindGameInteractions = () => {
    root.querySelector("[data-close-modal]")?.addEventListener("click", () => {
      closeModal();
    });

    root.querySelectorAll("[data-memory-card]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.memoryCard);
        if (gameState.openCards.includes(index) || gameState.matchedCards.has(index)) return;
        if (gameState.openCards.length === 2) return;
        gameState.openCards.push(index);
        drawGame();
        if (gameState.openCards.length < 2) return;
        const [first, second] = gameState.openCards;
        const firstCard = gameState.deck[first];
        const secondCard = gameState.deck[second];
        if (firstCard.id === secondCard.id && firstCard.type !== secondCard.type) {
          gameState.matchedCards.add(first);
          gameState.matchedCards.add(second);
          gameState.matches += 1;
        }
        gameState.openCards = [];
        window.setTimeout(() => {
          drawGame();
        }, 350);
      });
    });

    root.querySelector("[data-memory-reset]")?.addEventListener("click", () => {
      gameState = {
        deck: shuffleList(createMemoryDeck(section)),
        openCards: [],
        matchedCards: new Set(),
        matches: 0,
        totalPairs: section.quiz.length
      };
      drawGame();
    });
  };

  document.body.classList.add("modal-open");
  drawGame();
}

function launchFullscreenQuiz(section, quizKey, resultHost) {
  const root = getOrCreateModalRoot();
  const passingScore = FORGE_PROGRAM.passingScore;
  const answers = new Array(section.quiz.length).fill(null);
  let currentIndex = 0;
  let finished = false;
  let gameState = {
    deck: shuffleList(createMemoryDeck(section)),
    openCards: [],
    matchedCards: new Set(),
    matches: 0,
    totalPairs: section.quiz.length
  };

  const closeAllowed = () => finished;

  const drawQuiz = () => {
    const question = section.quiz[currentIndex];
    const optionHtml = question.options
      .map((option, optionIndex) => {
        const selected = answers[currentIndex] === optionIndex ? "selected" : "";
        return `<button type="button" class="option-pill quiz-option-btn ${selected}" data-quiz-option="${optionIndex}"><span>${option}</span></button>`;
      })
      .join("");

    root.innerHTML = `
      <div class="forge-modal-overlay quiz-fullscreen-modal" role="dialog" aria-modal="true" aria-label="Quiz attempt">
        <div class="forge-modal-card quiz-fullscreen-card">
          <header class="forge-modal-head">
            <div>
              <h3>${section.title} — Question ${currentIndex + 1}/${section.quiz.length}</h3>
              <p>One-way mode is active. No backtracking during this attempt.</p>
            </div>
            <button type="button" class="btn" data-close-modal ${closeAllowed() ? "" : "disabled"}>Exit</button>
          </header>
          <div class="quiz-fullscreen-body">
            <div class="question quiz-question">
              <h4>${question.q}</h4>
              <div class="option-grid">${optionHtml}</div>
            </div>
            <div class="button-row">
              <span class="quiz-meta">Choose one option to continue.</span>
              <button type="button" class="btn primary" data-quiz-next ${answers[currentIndex] === null ? "disabled" : ""}>${currentIndex === section.quiz.length - 1 ? "Submit Quiz" : "Next Question"}</button>
            </div>
          </div>
        </div>
      </div>
    `;
    bindQuizInteractions();
  };

  const drawResults = (score, passed) => {
    root.innerHTML = `
      <div class="forge-modal-overlay quiz-fullscreen-modal" role="dialog" aria-modal="true" aria-label="Quiz result">
        <div class="forge-modal-card quiz-fullscreen-card">
          <header class="forge-modal-head">
            <div>
              <h3>${section.title} — Results</h3>
              <p>${passed ? "Passed" : "Retry needed"} with ${score}%.</p>
            </div>
            <button type="button" class="btn" data-close-modal>Exit</button>
          </header>
          <div class="quiz-fullscreen-body">
            <div class="result ${passed ? "pass" : "fail"}">
              ${passed
                ? `Passed with ${score}% - section complete.`
                : `Scored ${score}% - you need ${passingScore}% to pass.`}
            </div>
            ${renderMemoryGame(section, gameState)}
            <div class="button-row">
              <button type="button" class="btn primary" data-quiz-retake>Retake Quiz</button>
            </div>
          </div>
        </div>
      </div>
    `;
    bindResultInteractions(score, passed);
  };

  const bindMemoryGame = () => {
    root.querySelectorAll("[data-memory-card]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.memoryCard);
        if (gameState.openCards.includes(index) || gameState.matchedCards.has(index)) return;
        if (gameState.openCards.length === 2) return;
        gameState.openCards.push(index);
        drawResults(
          Math.round((answers.filter((value, idx) => value === section.quiz[idx].answer).length / section.quiz.length) * 100),
          Math.round((answers.filter((value, idx) => value === section.quiz[idx].answer).length / section.quiz.length) * 100) >= passingScore
        );
        if (gameState.openCards.length < 2) return;
        const [first, second] = gameState.openCards;
        const firstCard = gameState.deck[first];
        const secondCard = gameState.deck[second];
        if (firstCard.id === secondCard.id && firstCard.type !== secondCard.type) {
          gameState.matchedCards.add(first);
          gameState.matchedCards.add(second);
          gameState.matches += 1;
        }
        gameState.openCards = [];
        window.setTimeout(() => {
          drawResults(
            Math.round((answers.filter((value, idx) => value === section.quiz[idx].answer).length / section.quiz.length) * 100),
            Math.round((answers.filter((value, idx) => value === section.quiz[idx].answer).length / section.quiz.length) * 100) >= passingScore
          );
        }, 350);
      });
    });

    root.querySelector("[data-memory-reset]")?.addEventListener("click", () => {
      gameState = {
        deck: shuffleList(createMemoryDeck(section)),
        openCards: [],
        matchedCards: new Set(),
        matches: 0,
        totalPairs: section.quiz.length
      };
      drawResults(
        Math.round((answers.filter((value, idx) => value === section.quiz[idx].answer).length / section.quiz.length) * 100),
        Math.round((answers.filter((value, idx) => value === section.quiz[idx].answer).length / section.quiz.length) * 100) >= passingScore
      );
    });
  };

  const bindResultInteractions = (score, passed) => {
    root.querySelector("[data-close-modal]")?.addEventListener("click", () => closeModal());
    root.querySelector("[data-quiz-retake]")?.addEventListener("click", () => {
      currentIndex = 0;
      answers.fill(null);
      finished = false;
      gameState = {
        deck: shuffleList(createMemoryDeck(section)),
        openCards: [],
        matchedCards: new Set(),
        matches: 0,
        totalPairs: section.quiz.length
      };
      drawQuiz();
    });
    if (resultHost) {
      resultHost.className = `result ${passed ? "pass" : "fail"}`;
      resultHost.textContent = passed
        ? `Passed with ${score}% - section complete.`
        : `Scored ${score}% - retry anytime.`;
    }
    bindMemoryGame();
    
    // Refresh module checklist after quiz completion
    const moduleKey = quizKey.split(':')[0];
    if (moduleKey && typeof renderModuleChecklist === 'function') {
      renderModuleChecklist(moduleKey);
    }
    
    // Update quiz button state
    const quizButton = document.querySelector(`[data-launch-quiz="${quizKey}"]`);
    if (quizButton && passed) {
      quizButton.textContent = 'Quiz Passed';
      quizButton.classList.add('success');
    }
  };

  const bindQuizInteractions = () => {
    root.querySelector("[data-close-modal]")?.addEventListener("click", () => {
      if (closeAllowed()) closeModal();
    });
    root.querySelectorAll("[data-quiz-option]").forEach((optionButton) => {
      optionButton.addEventListener("click", () => {
        answers[currentIndex] = Number(optionButton.dataset.quizOption);
        drawQuiz();
      });
    });
    root.querySelector("[data-quiz-next]")?.addEventListener("click", () => {
      if (answers[currentIndex] === null) return;
      if (currentIndex < section.quiz.length - 1) {
        currentIndex += 1;
        drawQuiz();
        return;
      }
      const correctCount = answers.filter((value, index) => value === section.quiz[index].answer).length;
      const score = Math.round((correctCount / section.quiz.length) * 100);
      const passed = score >= passingScore;
      markQuizResult(quizKey, passed, score);
      finished = true;
      drawResults(score, passed);
    });
  };

  document.body.classList.add("modal-open");
  drawQuiz();
}

function wireInlineQuizForms(root = document) {
  root.querySelectorAll("[data-start-quiz]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      const quizKey = button.dataset.startQuiz;
      if (!quizKey) return;
      const modulesMap = new Map(FORGE_PROGRAM.modules.map((module) => [module.key, module]));
      const module = Array.from(modulesMap.values()).find((entry) => quizKey.startsWith(entry.key));
      if (!module) return;
      const section = module.sections.find((entry) => getSectionStorageKey(module, entry) === quizKey);
      if (!section) return;
      const host = button.closest("[data-inline-quiz]");
      const resultHost = host?.querySelector("[data-quiz-result]") || null;
      launchFullscreenQuiz(section, quizKey, resultHost);
    });
  });
}

function renderModuleChecklist(moduleKey) {
  const host = document.querySelector("[data-module-checklist]");
  if (!host) return;

  const state = readState();
  const module = FORGE_PROGRAM.modules.find((m) => m.key === moduleKey);
  if (!module) return;

  const sections = module.sections || [];
  
  host.innerHTML = sections
    .map((section, index) => {
      const sectionKey = `${moduleKey}:${section.id}`;
      const result = state.completedQuizzes[sectionKey];
      const passedText = result
        ? result.passed
          ? `Passed (${result.score}%)`
          : `Retry Needed (${result.score}%)`
        : "Not Started";

      return `
        <tr>
          <td>Section ${index + 1}</td>
          <td>${section.title}</td>
          <td>${passedText}</td>
        </tr>
      `;
    })
    .join("");
}

function renderModuleSections(moduleKey) {
  const host = document.querySelector("[data-module-sections]");
  if (!host) return;

  const state = readState();
  const module = FORGE_PROGRAM.modules.find((m) => m.key === moduleKey);
  if (!module) return;

  const sections = module.sections || [];
  
  host.innerHTML = sections
    .map((section, index) => {
      const sectionKey = `${moduleKey}:${section.id}`;
      const result = state.completedQuizzes[sectionKey];
      const isRead = state.readSections?.[sectionKey] || false;
      
      return `
        <details class="panel-section module-section-dropdown" id="${section.id}" ${index === 0 ? 'open' : ''}>
          <summary class="section-head dropdown-summary">
            <h3>${index + 1}. ${section.title}</h3>
            <span class="dropdown-icon">▼</span>
          </summary>
          
          <div class="section-content">
            ${section.notes ? `
            <div class="module-notes">
              <p>${section.notes.substring(0, 200)}${section.notes.length > 200 ? '...' : ''}</p>
            </div>
            ` : ''}
            
            <div class="button-row">
              <button type="button" class="btn" data-view-article="${sectionKey}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13" style="vertical-align:middle;margin-right:5px" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" opacity="0.5"/></svg>View Article
              </button>
              
              ${section.quiz && section.quiz.length > 0 ? `
              <button type="button" class="btn primary" data-launch-quiz="${sectionKey}" ${isRead ? '' : 'disabled'}>
                ${isRead ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13" style="vertical-align:middle;margin-right:5px" aria-hidden="true"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>Take Quiz` : '🔒 Read Article First'}
              </button>
              ` : ''}
              
              ${section.quiz && section.quiz.length > 0 && result?.passed ? `
              <button type="button" class="btn success" data-play-game="${sectionKey}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13" style="vertical-align:middle;margin-right:5px" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>Memory Game
              </button>
              ` : ''}
            </div>
            
            ${result ? `
            <div class="section-status ${result.passed ? 'passed' : 'retry'}">
              ${result.passed ? `Passed ${result.score}%` : `Retry needed (${result.score}%)`}
            </div>
            ` : ''}
            
            <div class="quiz-result-inline" data-inline-result="${sectionKey}"></div>
          </div>
        </details>
      `;
    })
    .join("");
    
  // Wire up the View Article buttons - use setTimeout to ensure DOM is ready
  setTimeout(() => {
    sections.forEach((section) => {
      const sectionKey = `${moduleKey}:${section.id}`;
      const viewButton = document.querySelector(`[data-view-article="${sectionKey}"]`);
      
      if (viewButton) {
        // Remove any existing listeners to avoid duplicates
        const newButton = viewButton.cloneNode(true);
        viewButton.parentNode.replaceChild(newButton, viewButton);
        
        newButton.addEventListener("click", (e) => {
          e.preventDefault();
          openReadingModal(section, module);
        });
      }
      
      // Wire up quiz launch buttons
      const quizButton = document.querySelector(`[data-launch-quiz="${sectionKey}"]`);
      const resultHost = document.querySelector(`[data-inline-result="${sectionKey}"]`);
      
      if (quizButton && section.quiz) {
        const newQuizButton = quizButton.cloneNode(true);
        quizButton.parentNode.replaceChild(newQuizButton, quizButton);
        
        newQuizButton.addEventListener("click", (e) => {
          e.preventDefault();
          if (!newQuizButton.disabled) {
            launchFullscreenQuiz(section, sectionKey, resultHost);
          }
        });
      }
      
      // Wire up game buttons
      const gameButton = document.querySelector(`[data-play-game="${sectionKey}"]`);
      
      if (gameButton && section.quiz) {
        const newGameButton = gameButton.cloneNode(true);
        gameButton.parentNode.replaceChild(newGameButton, gameButton);
        
        newGameButton.addEventListener("click", (e) => {
          e.preventDefault();
          launchMemoryGame(section, sectionKey);
        });
      }
    });
  }, 0);
}

function wireQuizForm(quizFile, answers) {
  const form = document.querySelector("[data-quiz-form]");
  const resultHost = document.querySelector("[data-quiz-result]");
  if (!form || !resultHost) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    let correct = 0;
    let total = answers.length;

    answers.forEach((answerKey, idx) => {
      const selected = form.querySelector(`input[name='q${idx + 1}']:checked`);
      if (selected && selected.value === answerKey) {
        correct += 1;
      }
    });

    const score = Math.round((correct / total) * 100);
    const passed = score >= FORGE_PROGRAM.passingScore;

    markQuizResult(quizFile, passed, score);

    resultHost.className = `result ${passed ? "pass" : "fail"}`;
    resultHost.textContent = passed
      ? `Passed with ${score}% - this quiz now counts toward your module completion.`
      : `Scored ${score}% - needs ${FORGE_PROGRAM.passingScore}% to pass. Review module content and try again.`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderCookieBanner();
  cleanVisibleUrl();
  ensureFavicon();
  wireExtensionlessNavigation();
  renderCanvasRail();
  renderCommonHeader();
  injectTabletNav();
  injectMobileNavToggle();
  decorateSideNav();
  renderRoleControls();

  // Wire accordion stagger animations globally (before content render)
  wireAccordionAnimations();

  const pageKind = getPageKind();
  if (pageKind === "portal") {
    renderDashboardContent();
  } else if (pageKind === "module") {
    renderModuleContent();
  } else if (pageKind === "account") {
    // Wire auth state changes so the page re-renders on sign-in/sign-out
    if (window.FirebaseSystems) {
      FirebaseSystems.onAuthChange(() => {
        try { renderAccountContent(); } catch(e) { console.error("[FORGE] renderAccountContent error:", e); }
      });
    } else {
      // FirebaseSystems may still be initializing — try immediately, then retry
      try { renderAccountContent(); } catch(e) { console.error("[FORGE] renderAccountContent error:", e); }
      // Retry after 800ms in case firebase-init.js is loading slowly
      setTimeout(() => {
        if (window.FirebaseSystems) {
          FirebaseSystems.onAuthChange(() => {
            try { renderAccountContent(); } catch(e) { console.error("[FORGE] renderAccountContent retry error:", e); }
          });
        }
        try { renderAccountContent(); } catch(e) { /* silently ignore duplicate render */ }
      }, 800);
    }
  } else {
    renderHomeContent();
    renderPortalMetrics();
    renderModuleCards();
  }

  wireInlineQuizForms();
  wireReadCountdownTimers();
  normalizeExtensionlessLinks();

  // Run post-render animations (counters, intersection observer)
  runPostRenderAnimations();
});

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Animate stat counter values from 0 up to their data-count target.
 * Elements must have data-count (number) and optional data-suffix.
 */
function animateCounters(root = document) {
  root.querySelectorAll(".stat .value[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count) || 0;
    if (target === 0) return;
    const suffix = el.dataset.suffix || "";
    const isInt = Number.isInteger(target);
    const duration = Math.min(900, 300 + target * 6);
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;
      el.textContent = (isInt ? Math.round(current) : current.toFixed(1)) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }

    // Delay to match CSS animation timing on stat tiles
    const delay = parseFloat(
      getComputedStyle(el.closest(".stat") || el).animationDelay || "0"
    ) * 1000;
    setTimeout(() => requestAnimationFrame(tick), delay + 50);
  });
}

/**
 * Stagger-animate direct children of an accordion body when it opens.
 * Listens to the native <details> toggle event.
 */
function wireAccordionAnimations() {
  document.addEventListener(
    "toggle",
    (e) => {
      const details = e.target;
      if (!details.open) return;

      // Target the items container inside this details
      const body =
        details.querySelector(".canvas-module-items") ||
        details.querySelector(".cir-body") ||
        details.querySelector(".section-subitems") ||
        details.querySelector(".subitem-body");
      if (!body) return;

      const items = Array.from(body.children);
      items.forEach((item, i) => {
        item.style.setProperty("--delay", `${i * 35}ms`);
        item.classList.remove("anim-in");
        // Force reflow so re-opening works
        void item.offsetWidth;
        item.classList.add("anim-in");
        item.addEventListener(
          "animationend",
          () => item.classList.remove("anim-in"),
          { once: true }
        );
      });
    },
    true
  );
}

/**
 * Add page transition support via View Transitions API when navigating.
 * Wraps content renders so the browser can cross-fade.
 */
function withPageTransition(callback) {
  if (typeof document.startViewTransition === "function") {
    document.startViewTransition(callback);
  } else {
    callback();
  }
}

/**
 * After a page is rendered, kick off JS-driven animations:
 * - counter count-up on stat tiles
 * - progress bar grow (scaleX 0→1 via CSS, just forces the element into view)
 * - IntersectionObserver to lazily animate module rows as they scroll into view
 */
function runPostRenderAnimations(root = document) {
  animateCounters(root);
  observeModuleRows(root);
}

/**
 * Use IntersectionObserver to trigger re-entry animation for module rows
 * that appear below the fold (deferred stagger for long lists).
 */
function observeModuleRows(root = document) {
  if (!window.IntersectionObserver) return;

  const rows = root.querySelectorAll(".canvas-module-row");
  if (!rows.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Row is visible — make sure it's not stuck opacity:0 from animation
          entry.target.style.animationPlayState = "running";
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05 }
  );

  rows.forEach((row) => {
    // Pause CSS animation until row enters viewport (for below-fold rows)
    const delay = parseFloat(getComputedStyle(row).animationDelay || "0") * 1000;
    if (delay > 400) {
      row.style.animationPlayState = "paused";
    }
    io.observe(row);
  });
}
