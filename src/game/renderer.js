import { CANVAS_WIDTH, CANVAS_HEIGHT, SCALE, BALL_RADIUS, GROUND_MARGIN_PX } from '../shared/constants.js';
import { STONE_TYPES } from '../shared/stone-types.js';

let ctx = null;

export function initRenderer(canvas) {
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  ctx = canvas.getContext('2d');
  return ctx;
}

// Convert physics coords (Y-up, origin at ground center) to canvas coords (Y-down)
function toCanvas(wx, wy) {
  return {
    x: CANVAS_WIDTH / 2 + wx * SCALE,
    y: CANVAS_HEIGHT - GROUND_MARGIN_PX - wy * SCALE,
  };
}

export function getCanvasCoords(wx, wy) {
  return toCanvas(wx, wy);
}

// Convert canvas coords back to world coords
export function toWorld(cx, cy) {
  return {
    x: (cx - CANVAS_WIDTH / 2) / SCALE,
    y: (CANVAS_HEIGHT - GROUND_MARGIN_PX - cy) / SCALE,
  };
}

export function render(structureBodies, ballBodies, launcherState, gameState) {
  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Ground
  drawGround();

  // Structure stones
  for (const body of structureBodies) {
    drawStone(body);
  }

  // Balls
  for (const body of ballBodies) {
    drawBall(body);
  }
}

function drawGround() {
  const groundScreen = toCanvas(0, 0);
  ctx.fillStyle = '#3d3d2b';
  ctx.fillRect(0, groundScreen.y, CANVAS_WIDTH, CANVAS_HEIGHT - groundScreen.y);

  // Ground line
  ctx.strokeStyle = '#5a5a3f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundScreen.y);
  ctx.lineTo(CANVAS_WIDTH, groundScreen.y);
  ctx.stroke();
}

function drawStone(body) {
  const pos = body.getPosition();
  const angle = body.getAngle();
  const typeName = body.stoneType;
  const type = STONE_TYPES[typeName];
  if (!type) return;

  const screen = toCanvas(pos.x, pos.y);
  const w = type.width * SCALE;
  const h = type.height * SCALE;

  ctx.save();
  ctx.translate(screen.x, screen.y);
  ctx.rotate(-angle); // negate because canvas Y is flipped

  ctx.fillStyle = type.color;
  ctx.fillRect(-w / 2, -h / 2, w, h);

  // Border
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2, -h / 2, w, h);

  ctx.restore();
}

function drawBall(body) {
  const pos = body.getPosition();
  const screen = toCanvas(pos.x, pos.y);
  const r = BALL_RADIUS * SCALE;

  ctx.beginPath();
  ctx.arc(screen.x, screen.y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#c44';
  ctx.fill();
  ctx.strokeStyle = '#922';
  ctx.lineWidth = 2;
  ctx.stroke();
}
