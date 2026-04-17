import * as THREE from 'three';
import { scene } from './scene.js';

// Field dimensions (in world units)
export const FIELD = {
  W: 20,   // width (x axis)
  H: 13,   // height (z axis)
  goalW: 2.4,
  goalD: 0.8,
  goalH: 1.2,
};

export function buildPitch() {
  // Grass base
  const grassGeo = new THREE.PlaneGeometry(FIELD.W, FIELD.H);
  const grassMat = new THREE.MeshLambertMaterial({ color: 0x2d7a27 });
  const grass = new THREE.Mesh(grassGeo, grassMat);
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  scene.add(grass);

  // Alternating stripes
  const stripeCount = 10;
  const stripeW = FIELD.W / stripeCount;
  const stripeMat = new THREE.MeshLambertMaterial({ color: 0x267020, transparent: true, opacity: 0.5 });
  for (let i = 0; i < stripeCount; i += 2) {
    const sg = new THREE.PlaneGeometry(stripeW, FIELD.H);
    const sm = new THREE.Mesh(sg, stripeMat);
    sm.rotation.x = -Math.PI / 2;
    sm.position.set(-FIELD.W / 2 + stripeW * i + stripeW / 2, 0.001, 0);
    scene.add(sm);
  }

  // Lines
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const lineH = 0.002;

  const addRect = (w, d, x, z) => {
    const g = new THREE.PlaneGeometry(w, d);
    const m = new THREE.Mesh(g, lineMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, lineH, z);
    scene.add(m);
  };

  const addLine = (x1, z1, x2, z2, thickness = 0.06) => {
    const dx = x2 - x1, dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const g = new THREE.PlaneGeometry(len, thickness);
    const m = new THREE.Mesh(g, lineMat);
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = -Math.atan2(dz, dx);
    m.position.set((x1 + x2) / 2, lineH, (z1 + z2) / 2);
    scene.add(m);
  };

  // Perimeter
  const hw = FIELD.W / 2, hh = FIELD.H / 2;
  addLine(-hw, -hh, hw, -hh);
  addLine(-hw,  hh, hw,  hh);
  addLine(-hw, -hh, -hw, hh);
  addLine( hw, -hh,  hw, hh);

  // Center line
  addLine(0, -hh, 0, hh);

  // Center circle
  const circlePoints = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    circlePoints.push(new THREE.Vector3(Math.cos(a) * 2.0, lineH, Math.sin(a) * 2.0));
  }
  const circleGeo = new THREE.BufferGeometry().setFromPoints(circlePoints);
  scene.add(new THREE.Line(circleGeo, new THREE.LineBasicMaterial({ color: 0xffffff })));

  // Center dot
  addRect(0.2, 0.2, 0, 0);

  // Penalty areas (left and right) — real football proportions
  // Width (along Z) ≈ 40m/68m = 59% of field height → 13 * 0.59 = 7.6
  // Depth (along X) ≈ 16.5m/105m = 16% of field width → 20 * 0.16 = 3.2
  const penW = 3.2, penD = 7.6;
  // Left penalty area
  addLine(-hw, -penD / 2, -hw + penW, -penD / 2);
  addLine(-hw,  penD / 2, -hw + penW,  penD / 2);
  addLine(-hw + penW, -penD / 2, -hw + penW, penD / 2);
  // Right penalty area
  addLine(hw, -penD / 2, hw - penW, -penD / 2);
  addLine(hw,  penD / 2, hw - penW,  penD / 2);
  addLine(hw - penW, -penD / 2, hw - penW, penD / 2);

  // Goal areas (6-yard box) — 5.5m deep, 18.3m wide → scaled
  const goalAreaW = 1.1, goalAreaD = 3.6;
  // Left goal area
  addLine(-hw, -goalAreaD / 2, -hw + goalAreaW, -goalAreaD / 2);
  addLine(-hw,  goalAreaD / 2, -hw + goalAreaW,  goalAreaD / 2);
  addLine(-hw + goalAreaW, -goalAreaD / 2, -hw + goalAreaW, goalAreaD / 2);
  // Right goal area
  addLine(hw, -goalAreaD / 2, hw - goalAreaW, -goalAreaD / 2);
  addLine(hw,  goalAreaD / 2, hw - goalAreaW,  goalAreaD / 2);
  addLine(hw - goalAreaW, -goalAreaD / 2, hw - goalAreaW, goalAreaD / 2);

  // Penalty spots
  addRect(0.12, 0.12, -hw + 2.2, 0);  // Left penalty spot
  addRect(0.12, 0.12,  hw - 2.2, 0);  // Right penalty spot

  // Penalty arcs (D outside the box)
  const arcRadius = 1.8;
  const penSpotX = 2.2;
  // Left arc (faces right, outside penalty area)
  const leftArcPoints = [];
  for (let i = 0; i <= 32; i++) {
    const a = -Math.PI / 3 + (i / 32) * (2 * Math.PI / 3);  // ~120° arc
    const px = -hw + penSpotX + Math.cos(a) * arcRadius;
    const pz = Math.sin(a) * arcRadius;
    if (px > -hw + penW) leftArcPoints.push(new THREE.Vector3(px, lineH, pz));
  }
  if (leftArcPoints.length > 1) {
    const leftArcGeo = new THREE.BufferGeometry().setFromPoints(leftArcPoints);
    scene.add(new THREE.Line(leftArcGeo, new THREE.LineBasicMaterial({ color: 0xffffff })));
  }
  // Right arc (faces left, outside penalty area)
  const rightArcPoints = [];
  for (let i = 0; i <= 32; i++) {
    const a = Math.PI - Math.PI / 3 + (i / 32) * (2 * Math.PI / 3);
    const px = hw - penSpotX + Math.cos(a) * arcRadius;
    const pz = Math.sin(a) * arcRadius;
    if (px < hw - penW) rightArcPoints.push(new THREE.Vector3(px, lineH, pz));
  }
  if (rightArcPoints.length > 1) {
    const rightArcGeo = new THREE.BufferGeometry().setFromPoints(rightArcPoints);
    scene.add(new THREE.Line(rightArcGeo, new THREE.LineBasicMaterial({ color: 0xffffff })));
  }

  // Corner arcs
  const cornerR = 0.5;
  const corners = [
    { x: -hw, z: -hh, startA: 0 },
    { x: -hw, z:  hh, startA: -Math.PI / 2 },
    { x:  hw, z: -hh, startA: Math.PI / 2 },
    { x:  hw, z:  hh, startA: Math.PI },
  ];
  corners.forEach(c => {
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const a = c.startA + (i / 16) * (Math.PI / 2);
      pts.push(new THREE.Vector3(c.x + Math.cos(a) * cornerR, lineH, c.z + Math.sin(a) * cornerR));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    scene.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff })));
  });

  // Corner flags
  const flagMat = new THREE.MeshLambertMaterial({ color: 0xffcc00 });
  const poleMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  corners.forEach(c => {
    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6);
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(c.x, 0.4, c.z);
    scene.add(pole);
    // Flag (small triangle)
    const flagGeo = new THREE.BufferGeometry();
    const verts = new Float32Array([
      0, 0, 0,
      0.25, -0.08, 0,
      0, -0.18, 0,
    ]);
    flagGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    flagGeo.computeVertexNormals();
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(c.x, 0.78, c.z);
    scene.add(flag);
  });

  // Goals (3D + 2D net representation)
  buildGoal(-hw, 0, false);
  buildGoal(hw, 0, true);
  
  // 2D net representation (visible from top-down view)
  build2DNet(-hw, 0, false);
  build2DNet(hw, 0, true);

  // Outer border / rim with logos
  buildBorderWithLogos();
}

