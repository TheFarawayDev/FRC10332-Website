const STORAGE_KEY = "forge-training-state-v1";

function assetPrefix() {
  const path = window.location.pathname;
  if (path.includes("/modules/") || path.includes("/quizzes/")) {
    return "../";
  }
  return "";
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
  ensureFavicon();
  renderCommonHeader();
  renderRoleControls();
  renderPortalMetrics();
  renderModuleCards();
});
