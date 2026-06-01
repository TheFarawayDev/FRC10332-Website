// ─── Data ─────────────────────────────────────────────────────────────────────
const PUBLIC_DATA = {
  events: [
    { date: 'Jun 04', title: 'Drive Team Practice', detail: 'Field drills and communication reps. Smooth is fast — consistency wins matches.', type: 'Training' },
    { date: 'Jun 07', title: 'Community Demo', detail: 'Public STEM showcase at district center — robot demo, Q&A tables, and outreach activities for all ages.', type: 'Outreach' },
    { date: 'Jun 10', title: 'Build Session', detail: 'Mechanical and controls integration block — subsystem testing and final assembly prep before demo day.', type: 'Build' },
    { date: 'Jun 14', title: 'Safety Training Day', detail: 'Annual shop safety review, PPE inspection, and certification renewal for all members joining the build floor.', type: 'Safety' },
    { date: 'Jun 18', title: 'Sponsor Presentation', detail: 'Quarterly update for sponsors showcasing season progress, robot capabilities, and team milestones.', type: 'Business' },
    { date: 'Jun 21', title: 'Strategy Workshop', detail: 'Alliance selection prep, scouting process review, and in-depth match analysis training for the strategy team.', type: 'Strategy' },
  ],
  members: [
    { name: 'Alex M.', role: 'Team Captain', subteam: 'Strategy', bio: 'Coordinates season planning, match readiness, and mentor alignment across events. Has led the team through two regional competitions and one district championship appearance.', joined: 'Sep 2023' },
    { name: 'Jordan P.', role: 'Controls Lead', subteam: 'Control', bio: 'Maintains controls reliability standards and leads wiring quality reviews each sprint. Expert in CAN bus architecture, sensor integration, and autonomous routine development.', joined: 'Sep 2022' },
    { name: 'Taylor R.', role: 'Media Lead', subteam: 'Business/Media', bio: 'Directs team communications, sponsor updates, and event storytelling for outreach. Manages all social media channels and produces the annual team season highlight reel.', joined: 'Sep 2023' },
    { name: 'Casey L.', role: 'Safety Captain', subteam: 'Safety', bio: 'Runs safety checklists, tool trainings, and pit process audits before every competition. Certified in first aid and leads all new member shop orientation and certification sessions.', joined: 'Sep 2022' },
    { name: 'Morgan D.', role: 'Drive Coach', subteam: 'Strategy', bio: 'Prepares drive team communication plans and post-match review structure. Former driver with 3 seasons of competition experience and deep knowledge of FRC game strategy.', joined: 'Sep 2021' },
    { name: 'Riley S.', role: 'Mechanical Lead', subteam: 'Fabrication', bio: 'Leads fabrication timelines, assembly QA, and subsystem integration checkpoints. Specializes in drivetrain design, weight optimization, and tolerance-critical manufacturing processes.', joined: 'Sep 2023' },
    { name: 'Quinn B.', role: 'Design Lead', subteam: 'Design', bio: 'Oversees CAD workflows, manufacturing handoffs, and design review processes. Maintains the team\'s SolidWorks component library and Design for Manufacturability standards across sub-systems.', joined: 'Sep 2022' },
    { name: 'Avery T.', role: 'Business Lead', subteam: 'Business/Media', bio: 'Manages sponsor relationships, grant applications, and team budget planning. Grew team sponsorship revenue by 40% this season through targeted outreach campaigns and partnership programs.', joined: 'Sep 2023' },
  ],
  logs: [
    { scope: 'Sub-Team Log', team: 'Fabrication', entry: 'Completed intake bracket prototype, torque checklist, and tolerance review for production approval. All measurements are within spec and parts are ready for final machining and assembly.', date: 'May 28, 2026' },
    { scope: 'Sub-Team Log', team: 'Design', entry: 'Released drivetrain CAD revision 4 with complete manufacturing notes for handoff to fabrication. Incorporated mentor feedback on bearing block placement and updated frame clearance tolerances.', date: 'May 26, 2026' },
    { scope: 'Sub-Team Log', team: 'Control', entry: 'Validated CAN layout updates and completed full sensor calibration test pass. New autonomous routine successfully ran three consecutive passes in field simulation with zero CAN faults.', date: 'May 25, 2026' },
    { scope: 'Sub-Team Log', team: 'Business/Media', entry: 'Published sponsor recap package and queued social media highlights from the outreach demo. Three new sponsorship inquiries received from local engineering firms within 24 hours.', date: 'May 24, 2026' },
    { scope: 'Sub-Team Log', team: 'Strategy', entry: 'Completed match data analysis from last regional. Updated scouting form with two new metrics and distributed alliance selection prep materials and opponent trend reports to drive team.', date: 'May 23, 2026' },
    { scope: 'Team Log', team: 'All-Hands', entry: 'Closed weekly sprint review with action owners, due dates, and cross-team blockers resolved. Competition readiness is at 78% — targeting 90% before June 7 community demo event.', date: 'May 30, 2026' },
  ],
  posts: [
    { id: 'PUB-POST-001', title: 'Summer Outreach Schedule Published', body: 'The public outreach calendar is now live with event locations, volunteer windows, and team contacts. We have six community events planned through August, ranging from elementary school STEM visits to the district fair. Check the calendar page for specific dates and volunteer sign-up information for each event.', date: 'May 30, 2026', category: 'Outreach' },
    { id: 'PUB-POST-002', title: 'Rookie Orientation Open', body: 'Orientation nights begin next week with tours, safety briefing, and a full build workflow overview. New members should arrive at 6 PM at the main bay. Bring closed-toe shoes and your signed consent forms. Parent and guardian attendance is encouraged for the first session so everyone understands team expectations.', date: 'May 28, 2026', category: 'Team' },
    { id: 'PUB-POST-003', title: 'Mentor Spotlight: Electrical Crew', body: 'This month features the electrical mentor crew and their comprehensive reliability training checklist. These mentors contributed over 200 hours this season helping students master wiring standards, diagnostic tools, and CAN bus architecture. Their curriculum is now part of the official Forge training platform for all Controls members.', date: 'May 25, 2026', category: 'Community' },
    { id: 'PUB-POST-004', title: 'Build Season Readiness Update', body: 'Subsystem planning checkpoints are complete and the procurement queue is now published on the internal board. The team has finalized the mechanical design for the primary game piece manipulator and controls integration is 60% complete. We are on track for our first full-robot system test within two weeks.', date: 'May 22, 2026', category: 'Build' },
    { id: 'PUB-POST-005', title: 'Community Demo Recap', body: 'Thank you to the 200+ families and supporters who visited our district STEM showcase this weekend. The robot demo drew a huge crowd and our members delivered outstanding presentations on programming, CAD design, and team operations. Special thanks to all sponsors and the district events team for making this possible.', date: 'May 18, 2026', category: 'Outreach' },
    { id: 'PUB-POST-006', title: 'Season Awards & Recognition', body: 'Three members have been nominated for the regional Dean\'s List Award this season and the team has been selected as a finalist for the Excellence in Engineering Award. We are incredibly proud of every member\'s hard work and dedication. Full award ceremony details and nomination bios will be published closer to the regional competition.', date: 'May 15, 2026', category: 'Awards' },
  ]
};

