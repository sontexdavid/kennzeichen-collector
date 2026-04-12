import kennzeichen, { STATES } from '../data.js';
import { getCollected, isCollected, toggle } from '../store.js';

const STATE_PATHS = {
  SH: "M 245,20 L 270,15 290,25 305,45 295,80 285,95 275,85 260,90 240,80 230,60 235,35 Z",
  HH: "M 265,92 L 275,88 282,95 278,102 268,100 Z",
  MV: "M 300,30 L 340,20 380,25 400,40 395,65 380,75 350,80 320,78 305,70 295,55 Z",
  HB: "M 225,95 L 235,92 240,98 236,105 228,102 Z",
  NI: "M 180,80 L 220,70 250,85 265,105 270,130 260,160 240,175 220,180 195,170 170,155 165,130 170,105 Z",
  BB: "M 355,85 L 390,80 410,95 415,125 405,155 385,165 365,160 345,150 335,125 340,100 Z",
  BE: "M 370,115 L 380,112 385,120 380,128 372,125 Z",
  ST: "M 300,100 L 335,95 350,110 345,145 330,160 305,165 285,155 280,130 285,110 Z",
  NW: "M 130,160 L 170,150 195,165 200,195 190,225 170,240 145,235 125,215 120,190 Z",
  HE: "M 190,195 L 220,185 240,200 245,230 235,260 215,275 195,265 180,240 175,215 Z",
  TH: "M 255,175 L 290,165 310,180 315,210 300,230 275,235 255,220 245,200 Z",
  SN: "M 320,170 L 355,160 380,175 390,200 380,225 355,235 335,225 315,210 Z",
  RP: "M 120,240 L 150,230 175,245 180,275 170,305 150,315 125,305 110,280 Z",
  SL: "M 120,310 L 140,305 150,315 145,330 130,335 118,325 Z",
  BW: "M 150,320 L 185,305 215,315 230,345 225,380 200,400 170,395 150,370 140,345 Z",
  BY: "M 220,280 L 260,265 300,275 320,310 330,350 315,390 285,410 250,400 225,375 215,340 210,305 Z"
};

let rootContainer = null;

export function renderMap(container) {
  rootContainer = container;
  const collected = getCollected();

  const stateProgress = {};
  for (const code of Object.keys(STATES)) {
    const stateKz = kennzeichen.filter(k => k.state === code);
    const stateCollected = stateKz.filter(k => collected[k.code]);
    stateProgress[code] = {
      total: stateKz.length,
      collected: stateCollected.length,
      pct: stateKz.length > 0 ? stateCollected.length / stateKz.length : 0
    };
  }

  function getColor(pct) {
    if (pct === 0) return '#e0e0e0';
    if (pct === 1) return '#2e7d32';
    const r = Math.round(200 - pct * 154);
    const g = Math.round(200 + pct * 25);
    const b = Math.round(200 - pct * 150);
    return `rgb(${r},${g},${b})`;
  }

  const svgPaths = Object.entries(STATE_PATHS).map(([code, path]) => {
    const progress = stateProgress[code] || { pct: 0 };
    return `<path id="state-${code}" d="${path}" fill="${getColor(progress.pct)}" data-state="${code}" />`;
  }).join('\n');

  const labelPositions = {
    SH: [265, 55], HH: [273, 98], MV: [355, 52], HB: [233, 100],
    NI: [215, 130], BB: [375, 125], BE: [377, 121], ST: [315, 135],
    NW: [160, 195], HE: [215, 235], TH: [280, 205], SN: [355, 200],
    RP: [145, 275], SL: [133, 320], BW: [190, 355], BY: [275, 340]
  };

  const svgLabels = Object.entries(labelPositions).map(([code, [x, y]]) => {
    const progress = stateProgress[code] || { collected: 0, total: 0 };
    return `<text x="${x}" y="${y}" text-anchor="middle" font-size="9" font-weight="bold" fill="#333" pointer-events="none" style="text-shadow: 1px 1px 2px white">${code}</text>
            <text x="${x}" y="${y + 11}" text-anchor="middle" font-size="7" fill="#555" pointer-events="none" style="text-shadow: 1px 1px 2px white">${progress.collected}/${progress.total}</text>`;
  }).join('\n');

  container.innerHTML = `
    <div class="map-view">
      <div class="map-container">
        <svg viewBox="100 0 330 420" xmlns="http://www.w3.org/2000/svg">
          ${svgPaths}
          ${svgLabels}
        </svg>
      </div>
      <div class="map-legend">
        <span>0%</span>
        <div class="map-legend-gradient"></div>
        <span>100%</span>
      </div>
    </div>
    <div id="map-overlay-container"></div>
  `;

  container.querySelector('.map-container svg').addEventListener('click', (e) => {
    const path = e.target.closest('path[data-state]');
    if (!path) return;
    showStateOverlay(path.dataset.state);
  });
}

function showStateOverlay(stateCode) {
  const overlayContainer = rootContainer.querySelector('#map-overlay-container');
  const stateName = STATES[stateCode] || stateCode;
  const stateKz = kennzeichen.filter(k => k.state === stateCode).sort((a, b) => a.code.localeCompare(b.code));

  overlayContainer.innerHTML = `
    <div class="map-overlay" id="map-overlay">
      <div class="map-overlay-content">
        <div class="map-overlay-header">
          <h3>${stateName}</h3>
          <button class="map-overlay-close" id="overlay-close">&times;</button>
        </div>
        <div class="kz-list">
          ${stateKz.map(kz => {
            const collected = isCollected(kz.code);
            return `
              <div class="kz-card ${collected ? 'collected' : ''}" data-code="${kz.code}">
                <div class="kz-code"><span class="kz-code-text">${kz.code}</span></div>
                <div class="kz-info">
                  <div class="kz-name">${kz.name}</div>
                </div>
                <button class="kz-collect-btn ${collected ? 'collected' : ''}" data-collect="${kz.code}">
                  ${collected ? '✓' : '○'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  const overlay = overlayContainer.querySelector('#map-overlay');

  function closeOverlay() {
    overlayContainer.innerHTML = '';
    renderMap(rootContainer);
  }

  overlay.querySelector('#overlay-close').addEventListener('click', closeOverlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });

  overlay.querySelector('.kz-list').addEventListener('click', (e) => {
    const collectBtn = e.target.closest('[data-collect]');
    if (collectBtn) {
      e.stopPropagation();
      const code = collectBtn.dataset.collect;
      const nowCollected = toggle(code);
      collectBtn.classList.toggle('collected', nowCollected);
      collectBtn.innerHTML = nowCollected ? '✓' : '○';
      collectBtn.closest('.kz-card').classList.toggle('collected', nowCollected);
      return;
    }
    const card = e.target.closest('.kz-card');
    if (card) {
      overlayContainer.innerHTML = '';
      location.hash = `#/detail/${card.dataset.code}`;
    }
  });
}
