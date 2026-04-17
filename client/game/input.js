import * as THREE from 'three';
import { renderer, getActiveCamera, scene } from './scene.js';
import { figures, selectFigure, FIG_R } from './figures.js';
import { ballPos, kickBall, BALL_R } from './ball.js';
import { FIELD } from './pitch.js';
import { adjustCameraHeight, getMode, switchTo2D } from './camera.js';
import { adjustZoom, panCamera, getZoomLevel } from './scene.js';

let onFigureSelected = null;
let onFlick = null;

// Drag state
let dragging = false;
let dragStartX = 0, dragStartY = 0;
let currentFigure = null;
let dragMode = null; // 'select' | 'flick'

const FLICK_MAX_DRAG = 120;   // pixels (shorter drag = easier on mobile)
const FLICK_MAX_POWER = 20;   // world units/sec

const arrowCanvas = document.getElementById('arrow-canvas');
const arrowCtx = arrowCanvas.getContext('2d');

export function initInput({ onSelect, onFlickRelease }) {
  onFigureSelected = onSelect;
  onFlick = onFlickRelease;

  const el = renderer.domElement;

  // Mouse
  el.addEventListener('mousedown', onStart);
  el.addEventListener('mousemove', onMove);
  el.addEventListener('mouseup', onEnd);

  // Touch
  el.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      isPinching = true;
      lastPinchDist = getTouchDist(e);
      // Cancel any ongoing drag
      dragging = false;
      dragMode = null;
      clearArrow();
    } else if (!isPinching) {
      onStart(e.touches[0]);
    }
  }, { passive: true });
  el.addEventListener('touchmove',  e => {
    e.preventDefault();
    if (e.touches.length === 2) {
      isPinching = true;
      const dist = getTouchDist(e);
      if (lastPinchDist) {
        const delta = (lastPinchDist - dist) * 0.005;
        
        if (getMode() === '3d') {
          const result = adjustCameraHeight(delta);
          // If pinch-out beyond max, transition to 2D
          if (result === 'max' && delta < -0.01) {
            switchTo2D();
            isPinching = false;
            lastPinchDist = null;
          }
        } else {
          // 2D mode: pinch to zoom
          // pinch-in (delta > 0) = zoom out, pinch-out (delta < 0) = zoom in
          adjustZoom(-delta * 0.8);
        }
      }
      lastPinchDist = dist;
    } else if (!isPinching) {
      onMove(e.touches[0]);
    }
  }, { passive: false });
  el.addEventListener('touchend',   e => {
    // Only reset pinch if all fingers lifted
    if (e.touches.length === 0) {
      isPinching = false;
      lastPinchDist = null;
    }
    // Only fire onEnd if we weren't pinching
    if (!isPinching && e.changedTouches.length) {
      onEnd(e.changedTouches[0]);
    }
  });
  
  // Scroll wheel for camera height in 3D mode, zoom in 2D mode
  el.addEventListener('wheel', e => {
    e.preventDefault();
    if (getMode() === '3d') {
      adjustCameraHeight(e.deltaY > 0 ? 0.15 : -0.15);
    } else {
      // 2D mode: scroll to zoom
      adjustZoom(e.deltaY > 0 ? -0.15 : 0.15);
    }
  }, { passive: false });
}

let lastPinchDist = null;
let isPinching = false;  // Track if we're in pinch gesture

