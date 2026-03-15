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

  // Slingshot (behind balls)
  if (launcherState) {
    drawSlingshot(launcherState);
  }

  // Balls
  for (const body of ballBodies) {
    drawBall(body);
  }

  // HUD
  if (gameState) {
    drawHUD(gameState);
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

function drawSlingshot(launcher) {
  const anchor = toCanvas(launcher.anchorX, launcher.anchorY);
  const ground = toCanvas(launcher.anchorX, 0);
  const prongSpread = 10; // pixels
  const prongHeight = 20; // pixels above anchor

  // Fork body (stick from ground to anchor)
  ctx.strokeStyle = '#5a4a3a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(anchor.x, ground.y);
  ctx.lineTo(anchor.x, anchor.y);
  ctx.stroke();

  // Left prong
  const leftProngX = anchor.x - prongSpread;
  const leftProngY = anchor.y - prongHeight;
  ctx.beginPath();
  ctx.moveTo(anchor.x, anchor.y);
  ctx.lineTo(leftProngX, leftProngY);
  ctx.stroke();

  // Right prong
  const rightProngX = anchor.x + prongSpread;
  const rightProngY = anchor.y - prongHeight;
  ctx.beginPath();
  ctx.moveTo(anchor.x, anchor.y);
  ctx.lineTo(rightProngX, rightProngY);
  ctx.stroke();

  // If dragging, draw elastic bands and ball at pull position
  if (launcher.dragging) {
    const ballScreen = toCanvas(
      launcher.anchorX + launcher.pullX,
      launcher.anchorY + launcher.pullY,
    );
    const r = BALL_RADIUS * SCALE;

    // Elastic bands
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(leftProngX, leftProngY);
    ctx.lineTo(ballScreen.x, ballScreen.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightProngX, rightProngY);
    ctx.lineTo(ballScreen.x, ballScreen.y);
    ctx.stroke();

    // Ball at pull position
    ctx.beginPath();
    ctx.arc(ballScreen.x, ballScreen.y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#c44';
    ctx.fill();
    ctx.strokeStyle = '#922';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawHUD(gameState) {
  const { current, shotNumber, result } = gameState;

  // Shot counter
  ctx.fillStyle = '#ccc';
  ctx.font = '16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`Shot ${shotNumber} of 5`, 15, 25);

  // Result messages
  if (current === 'ROUND_OVER') {
    drawCenterMessage(result === 'topple' ? 'TOPPLED!' : 'MISS!', '#c44');
    drawSubMessage('Click to retry');
  } else if (current === 'WIN') {
    drawCenterMessage('ALL LANDED!', '#4c4');
    drawSubMessage('Click to play again');
  }
}

function drawCenterMessage(text, color) {
  ctx.fillStyle = color;
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
}

function drawSubMessage(text) {
  ctx.fillStyle = '#999';
  ctx.font = '18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
}
