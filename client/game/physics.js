// Rapier 2D Physics Engine integration
// Uses rapier2d-compat bundle (ES module with embedded WASM)

import RAPIER, { init as initRapierWasm } from '../lib/rapier2d.js';

let rapierModule = null;
let world = null;

// Physics constants — tuned for mobile gameplay
// Field: 20 units wide, max shot should travel ~12 units (60%), figure alone ~5 units (25%)
// NOTE: After scaling pedine from r=0.28 to r=0.16, mass dropped ~70% (volume ∝ r³)
// Increased damping to compensate and maintain similar travel distances
const FRICTION = 0.6;
const RESTITUTION = 0.45; // Slightly less bouncy
const LINEAR_DAMPING = 12.0; // Doubled damping to compensate for smaller mass
const ANGULAR_DAMPING = 6.0;

// Collision groups (bitmask)
// Group 0x0001 = ball
// Group 0x0002 = figures  
// Group 0x0004 = field walls (collide with all)
// Group 0x0008 = goal back walls (collide with ball only)
// Group 0x0010 = goal line walls (collide with figures only)
const GROUP_BALL = 0x0001;
const GROUP_FIGURE = 0x0002;
const GROUP_FIELD_WALL = 0x0004;
const GROUP_GOAL_BACK = 0x0008;
const GROUP_GOAL_LINE = 0x0010;

export async function initPhysics() {
  console.log('[physics] Loading Rapier WASM...');
  await initRapierWasm();
  rapierModule = RAPIER;
  console.log('[physics] Rapier loaded, creating world...');
  
  // Zero gravity (top-down view)
  world = new RAPIER.World({ x: 0.0, y: 0.0 });
  console.log('[physics] World created');
  
  return world;
}

export function createBallBody(x, z, radius) {
  const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(x, z)
    .setLinearDamping(LINEAR_DAMPING)
    .setAngularDamping(ANGULAR_DAMPING)
    .setCcdEnabled(true); // Continuous collision detection
  
  const body = world.createRigidBody(bodyDesc);
  
  // Ball collides with: figures, field walls, goal back walls
  // ActiveEvents.COLLISION_EVENTS enables collision event reporting
  const colliderDesc = RAPIER.ColliderDesc.ball(radius)
    .setFriction(FRICTION)
    .setRestitution(RESTITUTION)
    .setDensity(1.0)
    .setCollisionGroups((GROUP_BALL << 16) | (GROUP_FIGURE | GROUP_FIELD_WALL | GROUP_GOAL_BACK))
    .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
  
  const collider = world.createCollider(colliderDesc, body);
  
  return { body, collider };
}

export function createFigureBody(x, z, radius, isKinematic = false) {
  // Figures are dynamic — physics-driven like billiard balls
  const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(x, z)
    .setLinearDamping(LINEAR_DAMPING * 2) // Figures slow down faster
    .setAngularDamping(ANGULAR_DAMPING)
    .setCcdEnabled(true);
  
  const body = world.createRigidBody(bodyDesc);
  
  // Figures collide with: ball, other figures, field walls, goal line walls
  // ActiveEvents.COLLISION_EVENTS enables collision event reporting for foul detection
  const colliderDesc = RAPIER.ColliderDesc.ball(radius)
    .setFriction(FRICTION)
    .setRestitution(RESTITUTION)
    .setDensity(3.0) // Heavier than ball
    .setCollisionGroups((GROUP_FIGURE << 16) | (GROUP_BALL | GROUP_FIGURE | GROUP_FIELD_WALL | GROUP_GOAL_LINE))
    .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
  
  const collider = world.createCollider(colliderDesc, body);
  
  return { body, collider };
}

// Wall types for collision filtering
export const WALL_TYPE = {
  FIELD: 'field',       // Collides with all (standard field boundary)
  GOAL_BACK: 'goalBack', // Only ball collides (back of goal)
  GOAL_LINE: 'goalLine', // Only figures collide (goal line barrier)
};

export function createWall(x1, z1, x2, z2, thickness = 0.1, wallType = WALL_TYPE.FIELD) {
  // Static wall (field boundary)
  const cx = (x1 + x2) / 2;
  const cz = (z1 + z2) / 2;
  const dx = x2 - x1;
  const dz = z2 - z1;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  
  const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(cx, cz);
  const body = world.createRigidBody(bodyDesc);
  
  // Set collision groups based on wall type
  let group, mask;
  if (wallType === WALL_TYPE.GOAL_BACK) {
    group = GROUP_GOAL_BACK;
    mask = GROUP_BALL; // Only ball collides
  } else if (wallType === WALL_TYPE.GOAL_LINE) {
    group = GROUP_GOAL_LINE;
    mask = GROUP_FIGURE; // Only figures collide
  } else {
    group = GROUP_FIELD_WALL;
    mask = GROUP_BALL | GROUP_FIGURE; // All collide
  }
  
  const colliderDesc = RAPIER.ColliderDesc.cuboid(length / 2, thickness / 2)
    .setRotation(angle)
    .setFriction(FRICTION)
    .setRestitution(RESTITUTION * 0.7) // Walls less bouncy
    .setCollisionGroups((group << 16) | mask);
  
  world.createCollider(colliderDesc, body);
  
  return body;
}

export function applyImpulse(body, vx, vz) {
  body.applyImpulse({ x: vx, y: vz }, true);
}

export function setLinearVelocity(body, vx, vz) {
  body.setLinvel({ x: vx, y: vz }, true);
}

export function setPosition(body, x, z) {
  body.setTranslation({ x, y: z }, true);
  body.setLinvel({ x: 0, y: 0 }, true);
  body.setAngvel(0, true);
}

export function getPosition(body) {
  const pos = body.translation();
  return { x: pos.x, z: pos.y };
}

export function getVelocity(body) {
  const vel = body.linvel();
  return { x: vel.x, z: vel.y };
}

export function getSpeed(body) {
  const vel = body.linvel();
  return Math.sqrt(vel.x * vel.x + vel.y * vel.y);
}

// Collision event queue
let eventQueue = null;

export function stepPhysics(dt) {
  if (!world) return;
  
  // Initialize event queue if needed
  if (!eventQueue) {
    eventQueue = new RAPIER.EventQueue(true);
  }
  
  world.step(eventQueue);
}

// Get collision events from last step
// Returns array of { handle1, handle2 } pairs for colliders that started touching
export function getCollisionEvents() {
  const events = [];
  if (!eventQueue) return events;
  
  eventQueue.drainCollisionEvents((handle1, handle2, started) => {
    if (started) {
      events.push({ handle1, handle2 });
    }
  });
  
  return events;
}

// Map collider handle to body (for identifying what collided)
const colliderToBody = new Map();

export function registerCollider(collider, body, userData) {
  colliderToBody.set(collider.handle, { body, userData });
}

export function getColliderData(handle) {
  return colliderToBody.get(handle);
}

export function getWorld() {
  return world;
}

export function removeBody(body) {
  if (world && body) {
    world.removeRigidBody(body);
  }
}
