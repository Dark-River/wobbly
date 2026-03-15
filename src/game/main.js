import { createWorld, getStructureBodies, getBallBodies, stepWorld } from './physics.js';
import { initRenderer, render } from './renderer.js';
import { loadPuzzle, createStructureFromPuzzle } from '../shared/puzzle-loader.js';

const canvas = document.getElementById('game-canvas');
initRenderer(canvas);

async function init() {
  createWorld();
  const puzzle = await loadPuzzle('/puzzles/tutorial.json');
  createStructureFromPuzzle(puzzle);
  loop();
}

function loop() {
  stepWorld();
  render(getStructureBodies(), getBallBodies(), null, null);
  requestAnimationFrame(loop);
}

init().catch(err => console.error('Failed to initialize:', err));