function buildBorderWithLogos() {
  const borderWidth = 2; // width of border strip
  const hw = FIELD.W / 2;
  const hh = FIELD.H / 2;
  
  // Base brown plane (underneath)
  const baseGeo = new THREE.PlaneGeometry(FIELD.W + 4, FIELD.H + 4);
  const baseMat = new THREE.MeshLambertMaterial({ color: 0x8b6914 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.01;
  scene.add(base);
  
  // Create text textures
  const logoTexture = createTextTexture('SUBBIT', 'bold 120px Arial', '#FFFFFF', '#8b6914', 512, 128);
  const urlTexture = createTextTexture('www.subbit.app', '60px Arial', '#FFFFFF', '#8b6914', 512, 64);
  
  // Logo material
  const logoMat = new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true });
  const urlMat = new THREE.MeshBasicMaterial({ map: urlTexture, transparent: true });
  
  // Position offsets - logo at 20% from left edge, URL at 20% from right edge
  const borderOffset = 0.3; // distance from field edge
  const sideLength = FIELD.W; // horizontal sides
  const endLength = FIELD.H;  // vertical sides (left/right)
  
  // TOP SIDE (Z negative) - logo left, URL right
  const topLogo = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.6), logoMat);
  topLogo.rotation.x = -Math.PI / 2;
  topLogo.position.set(-hw * 0.6, 0.001, -hh - borderOffset);
  scene.add(topLogo);
  
  const topUrl = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.4), urlMat);
  topUrl.rotation.x = -Math.PI / 2;
  topUrl.position.set(hw * 0.6, 0.001, -hh - borderOffset);
  scene.add(topUrl);
  
  // BOTTOM SIDE (Z positive) - flipped 180°, logo left (appears right), URL right (appears left)
  const bottomLogo = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.6), logoMat);
  bottomLogo.rotation.x = -Math.PI / 2;
  bottomLogo.rotation.z = Math.PI;
  bottomLogo.position.set(hw * 0.6, 0.001, hh + borderOffset);
  scene.add(bottomLogo);
  
  const bottomUrl = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.4), urlMat);
  bottomUrl.rotation.x = -Math.PI / 2;
  bottomUrl.rotation.z = Math.PI;
  bottomUrl.position.set(-hw * 0.6, 0.001, hh + borderOffset);
  scene.add(bottomUrl);
  
  // LEFT SIDE (X negative) - rotated 90° CCW, logo at top, URL at bottom
  const leftLogo = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.6), logoMat);
  leftLogo.rotation.x = -Math.PI / 2;
  leftLogo.rotation.z = -Math.PI / 2;
  leftLogo.position.set(-hw - borderOffset, 0.001, -hh * 0.5);
  scene.add(leftLogo);
  
  const leftUrl = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.4), urlMat);
  leftUrl.rotation.x = -Math.PI / 2;
  leftUrl.rotation.z = -Math.PI / 2;
  leftUrl.position.set(-hw - borderOffset, 0.001, hh * 0.5);
  scene.add(leftUrl);
  
  // RIGHT SIDE (X positive) - rotated 90° CW, logo at top, URL at bottom
  const rightLogo = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.6), logoMat);
  rightLogo.rotation.x = -Math.PI / 2;
  rightLogo.rotation.z = Math.PI / 2;
  rightLogo.position.set(hw + borderOffset, 0.001, hh * 0.5);
  scene.add(rightLogo);
  
  const rightUrl = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.4), urlMat);
  rightUrl.rotation.x = -Math.PI / 2;
  rightUrl.rotation.z = Math.PI / 2;
  rightUrl.position.set(hw + borderOffset, 0.001, -hh * 0.5);
  scene.add(rightUrl);
}

