import * as THREE from 'three';
import { scene } from './scene.js';
import { FIELD } from './pitch.js';
import { createBallBody, getPosition, getVelocity, getSpeed, setLinearVelocity, setPosition, removeBody, registerCollider } from './physics.js';

// Ball diameter = dome diameter in real Subbuteo (~22mm)
// With FIG_R = 0.16 (dome radius), ball radius should be the same
export const BALL_R = 0.16;

let ballMesh;
let ballBody = null;

// Expose position/velocity as Vector2 for compatibility
export let ballPos = new THREE.Vector2(0, 0);
export let ballVel = new THREE.Vector2(0, 0);

const STOP_THRESHOLD = 0.05;

// Classic football (soccer ball) - Truncated Icosahedron
// 12 black pentagons + 20 white hexagons
const PANEL_WHITE = 0xffffff;
const PANEL_BLACK = 0x1a1a1a;

export function buildBall() {
  // Use IcosahedronGeometry with vertex colors for a clean soccer ball look
  const geometry = new THREE.IcosahedronGeometry(BALL_R, 5); // higher subdivision for crisp edges
  
  // Add vertex colors based on proximity to pentagon centers
  const colors = [];
  const posAttr = geometry.getAttribute('position');
  
  // Icosahedron vertex positions (the 12 pentagon centers)
  const phi = (1 + Math.sqrt(5)) / 2;
  const pentagonCenters = [
    [0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi],
    [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0],
    [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1]
  ].map(v => {
    const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    return new THREE.Vector3(v[0]/len, v[1]/len, v[2]/len);
  });
  
  // For each vertex, check if it's near a pentagon center
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);
    const pos = new THREE.Vector3(x, y, z).normalize();
    
    // Check distance to nearest pentagon center
    let minDist = Infinity;
    pentagonCenters.forEach(center => {
      const dist = pos.distanceTo(center);
      if (dist < minDist) minDist = dist;
    });
    
    // If close to a pentagon center, color black; else white
    // Threshold ~0.42 gives good pentagon coverage
    if (minDist < 0.42) {
      colors.push(0.1, 0.1, 0.1); // Black
    } else {
      colors.push(0.98, 0.98, 0.98); // White
    }
  }
  
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.35,
    metalness: 0.0,
  });
  
  const ball = new THREE.Mesh(geometry, material);
  ball.castShadow = true;
  ball.receiveShadow = true;
  ball.position.set(0, BALL_R, 0);
  
  scene.add(ball);
  ballMesh = ball;
  return ball;
}

// Expose ball collider handle for collision detection
let ballColliderHandle = null;
export function getBallColliderHandle() { return ballColliderHandle; }

export function initBallPhysics() {
  if (ballBody) {
    removeBody(ballBody);
  }
  const result = createBallBody(0, 0, BALL_R);
  ballBody = result.body;
  ballColliderHandle = result.collider.handle;
  
  // Register for collision detection
  registerCollider(result.collider, ballBody, { type: 'ball' });
}

export function getBallMesh() { return ballMesh; }
export function getBallBody() { return ballBody; }

export function kickBall(vx, vz) {
  if (ballBody) {
    setLinearVelocity(ballBody, vx, vz);
  }
}

export function placeBall(x, z) {
  if (ballBody) {
    setPosition(ballBody, x, z);
  }
  ballPos.set(x, z);
  ballVel.set(0, 0);
  syncMesh();
}

export function updateBall(dt) {
  if (!ballBody) return { moving: false };

  // Sync from physics
  const pos = getPosition(ballBody);
  const vel = getVelocity(ballBody);
  const speed = getSpeed(ballBody);

  ballPos.set(pos.x, pos.z);
  ballVel.set(vel.x, vel.z);

  // Spin the ball mesh visually based on velocity
  if (ballMesh && speed > STOP_THRESHOLD) {
    // Roll animation - rotate around the axis perpendicular to motion
    const rollSpeed = speed * dt * 5;
    ballMesh.rotation.z -= vel.x * dt * 5;
    ballMesh.rotation.x += vel.z * dt * 5;
  }

  syncMesh();
  
  return { moving: speed > STOP_THRESHOLD, wallHit: null };
}

function syncMesh() {
  if (ballMesh) {
    ballMesh.position.set(ballPos.x, BALL_R, ballPos.y);
  }
}

export function checkGoal() {
  const hw = FIELD.W / 2;  // 10
  const gW = FIELD.goalW / 2;  // 1.2

  // Goal if ball crosses the goal line (x beyond field edge) and is within goal width
  if (ballPos.x < -hw && Math.abs(ballPos.y) < gW) return 'left';
  if (ballPos.x > hw && Math.abs(ballPos.y) < gW) return 'right';
  return null;
}
