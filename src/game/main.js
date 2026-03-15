import { createWorld, getStructureBodies, stepWorld } from './physics.js';
import { initRenderer, render } from './renderer.js';
import { loadPuzzle, createStructureFromPuzzle } from '../shared/puzzle-loader.js';

const canvas = document.getElementById('game-canvas');
initRenderer(canvas);

const ballBodies = [];

async function init() {
  createWorld();
  const puzzle = await loadPuzzle('/puzzles/tutorial.json');
  createStructureFromPuzzle(puzzle);
  loop();
}

function loop() {
  // Step physics (for now, always step so we can see gravity work on test bodies)
  stepWorld();

  render(getStructureBodies(), ballBodies, null, null);
  requestAnimationFrame(loop);
}

init();
