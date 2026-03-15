import { createWorld, getStructureBodies, getBallBodies, stepWorld } from './physics.js';
import { initRenderer, render } from './renderer.js';
import { loadPuzzle, createStructureFromPuzzle, settleAndReadback } from '../shared/puzzle-loader.js';

const canvas = document.getElementById('game-canvas');
initRenderer(canvas);

let currentPuzzle = null;

async function init() {
  currentPuzzle = await loadPuzzle('/puzzles/tutorial.json');
  createWorld();
  createStructureFromPuzzle(currentPuzzle);
  settleAndReadback(currentPuzzle);
  loop();
}

function loop() {
  stepWorld();
  render(getStructureBodies(), getBallBodies(), null, null);
  requestAnimationFrame(loop);
}

init().catch(err => console.error('Failed to initialize:', err));
