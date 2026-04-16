import { STATES } from './data.js';
import { getCurrentChallenge, rerollChallenge } from './challenge.js';
import { toggle, isCollected } from './store.js';
import { checkNewlyUnlocked } from './achievements.js';
import { showAchievementToasts } from './toast.js';

let hostEl = null;

function ensureHost() {
  if (hostEl && document.body.contains(hostEl)) return hostEl;
  hostEl = document.createElement('div');
  hostEl.id = 'challenge-modal-host';
  document.body.appendChild(hostEl);
  return hostEl;
}

function buildInnerHtml(kz) {
  if (!kz) {
    return `
      <div class="challenge-modal-body challenge-complete">
        <div class="challenge-complete-icon">🏁</div>
        <div class="challenge-complete-text">Du hast alle Kennzeichen gesammelt!</div>
      </div>
    `;
  }
  const stateName = STATES[kz.state] || kz.state;
  return `
    <div class="challenge-modal-body" data-challenge="${kz.code}">
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
        <button class="challenge-btn challenge-btn-primary" data-action="found">✓ Gefunden</button>
        <button class="challenge-btn challenge-btn-secondary" data-action="detail">Details</button>
      </div>
      <button class="challenge-reroll-row" data-action="reroll">🎲 Neu würfeln</button>
    </div>
  `;
}

export function openChallengeModal() {
  const host = ensureHost();

  function render() {
    const kz = getCurrentChallenge();
    host.innerHTML = `
      <div class="challenge-modal" id="challenge-modal">
        <div class="challenge-modal-content">
          <div class="challenge-modal-header">
            <div class="challenge-label">🎯 Finde dieses Kennzeichen</div>
            <button class="challenge-modal-close" aria-label="Schließen">&times;</button>
          </div>
          ${buildInnerHtml(kz)}
        </div>
      </div>
    `;
    requestAnimationFrame(() => {
      const modal = host.querySelector('#challenge-modal');
      if (modal) modal.classList.add('visible');
    });
  }

  function close() {
    const modal = host.querySelector('#challenge-modal');
    if (!modal) { host.innerHTML = ''; return; }
    modal.classList.remove('visible');
    setTimeout(() => { host.innerHTML = ''; }, 180);
  }

  host.onclick = (e) => {
    const modal = host.querySelector('#challenge-modal');
    if (e.target === modal) { close(); return; }
    if (e.target.closest('.challenge-modal-close')) { close(); return; }

    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    const action = actionBtn.dataset.action;
    const bodyEl = host.querySelector('[data-challenge]');
    const code = bodyEl ? bodyEl.dataset.challenge : null;

    if (action === 'reroll') {
      rerollChallenge();
      render();
    } else if (action === 'found' && code) {
      if (!isCollected(code)) {
        toggle(code);
        const unlocked = checkNewlyUnlocked();
        if (unlocked.length) showAchievementToasts(unlocked);
      }
      render();
    } else if (action === 'detail' && code) {
      close();
      location.hash = `#/detail/${code}`;
    }
  };

  render();
}
