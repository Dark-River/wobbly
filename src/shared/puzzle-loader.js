import { addStoneBody } from '../game/physics.js';

export async function loadPuzzle(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load puzzle: ${path} (${response.status})`);
  return response.json();
}

export function createStructureFromPuzzle(puzzle) {
  const bodies = [];
  for (const stone of puzzle.structure) {
    const body = addStoneBody(stone.type, stone.x, stone.y, stone.angle || 0);
    bodies.push(body);
  }
  return bodies;
}
