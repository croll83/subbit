import * as THREE from 'three';
import { scene } from './scene.js';
import { FIELD } from './pitch.js';
import { createFigureBody, getPosition, getVelocity, getSpeed, setLinearVelocity, setPosition, removeBody, registerCollider } from './physics.js';

// === AUTHENTIC SUBBUTEO PROPORTIONS ===
// Real Subbuteo: field ~140cm, dome ~22mm diameter
// Ratio: 140/2.2 = 64, so with FIELD.W=20: dome diameter = 20/64 ≈ 0.31
export const FIG_R = 0.16;        // Dome radius (diameter 0.32) - collision radius
export const FIG_H = 0.45;        // Total height including player
const KEEPER_R = 0.17;
const KEEPER_H = 0.50;

// Visual scale multiplier - makes figures easier to tap on mobile
// Physics collider stays at FIG_R, but visual mesh is scaled up
const VISUAL_SCALE = 1.5;

// Team colors (classic Subbuteo)
const TEAM_COLORS = {
  home: {
    jersey: 0xe74c3c,      // Red
    shorts: 0xffffff,      // White
    socks: 0xe74c3c,       // Red
    keeper: 0xf1c40f,      // Yellow keeper
  },
  away: {
    jersey: 0x2980b9,      // Blue
    shorts: 0x2c3e50,      // Dark blue
    socks: 0x2980b9,       // Blue
    keeper: 0x27ae60,      // Green keeper
  }
};

// Formation: 1-4-3-3 layout (11 players each)
const HOME_POSITIONS = [
  // Keeper
  { x: -9.0, z:  0.0, isKeeper: true },
  // Defenders
  { x: -6.5, z: -2.0 }, { x: -6.5, z: -0.7 },
  { x: -6.5, z:  0.7 }, { x: -6.5, z:  2.0 },
  // Midfielders
  { x: -3.5, z: -1.5 }, { x: -3.5, z:  0.0 }, { x: -3.5, z:  1.5 },
  // Forwards
  { x: -1.5, z: -2.2 }, { x: -1.5, z:  0.0 }, { x: -1.5, z:  2.2 },
];

const AWAY_POSITIONS = HOME_POSITIONS.map(p => ({ ...p, x: -p.x, z: -p.z }));

export let figures = [];
let figureBodies = new Map();

export function clearFigures() {
  figures.forEach(fig => {
    const body = fig.userData.physicsBody;
    if (body) {
      removeBody(body);
    }
    scene.remove(fig);
    fig.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  });
  figures = [];
  figureBodies.clear();
}

export function buildFigures() {
  clearFigures();

  HOME_POSITIONS.forEach((pos, i) => {
    const fig = createSubbuteoFigure('home', i, pos.x, pos.z, pos.isKeeper || false);
    figures.push(fig);
  });

  AWAY_POSITIONS.forEach((pos, i) => {
    const fig = createSubbuteoFigure('away', i, pos.x, pos.z, pos.isKeeper || false);
    figures.push(fig);
  });

  return figures;
}

export function initFigurePhysics() {
  figures.forEach(fig => {
    const r = fig.userData.isKeeper ? KEEPER_R : FIG_R;
    const { body, collider } = createFigureBody(fig.position.x, fig.position.z, r, false);
    figureBodies.set(fig.uuid, body);
    fig.userData.physicsBody = body;
    fig.userData.colliderHandle = collider.handle;
    
    // Register for collision detection
    registerCollider(collider, body, { 
      type: 'figure', 
      team: fig.userData.team,
      id: fig.userData.id,
      isKeeper: fig.userData.isKeeper
    });
  });
}

