import kennzeichen, { STATES } from '../data.js';
import { isCollected, toggle } from '../store.js';
import { checkNewlyUnlocked } from '../achievements.js';
import { showAchievementToasts } from '../toast.js';
import { getCurrentChallenge, rerollChallenge } from '../challenge.js';

let currentFilter = 'all'; // 'all' | 'collected' | 'open'
let currentState = '';
let searchQuery = '';

function challengeHtml() {
  const kz = getCurrentChallenge();
  if (!kz) {
    return `
      <div class="challenge-card challenge-complete">
        <div class="challenge-label">🏁 Challenge</div>
        <div class="challenge-complete-text">Du hast alle Kennzeichen gesammelt!</div>
      </div>
    `;
  }
  const stateName = STATES[kz.state] || kz.state;
  return `
    <div class="challenge-card" data-challenge="${kz.code}">
      <div class="challenge-top">
        <div class="challenge-label">🎯 Finde dieses Kennzeichen</div>
        <button class="challenge-reroll" data-challenge-action="reroll" aria-label="Neu würfeln">🎲</button>
      </div>
      <div class="challenge-plate">
        <div class="detail-plate-eu">
          <div class="stars">★★★</div>
          <div class="country">D</div>
        </div>
        <div class="detail-plate-code">${kz.code}</div>
      </div>
      <div class="challenge-meta">
        <div class="challenge-name">${kz.name}</div>
        <div class="challenge-state">${stateName}</div>
      </div>
      <div class="challenge-actions">
        <button class="challenge-btn challenge-btn-primary" data-challenge-action="found">✓ Gefunden</button>
        <button class="challenge-btn challenge-btn-secondary" data-challenge-action="detail">Details</button>
      </div>
    </div>
  `;
}

export function renderList(container) {
  container.innerHTML = `
    <div class="list-view">
      <div id="challenge-host">${challengeHtml()}</div>
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
    </div>
  `;

  const listEl = container.querySelector('#kz-list');
  const searchInput = container.querySelector('.search-input');
  const filterBar = container.querySelector('.filter-bar');
  const stateSelect = container.querySelector('#state-filter');
  const challengeHost = container.querySelector('#challenge-host');

  function refreshChallenge() {
    challengeHost.innerHTML = challengeHtml();
  }

  function updateCardCollectedState(code, nowCollected) {
    const card = listEl.querySelector(`.kz-card[data-code="${code}"]`);
    if (!card) return;
    card.classList.toggle('collected', nowCollected);
    const btn = card.querySelector('[data-collect]');
    if (btn) {
      btn.classList.toggle('collected', nowCollected);
      btn.innerHTML = nowCollected ? '✓' : '○';
    }
  }

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

  // Challenge actions
  challengeHost.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-challenge-action]');
    if (!actionBtn) return;
    const action = actionBtn.dataset.challengeAction;
    const cardEl = actionBtn.closest('[data-challenge]');
    const code = cardEl ? cardEl.dataset.challenge : null;

    if (action === 'reroll') {
      rerollChallenge();
      refreshChallenge();
    } else if (action === 'found' && code) {
      if (!isCollected(code)) {
        toggle(code);
        updateCardCollectedState(code, true);
        const unlocked = checkNewlyUnlocked();
        if (unlocked.length) showAchievementToasts(unlocked);
      }
      refreshChallenge();
    } else if (action === 'detail' && code) {
      location.hash = `#/detail/${code}`;
    }
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
      const unlocked = checkNewlyUnlocked();
      if (unlocked.length) showAchievementToasts(unlocked);
      // If the collected plate was the active challenge, roll a new one
      const currentChallengeCode = container.querySelector('[data-challenge]')?.dataset.challenge;
      if (nowCollected && code === currentChallengeCode) {
        refreshChallenge();
      }
      return;
    }
    // Card navigation
    const card = e.target.closest('.kz-card');
    if (card) {
      location.hash = `#/detail/${card.dataset.code}`;
    }
  });

  renderItems();
}
