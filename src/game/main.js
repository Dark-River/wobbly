import { createWorld, getStructureBodies, getBallBodies, stepWorld } from './physics.js';
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
} from '../shared/constants.js';

const canvas = document.getElementById('game-canvas');
initRenderer(canvas);

let currentPuzzle = null;
let quietFrames = 0; // frames where all bodies are below velocity threshold
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
    // Displaced significantly from starting position (tipped over, slid off, etc.)
    const dx = pos.x - initial.x;
    const dy = pos.y - initial.y;
    if (dx * dx + dy * dy > 2.25) return true; // 1.5m displacement threshold
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
  // Ball at rest above ground = landed
  if (pos.y > GROUND_Y + 0.3) {
    return 'landed';
  }
  // Ball on or below ground = miss
  return 'miss';
}

function updateSettling() {
  // During FLYING: check if ball went off-screen (immediate miss)
  const state = getState();

  if (state.current === STATES.FLYING) {
    if (checkBallOffScreen()) {
      setRoundOver('miss');
      return;
    }

    // Check for topple during flight
    if (checkTopple()) {
      setRoundOver('topple');
      return;
    }

    // Transition to SETTLING when bodies slow down
    const maxSpeed = getMaxBodySpeed();
    if (maxSpeed < SETTLE_VELOCITY_THRESHOLD * 3) {
      // Use a higher threshold for initial transition
      setState(STATES.SETTLING);
      quietFrames = 0;
    }
  }

  if (state.current === STATES.SETTLING) {
    // Check for topple during settling
    if (checkTopple()) {
      setRoundOver('topple');
      return;
    }

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

    // Settled — determine result
    if (quietFrames >= SETTLE_FRAMES) {
      const result = checkBallResult();
      if (result === 'miss') {
        setRoundOver('miss');
      } else {
        // Ball landed successfully — advance to next shot
        advanceShot();
      }
    }
  }
}

function loop() {
  const state = getState();

  // Step physics when ball is in flight or settling
  if (state.current === STATES.FLYING || state.current === STATES.SETTLING) {
    stepWorld();
    updateSettling();
  }

  render(getStructureBodies(), getBallBodies(), getLauncherState(), state);
  requestAnimationFrame(loop);
}

init().catch(err => console.error('Failed to initialize:', err));