function createSubbuteoFigure(team, index, x, z, isKeeper) {
  const r = isKeeper ? KEEPER_R : FIG_R;
  const colors = TEAM_COLORS[team];
  const jerseyColor = isKeeper ? colors.keeper : colors.jersey;

  const group = new THREE.Group();

  // === AUTHENTIC SUBBUTEO BASE ===
  // Classic dome shape: hemisphere with flat top where player stands
  // The dome sits on the table with the rounded part DOWN, flat part UP
  
  // Dome is black/dark
  const baseMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a,
    roughness: 0.3,
    metalness: 0.1,
  });
  
  // Top cap is TEAM COLOR (visible from 2D top-down view)
  const capMat = new THREE.MeshStandardMaterial({ 
    color: jerseyColor,
    roughness: 0.4,
    metalness: 0.05,
  });
  
  // Hemisphere dome - curved part DOWN (touches ground), flat part UP
  const domeGeo = new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, baseMat);
  dome.rotation.x = Math.PI;  // Flip so curved part faces DOWN
  dome.position.y = r;        // Raise so bottom of curve touches y=0
  dome.castShadow = true;
  dome.receiveShadow = true;
  group.add(dome);
  
  // Flat cap on top of dome - TEAM COLOR for visibility in 2D
  const capGeo = new THREE.CircleGeometry(r * 0.95, 24);  // Slightly smaller to show black edge
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.rotation.x = -Math.PI / 2;  // Face up
  cap.position.y = r + 0.001;     // Just above dome
  group.add(cap);

  // === AUTHENTIC SUBBUTEO PLAYER FIGURE ===
  // Based on real Subbuteo miniatures: slender, curved body, stylized face with nose
  const baseTop = r;  // Player stands on top of the dome
  const s = r / 0.16;  // Scale factor (1.0 at default r=0.16)
  
  // Materials with glossy painted plastic look
  const skinMat = new THREE.MeshStandardMaterial({ 
    color: 0xdeb896,  // Warm skin tone
    roughness: 0.4,
    metalness: 0.05,
  });
  
  const jerseyMat = new THREE.MeshStandardMaterial({ 
    color: jerseyColor,
    roughness: 0.35,
    metalness: 0.05,
  });
  
  const shortsMat = new THREE.MeshStandardMaterial({ 
    color: colors.shorts,
    roughness: 0.4,
    metalness: 0.05,
  });
  
  const socksMat = new THREE.MeshStandardMaterial({ 
    color: colors.socks,
    roughness: 0.4,
    metalness: 0.05,
  });
  
  const bootsMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a,
    roughness: 0.3,
    metalness: 0.1,
  });
  
  const hairMat = new THREE.MeshStandardMaterial({ 
    color: isKeeper ? jerseyColor : 0x1a1008,  // Very dark brown/black hair
    roughness: 0.6,
    metalness: 0.05,
  });

  // --- LEGS (slender, curved using LatheGeometry) ---
  const legSpread = 0.022 * s;
  
  // Leg profile: ankle to hip (curved, slender)
  const legProfile = [
    new THREE.Vector2(0.010 * s, 0),           // Ankle
    new THREE.Vector2(0.012 * s, 0.015 * s),   // Lower calf
    new THREE.Vector2(0.014 * s, 0.035 * s),   // Mid calf (widest)
    new THREE.Vector2(0.012 * s, 0.055 * s),   // Upper calf
    new THREE.Vector2(0.010 * s, 0.070 * s),   // Knee
    new THREE.Vector2(0.013 * s, 0.090 * s),   // Lower thigh
    new THREE.Vector2(0.016 * s, 0.110 * s),   // Mid thigh
    new THREE.Vector2(0.014 * s, 0.125 * s),   // Upper thigh
  ];
  
  const bootH = 0.018 * s;
  const sockH = 0.045 * s;
  const legH = 0.125 * s;
  
  // Leg thickness reduced by 15%
  const legThick = 0.85;  // 85% of original
  
  [-1, 1].forEach(side => {
    const xOff = side * legSpread;
    
    // Boot (tapered cylinder) - 15% thinner
    const bootGeo = new THREE.CylinderGeometry(0.011 * s * legThick, 0.013 * s * legThick, bootH, 12);
    const boot = new THREE.Mesh(bootGeo, bootsMat);
    boot.position.set(xOff, baseTop + bootH/2, 0);
    boot.castShadow = true;
    group.add(boot);
    
    // Sock (slightly curved) - 15% thinner
    const sockGeo = new THREE.CylinderGeometry(0.010 * s * legThick, 0.012 * s * legThick, sockH, 12);
    const sock = new THREE.Mesh(sockGeo, socksMat);
    sock.position.set(xOff, baseTop + bootH + sockH/2, 0);
    sock.castShadow = true;
    group.add(sock);
    
    // Thigh/leg with LatheGeometry for natural curve - 15% thinner
    const thighProfile = [
      new THREE.Vector2(0.010 * s * legThick, 0),          // Knee
      new THREE.Vector2(0.014 * s * legThick, 0.020 * s),  // Lower thigh
      new THREE.Vector2(0.016 * s * legThick, 0.040 * s),  // Mid thigh (widest)
      new THREE.Vector2(0.015 * s * legThick, 0.055 * s),  // Upper thigh (wider to connect to shorts)
    ];
    const thighGeo = new THREE.LatheGeometry(thighProfile, 16);
    const thigh = new THREE.Mesh(thighGeo, skinMat);
    thigh.position.set(xOff, baseTop + bootH + sockH, 0);
    thigh.castShadow = true;
    group.add(thigh);
  });
  
  const legsTop = baseTop + bootH + sockH + 0.055 * s;

  // --- SHORTS (curved, athletic) - positioned to connect with thighs ---
  const shortsBottom = legsTop - 0.008 * s;  // Overlap slightly with thighs
  const shortsProfile = [
    new THREE.Vector2(0.020 * s, 0),           // Bottom (covers thigh tops)
    new THREE.Vector2(0.024 * s, 0.010 * s),   // Lower shorts
    new THREE.Vector2(0.026 * s, 0.022 * s),   // Mid (widest - hips)
    new THREE.Vector2(0.022 * s, 0.032 * s),   // Waist
  ];
  const shortsGeo = new THREE.LatheGeometry(shortsProfile, 16);
  const shorts = new THREE.Mesh(shortsGeo, shortsMat);
  shorts.position.y = shortsBottom;
  shorts.castShadow = true;
  group.add(shorts);
  
  const shortsTop = shortsBottom + 0.032 * s;

  // --- TORSO (slender, athletic, curved) ---
  const torsoProfile = [
    new THREE.Vector2(0.022 * s, 0),           // Waist
    new THREE.Vector2(0.024 * s, 0.020 * s),   // Lower torso
    new THREE.Vector2(0.028 * s, 0.045 * s),   // Chest (widest)
    new THREE.Vector2(0.030 * s, 0.060 * s),   // Upper chest/shoulders
    new THREE.Vector2(0.018 * s, 0.072 * s),   // Neck base
  ];
  const torsoGeo = new THREE.LatheGeometry(torsoProfile, 16);
  const torso = new THREE.Mesh(torsoGeo, jerseyMat);
  torso.position.y = shortsTop;
  torso.castShadow = true;
  group.add(torso);
  
  const torsoTop = shortsTop + 0.072 * s;
  const shoulderY = shortsTop + 0.060 * s;
  const shoulderWidth = 0.030 * s;

  // --- ARMS (hanging down along body, slightly outward) ---
  // Use simple cylinders for arms - more reliable than LatheGeometry for this
  const upperArmLen = 0.032 * s;
  const forearmLen = 0.030 * s;
  const armR = 0.006 * s;
  
  [-1, 1].forEach(side => {
    // Upper arm (jersey color) - attached at shoulder, angled outward
    const upperArmGeo = new THREE.CylinderGeometry(armR * 1.1, armR, upperArmLen, 8);
    const upperArm = new THREE.Mesh(upperArmGeo, jerseyMat);
    upperArm.position.set(
      side * (shoulderWidth + 0.005 * s), 
      shoulderY - upperArmLen/2, 
      0
    );
    upperArm.rotation.z = side * 0.2;  // Slight outward angle
    upperArm.castShadow = true;
    group.add(upperArm);
    
    // Forearm (skin color) - continues from upper arm
    const forearmGeo = new THREE.CylinderGeometry(armR * 0.9, armR * 0.7, forearmLen, 8);
    const forearm = new THREE.Mesh(forearmGeo, skinMat);
    const forearmX = side * (shoulderWidth + 0.005 * s + Math.sin(0.2) * upperArmLen);
    const forearmY = shoulderY - upperArmLen - forearmLen/2;
    forearm.position.set(forearmX, forearmY, 0);
    forearm.rotation.z = side * 0.15;  // Slight outward angle continues
    forearm.castShadow = true;
    group.add(forearm);
    
    // Hand (small sphere at end)
    const handGeo = new THREE.SphereGeometry(armR * 1.2, 8, 8);
    const hand = new THREE.Mesh(handGeo, skinMat);
    const handX = side * (shoulderWidth + 0.005 * s + Math.sin(0.2) * upperArmLen + Math.sin(0.15) * forearmLen);
    const handY = shoulderY - upperArmLen - forearmLen - armR;
    hand.position.set(handX, handY, 0);
    group.add(hand);
  });

  // --- NECK (short, connecting to head) ---
  const neckH = 0.012 * s;
  const neckGeo = new THREE.CylinderGeometry(0.012 * s, 0.016 * s, neckH, 12);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = torsoTop + neckH/2;
  group.add(neck);

  // --- HEAD (anatomical shape with skull morphology) ---
  const headH = 0.038 * s;
  const headW = 0.026 * s;
  
  // Main skull shape (slightly elongated sphere)
  const skullGeo = new THREE.SphereGeometry(headW, 20, 16);
  skullGeo.scale(1, 1.15, 1);  // Slightly taller than wide
  const skull = new THREE.Mesh(skullGeo, skinMat);
  skull.position.y = torsoTop + neckH + headW * 1.1;
  skull.castShadow = true;
  group.add(skull);
  
  // Nose (small protruding shape - stylized)
  const noseGeo = new THREE.ConeGeometry(0.004 * s, 0.012 * s, 6);
  const nose = new THREE.Mesh(noseGeo, skinMat);
  nose.position.set(0, torsoTop + neckH + headW * 0.95, headW * 0.85);
  nose.rotation.x = Math.PI / 2 + 0.3;  // Point forward and slightly down
  group.add(nose);
  
  // Ears (small bumps on sides)
  [-1, 1].forEach(side => {
    const earGeo = new THREE.SphereGeometry(0.005 * s, 6, 6);
    earGeo.scale(0.6, 1, 0.8);
    const ear = new THREE.Mesh(earGeo, skinMat);
    ear.position.set(side * headW * 0.95, torsoTop + neckH + headW * 1.0, 0);
    group.add(ear);
  });

  // --- HAIR (covers entire head like a helmet/cap) ---
  // Create hair as a slightly larger sphere that covers the skull
  const hairGeo = new THREE.SphereGeometry(headW * 1.08, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.75);
  hairGeo.scale(1, 1.12, 1);
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.y = torsoTop + neckH + headW * 1.15;
  hair.castShadow = true;
  group.add(hair);
  
  // Hair back/nape extension
  const hairBackGeo = new THREE.SphereGeometry(headW * 0.9, 12, 10);
  hairBackGeo.scale(1, 0.8, 0.6);
  const hairBack = new THREE.Mesh(hairBackGeo, hairMat);
  hairBack.position.set(0, torsoTop + neckH + headW * 0.85, -headW * 0.4);
  group.add(hairBack);

  // === GLOWING TEAM COLOR RING around dome edge ===
  const teamRingGeo = new THREE.TorusGeometry(r * 0.92, 0.012 * s, 8, 32);
  const teamRingMat = new THREE.MeshBasicMaterial({ 
    color: jerseyColor,
    transparent: true,
    opacity: 0.95,
  });
  const teamRing = new THREE.Mesh(teamRingGeo, teamRingMat);
  teamRing.rotation.x = Math.PI / 2;
  teamRing.position.y = r + 0.002;  // On top of the flat cap
  group.add(teamRing);

  // === SELECTION INDICATOR ===
  const selGeo = new THREE.RingGeometry(r * 1.3, r * 1.55, 24);
  const selMat = new THREE.MeshBasicMaterial({ 
    color: 0xffff00, 
    side: THREE.DoubleSide, 
    transparent: true, 
    opacity: 0.9 
  });
  const selRing = new THREE.Mesh(selGeo, selMat);
  selRing.rotation.x = -Math.PI / 2;
  selRing.position.y = 0.01;
  selRing.visible = false;
  group.add(selRing);

  group.position.set(x, 0, z);
  
  // Apply visual scale for easier tapping (physics stays at original size)
  group.scale.setScalar(VISUAL_SCALE);

  // Metadata
  group.userData = {
    team,
    index,
    isKeeper,
    id: `${team}_${index}`,
    selRing,
    physicsBody: null,
    // Store original colors for dimming
    jerseyColor,
  };

  scene.add(group);
  return group;
}

