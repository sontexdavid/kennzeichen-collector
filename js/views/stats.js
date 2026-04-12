import kennzeichen, { STATES } from '../data.js';
import { getCollected } from '../store.js';

export function renderStats(container) {
  const collected = getCollected();
  const collectedCount = Object.keys(collected).length;
  const total = kennzeichen.length;
  const pct = total > 0 ? Math.round((collectedCount / total) * 100) : 0;

  // Per-state stats
  const stateStats = {};
  for (const [code, name] of Object.entries(STATES)) {
    stateStats[code] = { name, total: 0, collected: 0 };
  }
  for (const kz of kennzeichen) {
    if (stateStats[kz.state]) {
      stateStats[kz.state].total++;
      if (collected[kz.code]) {
        stateStats[kz.state].collected++;
      }
    }
  }

  const sortedStates = Object.entries(stateStats)
    .map(([code, s]) => ({ code, ...s, pct: s.total > 0 ? Math.round((s.collected / s.total) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct || a.name.localeCompare(b.name));

  // Recently collected
  const recent = Object.entries(collected)
    .map(([code, data]) => {
      const kz = kennzeichen.find(k => k.code === code);
      return kz ? { code, name: kz.name, date: data.date } : null;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  container.innerHTML = `
    <div class="stats-view">
      <div class="stats-overall">
        <div class="stats-overall-count">${collectedCount}</div>
        <div class="stats-overall-total">von ${total} gesammelt (${pct}%)</div>
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${pct}%"></div>
        </div>
      </div>

      <div class="stats-section-title">Nach Bundesland</div>
      <div class="stats-state-list">
        ${sortedStates.map(s => `
          <div class="stats-state-card">
            <div class="stats-state-name">${s.name}</div>
            <div class="stats-state-progress">
              <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${s.pct}%"></div>
              </div>
            </div>
            <div class="stats-state-count">${s.collected}/${s.total}</div>
          </div>
        `).join('')}
      </div>

      ${recent.length > 0 ? `
        <div class="stats-section-title">Zuletzt gesammelt</div>
        <div class="stats-recent">
          ${recent.map(r => `
            <div class="stats-recent-item">
              <span class="stats-recent-code">${r.code}</span>
              <span class="stats-recent-name">${r.name}</span>
              <span class="stats-recent-date">${formatDate(r.date)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
}
