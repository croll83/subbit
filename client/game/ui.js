// HUD — Sport-tech Balanced (Variant B)
// All DOM elements for the redesigned HUD

import { getTeam, TEAMS, DEFAULT_MATCH } from './teams.js';

// ═══ DOM REFERENCES ═══
const $scoreBar = document.getElementById('score-bar');
const $homeScore = document.getElementById('home-score');
const $awayScore = document.getElementById('away-score');
const $homeCode = document.getElementById('home-code');
const $awayCode = document.getElementById('away-code');
const $homeFlag = document.getElementById('home-flag');
const $awayFlag = document.getElementById('away-flag');
const $halfLabel = document.getElementById('half-label');
const $timerDisplay = document.getElementById('timer-display');

const $viewToggle = document.getElementById('view-toggle');
const $btn2d = document.getElementById('btn-2d');
const $btn3d = document.getElementById('btn-3d');

const $flickPills = document.getElementById('flick-pills');
const $pills = $flickPills.querySelectorAll('.pill');

const $powerRing = document.getElementById('power-ring');
const $pwrBg = document.getElementById('pwr-bg');
const $pwrFg = document.getElementById('pwr-fg');

const $bottomBanner = document.getElementById('bottom-banner');
const $bannerDot = $bottomBanner.querySelector('.dot');
const $bannerText = document.getElementById('banner-text');

const $goalOverlay = document.getElementById('goal-overlay');
const $goalMeta = document.getElementById('goal-meta');
const $goalScore = document.getElementById('goal-score');
const $goalTeams = document.getElementById('goal-teams');

const $keeperUI = document.getElementById('keeper-ui');
const $keeperTrack = document.getElementById('keeper-track');
const $keeperThumb = document.getElementById('keeper-thumb');
const $keeperLabel = document.getElementById('keeper-label');

const $opponentBadge = document.getElementById('opponent-badge');

// ═══ STATE ═══
let currentState = 'your_turn'; // your_turn, flicking, shot_incoming, goal, opponent_turn
let flickCount = 3;
let power = 0;
let keeperPos = 50; // 0-100
let onViewToggle = null;
let keeperInputHandler = null;

// Current match teams
let homeTeam = getTeam(DEFAULT_MATCH.home);
let awayTeam = getTeam(DEFAULT_MATCH.away);

// ═══ TEAM SETUP ═══
export function setTeams(homeCode, awayCode) {
  homeTeam = getTeam(homeCode);
  awayTeam = getTeam(awayCode);
  
  // Update HUD
  $homeCode.textContent = homeTeam.shortName;
  $awayCode.textContent = awayTeam.shortName;
  $homeFlag.innerHTML = homeTeam.flag;
  $awayFlag.innerHTML = awayTeam.flag;
  
  console.log(`[UI] Teams set: ${homeTeam.name} vs ${awayTeam.name}`);
}

export function getHomeTeam() { return homeTeam; }
export function getAwayTeam() { return awayTeam; }

// Export TEAMS for external access
export { TEAMS };

// ═══ VIEW TOGGLE ═══
export function initViewToggle(callback) {
  onViewToggle = callback;
  $btn2d.addEventListener('click', () => {
    $btn2d.classList.add('active');
    $btn3d.classList.remove('active');
    if (onViewToggle) onViewToggle('2d');
  });
  $btn3d.addEventListener('click', () => {
    $btn3d.classList.add('active');
    $btn2d.classList.remove('active');
    if (onViewToggle) onViewToggle('3d');
  });
}

export function updateViewToggle(mode) {
  if (mode === '3d') {
    $btn3d.classList.add('active');
    $btn2d.classList.remove('active');
  } else {
    $btn2d.classList.add('active');
    $btn3d.classList.remove('active');
  }
}

// ═══ SCORE ═══
export function updateScore(home, away) {
  $homeScore.textContent = home;
  $awayScore.textContent = away;
}

// Legacy - now use setTeams()
export function setTeamCodes(home, away) {
  setTeams(home, away);
}

// ═══ TIMER ═══
export function updateTimer(secondsLeft, half) {
  const m = Math.floor(secondsLeft / 60);
  const s = Math.floor(secondsLeft % 60);
  $timerDisplay.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  $halfLabel.textContent = half === 1 ? '1T' : '2T';
}

// ═══ STATE MANAGEMENT ═══
export function setState(state) {
  currentState = state;
  updateBanner();
  updateKeeperState();
  
  // Show/hide opponent badge
  $opponentBadge.style.display = state === 'opponent_turn' ? 'flex' : 'none';
  
  // Goal overlay
  if (state === 'goal') {
    $goalOverlay.style.display = 'flex';
  }
}

export function hideGoal() {
  $goalOverlay.style.display = 'none';
}

// Legacy compatibility
export function setTurnLabel(text) {
  // Map legacy text to new state
  if (text.includes('seleziona') || text.includes('turno')) {
    setState('your_turn');
  } else if (text.includes('avversario') || text.includes('Opponent')) {
    setState('opponent_turn');
  }
}

export function setFlickHint(text) {
  // No longer used - power shown in banner
}

// ═══ FLICK PILLS ═══
export function setFlickCount(count) {
  flickCount = count;
  $pills.forEach((pill, i) => {
    pill.classList.toggle('active', i < count);
  });
}

export function showFlickPills(x, y) {
  $flickPills.style.display = 'flex';
  $flickPills.style.left = `${x - 22}px`;
  $flickPills.style.top = `${y - 38}px`;
}

