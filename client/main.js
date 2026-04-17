import * as THREE from 'three';
import { initScene, renderer, scene, getActiveCamera } from './game/scene.js';
import { buildPitch, FIELD } from './game/pitch.js';
import { buildFigures, figures, selectFigure, getFigureAt, getKeeper, FIG_R, initFigurePhysics, updateFigures, kickFigure, getFigureSpeed, clearFigures, setActiveTeam, moveKeeperToPosition } from './game/figures.js';
import { buildBall, updateBall, kickBall, placeBall, ballPos, ballVel, checkGoal, BALL_R, initBallPhysics, getBallBody } from './game/ball.js';
import { switchTo2D, switchTo3D, getMode } from './game/camera.js';
import { initInput, setCurrentFigure, getCurrentFigure } from './game/input.js';
import {
  updateScore, updateTimer, setTurnLabel, setFlickHint,
  showResult, showKeeperUI, hideKeeperUI, getKeeperSliderPos,
  initViewToggle, updateViewToggle, initKeeperSlider
} from './game/ui.js';
import { initPhysics, stepPhysics, createWall, WALL_TYPE, applyImpulse, setLinearVelocity, getSpeed, getCollisionEvents, getColliderData } from './game/physics.js';
import { computeBotMove, computeKeeperPosition, setDifficulty, getDifficulty } from './game/bot.js';

// ─── Game State (FISTF Rules V5.3) ─────────────────────────────────────────────

const state = {
  phase: 'kickoff',    // kickoff | playing | keeper_save | halftime | ended
  half: 1,
  secondsLeft: 120,    // 2 minutes per half
  score: { home: 0, away: 0 },
  possession: 'home',
  
  // FISTF Rule 5.2.1 — tracking consecutive touches
  currentFigure: null,       // ID of figure currently playing
  consecutiveTouches: 0,     // How many times this figure touched the ball (max 3)
  
  ballMoving: false,
  ballWasTouched: false,     // Track if ball was hit this turn
  ballPosAtFlick: { x: 0, z: 0 },  // Ball position when flick started
  selectedFigure: null,
  awaitingKeeperSave: false,
  
  // FISTF Rule 5.3: Foul tracking - hitting opponent before ball
  flickedFigureId: null,     // ID of the figure that was flicked
  opponentHitBeforeBall: false,  // Did we hit an opponent before touching the ball?
  
  // FISTF Rule 5.1.2b: Ball hitting stationary defender = change possession
  ballHitDefender: false,
  
  // PvE Mode
  gameMode: 'pve',           // 'pvp' | 'pve'
  botTeam: 'away',           // Which team the bot controls
  botThinking: false,        // Is bot currently computing move?
};

// Max consecutive touches per FISTF rules
const MAX_CONSECUTIVE_TOUCHES = 3;

// ─── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  console.log('[init] Starting...');
  initScene();
  console.log('[init] Scene done');
  buildPitch();
  console.log('[init] Pitch done');
  buildFigures();
  console.log('[init] Figures done (Subbuteo style)');
  buildBall();
  console.log('[init] Ball done (classic football pattern)');

  // Initialize Rapier physics
  console.log('[init] Loading Rapier...');
  await initPhysics();
  console.log('[init] Rapier loaded, creating physics bodies...');
  initBallPhysics();
  console.log('[init] Ball physics done');
  initFigurePhysics();
  console.log('[init] Figure physics done');
  createFieldWalls();
  console.log('[init] Walls done');

  placeBall(0, 0);
  switchTo2D();
  console.log('[init] Complete!');

  initInput({
    onSelect: (fig) => onFigureSelected(fig),
    onFlickRelease: ({ figure, vx, vz }) => onFlick(figure, vx, vz),
  });

  // View toggle button
  initViewToggle(() => {
    const mode = getMode();
    if (mode === '2d' && state.selectedFigure) {
      const fig = state.selectedFigure;
      switchTo3D(fig.position, ballPos);
      updateViewToggle('3d');
    } else if (mode === '3d') {
      switchTo2D();
      updateViewToggle('2d');
    }
  });

  // Keeper slider - always visible, controls home keeper in real-time
  initKeeperSlider((pos) => {
    moveKeeperToPosition('home', pos);
  });

  updateScore(0, 0);
  updateTimer(120, 1);
  setTurnLabel('HOME — seleziona una pedina');
  setFlickHint('Tap su una pedina tua per selezionarla');
  setActiveTeam(state.possession);

  // Start the game loop
  requestAnimationFrame(loop);
}