function createTextTexture(text, font, textColor, bgColor, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Text
  ctx.fillStyle = textColor;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildGoal(x, z, isRight) {
  const mat = new THREE.MeshLambertMaterial({ color: 0xeeeeee, side: THREE.DoubleSide });
  const postR = 0.05;
  const hw2 = FIELD.goalW / 2;
  // Depth goes OUTSIDE the field (right goal → +X, left goal → -X)
  const depth = isRight ? FIELD.goalD : -FIELD.goalD;

  // Posts
  const postGeo = new THREE.CylinderGeometry(postR, postR, FIELD.goalH, 8);
  [-hw2, hw2].forEach(dz => {
    const post = new THREE.Mesh(postGeo, mat);
    post.position.set(x, FIELD.goalH / 2, z + dz);
    post.castShadow = true;
    scene.add(post);
  });

  // Crossbar
  const barGeo = new THREE.CylinderGeometry(postR, postR, FIELD.goalW, 8);
  const bar = new THREE.Mesh(barGeo, mat);
  bar.rotation.x = Math.PI / 2;
  bar.position.set(x, FIELD.goalH, z);
  bar.castShadow = true;
  scene.add(bar);

  // Net with grid pattern texture
  const netTexture = createNetTexture();
  const netMat = new THREE.MeshBasicMaterial({ 
    map: netTexture, 
    transparent: true, 
    side: THREE.DoubleSide,
    depthWrite: false
  });

  // Back net
  const netGeo = new THREE.PlaneGeometry(FIELD.goalW, FIELD.goalH);
  const net = new THREE.Mesh(netGeo, netMat);
  net.position.set(x + depth, FIELD.goalH / 2, z);
  net.rotation.y = Math.PI / 2;
  scene.add(net);

  // Side nets
  const sideGeo = new THREE.PlaneGeometry(FIELD.goalD, FIELD.goalH);
  [-hw2, hw2].forEach(dz => {
    const side = new THREE.Mesh(sideGeo, netMat);
    side.position.set(x + depth * 0.5, FIELD.goalH / 2, z + dz);
    side.rotation.y = 0;
    scene.add(side);
  });
  
  // Top net (roof of the goal)
  const topGeo = new THREE.PlaneGeometry(FIELD.goalD, FIELD.goalW);
  const topNet = new THREE.Mesh(topGeo, netMat);
  topNet.rotation.x = -Math.PI / 2;
  topNet.position.set(x + depth * 0.5, FIELD.goalH, z);
  scene.add(topNet);
}

function createNetTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Transparent background
  ctx.clearRect(0, 0, size, size);
  
  // Draw net pattern
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  
  const gridSize = 16; // cells
  const cellSize = size / gridSize;
  
  // Vertical lines
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, size);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(size, i * cellSize);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 3); // Repeat the pattern
  return texture;
}

// 2D net representation (flat on ground, visible from top-down)
function build2DNet(x, z, isRight) {
  const hw2 = FIELD.goalW / 2;
  const depth = isRight ? FIELD.goalD : -FIELD.goalD;
  
  // Create net texture for 2D view
  const netTexture = create2DNetTexture();
  const netMat = new THREE.MeshBasicMaterial({ 
    map: netTexture, 
    transparent: true,
    opacity: 0.6
  });
  
  // Flat rectangle behind the goal line
  const netGeo = new THREE.PlaneGeometry(FIELD.goalD, FIELD.goalW);
  const net = new THREE.Mesh(netGeo, netMat);
  net.rotation.x = -Math.PI / 2;
  net.position.set(x + depth * 0.5, 0.003, z); // slightly above ground
  scene.add(net);
}

function create2DNetTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Transparent background
  ctx.clearRect(0, 0, size, size);
  
  // Draw net grid pattern - only 3x3 cells for big visible mesh
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  
  const gridSize = 3;
  const cellSize = size / gridSize;
  
  for (let i = 0; i <= gridSize; i++) {
    // Vertical
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, size);
    ctx.stroke();
    // Horizontal
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(size, i * cellSize);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4); // repeat to fill the net area
  return texture;
}
