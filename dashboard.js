const MEMBER_DATA = {
  counters: [
    { label: 'Active members', value: '42' },
    { label: 'Sub-team logs this week', value: '18' },
    { label: 'Open action items', value: '11' }
  ],
  logs: [
    { scope: 'Control', title: 'CAN diagnostics', body: 'Resolved intermittent device IDs and updated wiring map. Chaos: temporarily defeated.' },
    { scope: 'Strategy', title: 'Scouting schema update', body: 'Added consistency checks for cycle and defense tags. Data wins matches.' },
    { scope: 'Fabrication', title: 'Arm mount iteration', body: 'Completed stress test and approved v3 plate geometry. If it bends, we mend.' },
    { scope: 'All Team', title: 'Leadership sync', body: 'Published deadlines for outreach prep and pit checklist. Built by us, always.' }
  ],
  posts: [
    { id: 'MBR-POST-001', title: 'Reminder: Safety refresh due Friday', body: 'All pit crew and drive team members must finish check-in. PPE is always in style.' },
    { id: 'MBR-POST-002', title: 'Scrimmage prep packet posted', body: 'Review autonomous priorities and communication callouts. Drive smooth, think faster.' },
    { id: 'MBR-POST-003', title: 'Sponsor update draft review', body: 'Media and business teams to finalize visuals by Tuesday. Keep it sharp, keep it real.' }
  ]
};

function createMemberCard(text) {
  const card = document.createElement('article');
  card.className = 'tile-card';
  card.dataset.searchText = text.toLowerCase();
  return card;
}

function renderDashboard() {
  const countersHost = document.querySelector('[data-member-counters]');
  const logsHost = document.querySelector('[data-member-logs]');
  const postsHost = document.querySelector('[data-member-posts]');
  if (!countersHost || !logsHost || !postsHost) return;

  MEMBER_DATA.counters.forEach((item) => {
    const card = createMemberCard(`${item.label} ${item.value}`);
    card.innerHTML = `<h4>${item.label}</h4><p class="metric">${item.value}</p>`;
    countersHost.append(card);
  });

  MEMBER_DATA.logs.forEach((item) => {
    const card = createMemberCard(`${item.scope} ${item.title} ${item.body}`);
    card.innerHTML = `<p class="kicker">${item.scope}</p><h4>${item.title}</h4><p>${item.body}</p>`;
    logsHost.append(card);
  });

  MEMBER_DATA.posts.forEach((item) => {
    const card = createMemberCard(`${item.id} ${item.title} ${item.body}`);
    card.innerHTML = `<p class="kicker">Post ID: ${item.id}</p><h4>${item.title}</h4><p>${item.body}</p>`;
    postsHost.append(card);
  });
}

function bindMemberSearch() {
  const form = document.querySelector('[data-member-search-form]');
  const input = form?.querySelector('input[name="query"]');
  const meta = document.querySelector('[data-member-search-meta]');
  if (!form || !input || !meta) return;

  const runSearch = () => {
    const query = input.value.trim().toLowerCase();
    const cards = Array.from(document.querySelectorAll('.tile-card[data-search-text]'));
    let visible = 0;
    cards.forEach((card) => {
      const match = !query || card.dataset.searchText.includes(query);
      card.classList.toggle('hidden', !match);
      if (match) visible += 1;
    });
    meta.textContent = query
      ? `Showing ${visible} result${visible === 1 ? '' : 's'} for "${input.value.trim()}".`
      : 'Showing all dashboard items.';
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    runSearch();
  });

  input.addEventListener('input', runSearch);
}

document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  bindMemberSearch();
});