function createFieldWalls() {
  const hw = FIELD.W / 2;
  const hh = FIELD.H / 2;
  const thickness = 0.3;
  const goalW = FIELD.goalW / 2;
  const goalD = FIELD.goalD;

  // Top and bottom walls (full length)
  createWall(-hw, -hh, hw, -hh, thickness);
  createWall(-hw, hh, hw, hh, thickness);

  // Left wall (with goal gap)
  createWall(-hw, -hh, -hw, -goalW, thickness);
  createWall(-hw, goalW, -hw, hh, thickness);

  // Right wall (with goal gap)
  createWall(hw, -hh, hw, -goalW, thickness);
  createWall(hw, goalW, hw, hh, thickness);

  // Goal back walls (BALL ONLY)
  createWall(-hw - goalD, -goalW, -hw - goalD, goalW, thickness, WALL_TYPE.GOAL_BACK);
  createWall(hw + goalD, -goalW, hw + goalD, goalW, thickness, WALL_TYPE.GOAL_BACK);
  
  // Goal side walls (BALL ONLY)
  createWall(-hw - goalD, -goalW, -hw, -goalW, thickness, WALL_TYPE.GOAL_BACK);
  createWall(-hw - goalD, goalW, -hw, goalW, thickness, WALL_TYPE.GOAL_BACK);
  createWall(hw, -goalW, hw + goalD, -goalW, thickness, WALL_TYPE.GOAL_BACK);
  createWall(hw, goalW, hw + goalD, goalW, thickness, WALL_TYPE.GOAL_BACK);

  // Goal line barriers (FIGURES ONLY)
  createWall(-hw, -goalW, -hw, goalW, thickness, WALL_TYPE.GOAL_LINE);
  createWall(hw, -goalW, hw, goalW, thickness, WALL_TYPE.GOAL_LINE);
}

init().catch(err => {
  console.error('Init failed:', err);
  alert('Errore inizializzazione: ' + err.message);
});

// ─── Game Loop ─────────────────────────────────────────────────────────────────

let lastTime = null;
const HALF_DURATION = 120; // seconds

function loop(ts) {
  requestAnimationFrame(loop);

  const dt = lastTime ? Math.min((ts - lastTime) / 1000, 0.1) : 0;
  lastTime = ts;

  // Step physics
  stepPhysics(dt);

  // Update figure positions from physics
  updateFigures();

  // Check for fouls and ball touches during movement
  // Must keep checking until ball stops to catch all collision events
  // Also check when flickedFigureId is set (figure is in motion after impulse)
  if (state.ballMoving || state.flickedFigureId) {
    checkForFoul();
  }

  // Timer
  if (state.phase === 'playing' && !state.ballMoving && !state.awaitingKeeperSave) {
    state.secondsLeft -= dt;
    if (state.secondsLeft <= 0) {
      state.secondsLeft = 0;
      if (state.half === 1) {
        state.half = 2;
        state.secondsLeft = HALF_DURATION;
        state.possession = 'away';  // Away kicks off second half (FISTF Rule 4.1.1)
        showResult('Fine 1° tempo', 2500);
        setTimeout(() => kickoffReset(false), 2600);
      } else {
        state.phase = 'ended';
        const h = state.score.home, a = state.score.away;
        const result = h > a ? 'HOME VINCE!' : a > h ? 'AWAY VINCE!' : 'PAREGGIO!';
        showResult(result, 999999);
        setTurnLabel('Partita terminata');
      }
    }
    updateTimer(state.secondsLeft, state.half);
  }

  // Always update ball position from physics
  const { moving } = updateBall(dt);
  
  // Check goal
  if (state.phase !== 'goal') {
    const goal = checkGoal();
    if (goal) {
      state.phase = 'goal';
      onGoalScored(goal);
      return;
    }
  }

  // Ball physics - check if moving
  if (state.ballMoving) {
    // Check if ball was touched (moved from initial position)
    if (!state.ballWasTouched) {
      const dx = ballPos.x - state.ballPosAtFlick.x;
      const dz = ballPos.y - state.ballPosAtFlick.z;
      const distMoved = Math.sqrt(dx * dx + dz * dz);
      if (distMoved > 0.15) {
        state.ballWasTouched = true;
      }
    }

    // Check if ALL objects stopped (ball AND figures)
    let allStopped = !moving;
    if (allStopped) {
      figures.forEach(fig => {
        if (getFigureSpeed(fig) > 0.05) allStopped = false;
      });
    }

    if (allStopped) {
      state.ballMoving = false;
      afterBallStop();
    }
  }

  renderer.render(scene, getActiveCamera());
}

