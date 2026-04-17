import * as THREE from 'three';

export let renderer, scene, camera2D, camera3D, activeCamera;

// Field dimensions (must match pitch.js)
const FIELD_W = 20;
const FIELD_H = 13;
const PADDING = 1.5; // Extra space around field

function calcCameraBounds(screenW, screenH) {
  // Calculate the view size needed to fit the field with padding
  const viewW = FIELD_W + PADDING * 2;
  const viewH = FIELD_H + PADDING * 2;
  
  // Screen aspect ratio
  const screenAspect = screenW / screenH;
  // Field aspect ratio
  const fieldAspect = viewW / viewH;
  
  let halfW, halfH;
  
  if (screenAspect > fieldAspect) {
    // Screen is wider than field — fit by height
    halfH = viewH / 2;
    halfW = halfH * screenAspect;
  } else {
    // Screen is taller than field — fit by width
    halfW = viewW / 2;
    halfH = halfW / screenAspect;
  }
  
  return { halfW, halfH };
}

export function initScene() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  scene.fog = new THREE.Fog(0x1a1a2e, 30, 80);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('canvas-container').prepend(renderer.domElement);

  // Also resize arrow canvas
  const arrowCanvas = document.getElementById('arrow-canvas');
  arrowCanvas.width = W;
  arrowCanvas.height = H;

  // Cameras - fit field to screen
  const { halfW, halfH } = calcCameraBounds(W, H);
  camera2D = new THREE.OrthographicCamera(
    -halfW, halfW,
    halfH, -halfH,
    0.1, 200
  );
  camera2D.position.set(0, 25, 0);
  camera2D.lookAt(0, 0, 0);
  camera2D.up.set(0, 0, -1);

  camera3D = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);

  activeCamera = camera2D;

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xfff5e0, 1.2);
  sun.position.set(5, 20, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 60;
  sun.shadow.camera.left = -15;
  sun.shadow.camera.right = 15;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -12;
  sun.shadow.bias = -0.001;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xc8e8ff, 0.4);
  fill.position.set(-5, 10, -10);
  scene.add(fill);

  // Resize handler
  window.addEventListener('resize', onResize);

  return { renderer, scene, camera2D, camera3D };
}

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  
  renderer.setSize(w, h);
  
  const arrowCanvas = document.getElementById('arrow-canvas');
  arrowCanvas.width = w;
  arrowCanvas.height = h;

  const { halfW, halfH } = calcCameraBounds(w, h);
  camera2D.left   = -halfW;
  camera2D.right  =  halfW;
  camera2D.top    =  halfH;
  camera2D.bottom = -halfH;
  camera2D.updateProjectionMatrix();

  camera3D.aspect = w / h;
  camera3D.updateProjectionMatrix();
}

export function setCamera(cam) {
  activeCamera = cam;
}

export function getActiveCamera() {
  return activeCamera;
}

// === 2D CAMERA ZOOM & PAN ===
let zoomLevel = 1.0;  // 1.0 = fit whole field, 2.0 = 2x zoom, etc.
const MIN_ZOOM = 1.0;
const MAX_ZOOM = 3.0;

// Pan offset (world units)
let panX = 0;
let panZ = 0;

export function getZoomLevel() { return zoomLevel; }

export function setZoom(level) {
  zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level));
  applyZoom();
}

export function adjustZoom(delta) {
  setZoom(zoomLevel + delta);
}

// Pan the 2D camera by screen pixels
export function panCamera(deltaScreenX, deltaScreenY) {
  if (zoomLevel <= 1.0) return; // No pan at default zoom
  
  const w = window.innerWidth;
  const h = window.innerHeight;
  const { halfW, halfH } = calcCameraBounds(w, h);
  
  // Convert screen pixels to world units
  const viewW = (halfW * 2) / zoomLevel;
  const viewH = (halfH * 2) / zoomLevel;
  const worldPerPixelX = viewW / w;
  const worldPerPixelZ = viewH / h;
  
  panX -= deltaScreenX * worldPerPixelX;
  panZ -= deltaScreenY * worldPerPixelZ;
  
  // Clamp pan to keep field visible
  const maxPanX = (FIELD_W / 2) * (1 - 1 / zoomLevel);
  const maxPanZ = (FIELD_H / 2) * (1 - 1 / zoomLevel);
  panX = Math.max(-maxPanX, Math.min(maxPanX, panX));
  panZ = Math.max(-maxPanZ, Math.min(maxPanZ, panZ));
  
  applyZoom();
}

export function resetPan() {
  panX = 0;
  panZ = 0;
  applyZoom();
}

function applyZoom() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const { halfW, halfH } = calcCameraBounds(w, h);
  
  // Apply zoom — divide by zoomLevel to zoom in
  const zoomedHalfW = halfW / zoomLevel;
  const zoomedHalfH = halfH / zoomLevel;
  
  camera2D.left   = -zoomedHalfW + panX;
  camera2D.right  =  zoomedHalfW + panX;
  camera2D.top    =  zoomedHalfH + panZ;
  camera2D.bottom = -zoomedHalfH + panZ;
  camera2D.updateProjectionMatrix();
}
