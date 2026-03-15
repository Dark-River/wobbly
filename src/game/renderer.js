import { CANVAS_WIDTH, CANVAS_HEIGHT, SCALE, BALL_RADIUS, GROUND_MARGIN_PX, MAX_SHOTS } from '../shared/constants.js';
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
  drawBackground();
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

function drawBackground() {
  // Dark sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - GROUND_MARGIN_PX);
  grad.addColorStop(0, '#0c0c1a');
  grad.addColorStop(0.5, '#161628');
  grad.addColorStop(1, '#1e1e35');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Subtle moon glow
  const moonX = CANVAS_WIDTH - 100;
  const moonY = 60;
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 5, moonX, moonY, 80);
  moonGlow.addColorStop(0, 'rgba(200, 200, 220, 0.15)');
  moonGlow.addColorStop(1, 'rgba(200, 200, 220, 0)');
  ctx.fillStyle = moonGlow;
  ctx.fillRect(moonX - 80, moonY - 80, 160, 160);

  // Moon disc
  ctx.beginPath();
  ctx.arc(moonX, moonY, 12, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(220, 220, 235, 0.6)';
  ctx.fill();
}

function drawGround() {
  const groundY = CANVAS_HEIGHT - GROUND_MARGIN_PX;

  // Ground fill with gradient
  const grad = ctx.createLinearGradient(0, groundY, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#3d3a28');
  grad.addColorStop(0.3, '#33301f');
  grad.addColorStop(1, '#252218');
  ctx.fillStyle = grad;
  ctx.fillRect(0, groundY, CANVAS_WIDTH, GROUND_MARGIN_PX);

  // Surface detail — scattered small stones
  ctx.fillStyle = '#4a4630';
  for (let x = 10; x < CANVAS_WIDTH; x += 35) {
    const offset = (x * 7) % 11 - 5; // pseudo-random offset
    const size = 2 + (x * 3) % 4;
    ctx.fillRect(x + offset, groundY + 2, size, size * 0.6);
  }

  // Ground line with highlight
  ctx.strokeStyle = '#5a5638';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(CANVAS_WIDTH, groundY);
  ctx.stroke();

  // Subtle highlight above ground line
  ctx.strokeStyle = 'rgba(120, 115, 85, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, groundY - 1);
  ctx.lineTo(CANVAS_WIDTH, groundY - 1);
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

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w, h);

  // Stone body gradient
  const stoneGrad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  stoneGrad.addColorStop(0, type.colorTop);
  stoneGrad.addColorStop(1, type.colorBottom);
  ctx.fillStyle = stoneGrad;
  ctx.fillRect(-w / 2, -h / 2, w, h);

  // Masonry lines — horizontal cracks
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 1;
  if (h > 30) {
    const numCracks = Math.floor(h / 18);
    for (let i = 1; i <= numCracks; i++) {
      const cy = -h / 2 + (h / (numCracks + 1)) * i;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 2, cy);
      ctx.lineTo(w / 2 - 2, cy);
      ctx.stroke();
    }
  }

  // Light edge highlight (top and left)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-w / 2, h / 2);
  ctx.lineTo(-w / 2, -h / 2);
  ctx.lineTo(w / 2, -h / 2);
  ctx.stroke();

  // Dark edge (bottom and right)
  ctx.strokeStyle = type.border;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w / 2, -h / 2);
  ctx.lineTo(w / 2, h / 2);
  ctx.lineTo(-w / 2, h / 2);
  ctx.stroke();

  ctx.restore();
}

