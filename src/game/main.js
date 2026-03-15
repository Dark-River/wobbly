import { createWorld, getStructureBodies, getBallBodies, stepWorld, applyContactDamping } from './physics.js';
import { initRenderer, render, toWorld } from './renderer.js';
import { loadPuzzle, createStructureFromPuzzle, settleAndReadback } from '../shared/puzzle-loader.js';
import { getLauncherState, setAnchor, startDrag, updateDrag, releaseDrag } from './launcher.js';
import { getState, setState, STATES, advanceShot, setRoundOver, resetState } from './state.js';
import {
  SETTLE_VELOCITY_THRESHOLD,
  SETTLE_FRAMES,
  GROUND_Y,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_MARGIN_PX,
  SCALE,
  BALL_RADIUS,
} from '../shared/constants.js';

const canvas = document.getElementById('game-canvas');
initRenderer(canvas);

let currentPuzzle = null;
let quietFrames = 0; // frames where all bodies are below velocity threshold
let flightFrames = 0; // total frames since ball launched (settling timeout)
let currentBall = null; // the most recently launched ball

// Store initial structure positions after settlement, for topple detection
let initialStructurePositions = [];

async function init() {
  currentPuzzle = await loadPuzzle('/puzzles/tutorial.json');
  loadLevel();

  // Mouse events
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);

  loop();
}

function loadLevel() {
  createWorld();
  createStructureFromPuzzle(currentPuzzle);
  settleAndReadback(currentPuzzle);

  // Record settled positions for topple detection
  initialStructurePositions = getStructureBodies().map(body => ({
    x: body.getPosition().x,
    y: body.getPosition().y,
  }));

  setAnchor(currentPuzzle.launcher.x, currentPuzzle.launcher.y);
  currentBall = null;
  quietFrames = 0;
}

function getWorldPos(e) {
  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  return toWorld(cx, cy);
}

function onMouseDown(e) {
  const state = getState();

  // Handle retry/restart clicks
  if (state.current === STATES.ROUND_OVER || state.current === STATES.WIN) {
    resetState();
    loadLevel();
    return;
  }

  if (state.current !== STATES.AIMING) return;

  const pos = getWorldPos(e);
  startDrag(pos.x, pos.y);
}

function onMouseMove(e) {
  if (getState().current !== STATES.AIMING) return;
  const pos = getWorldPos(e);
  updateDrag(pos.x, pos.y);
}

function onMouseUp(e) {
  const state = getState();
  if (state.current !== STATES.AIMING) return;

  const ball = releaseDrag();
  if (ball) {
    currentBall = ball;
    quietFrames = 0;
    flightFrames = 0;
    setState(STATES.FLYING);
  }
}

function getMaxBodySpeed() {
  let maxSpeed = 0;
  for (const body of getStructureBodies()) {
    const v = body.getLinearVelocity();
    const speed = Math.sqrt(v.x * v.x + v.y * v.y);
    if (speed > maxSpeed) maxSpeed = speed;
  }
  for (const body of getBallBodies()) {
    const v = body.getLinearVelocity();
    const speed = Math.sqrt(v.x * v.x + v.y * v.y);
    if (speed > maxSpeed) maxSpeed = speed;
  }
  return maxSpeed;
}

function checkTopple() {
  const bodies = getStructureBodies();
  for (let i = 0; i < bodies.length; i++) {
    const pos = bodies[i].getPosition();
    const initial = initialStructurePositions[i];
    // Fell below ground
    if (pos.y < GROUND_Y - 0.5) return true;
    // Upper piece (wall/slab2/pillar) fell to ground level
    // Ground-level pieces (blocks, base slab) have initial y < 1.0 and are excluded
    if (initial.y > 1.0 && pos.y < 0.5) return true;
  }
  return false;
}

function checkBallOffScreen() {
  if (!currentBall) return false;
  const pos = currentBall.getPosition();
  const worldHalfWidth = CANVAS_WIDTH / SCALE / 2 + 5;
  const worldTopY = (CANVAS_HEIGHT - GROUND_MARGIN_PX) / SCALE + 10;
  return pos.x > worldHalfWidth || pos.x < -worldHalfWidth
    || pos.y < GROUND_Y - 2 || pos.y > worldTopY;
}

function checkBallResult() {
  if (!currentBall) return 'miss';
  const pos = currentBall.getPosition();
  // Ball must be above ground-resting height to count as landed on structure
  if (pos.y > GROUND_Y + BALL_RADIUS + 0.15) {
    return 'landed';
  }
  // Ball on or below ground = miss
  return 'miss';
}

function updateSettling() {
  // During FLYING: check if ball went off-screen (immediate miss)
  const state = getState();

  const MAX_FLIGHT_FRAMES = 600; // 10 seconds at 60fps — force settle if still going
  flightFrames++;

  if (state.current === STATES.FLYING) {
    if (checkBallOffScreen()) {
      setRoundOver('miss');
      return;
    }

    // Transition to SETTLING when bodies slow down
    const maxSpeed = getMaxBodySpeed();
    if (maxSpeed < SETTLE_VELOCITY_THRESHOLD * 3) {
      setState(STATES.SETTLING);
      quietFrames = 0;
    }
  }

  if (state.current === STATES.SETTLING) {
    const maxSpeed = getMaxBodySpeed();
    if (maxSpeed < SETTLE_VELOCITY_THRESHOLD) {
      quietFrames++;
    } else {
      quietFrames = 0;
      // If things got energetic again, go back to FLYING
      if (maxSpeed > SETTLE_VELOCITY_THRESHOLD * 5) {
        setState(STATES.FLYING);
      }
    }

    // Settled (or timed out) — determine result
    if (quietFrames >= SETTLE_FRAMES || flightFrames >= MAX_FLIGHT_FRAMES) {
      if (checkTopple()) {
        setRoundOver('topple');
      } else {
        const result = checkBallResult();
        if (result === 'miss') {
          setRoundOver('miss');
        } else {
          advanceShot();
        }
      }
    }
  }
}

function loop() {
  const state = getState();

  // Step physics when ball is in flight or settling
  if (state.current === STATES.FLYING || state.current === STATES.SETTLING) {
    stepWorld();
    applyContactDamping();
    updateSettling();
  }

  render(getStructureBodies(), getBallBodies(), getLauncherState(), state);
  requestAnimationFrame(loop);
}

init().catch(err => console.error('Failed to initialize:', err));