// ─── Color maps ───────────────────────────────────────────────────────────────
const SUBTEAM_COLORS = {
  'Control': '#3b82f6',
  'Design': '#8b5cf6',
  'Fabrication': '#f59e0b',
  'Strategy': '#22c55e',
  'Business/Media': '#ec4899',
  'Safety': '#ef4444',
  'Leadership': '#0070f3',
};

const CATEGORY_COLORS = {
  'Outreach': '#22c55e',
  'Team': '#3b82f6',
  'Community': '#ec4899',
  'Build': '#f59e0b',
  'Awards': '#a855f7',
  'Safety': '#ef4444',
};

const EVENT_TYPE_COLORS = {
  'Training': '#3b82f6',
  'Outreach': '#22c55e',
  'Build': '#f59e0b',
  'Safety': '#ef4444',
  'Business': '#ec4899',
  'Strategy': '#a855f7',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name) {
  return name.split(' ').map((w) => w[0] || '').join('').slice(0, 2).toUpperCase();
}

function createCard(text, className) {
  const card = document.createElement('article');
  card.className = ('tile-card ' + (className || '')).trim();
  card.dataset.searchText = text.toLowerCase();
  return card;
}

function markCardAsModal(card, type, idx) {
  card.classList.add('modal-ready');
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.dataset.modalType = type;
  card.dataset.modalIdx = String(idx);
}