function drawBall(body) {
  const pos = body.getPosition();
  const screen = toCanvas(pos.x, pos.y);
  const r = BALL_RADIUS * SCALE;

  // Shadow
  ctx.beginPath();
  ctx.arc(screen.x + 2, screen.y + 2, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fill();

  // Ball body with gradient
  const ballGrad = ctx.createRadialGradient(
    screen.x - r * 0.3, screen.y - r * 0.3, r * 0.1,
    screen.x, screen.y, r,
  );
  ballGrad.addColorStop(0, '#e65555');
  ballGrad.addColorStop(0.7, '#b83333');
  ballGrad.addColorStop(1, '#8a2222');
  ctx.beginPath();
  ctx.arc(screen.x, screen.y, r, 0, Math.PI * 2);
  ctx.fillStyle = ballGrad;
  ctx.fill();

  // Rim
  ctx.strokeStyle = '#6a1818';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawSlingshot(launcher) {
  const anchor = toCanvas(launcher.anchorX, launcher.anchorY);
  const ground = toCanvas(launcher.anchorX, 0);
  const prongSpread = 10;
  const prongHeight = 22;

  const leftProngX = anchor.x - prongSpread;
  const leftProngY = anchor.y - prongHeight;
  const rightProngX = anchor.x + prongSpread;
  const rightProngY = anchor.y - prongHeight;

  // If dragging, draw back elastic band (behind fork)
  if (launcher.dragging) {
    const ballScreen = toCanvas(
      launcher.anchorX + launcher.pullX,
      launcher.anchorY + launcher.pullY,
    );

    // Back elastic (left)
    ctx.strokeStyle = '#6b4e10';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftProngX, leftProngY);
    ctx.lineTo(ballScreen.x, ballScreen.y);
    ctx.stroke();
  }

  // Fork body — thick wood stick
  ctx.strokeStyle = '#4a3828';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(anchor.x, ground.y);
  ctx.lineTo(anchor.x, anchor.y);
  ctx.stroke();

  // Wood highlight
  ctx.strokeStyle = '#6a5238';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(anchor.x - 1, ground.y);
  ctx.lineTo(anchor.x - 1, anchor.y);
  ctx.stroke();

  // Prongs
  ctx.strokeStyle = '#4a3828';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(anchor.x - 2, anchor.y);
  ctx.lineTo(leftProngX, leftProngY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(anchor.x + 2, anchor.y);
  ctx.lineTo(rightProngX, rightProngY);
  ctx.stroke();

  // Prong highlights
  ctx.strokeStyle = '#6a5238';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(anchor.x - 3, anchor.y);
  ctx.lineTo(leftProngX - 1, leftProngY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(anchor.x + 1, anchor.y);
  ctx.lineTo(rightProngX - 1, rightProngY);
  ctx.stroke();

  // If dragging, draw front elastic and ball
  if (launcher.dragging) {
    const ballScreen = toCanvas(
      launcher.anchorX + launcher.pullX,
      launcher.anchorY + launcher.pullY,
    );
    const r = BALL_RADIUS * SCALE;

    // Front elastic (right)
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rightProngX, rightProngY);
    ctx.lineTo(ballScreen.x, ballScreen.y);
    ctx.stroke();

    // Ball at pull position
    const previewGrad = ctx.createRadialGradient(
      ballScreen.x - r * 0.3, ballScreen.y - r * 0.3, r * 0.1,
      ballScreen.x, ballScreen.y, r,
    );
    previewGrad.addColorStop(0, '#e65555');
    previewGrad.addColorStop(0.7, '#b83333');
    previewGrad.addColorStop(1, '#8a2222');
    ctx.beginPath();
    ctx.arc(ballScreen.x, ballScreen.y, r, 0, Math.PI * 2);
    ctx.fillStyle = previewGrad;
    ctx.fill();
    ctx.strokeStyle = '#6a1818';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.lineCap = 'butt';
}

function drawHUD(gameState) {
  const { current, shotNumber, result } = gameState;

  // Shot counter with ball indicators
  const indicatorY = 22;
  const indicatorStartX = 15;
  const indicatorSpacing = 22;
  const indicatorR = 7;

  for (let i = 1; i <= MAX_SHOTS; i++) {
    const cx = indicatorStartX + (i - 1) * indicatorSpacing;
    ctx.beginPath();
    ctx.arc(cx, indicatorY, indicatorR, 0, Math.PI * 2);

    if (i < shotNumber) {
      // Used shot — filled dim
      ctx.fillStyle = 'rgba(180, 50, 50, 0.5)';
      ctx.fill();
    } else if (i === shotNumber && current === 'AIMING') {
      // Current shot — bright
      ctx.fillStyle = '#c44';
      ctx.fill();
      ctx.strokeStyle = '#e66';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      // Future shot — outline only
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Result messages
  if (current === 'ROUND_OVER' || current === 'WIN') {
    // Dim overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (current === 'ROUND_OVER') {
      drawCenterMessage(result === 'topple' ? 'TOPPLED!' : 'MISS!', '#c44');
      drawSubMessage('Click to retry');
    } else {
      drawCenterMessage('ALL LANDED!', '#5cb85c');
      drawSubMessage('Click to play again');
    }
  }
}

function drawCenterMessage(text, color) {
  // Text shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, CANVAS_WIDTH / 2 + 2, CANVAS_HEIGHT / 2 - 18);

  // Text
  ctx.fillStyle = color;
  ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
}

function drawSubMessage(text) {
  ctx.fillStyle = '#aaa';
  ctx.font = '18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
}
