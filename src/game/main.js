import { createWorld, getStructureBodies, getBallBodies, stepWorld } from './physics.js';
import { initRenderer, render, toWorld } from './renderer.js';
import { loadPuzzle, createStructureFromPuzzle, settleAndReadback } from '../shared/puzzle-loader.js';
import { getLauncherState, setAnchor, startDrag, updateDrag, releaseDrag } from './launcher.js';
import { getState, setState, STATES } from './state.js';

const canvas = document.getElementById('game-canvas');
initRenderer(canvas);

let currentPuzzle = null;

async function init() {
  currentPuzzle = await loadPuzzle('/puzzles/tutorial.json');
  createWorld();
  createStructureFromPuzzle(currentPuzzle);
  settleAndReadback(currentPuzzle);

  // Set launcher anchor from puzzle data
  setAnchor(currentPuzzle.launcher.x, currentPuzzle.launcher.y);

  // Mouse events
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);

  loop();
}

function getWorldPos(e) {
  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  return toWorld(cx, cy);
}

function onMouseDown(e) {
  const state = getState();
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
    setState(STATES.FLYING);
  }
}

function loop() {
  const state = getState();

  // Only step physics when ball is in flight or settling
  if (state.current === STATES.FLYING || state.current === STATES.SETTLING) {
    stepWorld();
  }

  render(getStructureBodies(), getBallBodies(), getLauncherState(), state);
  requestAnimationFrame(loop);
}

init().catch(err => console.error('Failed to initialize:', err));
