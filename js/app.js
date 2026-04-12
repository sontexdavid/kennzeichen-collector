import { renderList } from './views/list.js';
import { renderDetail } from './views/detail.js';
import { renderStats } from './views/stats.js';
import { renderMap } from './views/map.js';

const content = document.getElementById('app-content');
const headerBack = document.getElementById('header-back');
const headerTitle = document.querySelector('.header-title');
const navItems = document.querySelectorAll('.nav-item');
const bottomNav = document.getElementById('bottom-nav');

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
  const titles = { list: 'Kennzeichen Sammeln', map: 'Karte', stats: 'Statistik', detail: 'Detail' };
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
    default:
      renderList(content);
  }
}

// Back button
headerBack.addEventListener('click', () => history.back());

// Route on hash change
window.addEventListener('hashchange', route);

// Initial route
route();
