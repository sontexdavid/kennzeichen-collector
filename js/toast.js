let containerEl = null;

function ensureContainer() {
  if (containerEl && document.body.contains(containerEl)) return containerEl;
  containerEl = document.createElement('div');
  containerEl.className = 'toast-container';
  document.body.appendChild(containerEl);
  return containerEl;
}

export function showAchievementToast(achievement) {
  const host = ensureContainer();
  const el = document.createElement('div');
  el.className = 'toast toast-achievement';
  el.innerHTML = `
    <div class="toast-icon">${achievement.icon}</div>
    <div class="toast-body">
      <div class="toast-label">Erfolg freigeschaltet</div>
      <div class="toast-title">${achievement.title}</div>
    </div>
  `;
  host.appendChild(el);

  requestAnimationFrame(() => el.classList.add('visible'));

  const dismiss = () => {
    el.classList.remove('visible');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  };
  el.addEventListener('click', dismiss);
  setTimeout(dismiss, 3800);
}

export function showAchievementToasts(list) {
  list.forEach((a, i) => setTimeout(() => showAchievementToast(a), i * 500));
}
