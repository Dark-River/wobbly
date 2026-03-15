import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../shared/constants.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

function loop() {
  // Clear with dark background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw ground placeholder
  ctx.fillStyle = '#3d3d2b';
  ctx.fillRect(0, CANVAS_HEIGHT - 60, CANVAS_WIDTH, 60);

  requestAnimationFrame(loop);
}

loop();