// ─── Foul Detection ─────────────────────────────────────────────────────────────

function checkForFoul() {
  const events = getCollisionEvents();
  
  // Log all collision events for debugging
  if (events.length > 0) {
    console.log('[checkForFoul] Events:', events.length, 'flickedFigureId:', state.flickedFigureId);
  }
  
  // FISTF Rules to detect:
  // 5.3.1: Foul - flicked figure hits stationary opponent BEFORE touching ball
  // 5.1.2b: Change possession - ball hits stationary defending figure
  
  let ballTouchedByFlickedFigure = false;
  let opponentHitByFlickedFigure = false;
  let ballHitStationaryDefender = false;
  
  for (const evt of events) {
    const data1 = getColliderData(evt.handle1);
    const data2 = getColliderData(evt.handle2);
    
    if (!data1 || !data2) {
      console.log('[checkForFoul] Missing collider data for handles:', evt.handle1, evt.handle2);
      continue;
    }
    
    const userData1 = data1.userData;
    const userData2 = data2.userData;
    
    console.log('[collision] Types:', userData1.type, 'vs', userData2.type, 
      '| IDs:', userData1.id || 'ball', 'vs', userData2.id || 'ball');
    
    // Check ball touch by flicked figure
    if ((userData1.type === 'ball' && userData2.type === 'figure') ||
        (userData2.type === 'ball' && userData1.type === 'figure')) {
      const figData = userData1.type === 'figure' ? userData1 : userData2;
      
      console.log('[collision] Ball touched figure:', figData.id, '| Flicked:', state.flickedFigureId);
      
      if (figData.id === state.flickedFigureId) {
        ballTouchedByFlickedFigure = true;
        console.log('[collision] ✓ Ball touched by FLICKED figure');
      } else if (figData.team !== state.possession) {
        // FISTF 5.1.2b: Ball hit a stationary defending figure → change possession
        ballHitStationaryDefender = true;
        console.log('[collision] ✓ Ball hit STATIONARY DEFENDER:', figData.id);
      }
    }
    
    // Check opponent collision by flicked figure (foul detection)
    if (userData1.type === 'figure' && userData2.type === 'figure') {
      const isFlickedFig1 = userData1.id === state.flickedFigureId;
      const isFlickedFig2 = userData2.id === state.flickedFigureId;
      
      console.log('[collision] Figure vs figure. Flicked?', isFlickedFig1 || isFlickedFig2);
      
      if (isFlickedFig1 || isFlickedFig2) {
        const flickedUserData = isFlickedFig1 ? userData1 : userData2;
        const otherUserData = isFlickedFig1 ? userData2 : userData1;
        
        console.log('[collision] Flicked team:', flickedUserData.team, '| Other team:', otherUserData.team);
        
        if (flickedUserData.team !== otherUserData.team) {
          opponentHitByFlickedFigure = true;
          console.log('[collision] ✓ FLICKED figure hit OPPONENT');
        }
      }
    }
  }
  
  // FISTF 5.3.1: Foul if flicked figure hits opponent BEFORE touching ball
  if (opponentHitByFlickedFigure && !state.ballWasTouched && !ballTouchedByFlickedFigure) {
    state.opponentHitBeforeBall = true;
    console.log('[foul] ★★★ FOUL DETECTED! Opponent hit before ball!');
  }
  
  // Update ball touched state
  if (ballTouchedByFlickedFigure) {
    state.ballWasTouched = true;
    console.log('[state] ballWasTouched = true');
  }
  
  // FISTF 5.1.2b: Ball hitting stationary defender = change possession
  if (ballHitStationaryDefender) {
    state.ballHitDefender = true;
    console.log('[state] ballHitDefender = true');
  }
}

