import * as THREE from 'three';
import { camera3D, setCamera, camera2D } from './scene.js';
import { FIG_H } from './figures.js';

let currentMode = '2d';
let transitionT = 0;
const TRANSITION_DURATION = 0.35; // seconds

let from3DPos = new THREE.Vector3();
let to3DPos   = new THREE.Vector3();
let from3DLook = new THREE.Vector3();
let to3DLook   = new THREE.Vector3();
let transitioning = false;

// Camera height control
let camHeightMultiplier = 1.0;
const MIN_HEIGHT_MULT = 0.5;
const MAX_HEIGHT_MULT = 3.0;

// Store current figure/ball for height adjustment
let currentFigurePos = null;
let currentBallPos = null;

export function getMode() { return currentMode; }

export function adjustCameraHeight(delta) {
  if (currentMode !== '3d') return null;
  
  const oldMult = camHeightMultiplier;
  camHeightMultiplier = Math.max(MIN_HEIGHT_MULT, Math.min(MAX_HEIGHT_MULT, camHeightMultiplier + delta));
  
  if (currentFigurePos && currentBallPos) {
    updateCamera3DPosition();
  }
  
  // Return 'max' if we hit the ceiling (for triggering 2D transition)
  if (oldMult >= MAX_HEIGHT_MULT && delta > 0) return 'max';
  if (oldMult <= MIN_HEIGHT_MULT && delta < 0) return 'min';
  return 'ok';
}

function updateCamera3DPosition() {
  const fx = currentFigurePos.x, fz = currentFigurePos.z;
  const bx = currentBallPos.x,   bz = currentBallPos.y;

  const dx = bx - fx, dz = bz - fz;
  const len = Math.sqrt(dx * dx + dz * dz) || 1;
  const nx = dx / len, nz = dz / len;

  const camDist = 2.5;  // 30% più vicino (era 3.5)
  const camHeight = (FIG_H + 0.3) * 2 * camHeightMultiplier;

  camera3D.position.set(fx - nx * camDist, camHeight, fz - nz * camDist);
  camera3D.lookAt(bx, 0, bz);
  camera3D.updateProjectionMatrix();
}

export function switchTo3D(figurePos, ballPos) {
  // Store for height adjustments
  currentFigurePos = figurePos;
  currentBallPos = ballPos;
  
  updateCamera3DPosition();

  setCamera(camera3D);
  currentMode = '3d';
}

export function switchTo2D() {
  setCamera(camera2D);
  currentMode = '2d';
}

export function update3DCamera(figurePos, ballPos) {
  if (currentMode !== '3d') return;
  // Keep camera fixed — no follow logic in 3D (as per spec)
}
