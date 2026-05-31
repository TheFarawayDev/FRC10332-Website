const PUBLIC_DATA = {
  events: [
    { date: 'Jun 04', title: 'Drive Team Practice', detail: 'Field drills + communication reps. Slogan: smooth is fast.' },
    { date: 'Jun 07', title: 'Community Demo', detail: 'Public STEM showcase at district center — robot says hi, probably loudly.' },
    { date: 'Jun 10', title: 'Build Session', detail: 'Mechanical + controls integration block, aka bolt-and-pray night.' }
  ],
  members: [
    { name: 'Alex M.', role: 'Team Captain', subteam: 'Strategy', bio: 'Coordinates season planning, match readiness, and mentor alignment across events.' },
    { name: 'Jordan P.', role: 'Controls Lead', subteam: 'Control', bio: 'Maintains controls reliability standards and leads wiring quality reviews each sprint.' },
    { name: 'Taylor R.', role: 'Media Lead', subteam: 'Business/Media', bio: 'Directs team communications, sponsor updates, and event storytelling for outreach.' },
    { name: 'Casey L.', role: 'Safety Captain', subteam: 'Safety', bio: 'Runs safety checklists, tool trainings, and pit process audits before every competition.' },
    { name: 'Morgan D.', role: 'Drive Coach', subteam: 'Strategy', bio: 'Prepares drive team communication plans and post-match review structure.' },
    { name: 'Riley S.', role: 'Mechanical Lead', subteam: 'Fabrication', bio: 'Leads fabrication timelines, assembly QA, and subsystem integration checkpoints.' }
  ],
  logs: [
    { scope: 'Sub-Team Log', team: 'Fabrication', entry: 'Completed intake bracket prototype, torque checklist, and tolerance review for production approval.' },
    { scope: 'Sub-Team Log', team: 'Design', entry: 'Released drivetrain CAD revision 4 and documented manufacturing notes for handoff.' },
    { scope: 'Sub-Team Log', team: 'Control', entry: 'Validated CAN layout updates and completed sensor calibration test pass.' },
    { scope: 'Sub-Team Log', team: 'Business/Media', entry: 'Published sponsor recap package and queued social highlights from outreach demo.' },
    { scope: 'Team Log', team: 'All-Hands', entry: 'Closed weekly sprint review with action owners, due dates, and cross-team blockers resolved.' }
  ],
  posts: [
    { id: 'PUB-POST-001', title: 'Summer Outreach Schedule Published', body: 'Public outreach calendar is now live with event locations, volunteer windows, and team contacts.' },
    { id: 'PUB-POST-002', title: 'Rookie Orientation Open', body: 'Orientation nights begin next week with tours, safety briefing, and build workflow overview.' },
    { id: 'PUB-POST-003', title: 'Mentor Spotlight', body: 'This month features the electrical mentor crew and their reliability training checklist.' },
    { id: 'PUB-POST-004', title: 'Build Season Readiness Update', body: 'Subsystem planning checkpoints are complete and procurement queue is now published.' },
    { id: 'PUB-POST-005', title: 'Community Demo Recap', body: 'Thank you to families and supporters who visited our district STEM showcase this weekend.' }
  ]
};

function createCard(text, className = '') {
  const card = document.createElement('article');
  card.className = `tile-card ${className}`.trim();
  card.dataset.searchText = text.toLowerCase();
  return card;
}

function markCardAsModal(card, title, detail) {
  card.classList.add('modal-ready');
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.dataset.modalTitle = title;
  card.dataset.modalBody = detail;
}

function renderPublicSite() {
  const pageView = document.body.dataset.publicView || 'all';
  const calendarHost = document.querySelector('[data-public-calendar]');
  const membersHost = document.querySelector('[data-public-members]');
  const logsHost = document.querySelector('[data-public-logs]');
  const postsHost = document.querySelector('[data-public-posts]');
  const countersHost = document.querySelector('[data-public-counters]');

  if (countersHost && (pageView === 'all' || pageView === 'overview')) {
    countersHost.innerHTML = '';
    [
      { label: 'Total members', value: '42' },
      { label: 'Public member profiles', value: String(PUBLIC_DATA.members.length) },
      { label: 'Sub-teams active', value: '7' }
    ].forEach((item) => {
      const card = createCard(`${item.label} ${item.value}`);
      card.innerHTML = `<h4>${item.label}</h4><p class="metric">${item.value}</p>`;
      countersHost.append(card);
    });
  }

  if (calendarHost && (pageView === 'all' || pageView === 'calendar')) {
    PUBLIC_DATA.events.forEach((item) => {
      const card = createCard(`${item.date} ${item.title} ${item.detail}`);
      card.innerHTML = `<p class="kicker">${item.date}</p><h4>${item.title}</h4><p>${item.detail}</p>`;
      calendarHost.append(card);
    });
  }

  if (membersHost && (pageView === 'all' || pageView === 'members')) {
    PUBLIC_DATA.members.forEach((item) => {
      const card = createCard(`${item.name} ${item.role} ${item.subteam} ${item.bio}`);
      card.innerHTML = `<h4>${item.name}</h4><p><strong>${item.role}</strong> · ${item.subteam}</p><p>${item.bio}</p>`;
      markCardAsModal(card, `${item.name} · ${item.role}`, `${item.subteam}\n\n${item.bio}`);
      membersHost.append(card);
    });
  }

  if (logsHost && (pageView === 'all' || pageView === 'logs')) {
    PUBLIC_DATA.logs.forEach((item) => {
      const card = createCard(`${item.scope} ${item.team} ${item.entry}`);
      card.innerHTML = `<p class="kicker">${item.scope}</p><h4>${item.team}</h4><p>${item.entry}</p>`;
      markCardAsModal(card, `${item.scope} · ${item.team}`, item.entry);
      logsHost.append(card);
    });
  }

  if (postsHost && (pageView === 'all' || pageView === 'posts')) {
    PUBLIC_DATA.posts.forEach((item) => {
      const card = createCard(`${item.id} ${item.title} ${item.body}`);
      card.innerHTML = `<p class="kicker">Post ID: ${item.id}</p><h4>${item.title}</h4><p>${item.body}</p>`;
      markCardAsModal(card, `${item.title} (${item.id})`, item.body);
      postsHost.append(card);
    });
  }
}

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

function bindPublicModalCards() {
  const host = document.createElement('div');
  host.className = 'site-modal';
  host.hidden = true;
  host.innerHTML = `
    <div class="site-modal-card" role="dialog" aria-modal="true" aria-labelledby="siteModalTitle">
      <div class="site-modal-head">
        <h4 id="siteModalTitle"></h4>
        <button class="site-modal-close" type="button" data-modal-close aria-label="Close">✕</button>
      </div>
      <div class="site-modal-body" data-modal-body></div>
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
    if (target.matches('[data-modal-close]') || target === host) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !host.hidden) close();
  });

  document.querySelectorAll('.tile-card.modal-ready').forEach((card) => {
    const open = () => {
      if (!titleHost || !bodyHost) return;
      titleHost.textContent = card.dataset.modalTitle || 'Detail';
      bodyHost.textContent = card.dataset.modalBody || '';
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

document.addEventListener('DOMContentLoaded', () => {
  renderPublicSite();
  bindPublicSearch();
  bindPublicModalCards();
});
