import { addStoneBody } from '../game/physics.js';

export async function loadPuzzle(path) {
  const response = await fetch(path);
  const puzzle = await response.json();
  return puzzle;
}

export function createStructureFromPuzzle(puzzle) {
  const bodies = [];
  for (const stone of puzzle.structure) {
    const body = addStoneBody(stone.type, stone.x, stone.y, stone.angle || 0);
    bodies.push(body);
  }
  return bodies;
}