export function hideFlickPills() {
  $flickPills.style.display = 'none';
}

// ═══ POWER RING ═══
export function showPowerRing(screenX, screenY) {
  $powerRing.style.display = 'block';
  $pwrBg.setAttribute('cx', screenX);
  $pwrBg.setAttribute('cy', screenY);
  $pwrFg.setAttribute('cx', screenX);
  $pwrFg.setAttribute('cy', screenY);
  $pwrFg.setAttribute('transform', `rotate(-90 ${screenX} ${screenY})`);
  setState('flicking');
}

export function updatePowerRing(pwr) {
  power = pwr;
  const circumference = 2 * Math.PI * 24;
  const dashLength = circumference * pwr;
  $pwrFg.setAttribute('stroke-dasharray', `${dashLength} ${circumference}`);
  updateBanner();
}

export function hidePowerRing() {
  $powerRing.style.display = 'none';
  setState('your_turn');
}

// ═══ BOTTOM BANNER ═══
function updateBanner() {
  const accent = getAccentColor();
  $bannerDot.style.background = accent;
  $bannerDot.style.boxShadow = `0 0 10px ${accent}`;
  
  // Pulse animation
  const shouldPulse = currentState === 'your_turn' || currentState === 'shot_incoming';
  $bannerDot.classList.toggle('pulse', shouldPulse);
  
  // Text content
  switch (currentState) {
    case 'your_turn':
      $bannerText.innerHTML = 'Il tuo turno — <span class="accent">tocca una pedina</span>';
      break;
    case 'flicking':
      $bannerText.innerHTML = `Trascina per direzionare <span class="divider"></span> <span class="power-pct">${Math.round(power * 100)}%</span>`;
      break;
    case 'shot_incoming':
      $bannerText.innerHTML = '<span style="color: var(--danger); font-weight: 700;">Tiro in porta — DIFENDI</span>';
      break;
    case 'opponent_turn':
      $bannerText.innerHTML = '<span style="color: rgba(255,255,255,0.82);">Turno avversario</span> <span class="divider"></span> <span class="latency">34ms</span>';
      break;
    case 'goal':
      $bannerText.innerHTML = `GOL di <span class="accent">${homeTeam.name}</span>`;
      break;
  }
}

function getAccentColor() {
  switch (currentState) {
    case 'shot_incoming': return 'var(--danger)';
    case 'opponent_turn': return 'var(--warn)';
    default: return 'var(--highlight)';
  }
}

// ═══ GOAL CARD ═══
export function showResult(text, duration = 1800) {
  // Parse legacy "GOL!" or similar
  if (text.toUpperCase().includes('GOL')) {
    setState('goal');
    // Update goal card with current score
    const homeScore = $homeScore.textContent;
    const awayScore = $awayScore.textContent;
    $goalScore.textContent = homeScore;
    $goalTeams.innerHTML = `${homeTeam.name} <span class="score-highlight">${homeScore}</span> – ${awayScore} ${awayTeam.name}`;
    
    setTimeout(() => {
      hideGoal();
      setState('your_turn');
    }, duration);
  }
}

export function showGoal(minute, half, homeScore, awayScore) {
  const halfText = half === 1 ? '1° TEMPO' : '2° TEMPO';
  $goalMeta.textContent = `${minute}' · ${halfText}`;
  $goalScore.textContent = homeScore;
  $goalTeams.innerHTML = `${homeTeam.name} <span class="score-highlight">${homeScore}</span> – ${awayScore} ${awayTeam.name}`;
  setState('goal');
}

// ═══ KEEPER SLIDER ═══
export function initKeeperSlider(onPosChange) {
  $keeperUI.style.display = 'flex';
  keeperPos = 50;
  updateKeeperThumbPosition();
  
  if (onPosChange) {
    keeperInputHandler = onPosChange;
  }
  
  // Touch/mouse drag on thumb
  let dragging = false;
  const trackRect = () => $keeperTrack.getBoundingClientRect();
  
  const onStart = (e) => {
    dragging = true;
    e.preventDefault();
  };
  
  const onMove = (e) => {
    if (!dragging) return;
    const rect = trackRect();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let pct = ((clientY - rect.top) / rect.height) * 100;
    pct = Math.max(0, Math.min(100, pct));
    keeperPos = pct;
    updateKeeperThumbPosition();
    if (keeperInputHandler) keeperInputHandler(pct);
  };
  
  const onEnd = () => {
    dragging = false;
  };
  
  $keeperThumb.addEventListener('mousedown', onStart);
  $keeperThumb.addEventListener('touchstart', onStart, { passive: false });
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);
}

function updateKeeperThumbPosition() {
  $keeperThumb.style.top = `${keeperPos}%`;
}

function updateKeeperState() {
  const isDefending = currentState === 'shot_incoming';
  $keeperUI.classList.toggle('defending', isDefending);
}

export function setKeeperSide(side) {
  $keeperUI.classList.remove('left', 'right');
  $keeperUI.classList.add(side);
}

export function getKeeperSliderPos() {
  return keeperPos;
}

// Legacy compatibility
export function showKeeperUI(onPosChange = null, defendingSide = 'right') {
  // Slider is always visible, just update state if needed
  if (onPosChange && !keeperInputHandler) {
    keeperInputHandler = onPosChange;
  }
}

export function hideKeeperUI() {
  // Slider is always visible, no-op
}

// ═══ INITIALIZATION ═══
// Set default teams on load
setTeams(DEFAULT_MATCH.home, DEFAULT_MATCH.away);
updateBanner();
