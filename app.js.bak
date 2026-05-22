const STORAGE_KEY = "forge-training-state-v1";

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
  { href: "index.html", label: "Account", icon: "account" }
];

function assetPrefix() {
  const path = window.location.pathname;
  if (path.includes("/modules/") || path.includes("/quizzes/")) {
    return "../";
  }
  return "";
}

function currentFilePath() {
  const path = window.location.pathname;
  if (path.endsWith("/")) {
    return `${path}index.html`;
  }
  return path;
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
  const prefix = assetPrefix();
  return `${prefix}${href}`;
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
    ["Role", "account"]
  ];

  document.querySelectorAll(".side-nav a").forEach((link) => {
    if (link.dataset.decorated === "true") return;
    const key = map.find(([name]) => link.textContent.includes(name))?.[1] || "dashboard";
    link.insertAdjacentHTML("afterbegin", `<span class="nav-icon">${UI_ICONS[key]}</span>`);
    link.dataset.decorated = "true";
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
      completedQuizzes: {}
    };
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return {
      role: "rookie",
      overrideRequired: false,
      completedQuizzes: {}
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

function isExempt(state) {
  return state.role === "existing" && !state.overrideRequired;
}

function getModuleProgress(module, state) {
  if (isExempt(state)) {
    return {
      complete: true,
      passedCount: module.quizzes.length,
      totalCount: module.quizzes.length,
      percentage: 100,
      statusText: "Exempt (existing member)"
    };
  }

  const passedCount = module.quizzes.filter((quizPath) => {
    const row = state.completedQuizzes[quizPath];
    return row && row.passed;
  }).length;

  const totalCount = module.quizzes.length;
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
  const roleLabel = FORGE_PROGRAM.roles[state.role] || FORGE_PROGRAM.roles.rookie;

  target.innerHTML = `
    <div class="brand">
      <div class="brand-mark"><img src="${assetPrefix()}favicon.svg" alt="FORGE icon" /></div>
      <div class="brand-copy">
        <h1>${FORGE_PROGRAM.fullName}</h1>
        <p>${FORGE_PROGRAM.cohort}</p>
      </div>
    </div>
    <div class="badge-row">
      <span class="badge">Role: ${roleLabel}</span>
      <span class="badge">Pass Mark: ${FORGE_PROGRAM.passingScore}%</span>
    </div>
  `;
}

function renderRoleControls() {
  const form = document.querySelector("[data-role-form]");
  if (!form) return;

  const state = readState();
  form.querySelector("[name='memberRole']").value = state.role;
  form.querySelector("[name='mentorOverride']").checked = state.overrideRequired;

  form.addEventListener("change", () => {
    setRole(form.querySelector("[name='memberRole']").value);
    setOverride(form.querySelector("[name='mentorOverride']").checked);
    window.location.reload();
  });
}

function renderModuleCards() {
  const host = document.querySelector("[data-module-grid]");
  if (!host) return;

  const state = readState();

  host.innerHTML = FORGE_PROGRAM.modules
    .map((module) => {
      const progress = getModuleProgress(module, state);

      return `
        <article class="card module-row-card">
          <div class="module-row-head">
            <h3>${module.title}</h3>
            <span class="tag">${progress.passedCount}/${progress.totalCount}</span>
          </div>
          <p>${module.outcome}</p>
          <div class="tag-row">
            <span class="tag">Owner: ${module.owner}</span>
            <span class="tag">${progress.statusText}</span>
          </div>
          <div class="progress-track" aria-hidden="true">
            <div class="progress-fill" style="width: ${progress.percentage}%"></div>
          </div>
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

  normalizeExtensionlessLinks(host);
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
  renderPortalMetrics();
  renderModuleCards();
  normalizeExtensionlessLinks();
});
