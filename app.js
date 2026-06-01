const STORAGE_KEY = "forge-training-state-v1";
const MIN_READ_SECONDS = 300;
const MODAL_ROOT_ID = "forge-modal-root";

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
  const state = readState();
  return Boolean(state.readSections?.[sectionKey] || state.watchedVideos?.[sectionKey]);
}

function markVideoWatched(sectionKey) {
  const state = readState();
  state.readSections = state.readSections || {};
  state.readSections[sectionKey] = true;
  state.watchedVideos = state.watchedVideos || {};
  state.watchedVideos[sectionKey] = true;
  saveState(state);
  unlockQuizGate(sectionKey);
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
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 3h8v8H3z"/></svg>',
  business:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18v14H3zM8 7V5h8v2M3 11h18"/></svg>',
  safety:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 4v6c0 5-3.4 7.9-8 9-4.6-1.1-8-4-8-9V7l8-4zM9 12l2 2 4-4"/></svg>',
  strategy:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l7-7M14 6l4-4 4 4-4 4zM13 7l4 4M4 10l4-4 4 4-4 4z"/></svg>',
  design:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17l5 4 13-13-5-5L3 17zM14 5l5 5"/></svg>',
  control:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3v6M16 3v6M5 9h14v12H5zM9 13h6M9 17h6"/></svg>',
  fabrication:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 19h18M7 15l5-11 5 11"/></svg>',
  art:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h5a4 4 0 0 0 0-8h-5z"/></svg>',
  account:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"/></svg>'
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

function injectMobileNavToggle() {
  // Mobile nav toggle removed - using standard topbar navigation
  return;
  
  const topbar = document.querySelector(".topbar");
  if (!topbar || topbar.querySelector(".mobile-nav-toggle")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "mobile-nav-toggle btn alt";
  button.textContent = "Menu";
  button.addEventListener("click", () => {
    document.body.classList.toggle("rail-open");
  });
  topbar.prepend(button);
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
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      role: "rookie",
      team: null,
      overrideRequired: false,
      completedQuizzes: {},
      watchedVideos: {},
      readSections: {}
    };
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed.watchedVideos) parsed.watchedVideos = {};
    if (!parsed.readSections) parsed.readSections = { ...(parsed.watchedVideos || {}) };
    if (parsed.team === undefined) parsed.team = null;
    return parsed;
  } catch (error) {
    return {
      role: "rookie",
      team: null,
      overrideRequired: false,
      completedQuizzes: {},
      watchedVideos: {},
      readSections: {}
    };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  return getSortedModulesForState(state)
    .filter((module) => !getModuleProgress(module, state).complete)
    .slice(0, limit);
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

  target.innerHTML = `
    <div class="hero-card" style="padding: 24px;">
      <div class="badge-row">
        <span class="badge role-badge" style="--role-color: ${roleData.color}">${roleLabel}</span>
        ${teamData ? `<span class="badge team-badge" style="--role-color:${teamData.color};border-left-color:${teamData.color}">[${teamData.code}] ${teamData.label}</span>` : ""}
        <span class="badge">Pass Mark: ${FORGE_PROGRAM.passingScore}%</span>
        ${isExempt(state) ? '<span class="badge exempt-badge">Training Exempt</span>' : ''}
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

  return `
    <article class="stat">
      <span class="value" data-count="${summary.percentage}" data-suffix="%">${summary.percentage}%</span>
      <span>Program completion</span>
    </article>
    <article class="stat">
      <span class="value">${summary.completedModules}/${summary.totalModules}</span>
      <span>Modules complete</span>
    </article>
    <article class="stat">
      <span class="value" data-count="${checksLogged}">${checksLogged}</span>
      <span>Checks logged</span>
    </article>
    <article class="stat">
      <span class="value" data-count="${videosWatched}">${videosWatched}</span>
      <span>Reads completed</span>
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
const LOCK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
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
          <span class="cmr-check ${progress.complete ? "done" : ""}" aria-label="${progress.complete ? "Complete" : "In Progress"}">${progress.complete ? "✓" : ""}</span>
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

  const state = readState();
  const teamData = getTeamData(state);
  const sortedModules = getSortedModulesForState(state);
  const recommendedModules = getRecommendedModules(state, 3);
  const expectation = getTrainingExpectation(state);
  const videosWatched = Object.keys(state.readSections || state.watchedVideos || {}).length;
  const quizAttempts = Object.keys(state.completedQuizzes).length;
  const summary = getOverallProgress(state);

  host.innerHTML = `
    <article class="panel hero dashboard-hero forge-hero-v2">
      <div class="hero-grid dashboard-hero-grid">
        <div class="hero-copy">
          <span class="eyebrow">Advanced Training Platform</span>
          <h2>FORGE Training System</h2>
          <p class="hero-subtitle">Focused Operations for Robotics Growth &amp; Excellence</p>
          <p>A comprehensive workspace designed for safety readiness, technical skill development, and team operational excellence. Master the fundamentals, advance your capabilities, and prepare for competition success.</p>
          <div class="hero-chip-row">
            <span class="glass-chip chip-primary">${summary.percentage}% Complete</span>
            <span class="glass-chip">${teamData ? `[${teamData.code}] ${teamData.label}` : "All-team view"}</span>
            <span class="glass-chip">${videosWatched} Lessons</span>
            <span class="glass-chip">${quizAttempts} Assessments</span>
          </div>
        </div>
        <aside class="hero-side">
          <div class="preview-card compact forge-status-card">
            <span class="preview-kicker">Training Status</span>
            <h3>${expectation.title}</h3>
            <p>${expectation.body}</p>
            <div class="status-progress-wrap">
              <div class="status-progress-bar">
                <div class="status-progress-fill" style="width: ${summary.percentage}%"></div>
              </div>
              <span class="status-progress-text">${summary.completedModules}/${summary.totalModules} Modules</span>
            </div>
          </div>
        </aside>
      </div>
    </article>

    <section class="panel stats-overview-panel">
      <div class="section-head compact">
        <h3>📊 Performance Metrics</h3>
        <p>Track your progress across all training modules and assessments</p>
      </div>
      <div class="quick-grid">
        ${renderMetricTiles(state)}
      </div>
    </section>

    ${recommendedModules.length > 0 ? `
    <section class="panel recommended-modules-panel">
      <div class="section-head compact">
        <h3>🎓 Next Steps</h3>
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
                <span>⏱️ ${module.estimatedTime || "60 min"}</span>
                <span>📝 ${getModuleSections(module).length} sections</span>
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
        <h3>📚 All Training Modules</h3>
        <p>Complete curriculum organized by role, sub-team, and skill level. Expand any module to view lessons and begin training.</p>
      </div>
      <div class="module-accordion-list">
        ${sortedModules.map((module, index) => renderModuleAccordion(module, state, index === 0)).join("")}
      </div>
    </section>

    <section class="panel forge-footer-panel">
      <div class="forge-footer-grid">
        <div class="forge-footer-col">
          <h4>💡 Training Tips</h4>
          <ul>
            <li>Complete modules in the recommended order for optimal learning</li>
            <li>Read all content thoroughly before attempting quizzes</li>
            <li>Retake quizzes until you achieve the passing score of ${FORGE_PROGRAM.passingScore}%</li>
            <li>Track your progress using the metrics dashboard above</li>
          </ul>
        </div>
        <div class="forge-footer-col">
          <h4>🛡️ Safety First</h4>
          <ul>
            <li>Safety modules are mandatory for all members</li>
            <li>Shop access requires completion of safety training</li>
            <li>Always wear appropriate PPE in the workspace</li>
            <li>Report any safety concerns to team leadership</li>
          </ul>
        </div>
        <div class="forge-footer-col">
          <h4>📞 Need Help?</h4>
          <ul>
            <li>Contact your sub-team lead for module questions</li>
            <li>Technical issues? Reach out to site administrators</li>
            <li>Review the <a href="../terms">Terms of Service</a></li>
            <li>Check our <a href="../privacy">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
    </section>
  `;
}

function renderModuleContent() {
  const host = document.querySelector("[data-module-content], .content-area");
  if (!host) return;

  const module = getModuleFromPath();
  const state = readState();

  host.innerHTML = `
    <article class="panel hero module-hero">
      <div>
        <h2>${module.title}</h2>
        <p>${module.outcome}</p>
      </div>
      <div class="quick-grid">
        <article class="stat"><span class="value">${getModuleProgress(module, state).passedCount}/${getModuleProgress(module, state).totalCount}</span><span>Sections complete</span></article>
        <article class="stat"><span class="value">6</span><span>Sections available</span></article>
        <article class="stat"><span class="value">${isExempt(state) ? "Exempt" : "Required"}</span><span>Current rule</span></article>
      </div>
    </article>
    <article class="panel canvas-module-list">
      <div class="module-accordion-list single-module">
        ${renderModuleAccordion(module, state, true)}
      </div>
    </article>
  `;
}

function renderAccountContent() {
  const host = document.querySelector("[data-account-content], .content-area");
  if (!host) return;

  const state = readState();
  const summary = getOverallProgress(state);
  const demo = FORGE_PROGRAM.demo;
  const teamData = getTeamData(state);
  const isAdmin = ["captain", "lead", "mentor"].includes(state.role);

  // Team assignment card
  const teamsObj = FORGE_PROGRAM.teams || {};
  const teamCard = `
    <section class="account-card">
      <h3>Sub-Team Assignment</h3>
      <p style="font-size:0.78rem;color:var(--ink-1);margin:0 0 10px;">Your assigned sub-team controls which modules are marked Required or Optional on your dashboard.</p>
      <div class="team-card-list" data-team-form>
        <label class="team-card ${!state.team ? "selected" : ""}">
          <input type="radio" name="memberTeam" value="" ${!state.team ? "checked" : ""} />
          <span class="team-card-dot" style="background:var(--ink-1)"></span>
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

  // Admin panel: module matrix per team (only for admins)
  const adminPanel = isAdmin ? `
    <div class="admin-panel">
      <h3>Admin — Module Requirement Matrix</h3>
      <p style="font-size:0.78rem;color:var(--ink-1);margin:4px 0 0;">Shows which modules each sub-team must complete. Assign teams to members via the roster (coming soon).</p>
      <table class="admin-matrix">
        <thead>
          <tr>
            <th>Sub-Team</th>
            <th>Required Modules</th>
            <th>Optional Modules</th>
          </tr>
        </thead>
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
    <article class="account-hero">
      <div class="account-badge">${demo.initials}</div>
      <div>
        <h2>${demo.name}</h2>
        <p>${demo.memberId} &nbsp;·&nbsp; ${teamData ? `[${teamData.code}] ${teamData.label}` : demo.subteam} &nbsp;·&nbsp; ${demo.joined}</p>
      </div>
      <div style="margin-left:auto">
        <span class="badge role-badge" style="--role-color:${(FORGE_PROGRAM.roles[state.role]||{}).color}">${(FORGE_PROGRAM.roles[state.role]||{label:"—"}).label}</span>
      </div>
    </article>
    <article class="panel account-grid">
      <section class="account-card">
        <h3>Profile</h3>
        <div class="account-row"><span>Email</span><strong>${demo.email}</strong></div>
        <div class="account-row"><span>Joined</span><strong>${demo.joined}</strong></div>
        <div class="account-row"><span>Subteam</span><strong>${teamData ? teamData.label : demo.subteam}</strong></div>
      </section>
      <section class="account-card">
        <h3>Training Status</h3>
        <div class="account-row"><span>Program progress</span><strong>${summary.percentage}%</strong></div>
        <div class="account-row"><span>Modules complete</span><strong>${summary.completedModules}/${summary.totalModules}</strong></div>
        <div class="account-row"><span>Exempt</span><strong>${isExempt(state) ? "Yes" : "No"}</strong></div>
      </section>
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
      ${teamCard}
    </article>
    ${adminPanel}
  `;

  renderRoleControls();
  wireTeamControls();
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
      quizButton.textContent = '✓ Quiz Passed';
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
                📖 View Article
              </button>
              
              ${section.quiz && section.quiz.length > 0 ? `
              <button type="button" class="btn primary" data-launch-quiz="${sectionKey}" ${isRead ? '' : 'disabled'}>
                ${isRead ? '🎯 Take Quiz' : '🔒 Read Article First'}
              </button>
              ` : ''}
            </div>
            
            ${result ? `
            <div class="section-status ${result.passed ? 'passed' : 'retry'}">
              ${result.passed ? `✓ Passed with ${result.score}%` : `Retry needed (${result.score}%)`}
            </div>
            ` : ''}
            
            <div class="quiz-result-inline" data-inline-result="${sectionKey}"></div>
          </div>
        </details>
      `;
    })
    .join("");
    
  // Wire up the View Article buttons
  sections.forEach((section) => {
    const sectionKey = `${moduleKey}:${section.id}`;
    const viewButton = document.querySelector(`[data-view-article="${sectionKey}"]`);
    
    if (viewButton) {
      viewButton.addEventListener("click", () => {
        launchReadingSession(module, section);
      });
    }
    
    // Wire up quiz launch buttons
    const quizButton = document.querySelector(`[data-launch-quiz="${sectionKey}"]`);
    const resultHost = document.querySelector(`[data-inline-result="${sectionKey}"]`);
    
    if (quizButton && section.quiz) {
      quizButton.addEventListener("click", () => {
        launchFullscreenQuiz(section, sectionKey, resultHost);
      });
    }
  });
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
  cleanVisibleUrl();
  ensureFavicon();
  wireExtensionlessNavigation();
  renderCanvasRail();
  renderCommonHeader();
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
    renderAccountContent();
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