export function kickFigure(fig, vx, vz) {
  const body = fig.userData.physicsBody;
  if (body) {
    setLinearVelocity(body, vx, vz);
  }
}

export function getFigureBody(fig) {
  return fig.userData.physicsBody;
}

export function updateFigures() {
  figures.forEach(fig => {
    const body = fig.userData.physicsBody;
    if (body) {
      const pos = getPosition(body);
      fig.position.x = pos.x;
      fig.position.z = pos.z;
    }
  });
}

export function getFigureSpeed(fig) {
  const body = fig.userData.physicsBody;
  return body ? getSpeed(body) : 0;
}

export function selectFigure(fig) {
  figures.forEach(f => {
    f.userData.selRing.visible = false;
    // Reset glow
    f.traverse(child => {
      if (child.material && child.material.emissiveIntensity !== undefined) {
        child.material.emissiveIntensity = 0;
      }
    });
  });
  if (fig) {
    fig.userData.selRing.visible = true;
    // Add subtle glow to selected figure
    fig.traverse(child => {
      if (child.material && child.material.emissive) {
        child.material.emissive.setHex(0x444400);
        child.material.emissiveIntensity = 0.3;
      }
    });
  }
}

export function getFigureAt(team) {
  return figures.filter(f => f.userData.team === team);
}

