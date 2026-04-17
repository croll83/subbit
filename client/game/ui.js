// HUD helpers

const $scoreDisplay = document.getElementById('score-display');
const $timerDisplay = document.getElementById('timer-display');
const $halfLabel  = document.getElementById('half-label');
const $turnLabel  = document.getElementById('turn-label');
const $flickHint  = document.getElementById('flick-hint');
const $keeperUI   = document.getElementById('keeper-ui');
const $keeperSlider = document.getElementById('keeper-slider');
const $resultOverlay = document.getElementById('result-overlay');
const $resultText    = document.getElementById('result-text');
const $viewToggle = document.getElementById('view-toggle');

// View toggle callback (set by main.js)
let onViewToggle = null;

export function initViewToggle(callback) {
  onViewToggle = callback;
  $viewToggle.addEventListener('click', () => {
    if (onViewToggle) onViewToggle();
  });
}

export function updateViewToggle(mode) {
  if (mode === '3d') {
    $viewToggle.textContent = '🗺️ 2D';
  } else {
    $viewToggle.textContent = '🔭 3D';
  }
}

export function updateScore(home, away) {
  $scoreDisplay.textContent = `HOME ${home} - ${away} AWAY`;
}

export function updateTimer(secondsLeft, half) {
  const m = Math.floor(secondsLeft / 60);
  const s = Math.floor(secondsLeft % 60);
  $timerDisplay.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  $halfLabel.textContent = half === 1 ? '1° tempo' : '2° tempo';
}

export function setTurnLabel(text) {
  $turnLabel.textContent = text;
}

export function setFlickHint(text) {
  $flickHint.textContent = text;
}

export function showResult(text, duration = 1800) {
  $resultText.textContent = text;
  $resultOverlay.style.display = 'flex';
  setTimeout(() => { $resultOverlay.style.display = 'none'; }, duration);
}

// Track keeper UI state
let keeperInputHandler = null;

// Get current slider position (0-100)
export function getKeeperSliderPos() {
  return parseInt($keeperSlider.value, 10);
}

// Initialize keeper slider - always visible, always controls home keeper
export function initKeeperSlider(onPosChange) {
  $keeperSlider.value = 50;
  $keeperUI.style.display = 'flex';
  
  // Real-time position updates
  if (onPosChange) {
    keeperInputHandler = () => {
      const pos = parseInt($keeperSlider.value, 10);
      onPosChange(pos);
    };
    $keeperSlider.addEventListener('input', keeperInputHandler);
  }
}

// Legacy functions for compatibility - now just return slider value
export function showKeeperUI(onPosChange = null, defendingSide = 'right') {
  // Slider is always visible, no-op
}

export function hideKeeperUI() {
  // Slider is always visible, no-op
}
