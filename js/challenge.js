import kennzeichen from './data.js';
import { getCollected } from './store.js';

const STORAGE_KEY = 'kz-challenge';

function pickUncollected(excludeCode = null) {
  const collected = getCollected();
  const pool = kennzeichen.filter(k => !collected[k.code] && k.code !== excludeCode);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getCurrentChallenge() {
  const code = localStorage.getItem(STORAGE_KEY);
  if (code) {
    const kz = kennzeichen.find(k => k.code === code);
    const collected = getCollected();
    if (kz && !collected[code]) return kz;
  }
  const pick = pickUncollected();
  if (pick) {
    localStorage.setItem(STORAGE_KEY, pick.code);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  return pick;
}

export function rerollChallenge() {
  const current = localStorage.getItem(STORAGE_KEY);
  const pick = pickUncollected(current) || pickUncollected();
  if (pick) {
    localStorage.setItem(STORAGE_KEY, pick.code);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  return pick;
}

export function clearChallenge() {
  localStorage.removeItem(STORAGE_KEY);
}
