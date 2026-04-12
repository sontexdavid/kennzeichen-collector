import kennzeichen, { STATES } from '../data.js';
import { isCollected, toggle } from '../store.js';

let currentFilter = 'all'; // 'all' | 'collected' | 'open'
let currentState = '';
let searchQuery = '';

export function renderList(container) {
  container.innerHTML = `
    <div class="search-container">
      <input type="search" class="search-input" placeholder="Kennzeichen suchen..." value="${searchQuery}">
    </div>
    <div class="filter-bar">
      <button class="filter-chip ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">Alle</button>
      <button class="filter-chip ${currentFilter === 'collected' ? 'active' : ''}" data-filter="collected">Gesammelt</button>
      <button class="filter-chip ${currentFilter === 'open' ? 'active' : ''}" data-filter="open">Offen</button>
      <select class="filter-select" id="state-filter">
        <option value="">Alle Bundesländer</option>
        ${Object.entries(STATES).sort((a, b) => a[1].localeCompare(b[1])).map(([code, name]) =>
          `<option value="${code}" ${currentState === code ? 'selected' : ''}>${name}</option>`
        ).join('')}
      </select>
    </div>
    <div class="kz-list" id="kz-list"></div>
  `;

  const listEl = container.querySelector('#kz-list');
  const searchInput = container.querySelector('.search-input');
  const filterBar = container.querySelector('.filter-bar');
  const stateSelect = container.querySelector('#state-filter');

  function renderItems() {
    const query = searchQuery.toLowerCase();
    const filtered = kennzeichen.filter(kz => {
      // Search filter
      if (query) {
        const match = kz.code.toLowerCase().includes(query) ||
          kz.name.toLowerCase().includes(query) ||
          (STATES[kz.state] || '').toLowerCase().includes(query);
        if (!match) return false;
      }
      // State filter
      if (currentState && kz.state !== currentState) return false;
      // Collected filter
      const collected = isCollected(kz.code);
      if (currentFilter === 'collected' && !collected) return false;
      if (currentFilter === 'open' && collected) return false;
      return true;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">Keine Kennzeichen gefunden</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(kz => {
      const collected = isCollected(kz.code);
      return `
        <div class="kz-card ${collected ? 'collected' : ''}" data-code="${kz.code}">
          <div class="kz-code"><span class="kz-code-text">${kz.code}</span></div>
          <div class="kz-info">
            <div class="kz-name">${kz.name}</div>
            <div class="kz-state">${STATES[kz.state] || kz.state}</div>
          </div>
          <button class="kz-collect-btn ${collected ? 'collected' : ''}" data-collect="${kz.code}" aria-label="${collected ? 'Entfernen' : 'Sammeln'}">
            ${collected ? '✓' : '○'}
          </button>
        </div>
      `;
    }).join('');
  }

  // Search
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderItems();
  });

  // Filter chips
  filterBar.addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    currentFilter = chip.dataset.filter;
    filterBar.querySelectorAll('.filter-chip').forEach(c =>
      c.classList.toggle('active', c.dataset.filter === currentFilter)
    );
    renderItems();
  });

  // State filter
  stateSelect.addEventListener('change', (e) => {
    currentState = e.target.value;
    renderItems();
  });

  // Card clicks
  listEl.addEventListener('click', (e) => {
    // Collect button
    const collectBtn = e.target.closest('[data-collect]');
    if (collectBtn) {
      e.stopPropagation();
      const code = collectBtn.dataset.collect;
      const nowCollected = toggle(code);
      collectBtn.classList.toggle('collected', nowCollected);
      collectBtn.innerHTML = nowCollected ? '✓' : '○';
      collectBtn.closest('.kz-card').classList.toggle('collected', nowCollected);
      return;
    }
    // Card navigation
    const card = e.target.closest('.kz-card');
    if (card) {
      location.hash = `#/detail/${card.dataset.code}`;
    }
  });

  renderItems();
  searchInput.focus();
}