// ─── Figure Selection ──────────────────────────────────────────────────────────

function onFigureSelected(fig) {
  if (state.phase !== 'playing' && state.phase !== 'kickoff') return;
  if (!fig) return;

  // Check if it's the player's figure
  const team = fig.userData.team;
  if (team !== state.possession) {
    showResult('Non è il tuo turno!', 800);
    return;
  }

  // KEEPER cannot be selected for flicking - only controlled via slider during opponent's turn
  if (fig.userData.isKeeper) {
    showResult('Il portiere si muove solo quando difendi!', 1000);
    return;
  }

  // Deselect if same figure tapped again
  if (state.selectedFigure === fig) {
    state.selectedFigure = null;
    selectFigure(null);
    setCurrentFigure(null);
    setFlickHint('Tap su una pedina tua per selezionarla');
    hideKeeperUI();  // Hide slider when deselecting
    switchTo2D();
    return;
  }

  // FISTF Rule 5.2.1: Check if this figure has exhausted its 3 consecutive touches
  if (state.currentFigure === fig.userData.id && state.consecutiveTouches >= MAX_CONSECUTIVE_TOUCHES) {
    showResult(`Max ${MAX_CONSECUTIVE_TOUCHES} tocchi! Scegli un'altra pedina`, 1200);
    return;
  }

  state.selectedFigure = fig;
  selectFigure(fig);
  setCurrentFigure(fig);
  
  // Show touch counter if continuing with same figure
  if (state.currentFigure === fig.userData.id && state.consecutiveTouches > 0) {
    setFlickHint(`Trascina per tirare (tocco ${state.consecutiveTouches + 1}/${MAX_CONSECUTIVE_TOUCHES})`);
  } else {
    setFlickHint('Trascina per tirare');
  }

  // Switch to 3D view
  if (state.phase === 'playing' || state.phase === 'kickoff') {
    switchTo3D(fig.position, ballPos);
  }
  
  // Show keeper slider for DEFENDING team - visible during attack preparation
  // HOME attacks RIGHT goal, AWAY attacks LEFT goal
  const sliderSide = state.possession === 'home' ? 'right' : 'left';
  showKeeperUI(null, sliderSide);  // No callback, just show for positioning
}

// ─── Flick Handler ─────────────────────────────────────────────────────────────

const IMPULSE_SCALE = 2.0;

