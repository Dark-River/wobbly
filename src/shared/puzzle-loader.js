import { PRE_SETTLE_STEPS } from './constants.js';
import { createWorld, addStoneBody, getStructureBodies, stepWorld } from '../game/physics.js';

export async function loadPuzzle(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load puzzle: ${path} (${response.status})`);
  return response.json();
}

export function createStructureFromPuzzle(puzzle) {
  for (const stone of puzzle.structure) {
    addStoneBody(stone.type, stone.x, stone.y, stone.angle || 0);
  }
  return getStructureBodies();
}

/**
 * Run physics headlessly to let the structure settle, then recreate
 * bodies at their settled positions so the structure starts at rest.
 */
export function settleAndReadback(puzzle) {
  // Step 1: Run physics for N steps to let everything settle
  for (let i = 0; i < PRE_SETTLE_STEPS; i++) {
    stepWorld();
  }

  // Step 2: Read back settled positions
  const settledPositions = getStructureBodies().map(body => ({
    type: body.stoneType,
    x: body.getPosition().x,
    y: body.getPosition().y,
    angle: body.getAngle(),
  }));

  // Step 3: Recreate world with bodies at settled positions
  createWorld();
  for (const stone of settledPositions) {
    addStoneBody(stone.type, stone.x, stone.y, stone.angle);
  }

  // Step 4: Set all structure bodies to sleep so they start perfectly still
  for (const body of getStructureBodies()) {
    body.setAwake(false);
  }

  return getStructureBodies();
}
