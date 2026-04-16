import kennzeichen from './data.js';
import { getCollected } from './store.js';

const STORAGE_SEEN = 'kz-achievements-seen';

export const ACHIEVEMENTS = [
  { id: 'first',        title: 'Erster Fund',          description: 'Sammle dein erstes Kennzeichen',     icon: '🚗', target: 1,   kind: 'count' },
  { id: 'ten',          title: 'Einsteiger',            description: '10 Kennzeichen gesammelt',           icon: '🔟', target: 10,  kind: 'count' },
  { id: 'twentyfive',   title: 'Sammler',               description: '25 Kennzeichen gesammelt',           icon: '🎯', target: 25,  kind: 'count' },
  { id: 'fifty',        title: 'Halbzeit des Einstiegs',description: '50 Kennzeichen gesammelt',           icon: '⭐', target: 50,  kind: 'count' },
  { id: 'hundred',      title: 'Enthusiast',            description: '100 Kennzeichen gesammelt',          icon: '💯', target: 100, kind: 'count' },
  { id: 'twohundred',   title: 'Experte',               description: '200 Kennzeichen gesammelt',          icon: '🏆', target: 200, kind: 'count' },
  { id: 'threehundred', title: 'Meister',               description: '300 Kennzeichen gesammelt',          icon: '👑', target: 300, kind: 'count' },
  { id: 'all',          title: 'Vollendet!',            description: 'Alle Kennzeichen gesammelt',         icon: '🎉', target: 474, kind: 'count' },

  { id: 'state-1',      title: 'Bundesland komplett',   description: 'Schließe ein Bundesland vollständig ab', icon: '🗺️', target: 1,  kind: 'states' },
  { id: 'state-5',      title: 'Bundesland-Sammler',    description: '5 Bundesländer vollständig',         icon: '🇩🇪', target: 5,  kind: 'states' },
  { id: 'state-all',    title: 'Deutschland-Meister',   description: 'Alle 16 Bundesländer vollständig',   icon: '🏅', target: 16, kind: 'states' }
];

function computeStateCompletion(collected) {
  const byState = {};
  for (const kz of kennzeichen) {
    if (!byState[kz.state]) byState[kz.state] = { total: 0, count: 0 };
    byState[kz.state].total++;
    if (collected[kz.code]) byState[kz.state].count++;
  }
  return Object.values(byState).filter(s => s.total > 0 && s.count === s.total).length;
}

export function getProgress(achievement, collected = getCollected()) {
  if (achievement.kind === 'count') return Object.keys(collected).length;
  if (achievement.kind === 'states') return computeStateCompletion(collected);
  return 0;
}

export function isEarned(achievement, collected = getCollected()) {
  return getProgress(achievement, collected) >= achievement.target;
}

export function getEarnedIds(collected = getCollected()) {
  return ACHIEVEMENTS.filter(a => isEarned(a, collected)).map(a => a.id);
}

function readSeen() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_SEEN) || '[]'));
  } catch {
    return new Set();
  }
}

function writeSeen(ids) {
  localStorage.setItem(STORAGE_SEEN, JSON.stringify(Array.from(ids)));
}

export function initAchievements() {
  if (localStorage.getItem(STORAGE_SEEN) === null) {
    writeSeen(new Set(getEarnedIds()));
  }
}

export function checkNewlyUnlocked() {
  const earned = getEarnedIds();
  const seen = readSeen();
  const newOnes = earned.filter(id => !seen.has(id));
  writeSeen(new Set(earned));
  return newOnes.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean);
}