function getTouchDist(e) {
  const t = e.touches;
  const dx = t[0].clientX - t[1].clientX;
  const dy = t[0].clientY - t[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export function setCurrentFigure(fig) {
  currentFigure = fig;
}

export function getCurrentFigure() { return currentFigure; }

function getPointerNDC(evt) {
  const rect = renderer.domElement.getBoundingClientRect();
  return new THREE.Vector2(
    ((evt.clientX - rect.left) / rect.width) * 2 - 1,
    -((evt.clientY - rect.top) / rect.height) * 2 + 1
  );
}

function raycastFigures(ndc) {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(ndc, getActiveCamera());

  // Collect all meshes from figures
  const meshes = [];
  figures.forEach(fig => {
    fig.traverse(child => {
      if (child.isMesh && child !== fig.userData.selRing) meshes.push(child);
    });
  });

  const hits = raycaster.intersectObjects(meshes);
  if (!hits.length) return null;

  // Find parent figure group
  let obj = hits[0].object;
  while (obj.parent && !obj.userData.team) obj = obj.parent;
  return obj.userData.team ? obj : null;
}

let dragStartTime = 0;
let lastSelectionTime = 0;  // Cooldown after selection
const TAP_MAX_TIME = 250;    // ms — tap vs drag threshold
const TAP_MAX_DIST = 25;     // px — tap vs drag threshold (larger for mobile)
const SELECTION_COOLDOWN = 400; // ms — ignore taps right after selection (camera transition)

// Pan tracking
let lastPanX = 0;
let lastPanY = 0;

function onStart(evt) {
  // Ignore if we just selected (camera transitioning)
  if (performance.now() - lastSelectionTime < SELECTION_COOLDOWN) {
    dragging = false;
    return;
  }

  dragStartX = evt.clientX;
  dragStartY = evt.clientY;
  lastPanX = evt.clientX;
  lastPanY = evt.clientY;
  dragStartTime = performance.now();
  dragging = true;

  const ndc = getPointerNDC(evt);

  if (currentFigure) {
    // Figure selected — could be tap (to deselect/reselect) or drag (to flick)
    // We'll determine which on onEnd based on time/distance
    dragMode = 'flick';  // Assume flick, will check on release
  } else {
    // No figure selected — try to select one or pan
    dragMode = 'select';
    const hit = raycastFigures(ndc);
    if (hit) {
      // Let onFigureSelected validate (checks team, keeper, etc.)
      // It will call setCurrentFigure if selection is valid
      onFigureSelected && onFigureSelected(hit);
      lastSelectionTime = performance.now();  // Start cooldown
      dragMode = null;
      dragging = false;
    } else if (getMode() === '2d' && getZoomLevel() > 1.0) {
      // No figure hit and zoomed in — start pan
      dragMode = 'pan';
    }
  }
}

function onMove(evt) {
  if (!dragging) return;
  
  if (dragMode === 'flick') {
    drawArrow(evt.clientX, evt.clientY);
  } else if (dragMode === 'pan') {
    const deltaX = evt.clientX - lastPanX;
    const deltaY = evt.clientY - lastPanY;
    panCamera(deltaX, deltaY);
    lastPanX = evt.clientX;
    lastPanY = evt.clientY;
  }
}

function onEnd(evt) {
  if (!dragging) return;
  dragging = false;

  if (dragMode === 'flick' && currentFigure) {
    const dx = evt.clientX - dragStartX;
    const dy = evt.clientY - dragStartY;
    const dragLen = Math.sqrt(dx * dx + dy * dy);
    const elapsed = performance.now() - dragStartTime;

    clearArrow();

    // Check if this was a TAP (quick, no movement) vs a DRAG (flick)
    if (elapsed < TAP_MAX_TIME && dragLen < TAP_MAX_DIST) {
      // It's a tap — try to select another figure or deselect current
      const ndc = getPointerNDC(evt);
      const hit = raycastFigures(ndc);
      
      if (hit && hit.userData.id !== currentFigure.userData.id) {
        // Tapped on different figure — select it
        currentFigure = hit;
        selectFigure(currentFigure);
        onFigureSelected && onFigureSelected(currentFigure);
      } else {
        // Tapped on same figure or empty space — deselect
        currentFigure = null;
        selectFigure(null);
        onFigureSelected && onFigureSelected(null);
      }
      dragMode = null;
      return;
    }

    if (dragLen >= TAP_MAX_DIST) {
      // Drag direction = where we pulled TOWARD ball
      // Invert: pulling back means launching forward
      const power = Math.min(dragLen, FLICK_MAX_DRAG) / FLICK_MAX_DRAG * FLICK_MAX_POWER;

      // Map drag to world vector based on camera orientation
      // In 3D mode, camera is behind figure looking at ball
      // So we need to rotate drag vector to match figure→ball direction
      const figPos = currentFigure.position;
      
      // Direction figure → ball in world XZ plane
      const towardBallX = ballPos.x - figPos.x;
      const towardBallZ = ballPos.y - figPos.z;  // ballPos.y = world Z
      const towardLen = Math.sqrt(towardBallX * towardBallX + towardBallZ * towardBallZ) || 1;
      
      // Forward vector (toward ball)
      const fwdX = towardBallX / towardLen;
      const fwdZ = towardBallZ / towardLen;
      
      // Right vector (perpendicular, 90° clockwise)
      const rightX = fwdZ;
      const rightZ = -fwdX;
      
      // Screen mapping (fionda style: drag toward ball = pedina goes toward ball)
      // drag DOWN (dy > 0) → go FORWARD (toward ball)
      // drag RIGHT (dx > 0) → go LEFT
      const screenFwd = dy / dragLen;   // drag down = forward
      const screenRight = dx / dragLen; // drag right = left
      
      const vx = (screenFwd * fwdX + screenRight * rightX) * power;
      const vz = (screenFwd * fwdZ + screenRight * rightZ) * power;

      onFlick && onFlick({ figure: currentFigure, vx, vz });
    }
  }

  dragMode = null;
}

function drawArrow(mx, my) {
  clearArrow();
  if (!currentFigure) return;

  const ctx = arrowCtx;
  const w = arrowCanvas.width, h = arrowCanvas.height;

  // Project figure position to screen
  const figScreen = worldToScreen(currentFigure.position);

  // Direction of drag from start
  const ddx = mx - dragStartX;
  const ddy = my - dragStartY;
  const len = Math.sqrt(ddx * ddx + ddy * ddy);
  if (len < 4) return;

  // Arrow points from figure in the OPPOSITE direction of drag (that's where pedina will go)
  const frac = Math.min(len, FLICK_MAX_DRAG) / FLICK_MAX_DRAG;
  const arrowLen = frac * 120;
  const endX = figScreen.x - (ddx / len) * arrowLen;
  const endY = figScreen.y - (ddy / len) * arrowLen;

  // Power color: green → yellow → red
  const r = Math.round(frac * 255);
  const g = Math.round((1 - frac) * 255);
  const color = `rgb(${r},${g},0)`;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 4]);
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;

  ctx.beginPath();
  ctx.moveTo(figScreen.x, figScreen.y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Arrowhead
  const angle = Math.atan2(endY - figScreen.y, endX - figScreen.x);
  ctx.setLineDash([]);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - 12 * Math.cos(angle - 0.4), endY - 12 * Math.sin(angle - 0.4));
  ctx.lineTo(endX - 12 * Math.cos(angle + 0.4), endY - 12 * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();

  // === Ball trajectory preview ===
  // Calculate world direction (same logic as onEnd flick)
  const figPos = currentFigure.position;
  const towardBallX = ballPos.x - figPos.x;
  const towardBallZ = ballPos.y - figPos.z;
  const towardLen = Math.sqrt(towardBallX * towardBallX + towardBallZ * towardBallZ) || 1;
  
  const fwdX = towardBallX / towardLen;
  const fwdZ = towardBallZ / towardLen;
  const rightX = fwdZ;
  const rightZ = -fwdX;
  
  const screenFwd = ddy / len;
  const screenRight = ddx / len;
  
  // Direction the figure will move (normalized)
  const dirX = screenFwd * fwdX + screenRight * rightX;
  const dirZ = screenFwd * fwdZ + screenRight * rightZ;
  const dirLen = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
  const normDirX = dirX / dirLen;
  const normDirZ = dirZ / dirLen;

  const power = frac * FLICK_MAX_POWER;
  const figX = figPos.x;
  const figZ = figPos.z;
  const bx = ballPos.x;
  const bz = ballPos.y;
  
  // Combined radius for collision (figure + ball)
  const collisionRadius = FIG_R + BALL_R;
  
  // Check if trajectory hits ball
  const toBallX = bx - figX;
  const toBallZ = bz - figZ;
  const dot = toBallX * normDirX + toBallZ * normDirZ;
  const closestX = figX + dot * normDirX;
  const closestZ = figZ + dot * normDirZ;
  const distToBall = Math.sqrt((closestX - bx) ** 2 + (closestZ - bz) ** 2);
  
  const willHit = dot > 0 && distToBall < collisionRadius;
  
  if (willHit) {
    // Calculate where ball will go
    const halfChord = Math.sqrt(collisionRadius ** 2 - distToBall ** 2);
    const impactDist = dot - halfChord;
    const impactX = figX + impactDist * normDirX;
    const impactZ = figZ + impactDist * normDirZ;
    
    // Direction ball will travel (from impact point toward ball center)
    const impactToBallX = bx - impactX;
    const impactToBallZ = bz - impactZ;
    const impactToBallLen = Math.sqrt(impactToBallX ** 2 + impactToBallZ ** 2) || 1;
    const ballDirX = impactToBallX / impactToBallLen;
    const ballDirZ = impactToBallZ / impactToBallLen;
    
    const ballTravelDist = power * 0.8;
    const ballEndX = bx + ballDirX * ballTravelDist;
    const ballEndZ = bz + ballDirZ * ballTravelDist;
    
    // Draw ball trajectory (white dotted line from ball)
    const ballScreen = worldToScreen(new THREE.Vector3(bx, BALL_R, bz));
    const ballEndScreen = worldToScreen(new THREE.Vector3(ballEndX, BALL_R, ballEndZ));
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 4;
    
    ctx.beginPath();
    ctx.moveTo(ballScreen.x, ballScreen.y);
    ctx.lineTo(ballEndScreen.x, ballEndScreen.y);
    ctx.stroke();
    
    // Ball endpoint marker
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(ballEndScreen.x, ballEndScreen.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();
  }

  ctx.restore();
}

function clearArrow() {
  arrowCtx.clearRect(0, 0, arrowCanvas.width, arrowCanvas.height);
}

function worldToScreen(worldPos) {
  const cam = getActiveCamera();
  const v = worldPos.clone().project(cam);
  return {
    x: (v.x + 1) / 2 * arrowCanvas.width,
    y: (-v.y + 1) / 2 * arrowCanvas.height,
  };
}