// ─── Rich modal HTML builders ─────────────────────────────────────────────────
function buildMemberModal(member) {
  const initials = getInitials(member.name);
  const color = SUBTEAM_COLORS[member.subteam] || '#0070f3';
  return `
    <div class="modal-member-header">
      <div class="modal-avatar" style="background:${color}20;color:${color};border-color:${color}40">${initials}</div>
      <div class="modal-member-meta">
        <span class="modal-role-label">${member.role}</span>
        <span class="modal-subteam-pill" style="background:${color}18;color:${color};border-color:${color}30">${member.subteam}</span>
      </div>
    </div>
    <div class="modal-body-section">
      <p class="modal-field-label">About</p>
      <p>${member.bio}</p>
    </div>
    <div class="modal-body-row">
      <div class="modal-body-meta"><span class="modal-field-label">Sub-Team</span><strong>${member.subteam}</strong></div>
      <div class="modal-body-meta"><span class="modal-field-label">Member Since</span><strong>${member.joined}</strong></div>
    </div>
  `;
}

function buildLogModal(log) {
  const color = SUBTEAM_COLORS[log.team] || '#888';
  return `
    <div class="modal-log-header">
      <span class="modal-scope-pill">${log.scope}</span>
      <span class="modal-team-pill" style="background:${color}18;color:${color};border-color:${color}30">${log.team}</span>
    </div>
    <div class="modal-body-section">
      <p class="modal-field-label">Log Entry</p>
      <p>${log.entry}</p>
    </div>
    <div class="modal-body-row">
      <div class="modal-body-meta"><span class="modal-field-label">Date</span><strong>${log.date}</strong></div>
      <div class="modal-body-meta"><span class="modal-field-label">Scope</span><strong>${log.scope}</strong></div>
    </div>
  `;
}

function buildPostModal(post) {
  const color = CATEGORY_COLORS[post.category] || '#888';
  return `
    <div class="modal-post-header">
      <span class="modal-category-pill" style="background:${color}18;color:${color};border-color:${color}30">${post.category}</span>
      <span class="modal-post-date">${post.date}</span>
    </div>
    <div class="modal-body-section">
      <p>${post.body}</p>
    </div>
    <div class="modal-body-row">
      <div class="modal-body-meta"><span class="modal-field-label">Post ID</span><strong>${post.id}</strong></div>
      <div class="modal-body-meta"><span class="modal-field-label">Published</span><strong>${post.date}</strong></div>
    </div>
  `;
}

function buildModalContent(type, idx) {
  if (type === 'member') {
    const item = PUBLIC_DATA.members[idx];
    return item ? { title: `${item.name} \u00b7 ${item.role}`, html: buildMemberModal(item) } : null;
  }
  if (type === 'log') {
    const item = PUBLIC_DATA.logs[idx];
    return item ? { title: `${item.scope} \u00b7 ${item.team}`, html: buildLogModal(item) } : null;
  }
  if (type === 'post') {
    const item = PUBLIC_DATA.posts[idx];
    return item ? { title: item.title, html: buildPostModal(item) } : null;
  }
  return null;
}

// ─── Card renderers ───────────────────────────────────────────────────────────
function renderMemberCard(item, idx, host) {
  const initials = getInitials(item.name);
  const color = SUBTEAM_COLORS[item.subteam] || '#0070f3';
  const card = createCard(`${item.name} ${item.role} ${item.subteam} ${item.bio}`);
  card.innerHTML = `
    <div class="member-card-header">
      <div class="member-avatar" style="background:${color}20;color:${color};border-color:${color}40">${initials}</div>
      <div class="member-card-meta">
        <h4>${item.name}</h4>
        <p class="member-role-text">${item.role}</p>
      </div>
    </div>
    <span class="member-subteam-chip" style="background:${color}12;color:${color};border-color:${color}25">${item.subteam}</span>
    <p class="member-bio-excerpt">${item.bio.slice(0, 90)}${item.bio.length > 90 ? '\u2026' : ''}</p>
    <p class="card-cta-hint">Tap to read more</p>
  `;
  markCardAsModal(card, 'member', idx);
  host.append(card);
}