export function getKeeper(team) {
  return figures.find(f => f.userData.team === team && f.userData.isKeeper);
}

// Move keeper along the goal line (left/right only)
// pos: 0-100 (slider value), 50 = center
export function moveKeeperToPosition(team, pos) {
  const keeper = getKeeper(team);
  if (!keeper) return;
  
  const goalW = FIELD.goalW / 2;
  const extraMargin = goalW * 0.05;  // 5% extra on each side
  const minZ = -goalW - extraMargin;
  const maxZ = goalW + extraMargin;
  
  // Normalize pos from 0-100 to 0-1
  const normalizedPos = pos / 100;
  
  // Interpolate Z position based on pos (0-1)
  const targetZ = minZ + normalizedPos * (maxZ - minZ);
  
  // Keeper stays at the same X (near the goal)
  const keeperX = team === 'home' ? -9.0 : 9.0;
  
  // Update physics body position
  const body = keeper.userData.physicsBody;
  if (body) {
    setPosition(body, keeperX, targetZ);
  }
  
  // Update mesh position
  keeper.position.x = keeperX;
  keeper.position.z = targetZ;
}

// Highlight active team, dim the other
export function setActiveTeam(activeTeam) {
  figures.forEach(fig => {
    const isActive = fig.userData.team === activeTeam;
    fig.traverse(child => {
      if (child.material && child.material.color && !child.userData.isSelectionRing) {
        // Store original color if not already stored
        if (child.userData.originalColor === undefined) {
          child.userData.originalColor = child.material.color.getHex();
        }
        if (isActive) {
          // Restore original color
          child.material.color.setHex(child.userData.originalColor);
          if (child.material.opacity !== undefined) {
            child.material.opacity = 1.0;
            child.material.transparent = false;
          }
        } else {
          // Dim: desaturate and darken
          const orig = child.userData.originalColor;
          const r = ((orig >> 16) & 0xff) / 255;
          const g = ((orig >> 8) & 0xff) / 255;
          const b = (orig & 0xff) / 255;
          // Mix with gray
          const gray = r * 0.3 + g * 0.5 + b * 0.2;
          const dimFactor = 0.4;
          child.material.color.setRGB(
            r * dimFactor + gray * (1 - dimFactor) * 0.5,
            g * dimFactor + gray * (1 - dimFactor) * 0.5,
            b * dimFactor + gray * (1 - dimFactor) * 0.5
          );
        }
      }
    });
  });
}
