import planck from 'planck';
import { GRAVITY } from '../shared/constants.js';
import { STONE_TYPES } from '../shared/stone-types.js';

const { World, Vec2, Edge, Box } = planck;

let world = null;
let groundBody = null;
const structureBodies = [];

export function createWorld() {
  world = new World({ gravity: Vec2(0, GRAVITY) });

  // Ground: static edge across the bottom
  groundBody = world.createBody();
  groundBody.createFixture(Edge(Vec2(-100, 0), Vec2(100, 0)), {
    friction: 0.8,
  });

  structureBodies.length = 0;
  return world;
}

export function destroyWorld() {
  if (world) {
    // Planck doesn't have a destroy method — just null it out
    world = null;
    groundBody = null;
    structureBodies.length = 0;
  }
}

export function getWorld() {
  return world;
}

export function getStructureBodies() {
  return structureBodies;
}

export function addStoneBody(typeName, x, y, angle = 0) {
  const type = STONE_TYPES[typeName];
  if (!type) throw new Error(`Unknown stone type: ${typeName}`);

  const body = world.createDynamicBody({
    position: Vec2(x, y),
    angle: angle,
  });

  body.createFixture(Box(type.width / 2, type.height / 2), {
    density: type.density,
    friction: type.friction,
    restitution: type.restitution,
  });

  body.stoneType = typeName;
  structureBodies.push(body);
  return body;
}

export function addBallBody(x, y, vx, vy, radius) {
  const body = world.createDynamicBody({
    position: Vec2(x, y),
    bullet: true,
  });

  body.createFixture(planck.Circle(radius), {
    density: 1.5,
    friction: 0.5,
    restitution: 0.3,
  });

  body.setLinearVelocity(Vec2(vx, vy));
  body.isBall = true;
  return body;
}

export function stepWorld(dt = 1 / 60) {
  if (world) {
    world.step(dt);
  }
}
