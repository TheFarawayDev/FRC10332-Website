const STORAGE_KEY = "forge-training-state-v1";

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
  return Boolean(readState().watchedVideos?.[sectionKey]);
}

function markVideoWatched(sectionKey) {
  const state = readState();
  state.watchedVideos = state.watchedVideos || {};
  state.watchedVideos[sectionKey] = true;
  saveState(state);
  unlockQuizGate(sectionKey);
}

function unlockQuizGate(sectionKey) {
  const badge = document.querySelector(`[data-vbadge="${sectionKey}"]`);
  if (badge) {
    badge.className = "video-watch-badge watched";
    badge.innerHTML = "&#x2713;&ensp;Video complete &mdash; quiz unlocked";
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
    summaryVideoBadge.innerHTML = "&#x2713;&nbsp;Watched";
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

function renderVideoPanel(section, module) {
  const key = getSectionStorageKey(module, section);
  const vid = extractVideoId(section.video);
  const watched = getVideoWatched(key);
  const elemId = "yt-" + key.replace(/[^a-z0-9]/gi, "-");
  return `
    <div class="video-player-wrap" data-player-key="${key}" data-video-id="${vid}">
      <div id="${elemId}" class="yt-target"></div>
      <div class="video-watch-badge ${watched ? "watched" : ""}" data-vbadge="${key}">
        ${watched ? "&#x2713;&ensp;Video complete &mdash; quiz unlocked" : "&#x25B6;&ensp;Watch to completion to unlock the quiz"}
      </div>
    </div>
  `;
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

const RAIL_LINKS = [
  { href: "portal.html", label: "Dashboard", icon: "dashboard" },
  { href: "modules/business-media.html", label: "Business", icon: "business" },
  { href: "modules/safety.html", label: "Safety", icon: "safety" },
  { href: "modules/strategy.html", label: "Strategy", icon: "strategy" },
  { href: "modules/design.html", label: "Design", icon: "design" },
  { href: "modules/control.html", label: "Control", icon: "control" },
  { href: "modules/fabrication.html", label: "Fabrication", icon: "fabrication" },
  { href: "modules/art.html", label: "Art", icon: "art" },
  { href: "account.html", label: "Account", icon: "account" }
];

function assetPrefix() {
  const path = window.location.pathname;
  if (path.includes("/modules/") || path.includes("/quizzes/")) {
    return "../";
  }
  return "";
}

function cleanVisibleUrl() {
  const path = window.location.pathname;
  if (path.endsWith("index.html")) {
    const clean = path.slice(0, -"index.html".length) || "/";
    window.history.replaceState({}, "", clean + window.location.search + window.location.hash);
    return;
  }

  if (path.endsWith(".html")) {
    const clean = path.slice(0, -".html".length);
    window.history.replaceState({}, "", clean + window.location.search + window.location.hash);
  }
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
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-file-href]");
    if (!link) return;
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    if (link.target && link.target !== "_self") return;

    event.preventDefault();
    window.location.href = link.dataset.fileHref;
  });
}

function normalizeExtensionlessLinks(scope = document) {
  scope.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) {
      return;
    }

    if (href.endsWith(".html")) {
      link.dataset.fileHref = href;
      link.setAttribute("href", href.slice(0, -5));
    }
  });
}