function renderLogCard(item, idx, host) {
  const color = SUBTEAM_COLORS[item.team] || '#888';
  const card = createCard(`${item.scope} ${item.team} ${item.entry} ${item.date || ''}`);
  card.innerHTML = `
    <div class="log-card-head">
      <span class="log-scope-kicker">${item.scope}</span>
      <span class="log-date-chip">${item.date || ''}</span>
    </div>
    <h4 class="log-team-name" style="color:${color}">${item.team}</h4>
    <p>${item.entry.slice(0, 100)}${item.entry.length > 100 ? '\u2026' : ''}</p>
    <p class="card-cta-hint">Tap for full entry</p>
  `;
  markCardAsModal(card, 'log', idx);
  host.append(card);
}

function renderPostCard(item, idx, host) {
  const color = CATEGORY_COLORS[item.category] || '#888';
  const card = createCard(`${item.id} ${item.title} ${item.body} ${item.category || ''}`);
  card.innerHTML = `
    <div class="post-card-head">
      <span class="post-category-pill" style="background:${color}18;color:${color};border-color:${color}30">${item.category || 'Post'}</span>
      <span class="post-date-chip">${item.date || ''}</span>
    </div>
    <h4>${item.title}</h4>
    <p>${item.body.slice(0, 110)}${item.body.length > 110 ? '\u2026' : ''}</p>
    <p class="card-cta-hint">Tap to read full post</p>
  `;
  markCardAsModal(card, 'post', idx);
  host.append(card);
}