function onFlick(figure, vx, vz) {
  if (state.phase !== 'playing' && state.phase !== 'kickoff') return;
  if (!figure) return;

  const speed = Math.sqrt(vx * vx + vz * vz);
  if (speed < 0.3) return; // Too weak

  // Track which figure is being used
  const figId = figure.userData.id;
  if (state.currentFigure !== figId) {
    // New figure, reset counter
    state.currentFigure = figId;
    state.consecutiveTouches = 0;
  }
  // Note: consecutiveTouches will be incremented in afterBallStop if ball was touched

  // Prepare state BEFORE impulse (but don't set ballMoving yet!)
  state.ballWasTouched = false;
  state.ballPosAtFlick = { x: ballPos.x, z: ballPos.y };
  state.flickedFigureId = figId;
  state.opponentHitBeforeBall = false;
  state.phase = 'playing';

  // UI cleanup
  switchTo2D();
  state.selectedFigure = null;
  selectFigure(null);
  setCurrentFigure(null);
  setFlickHint('');
  
  // Apply keeper position
  const defendingTeam = state.possession === 'home' ? 'away' : 'home';
  
  if (state.gameMode === 'pve' && defendingTeam === state.botTeam) {
    // Bot controls its keeper — AI decides position
    const botKeeperPos = computeKeeperPosition(defendingTeam);
    moveKeeperToPosition(defendingTeam, botKeeperPos);
  } else {
    // Player controls keeper via slider
    const keeperPos = getKeeperSliderPos();
    moveKeeperToPosition(defendingTeam, keeperPos);
  }
  hideKeeperUI();
  
  // Apply the impulse immediately
  const body = figure.userData.physicsBody;
  if (body) {
    const impulseX = vx * IMPULSE_SCALE;
    const impulseZ = vz * IMPULSE_SCALE;
    applyImpulse(body, impulseX, impulseZ);
    
    // Set ballMoving to enable collision detection
    state.ballMoving = true;
  }
}

// ─── Goal Scored ───────────────────────────────────────────────────────────────

function onGoalScored(side) {
  state.ballMoving = false;
  state.phase = 'goal';
  
  // Stop the ball immediately
  const ballBody = getBallBody();
  if (ballBody) {
    setLinearVelocity(ballBody, 0, 0);
  }

  if (side === 'right') {
    state.score.home++;
    showResult('GOAL HOME!', 2500);
  } else {
    state.score.away++;
    showResult('GOAL AWAY!', 2500);
  }

  updateScore(state.score.home, state.score.away);

  setTimeout(() => {
    // After goal, the conceding team kicks off (FISTF Rule 4.2.5)
    state.possession = side === 'right' ? 'away' : 'home';
    kickoffReset(false);
  }, 2600);
}

// ─── After Ball Stops ──────────────────────────────────────────────────────────

function afterBallStop() {
  if (state.phase === 'ended') return;

  // FISTF Rule 5.3.1: Foul - hitting opponent before touching the ball
  if (state.opponentHitBeforeBall && !state.ballWasTouched) {
    showResult('FALLO! Colpito avversario prima della palla', 1500);
    switchPossession();
    state.currentFigure = null;
    state.consecutiveTouches = 0;
    resetCollisionState();
    state.phase = 'playing';
    setTurnLabel(`${state.possession.toUpperCase()} — punizione`);
    return;
  }

  // FISTF Rule 5.1.2b: Ball hit a stationary defender = change possession
  if (state.ballHitDefender) {
    showResult('Cambio!', 800);
    switchPossession();
    state.currentFigure = null;
    state.consecutiveTouches = 0;
    resetCollisionState();
    state.phase = 'playing';
    setTurnLabel(`${state.possession.toUpperCase()} — seleziona una pedina`);
    return;
  }

  // FISTF Rule 5.1.2: Check if ball was touched
  if (state.ballWasTouched) {
    // Ball was touched — attacker keeps possession
    state.consecutiveTouches++;
    
    // Check if max touches reached for this figure
    if (state.consecutiveTouches >= MAX_CONSECUTIVE_TOUCHES) {
      setFlickHint(`${state.consecutiveTouches}/${MAX_CONSECUTIVE_TOUCHES} tocchi — scegli un'altra pedina`);
    } else {
      setFlickHint(`Tocco ${state.consecutiveTouches}/${MAX_CONSECUTIVE_TOUCHES} — continua o cambia pedina`);
    }
  } else {
    // FISTF Rule 5.1.2a: Figure missed the ball — change possession
    switchPossession();
    showResult('Mancato!', 800);
    // Reset figure tracking for new player
    state.currentFigure = null;
    state.consecutiveTouches = 0;
  }
  
  resetCollisionState();
  state.phase = 'playing';
  setTurnLabel(`${state.possession.toUpperCase()} — seleziona una pedina`);
  
  // If still bot's turn (ball was touched, keeps possession), trigger next move
  if (state.gameMode === 'pve' && state.possession === state.botTeam) {
    setTimeout(() => triggerBotMove(), 800);
  }
}

