const PUBLIC_DATA = {
  events: [
    { date: 'Jun 04', title: 'Drive Team Practice', detail: 'Field drills + communication reps' },
    { date: 'Jun 07', title: 'Community Demo', detail: 'Public STEM showcase at district center' },
    { date: 'Jun 10', title: 'Build Session', detail: 'Mechanical + controls integration block' }
  ],
  members: [
    { name: 'Alex M.', role: 'Team Captain', subteam: 'Strategy', bio: 'Coordinates season planning and match readiness.' },
    { name: 'Jordan P.', role: 'Controls Lead', subteam: 'Control', bio: 'Owns wiring standards and controls reliability.' },
    { name: 'Taylor R.', role: 'Media Lead', subteam: 'Business/Media', bio: 'Manages team communications and sponsor coverage.' },
    { name: 'Casey L.', role: 'Safety Captain', subteam: 'Safety', bio: 'Runs shop safety checklists and compliance logs.' }
  ],
  logs: [
    { scope: 'Sub-Team Log', team: 'Fabrication', entry: 'Completed intake bracket prototype and tolerance review.' },
    { scope: 'Sub-Team Log', team: 'Design', entry: 'Released drivetrain CAD revision 4 for manufacturing handoff.' },
    { scope: 'Team Log', team: 'All-Hands', entry: 'Finished week sprint review and posted new milestone board.' }
  ],
  posts: [
    { title: 'Summer Outreach Schedule Published', body: 'Public outreach calendar is now live with event locations and volunteer slots.' },
    { title: 'Rookie Orientation Open', body: 'New members can attend orientation nights starting next week.' },
    { title: 'Mentor Spotlight', body: 'Read this month\'s profile on our electrical systems mentor team.' }
  ]
};

function createCard(text, className = '') {
  const card = document.createElement('article');
  card.className = `tile-card ${className}`.trim();
  card.dataset.searchText = text.toLowerCase();
  return card;
}

function renderPublicSite() {
  const calendarHost = document.querySelector('[data-public-calendar]');
  const membersHost = document.querySelector('[data-public-members]');
  const logsHost = document.querySelector('[data-public-logs]');
  const postsHost = document.querySelector('[data-public-posts]');
  const countersHost = document.querySelector('[data-public-counters]');
  if (!calendarHost || !membersHost || !logsHost || !postsHost || !countersHost) return;

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

  PUBLIC_DATA.events.forEach((item) => {
    const card = createCard(`${item.date} ${item.title} ${item.detail}`);
    card.innerHTML = `<p class="kicker">${item.date}</p><h4>${item.title}</h4><p>${item.detail}</p>`;
    calendarHost.append(card);
  });

  PUBLIC_DATA.members.forEach((item) => {
    const card = createCard(`${item.name} ${item.role} ${item.subteam} ${item.bio}`);
    card.innerHTML = `<h4>${item.name}</h4><p><strong>${item.role}</strong> · ${item.subteam}</p><p>${item.bio}</p>`;
    membersHost.append(card);
  });

  PUBLIC_DATA.logs.forEach((item) => {
    const card = createCard(`${item.scope} ${item.team} ${item.entry}`);
    card.innerHTML = `<p class="kicker">${item.scope}</p><h4>${item.team}</h4><p>${item.entry}</p>`;
    logsHost.append(card);
  });

  PUBLIC_DATA.posts.forEach((item) => {
    const card = createCard(`${item.title} ${item.body}`);
    card.innerHTML = `<h4>${item.title}</h4><p>${item.body}</p>`;
    postsHost.append(card);
  });
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

document.addEventListener('DOMContentLoaded', () => {
  renderPublicSite();
  bindPublicSearch();
});
