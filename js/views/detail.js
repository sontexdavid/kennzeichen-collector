import kennzeichen, { STATES } from '../data.js';
import { isCollected, toggle } from '../store.js';
import { checkNewlyUnlocked } from '../achievements.js';
import { showAchievementToasts } from '../toast.js';

export function renderDetail(container, code) {
  const kz = kennzeichen.find(k => k.code === code);
  if (!kz) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❓</div>
        <div class="empty-state-text">Kennzeichen "${code}" nicht gefunden</div>
      </div>
    `;
    return;
  }

  const collected = isCollected(kz.code);
  const stateName = STATES[kz.state] || kz.state;

  container.innerHTML = `
    <div class="detail-view">
      <div class="detail-plate">
        <div class="detail-plate-eu">
          <div class="stars">★★★</div>
          <div class="country">D</div>
        </div>
        <div class="detail-plate-code">${kz.code}</div>
      </div>

      <div class="detail-meta">
        <h2>${kz.name}</h2>
        <div class="detail-type">${stateName}</div>
      </div>

      <div class="detail-info-grid">
        <div class="detail-info-item">
          <div class="detail-info-label">Kennzeichen</div>
          <div class="detail-info-value">${kz.code}</div>
        </div>
        <div class="detail-info-item">
          <div class="detail-info-label">Bundesland</div>
          <div class="detail-info-value">${stateName}</div>
        </div>
      </div>

      <button class="detail-collect-btn ${collected ? 'collected' : ''}" id="detail-collect">
        ${collected ? '✓ Gesammelt' : '○ Sammeln'}
      </button>
    </div>
  `;

  const btn = container.querySelector('#detail-collect');
  btn.addEventListener('click', () => {
    const nowCollected = toggle(kz.code);
    btn.classList.toggle('collected', nowCollected);
    btn.innerHTML = nowCollected ? '✓ Gesammelt' : '○ Sammeln';
    const unlocked = checkNewlyUnlocked();
    if (unlocked.length) showAchievementToasts(unlocked);
  });
}