function resetCollisionState() {
  state.opponentHitBeforeBall = false;
  state.ballWasTouched = false;
  state.ballHitDefender = false;
}

// ─── Switch Possession ─────────────────────────────────────────────────────────

function switchPossession() {
  state.possession = state.possession === 'home' ? 'away' : 'home';
  state.currentFigure = null;
  state.consecutiveTouches = 0;
  setTurnLabel(`${state.possession.toUpperCase()} — seleziona una pedina`);
  setActiveTeam(state.possession);
  
  // Trigger bot if it's bot's turn
  if (state.gameMode === 'pve' && state.possession === state.botTeam) {
    triggerBotMove();
  }
}

// ─── Bot AI ─────────────────────────────────────────────────────────────────────

function triggerBotMove() {
  if (state.botThinking) return;
  if (state.phase !== 'playing' && state.phase !== 'kickoff') return;
  
  state.botThinking = true;
  setTurnLabel('BOT sta pensando...');
  setFlickHint('');
  
  // Compute bot's move
  const move = computeBotMove(
    state.botTeam,
    state.consecutiveTouches,
    state.currentFigure
  );
  
  // Delay to make it feel more natural
  setTimeout(() => {
    if (state.phase === 'ended') {
      state.botThinking = false;
      return;
    }
    
    // Select figure visually
    state.selectedFigure = move.figure;
    selectFigure(move.figure);
    setTurnLabel('BOT attacca!');
    
    // Switch to 3D briefly to show the action
    switchTo3D(move.figure.position, ballPos);
    
    // Execute flick after a short delay
    setTimeout(() => {
      // Execute the flick (player's keeper is controlled by slider, not AI)
      executeBotFlick(move.figure, move.vx, move.vz);
      state.botThinking = false;
    }, 800);
    
  }, move.delay);
}

function executeBotFlick(figure, vx, vz) {
  // Same logic as onFlick but for bot
  const speed = Math.sqrt(vx * vx + vz * vz);
  if (speed < 0.3) {
    // Too weak, try again
    state.botThinking = false;
    setTimeout(() => triggerBotMove(), 500);
    return;
  }
  
  const figId = figure.userData.id;
  if (state.currentFigure !== figId) {
    state.currentFigure = figId;
    state.consecutiveTouches = 0;
  }
  
  state.ballWasTouched = false;
  state.ballPosAtFlick = { x: ballPos.x, z: ballPos.y };
  state.flickedFigureId = figId;
  state.opponentHitBeforeBall = false;
  state.phase = 'playing';
  
  // UI cleanup
  switchTo2D();
  state.selectedFigure = null;
  selectFigure(null);
  setCurrentFigure(null);
  setFlickHint('');
  hideKeeperUI();
  
  // Apply the impulse
  const body = figure.userData.physicsBody;
  if (body) {
    const impulseX = vx * IMPULSE_SCALE;
    const impulseZ = vz * IMPULSE_SCALE;
    applyImpulse(body, impulseX, impulseZ);
    state.ballMoving = true;
  }
}

// ─── Kickoff Reset ─────────────────────────────────────────────────────────────

function kickoffReset(resetPossession = true) {
  placeBall(0, 0);
  switchTo2D();
  state.phase = 'kickoff';
  state.currentFigure = null;
  state.consecutiveTouches = 0;
  if (resetPossession) state.possession = 'home';

  selectFigure(null);
  setCurrentFigure(null);
  state.selectedFigure = null;
  setTurnLabel(`${state.possession.toUpperCase()} — seleziona una pedina (calcio d'inizio)`);
  setFlickHint('');

  // Reset figure positions
  clearFigures();
  buildFigures();
  initFigurePhysics();
  setActiveTeam(state.possession);
  updateScore(state.score.home, state.score.away);
  updateTimer(state.secondsLeft, state.half);
  
  // Trigger bot if it kicks off
  if (state.gameMode === 'pve' && state.possession === state.botTeam) {
    setTimeout(() => triggerBotMove(), 1500);
  }
}
