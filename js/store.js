const STORAGE_KEY = 'kz-collected';

export function getCollected() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function isCollected(code) {
  return !!getCollected()[code];
}

export function toggle(code) {
  const collected = getCollected();
  if (collected[code]) {
    delete collected[code];
  } else {
    collected[code] = { date: new Date().toISOString() };
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collected));
  return !!collected[code];
}

export function getCount() {
  return Object.keys(getCollected()).length;
}
