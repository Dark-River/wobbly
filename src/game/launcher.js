import { MAX_PULL_RADIUS, BALL_RADIUS, SPEED_FACTOR } from '../shared/constants.js';
import { addBallBody } from './physics.js';

const launcherState = {
  anchorX: 0,
  anchorY: 0,
  dragging: false,
  pullX: 0, // offset from anchor
  pullY: 0,
  power: 0, // 0-1 normalized
};

export function getLauncherState() {
  return launcherState;
}

export function setAnchor(x, y) {
  launcherState.anchorX = x;
  launcherState.anchorY = y;
}

export function startDrag(worldX, worldY) {
  // Only start drag if click is near the anchor
  const dx = worldX - launcherState.anchorX;
  const dy = worldY - launcherState.anchorY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > 2) return false; // too far from anchor

  launcherState.dragging = true;
  launcherState.pullX = 0;
  launcherState.pullY = 0;
  launcherState.power = 0;
  return true;
}

export function updateDrag(worldX, worldY) {
  if (!launcherState.dragging) return;

  let dx = worldX - launcherState.anchorX;
  let dy = worldY - launcherState.anchorY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Clamp to max pull radius
  if (dist > MAX_PULL_RADIUS) {
    dx = (dx / dist) * MAX_PULL_RADIUS;
    dy = (dy / dist) * MAX_PULL_RADIUS;
  }

  launcherState.pullX = dx;
  launcherState.pullY = dy;
  launcherState.power = Math.min(dist, MAX_PULL_RADIUS) / MAX_PULL_RADIUS;
}

export function releaseDrag() {
  if (!launcherState.dragging) return null;

  launcherState.dragging = false;

  // Velocity = opposite of pull direction, scaled by speed factor
  const vx = -launcherState.pullX * SPEED_FACTOR;
  const vy = -launcherState.pullY * SPEED_FACTOR;

  // Don't launch if barely pulled
  if (launcherState.power < 0.05) {
    launcherState.pullX = 0;
    launcherState.pullY = 0;
    launcherState.power = 0;
    return null;
  }

  // Create ball at anchor position
  const ball = addBallBody(
    launcherState.anchorX,
    launcherState.anchorY,
    vx,
    vy,
    BALL_RADIUS,
  );

  launcherState.pullX = 0;
  launcherState.pullY = 0;
  launcherState.power = 0;

  return ball;
}

export function cancelDrag() {
  launcherState.dragging = false;
  launcherState.pullX = 0;
  launcherState.pullY = 0;
  launcherState.power = 0;
}
