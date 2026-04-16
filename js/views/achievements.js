import { ACHIEVEMENTS, getProgress, isEarned } from '../achievements.js';
import { getCollected } from '../store.js';

export function renderAchievements(container) {
  const collected = getCollected();
  const earnedCount = ACHIEVEMENTS.filter(a => isEarned(a, collected)).length;
  const total = ACHIEVEMENTS.length;
  const pct = total > 0 ? Math.round((earnedCount / total) * 100) : 0;

  container.innerHTML = `
    <div class="ach-view">
      <div class="stats-overall">
        <div class="stats-overall-count">${earnedCount}</div>
        <div class="stats-overall-total">von ${total} freigeschaltet (${pct}%)</div>
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${pct}%"></div>
        </div>
      </div>

      <div class="ach-grid">
        ${ACHIEVEMENTS.map(a => {
          const progress = getProgress(a, collected);
          const earned = progress >= a.target;
          const displayProgress = Math.min(progress, a.target);
          const progressPct = a.target > 0 ? Math.round((displayProgress / a.target) * 100) : 0;
          return `
            <div class="ach-card ${earned ? 'earned' : 'locked'}">
              <div class="ach-icon">${earned ? a.icon : '🔒'}</div>
              <div class="ach-info">
                <div class="ach-title">${a.title}</div>
                <div class="ach-desc">${a.description}</div>
                <div class="ach-progress-row">
                  <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${progressPct}%"></div>
                  </div>
                  <span class="ach-progress-text">${displayProgress}/${a.target}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
