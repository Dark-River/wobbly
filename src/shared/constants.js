// Canvas dimensions
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;

// Physics (Planck.js uses meters, we define a pixels-per-meter scale)
export const SCALE = 30; // pixels per meter
export const GRAVITY = -20; // m/s² (negative = down in Planck's Y-up coords)

// Ground position (in world meters, Y-up)
export const GROUND_Y = 0;

// Rendering
export const GROUND_MARGIN_PX = 60; // pixels from bottom of canvas to ground line

// Ball
export const BALL_RADIUS = 0.4; // meters
export const MAX_SHOTS = 5;

// Slingshot
export const MAX_PULL_RADIUS = 4; // meters
export const SPEED_FACTOR = 8;

// Settling
export const SETTLE_VELOCITY_THRESHOLD = 0.1;
export const SETTLE_FRAMES = 60; // frames below threshold to confirm settled
export const PRE_SETTLE_STEPS = 300; // headless physics steps for pre-settlement
