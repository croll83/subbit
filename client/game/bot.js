// ─── Subbuteo AI Bot ─────────────────────────────────────────────────────────
// Simple but effective AI for PvE mode
// Evaluates board state and chooses best action

import { figures, FIG_R, getKeeper } from './figures.js';
import { ballPos, BALL_R } from './ball.js';
import { FIELD } from './pitch.js';

// AI difficulty settings
const DIFFICULTY = {
  easy: { accuracy: 0.6, reactionTime: 1500, powerVariance: 0.3 },
  medium: { accuracy: 0.8, reactionTime: 1000, powerVariance: 0.15 },
  hard: { accuracy: 0.95, reactionTime: 500, powerVariance: 0.05 },
};

let currentDifficulty = 'medium';

export function setDifficulty(level) {
  if (DIFFICULTY[level]) currentDifficulty = level;
}

export function getDifficulty() {
  return currentDifficulty;
}

// ─── Main AI Decision Function ──────────────────────────────────────────────

export function computeBotMove(team, consecutiveTouches, currentFigureId) {
  const settings = DIFFICULTY[currentDifficulty];
  
  // Get all figures for the bot's team (excluding keeper)
  const myFigures = figures.filter(f => 
    f.userData.team === team && !f.userData.isKeeper
  );
  
  // Get opponent figures for threat assessment
  const opponentFigures = figures.filter(f => 
    f.userData.team !== team
  );
  
  // Ball position in world coords
  const bx = ballPos.x;
  const bz = ballPos.y;
  
  // Goal we're attacking (away attacks left goal at x = -10)
  const targetGoalX = team === 'away' ? -FIELD.W / 2 : FIELD.W / 2;
  const targetGoalZ = 0;
  
  // ─── Select Best Figure ───────────────────────────────────────────────────
  
  let bestFigure = null;
  let bestScore = -Infinity;
  
  for (const fig of myFigures) {
    // Skip if this figure has used all 3 touches
    if (currentFigureId === fig.userData.id && consecutiveTouches >= 3) {
      continue;
    }
    
    const fx = fig.position.x;
    const fz = fig.position.z;
    
    // Distance to ball
    const distToBall = Math.sqrt((fx - bx) ** 2 + (fz - bz) ** 2);
    
    // Angle to goal through ball
    const angleToGoal = getAngleQuality(fx, fz, bx, bz, targetGoalX, targetGoalZ);
    
    // Check if path to ball is blocked by opponents
    const pathBlocked = isPathBlocked(fx, fz, bx, bz, opponentFigures);
    
    // Score this figure
    let score = 0;
    
    // Closer to ball is better (inverse distance)
    score += 10 / (distToBall + 0.5);
    
    // Better angle to goal is better
    score += angleToGoal * 5;
    
    // Penalize blocked paths
    if (pathBlocked) score -= 8;
    
    // Bonus for figures already in attacking position
    if ((team === 'away' && fx < bx) || (team === 'home' && fx > bx)) {
      score += 2;
    }
    
    // Bonus for continuing with same figure (momentum)
    if (currentFigureId === fig.userData.id && consecutiveTouches < 3) {
      score += 3;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestFigure = fig;
    }
  }
  
  if (!bestFigure) {
    // Fallback: pick closest figure to ball
    bestFigure = myFigures.reduce((best, fig) => {
      const dist = Math.sqrt(
        (fig.position.x - bx) ** 2 + (fig.position.z - bz) ** 2
      );
      if (!best || dist < best.dist) return { fig, dist };
      return best;
    }, null)?.fig || myFigures[0];
  }
  
  // ─── Calculate Flick Direction and Power ──────────────────────────────────
  
  const fx = bestFigure.position.x;
  const fz = bestFigure.position.z;
  
  // Primary target: shoot at goal if close enough, otherwise pass/advance
  const distToGoal = Math.sqrt((bx - targetGoalX) ** 2 + (bz - targetGoalZ) ** 2);
  const distToBall = Math.sqrt((fx - bx) ** 2 + (fz - bz) ** 2);
  
  let targetX, targetZ, power;
  
  if (distToGoal < 6) {
    // Close to goal — SHOOT!
    targetX = targetGoalX;
    targetZ = targetGoalZ + (Math.random() - 0.5) * FIELD.goalW * 0.6; // Aim within goal
    power = 0.85 + Math.random() * 0.15; // High power for shot
  } else if (distToGoal < 12) {
    // Mid-range — advance toward goal
    targetX = targetGoalX;
    targetZ = bz * 0.5; // Drift toward center
    power = 0.6 + Math.random() * 0.2;
  } else {
    // Far from goal — pass forward or dribble
    const advanceX = team === 'away' ? bx - 3 : bx + 3;
    targetX = advanceX;
    targetZ = bz + (Math.random() - 0.5) * 2;
    power = 0.4 + Math.random() * 0.3;
  }
  
  // Calculate direction: figure must move TOWARD the ball
  // The ball will then continue in roughly the same direction
  const toBallX = bx - fx;
  const toBallZ = bz - fz;
  const toBallLen = Math.sqrt(toBallX ** 2 + toBallZ ** 2) || 1;
  
  // Normalize direction to ball
  const dirX = toBallX / toBallLen;
  const dirZ = toBallZ / toBallLen;
  
  // Velocity: figure moves toward ball
  let vx = dirX * power * 20; // Max power ~20
  let vz = dirZ * power * 20;
  
  // Apply accuracy variance based on difficulty
  const accuracyFactor = settings.accuracy + (Math.random() - 0.5) * (1 - settings.accuracy);
  const powerFactor = 1 + (Math.random() - 0.5) * settings.powerVariance * 2;
  
  // Add some randomness to direction (less accurate = more random)
  const angleNoise = (1 - settings.accuracy) * Math.PI * 0.3 * (Math.random() - 0.5);
  const cos = Math.cos(angleNoise);
  const sin = Math.sin(angleNoise);
  const vxNoisy = vx * cos - vz * sin;
  const vzNoisy = vx * sin + vz * cos;
  
  vx = vxNoisy * powerFactor;
  vz = vzNoisy * powerFactor;
  
  return {
    figure: bestFigure,
    vx,
    vz,
    delay: settings.reactionTime + Math.random() * 500,
  };
}