// ─── Main render ──────────────────────────────────────────────────────────────
function renderPublicSite() {
  const pageView = document.body.dataset.publicView || 'all';
  const calendarHost = document.querySelector('[data-public-calendar]');
  const membersHost = document.querySelector('[data-public-members]');
  const logsHost = document.querySelector('[data-public-logs]');
  const postsHost = document.querySelector('[data-public-posts]');
  const countersHost = document.querySelector('[data-public-counters]');
  const recentPostsHost = document.querySelector('[data-public-recent-posts]');
  const recentLogsHost = document.querySelector('[data-public-recent-logs]');

  if (countersHost && (pageView === 'all' || pageView === 'overview')) {
    countersHost.innerHTML = '';
    [
      { label: 'Total Members', value: '42', path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z' },
      { label: 'Public Profiles', value: String(PUBLIC_DATA.members.length), path: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
      { label: 'Sub-Teams Active', value: '7', path: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
    ].forEach((item) => {
      const card = createCard(`${item.label} ${item.value}`);
      card.innerHTML = `
        <div class="counter-card-inner">
          <svg class="counter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${item.path}"/></svg>
          <div>
            <p class="metric">${item.value}</p>
            <p class="counter-label">${item.label}</p>
          </div>
        </div>
      `;
      countersHost.append(card);
    });
  }

  if (calendarHost && (pageView === 'all' || pageView === 'calendar')) {
    PUBLIC_DATA.events.forEach((item) => {
      const typeColor = EVENT_TYPE_COLORS[item.type] || '#888';
      const card = createCard(`${item.date} ${item.title} ${item.detail} ${item.type || ''}`);
      card.innerHTML = `
        <div class="event-card-head">
          <span class="event-date-badge">${item.date}</span>
          <span class="event-type-pill" style="background:${typeColor}18;color:${typeColor};border:1px solid ${typeColor}30">${item.type || 'Event'}</span>
        </div>
        <h4>${item.title}</h4>
        <p>${item.detail}</p>
      `;
      calendarHost.append(card);
    });
  }

  if (membersHost && (pageView === 'all' || pageView === 'members')) {
    PUBLIC_DATA.members.forEach((item, idx) => renderMemberCard(item, idx, membersHost));
  }

  if (logsHost && (pageView === 'all' || pageView === 'logs')) {
    PUBLIC_DATA.logs.forEach((item, idx) => renderLogCard(item, idx, logsHost));
  }

  if (postsHost && (pageView === 'all' || pageView === 'posts')) {
    PUBLIC_DATA.posts.forEach((item, idx) => renderPostCard(item, idx, postsHost));
  }

  // Overview: recent posts preview (3 latest)
  if (recentPostsHost && (pageView === 'overview' || pageView === 'all')) {
    PUBLIC_DATA.posts.slice(0, 3).forEach((item, idx) => renderPostCard(item, idx, recentPostsHost));
  }

  // Overview: recent logs preview (3 latest)
  if (recentLogsHost && (pageView === 'overview' || pageView === 'all')) {
    PUBLIC_DATA.logs.slice(0, 3).forEach((item, idx) => renderLogCard(item, idx, recentLogsHost));
  }
}

// ─── Search ───────────────────────────────────────────────────────────────────
function bindPublicSearch() {
  const form = document.querySelector('[data-public-search-form]');
  const input = form?.querySelector('input[name="query"]');
  const meta = document.querySelector('[data-public-search-meta]');
  if (!form || !input || !meta) return;

  const runSearch = () => {
    const q = input.value.trim().toLowerCase();
    const cards = Array.from(document.querySelectorAll('.tile-card[data-search-text]'));
    let visible = 0;
    cards.forEach((card) => {
      const match = !q || card.dataset.searchText.includes(q);
      card.classList.toggle('hidden', !match);
      if (match) visible += 1;
    });
    meta.textContent = q
      ? `Showing ${visible} result${visible === 1 ? '' : 's'} for "${input.value.trim()}".`
      : 'Showing all public items.';
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    runSearch();
  });
  input.addEventListener('input', runSearch);
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function bindPublicModalCards() {
  const host = document.createElement('div');
  host.className = 'site-modal';
  host.hidden = true;
  host.innerHTML = `
    <div class="site-modal-card" role="dialog" aria-modal="true" aria-labelledby="siteModalTitle">
      <div class="site-modal-head">
        <h4 id="siteModalTitle"></h4>
        <button class="site-modal-close" type="button" data-modal-close aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="site-modal-body modal-rich-body" data-modal-body></div>
    </div>
  `;
  document.body.append(host);

  const titleHost = host.querySelector('#siteModalTitle');
  const bodyHost = host.querySelector('[data-modal-body]');
  const close = () => {
    host.hidden = true;
    document.body.classList.remove('modal-open');
  };

  host.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest('[data-modal-close]') || target === host) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !host.hidden) close();
  });

  document.querySelectorAll('.tile-card.modal-ready').forEach((card) => {
    const open = () => {
      if (!titleHost || !bodyHost) return;
      const type = card.dataset.modalType;
      const idx = parseInt(card.dataset.modalIdx || '0', 10);
      const content = buildModalContent(type, idx);
      if (!content) return;
      titleHost.textContent = content.title;
      bodyHost.innerHTML = content.html;
      host.hidden = false;
      document.body.classList.add('modal-open');
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });
}

// ─── Cookie Consent ───────────────────────────────────────────────────────────
const _COOKIE_CONSENT_KEY = "frc10332-cookie-consent";

function _getCookieConsent() {
  try {
    const raw = localStorage.getItem(_COOKIE_CONSENT_KEY);
    if (raw === null) return null;
    return JSON.parse(raw)?.accepted === true;
  } catch (e) { return null; }
}

function _setCookieConsent(accepted) {
  try {
    localStorage.setItem(_COOKIE_CONSENT_KEY, JSON.stringify({ accepted, ts: Date.now() }));
  } catch (e) { /* silent */ }
}

function _dismissPublicCookieBanner(banner) {
  banner.classList.remove("cookie-banner-visible");
  setTimeout(() => banner.remove(), 350);
}

function initCookieBanner() {
  if (_getCookieConsent() !== null) return; // already decided
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
        <p>We use local storage to remember your preferences and enable the FORGE training system. Your choice is saved site-wide.</p>
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
    _setCookieConsent(true);
    _dismissPublicCookieBanner(banner);
  });
  banner.querySelector(".cookie-deny-btn").addEventListener("click", () => {
    _setCookieConsent(false);
    _dismissPublicCookieBanner(banner);
    // Sign out any active FORGE session — consent is required for auth storage
    if (window.FirebaseSystems?.getCurrentUser()) {
      window.FirebaseSystems.signOut().catch(() => {});
    }
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderPublicSite();
  bindPublicSearch();
  bindPublicModalCards();
  initCookieBanner();
});
