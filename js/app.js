import { renderList } from './views/list.js';
import { renderDetail } from './views/detail.js';
import { renderStats } from './views/stats.js';
import { renderMap } from './views/map.js';
import { renderAchievements } from './views/achievements.js';
import { getTheme, toggleTheme } from './theme.js';
import { initAchievements } from './achievements.js';
import { openChallengeModal } from './challenge-modal.js';

const content = document.getElementById('app-content');
const headerBack = document.getElementById('header-back');
const headerTitle = document.querySelector('.header-title');
const navItems = document.querySelectorAll('.nav-item');
const bottomNav = document.getElementById('bottom-nav');
const themeBtn = document.getElementById('btn-theme');
const diceBtn = document.getElementById('btn-dice');

function updateThemeIcon() {
  if (!themeBtn) return;
  themeBtn.textContent = getTheme() === 'dark' ? '☀️' : '🌙';
}

function route() {
  const hash = location.hash || '#/list';
  const [, path, param] = hash.match(/^#\/(\w+)\/?(.*)$/) || [, 'list', ''];

  // Update nav active state
  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.view === path);
  });

  // Show/hide back button and nav
  const isDetail = path === 'detail';
  headerBack.style.display = isDetail ? '' : 'none';
  bottomNav.style.display = isDetail ? 'none' : '';

  // Update title
  const titles = { list: 'Kennzeichen Sammeln', map: 'Karte', stats: 'Statistik', detail: 'Detail', achievements: 'Erfolge' };
  headerTitle.textContent = titles[path] || 'Kennzeichen Sammeln';

  // Render view
  content.innerHTML = '';
  switch (path) {
    case 'list':
      renderList(content);
      break;
    case 'detail':
      renderDetail(content, param);
      break;
    case 'stats':
      renderStats(content);
      break;
    case 'map':
      renderMap(content);
      break;
    case 'achievements':
      renderAchievements(content);
      break;
    default:
      renderList(content);
  }
}

// Back button
headerBack.addEventListener('click', () => history.back());

// Theme toggle
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    toggleTheme();
    updateThemeIcon();
  });
}
updateThemeIcon();

// Dice (open challenge modal)
if (diceBtn) {
  diceBtn.addEventListener('click', () => openChallengeModal());
}

// Initialize achievements store (seed "seen" set so existing plates don't retroactively fire toasts)
initAchievements();

// Route on hash change
window.addEventListener('hashchange', route);

// Initial route
route();