// ─── Keeper AI ──────────────────────────────────────────────────────────────

export function computeKeeperPosition(team) {
  const settings = DIFFICULTY[currentDifficulty];
  
  // Predict where ball is heading based on current position
  // Simple: position keeper in line with ball's Z position
  const bz = ballPos.y;
  
  // Normalize to 0-100 range for slider
  // Goal spans from -goalW/2 to +goalW/2 in Z
  const halfGoal = FIELD.goalW / 2;
  
  // Clamp ball Z to goal range
  const clampedZ = Math.max(-halfGoal, Math.min(halfGoal, bz));
  
  // Convert to 0-100 (0 = bottom of goal, 100 = top)
  let sliderPos = ((clampedZ + halfGoal) / FIELD.goalW) * 100;
  
  // Add some reaction imperfection based on difficulty
  const noise = (1 - settings.accuracy) * 30 * (Math.random() - 0.5);
  sliderPos = Math.max(0, Math.min(100, sliderPos + noise));
  
  return sliderPos;
}

// ─── Helper Functions ───────────────────────────────────────────────────────

function getAngleQuality(fx, fz, bx, bz, gx, gz) {
  // How good is the angle from figure through ball to goal?
  // Returns 0-1 (1 = perfect straight line)
  
  const toBallX = bx - fx;
  const toBallZ = bz - fz;
  const toBallLen = Math.sqrt(toBallX ** 2 + toBallZ ** 2) || 1;
  
  const toGoalX = gx - bx;
  const toGoalZ = gz - bz;
  const toGoalLen = Math.sqrt(toGoalX ** 2 + toGoalZ ** 2) || 1;
  
  // Dot product of normalized vectors
  const dot = (toBallX / toBallLen) * (toGoalX / toGoalLen) + 
              (toBallZ / toBallLen) * (toGoalZ / toGoalLen);
  
  // dot = 1 means perfect alignment, -1 means opposite direction
  return Math.max(0, dot);
}

function isPathBlocked(fx, fz, bx, bz, opponents) {
  // Check if any opponent is between figure and ball
  const dx = bx - fx;
  const dz = bz - fz;
  const dist = Math.sqrt(dx * dx + dz * dz);
  
  if (dist < 0.1) return false;
  
  const dirX = dx / dist;
  const dirZ = dz / dist;
  
  for (const opp of opponents) {
    const ox = opp.position.x;
    const oz = opp.position.z;
    
    // Vector from figure to opponent
    const toOppX = ox - fx;
    const toOppZ = oz - fz;
    
    // Project onto direction
    const proj = toOppX * dirX + toOppZ * dirZ;
    
    // Only check if opponent is between figure and ball
    if (proj < 0 || proj > dist) continue;
    
    // Perpendicular distance to line
    const perpX = toOppX - proj * dirX;
    const perpZ = toOppZ - proj * dirZ;
    const perpDist = Math.sqrt(perpX * perpX + perpZ * perpZ);
    
    // If opponent is within collision range of path
    if (perpDist < FIG_R * 2 + 0.1) {
      return true;
    }
  }
  
  return false;
}