function renderCanvasRail() {
  if (document.querySelector(".canvas-rail")) return;

  const rail = document.createElement("nav");
  rail.className = "canvas-rail";
  rail.setAttribute("aria-label", "Primary Navigation");

  const current = window.location.pathname;
  const isRoot = current === "/" || current === "";
  rail.innerHTML = `
    <div class="rail-logo"><img src="${assetPrefix()}favicon.svg" alt="FORGE" /></div>
    ${RAIL_LINKS.map((link) => {
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
  normalizeExtensionlessLinks(rail);
}

function injectMobileNavToggle() {
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
      overrideRequired: false,
      completedQuizzes: {},
      watchedVideos: {}
    };
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed.watchedVideos) parsed.watchedVideos = {};
    return parsed;
  } catch (error) {
    return {
      role: "rookie",
      overrideRequired: false,
      completedQuizzes: {},
      watchedVideos: {}
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

function renderCommonHeader() {
  const target = document.querySelector("[data-forge-header]");
  if (!target) return;

  const state = readState();
  const roleData = FORGE_PROGRAM.roles[state.role] || FORGE_PROGRAM.roles.rookie;
  const roleLabel = roleData.label;

  target.innerHTML = `
    <div class="brand">
      <div class="brand-mark"><img src="${assetPrefix()}favicon.svg" alt="FORGE icon" /></div>
      <div class="brand-copy">
        <h1>${FORGE_PROGRAM.fullName}</h1>
        <p>${FORGE_PROGRAM.cohort}</p>
      </div>
    </div>
    <div class="badge-row">
      <span class="badge role-badge" style="--role-color: ${roleData.color}">${roleLabel}</span>
      <span class="badge">Pass Mark: ${FORGE_PROGRAM.passingScore}%</span>
      ${isExempt(state) ? '<span class="badge exempt-badge">Training Exempt</span>' : ''}
    </div>
  `;
}

function renderRoleControls() {
  const scope = document.querySelector("[data-role-form]");
  if (!scope || scope.dataset.bound === "true") return;

  const state = readState();
  const roleControls = scope.querySelectorAll("[name='memberRole']");
  const overrideControl = scope.querySelector("[name='mentorOverride']");

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

  scope.addEventListener("change", () => {
    const selectedRole = scope.querySelector("[name='memberRole']:checked")?.value
      || scope.querySelector("[name='memberRole']")?.value
      || state.role;
    const overrideValue = Boolean(scope.querySelector("[name='mentorOverride']")?.checked);
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

  return `
    <article class="stat">
      <span class="value">${summary.percentage}%</span>
      <span>Program completion</span>
    </article>
    <article class="stat">
      <span class="value">${summary.completedModules}/${summary.totalModules}</span>
      <span>Modules complete</span>
    </article>
    <article class="stat">
      <span class="value">${Object.keys(state.completedQuizzes).length}</span>
      <span>Checks logged</span>
    </article>
    <article class="stat">
      <span class="value">${isExempt(state) ? "Yes" : "No"}</span>
      <span>Training exempt</span>
    </article>
  `;
}

function renderQuizForm(section, module) {
  const storageKey = getSectionStorageKey(module, section);

  const questions = section.quiz
    .map((question, questionIndex) => {
      const options = question.options
        .map((option, optionIndex) => {
          return `
            <label class="option-pill">
              <input type="radio" name="${storageKey}-q${questionIndex}" value="${optionIndex}" />
              <span>${option}</span>
            </label>
          `;
        })
        .join("");

      return `
        <div class="question quiz-question">
          <h4>${questionIndex + 1}. ${question.q}</h4>
          <div class="option-grid">${options}</div>
        </div>
      `;
    })
    .join("");

  return `
    <form class="quiz-form inline-quiz" data-inline-quiz data-quiz-key="${storageKey}" data-passing-score="${FORGE_PROGRAM.passingScore}">
      ${questions}
      <div class="button-row">
        <button class="btn primary" type="submit">Submit Checkoff</button>
        <span class="quiz-meta">${section.quiz.length} questions • ${section.status}</span>
      </div>
      <div class="result" data-quiz-result>Submit to lock this section.</div>
    </form>
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
         <p>Watch the training video to completion to unlock this assessment.</p>
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
              <span class="subitem-title">Training Video</span>
              <span class="subitem-badge ${watched ? "watched" : ""}" data-subitem-vbadge="${quizKey}">${watched ? "&#x2713;&nbsp;Watched" : "Required"}</span>
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
              <div class="rich-notes">${section.notes}</div>
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
  const sections = getModuleSections(module)
    .map((section, index) => renderCanvasItemRow(section, module, index, state))
    .join("");

  return `
    <details class="canvas-module-row" ${defaultOpen ? "open" : ""}>
      <summary>
        <span class="cmr-grip">⋮</span>
        <span class="cmr-arrow">▶</span>
        <span class="cmr-title">${module.title}</span>
        <span class="cmr-right">
          <span class="cmr-check ${progress.complete ? "done" : ""}" aria-label="${progress.complete ? "Complete" : "In Progress"}">${progress.complete ? "✓" : ""}</span>
          <button class="cmr-plus" type="button" aria-label="Expand">+</button>
          <span class="cmr-dots">⋮</span>
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

  host.innerHTML = `
    <article class="panel hero dashboard-hero">
      <div>
        <h2>FORGE Module Dashboard</h2>
        <p>Canvas-style module browser with dropdown sections, notes, watch items, and quiz checkoffs.</p>
      </div>
      <div class="quick-grid">${renderMetricTiles(state)}</div>
    </article>
    <article class="panel canvas-module-list">
      <div class="section-head">
        <div>
          <h3>Training Modules</h3>
          <p>Open a module to reveal six sections. Each section includes notes, a watch panel, and a quiz.</p>
        </div>
      </div>
      <div class="module-accordion-list">
        ${FORGE_PROGRAM.modules.map((module) => renderModuleAccordion(module, state)).join("")}
      </div>
    </article>
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

  host.innerHTML = `
    <article class="panel hero account-hero">
      <div class="account-badge">${demo.initials}</div>
      <div>
        <h2>${demo.name}</h2>
        <p>${demo.role === "existing" ? "Existing member" : "Training account preview"} • ${demo.subteam} • ${demo.memberId}</p>
      </div>
    </article>
    <article class="panel account-grid">
      <section class="account-card">
        <h3>Profile</h3>
        <div class="account-row"><span>Email</span><strong>${demo.email}</strong></div>
        <div class="account-row"><span>Joined</span><strong>${demo.joined}</strong></div>
        <div class="account-row"><span>Subteam</span><strong>${demo.subteam}</strong></div>
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
            <span>Mentor override &mdash; require full training track regardless of role</span>
          </label>
          <div class="role-card-list">
            ${Object.entries(FORGE_PROGRAM.roles).map(([key, role]) => `
              <label class="role-card ${state.role === key ? "selected" : ""}">
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
    </article>
  `;

  renderRoleControls();
}

function wireInlineQuizForms(root = document) {
  root.querySelectorAll("form[data-inline-quiz]").forEach((form) => {
    if (form.dataset.bound === "true") return;
    form.dataset.bound = "true";

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const quizKey = form.dataset.quizKey;
      const passingScore = Number(form.dataset.passingScore || FORGE_PROGRAM.passingScore);
      const modulesMap = new Map(FORGE_PROGRAM.modules.map((module) => [module.key, module]));
      const module = Array.from(modulesMap.values()).find((entry) => quizKey.startsWith(entry.key));
      if (!module) return;

      const section = module.sections.find((entry) => getSectionStorageKey(module, entry) === quizKey);
      if (!section) return;

      let correctCount = 0;
      section.quiz.forEach((question, questionIndex) => {
        const selected = form.querySelector(`input[name='${quizKey}-q${questionIndex}']:checked`);
        if (selected && Number(selected.value) === question.answer) {
          correctCount += 1;
        }
      });

      const score = Math.round((correctCount / section.quiz.length) * 100);
      const passed = score >= passingScore;
      markQuizResult(quizKey, passed, score);

      const resultHost = form.querySelector("[data-quiz-result]");
      if (resultHost) {
        resultHost.className = `result ${passed ? "pass" : "fail"}`;
        resultHost.textContent = passed
          ? `Passed with ${score}% - this section is now complete.`
          : `Scored ${score}% - you need ${passingScore}% to pass this section.`;
      }

      form.closest(".canvas-item-row")?.setAttribute("open", "open");
    });
  });
}

function renderModuleChecklist(moduleKey) {
  const host = document.querySelector("[data-module-checklist]");
  if (!host) return;

  const state = readState();
  const module = FORGE_PROGRAM.modules.find((m) => m.key === moduleKey);
  if (!module) return;

  host.innerHTML = module.quizzes
    .map((quizPath, index) => {
      const result = state.completedQuizzes[quizPath];
      const passedText = result
        ? result.passed
          ? `Passed (${result.score}%)`
          : `Retry Needed (${result.score}%)`
        : "Not Started";

      return `
        <tr>
          <td>Quiz ${index + 1}</td>
          <td><a href="../${quizPath}">${quizPath.split("/")[1].replace(".html", "")}</a></td>
          <td>${passedText}</td>
        </tr>
      `;
    })
    .join("");
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
  loadYouTubeAPI();
  wireExtensionlessNavigation();
  renderCanvasRail();
  renderCommonHeader();
  injectMobileNavToggle();
  decorateSideNav();
  renderRoleControls();

  const pageKind = getPageKind();
  if (pageKind === "portal") {
    renderDashboardContent();
  } else if (pageKind === "module") {
    renderModuleContent();
  } else if (pageKind === "account") {
    renderAccountContent();
  } else {
    renderPortalMetrics();
    renderModuleCards();
  }

  wireInlineQuizForms();
  normalizeExtensionlessLinks();
  // Init YouTube players in case API already loaded before DOM render
  initYouTubePlayers();
  // Re-init when any module accordion is opened
  document.addEventListener("toggle", () => initYouTubePlayers(), true);
});
