# Architecture

Technical overview for developers new to the codebase.

---

## Overview

Wobbly is intentionally low-dependency. The entire game runs as a single HTML file with inline JS and CSS. No build step, no bundler, no framework. The only external dependency is **Matter.js 0.19.0**, loaded from a CDN.

This is a deliberate choice for the prototype phase — it makes iteration fast and keeps the barrier to contribution low.

---

## File Map

```
src/game.html         ← The game (player-facing)
tools/builder.html    ← The puzzle design tool (developer-facing)
```

Both files are self-contained. They share the same physics constants and stone definitions by convention, not by import — if you change physics parameters in one, update the other.

> **TODO**: Extract shared constants into a `src/physics.js` module and import it in both files once the prototype is stable enough to justify a build step.

---

## Physics Engine: Matter.js

We use **Matter.js 0.19.0** for 2D rigid body simulation.

### Key settings

```js
Engine.create({
  gravity: { x: 0, y: 2.0 },
  positionIterations: 20,    // default is 6 — higher = more stable stacking
  velocityIterations: 16,    // default is 4
  enableSleeping: true,      // bodies stop simulating when at rest
})
```

All bodies share these options:
```js
{
  slop: 0.04,          // overlap tolerance — tighter than default (0.05)
  frictionAir: 0.05,   // global air drag
}
```

### Body types

**Structure stones** use `Bodies.rectangle()` with `chamfer: {radius: 2}`. The chamfer rounds corners slightly, which improves stacking stability by reducing edge-catching.

**The arch stone** uses `Bodies.fromVertices()` with a half-disc vertex array. Matter.js recalculates the centroid internally for vertex bodies — this centroid will not match the geometric centre of the original vertex positions. This is accounted for in the draw code, which offsets the arch rendering by `4r/(3π)` (the centroid of a half-disc above its flat base).

**Launched stones**:
- Circle: `Bodies.circle()`
- Decagon: `Bodies.fromVertices()` with 10-sided polygon
- Astroid: `Bodies.fromVertices()` with 44-point 4-cusp hypocycloid approximation

### Pre-settlement (critical concept)

**Problem**: Matter.js computes body centroids differently than geometric centres, especially for chamfered rectangles and vertex bodies. Placing a body at a calculated geometric position and then running physics will cause a small but visible drift on the first frame.

**Solution**: The builder runs a `settleAndReadback()` function after generating a castle:

```js
function settleAndReadback(stones, steps=600) {
  // 1. Create a temporary physics world
  // 2. Add all stones as dynamic bodies at their geometric positions
  // 3. Run N steps — everything falls into its natural resting state
  // 4. Read back body.position.x, body.position.y, body.angle for each body
  // 5. Store those as the canonical stone coordinates
  // 6. Destroy the temporary world
}
```

The coordinates stored in the puzzle JSON are the *settled physics positions*, not the geometric design positions. When the game creates bodies at those exact coordinates, they start at rest and remain there.

This is verified with `verifySim()` after settlement:
```js
function verifySim(stones, steps=200) {
  // Places bodies at stored coordinates, runs 200 steps
  // Checks that maxDrift < 3px — if so, the puzzle is approved
}
```

---

## Canvas Coordinate System

```
(0,0)                      (canvas.width, 0)
  ┌──────────────────────────────────────┐
  │                                      │
  │         structure centred here       │
  │              ↓                       │
  │         (CX(), various y)            │
  │                                      │
  │  ◈ launcher                          │
  ├──────────────── GY() ────────────────┤  ← ground surface
  │         (ground body)                │
  └──────────────────────────────────────┘
(0, canvas.height)         (canvas.width, canvas.height)
```

Key functions:
```js
const GY  = () => cv.height - 38;      // ground surface Y (canvas coords)
const PGY = () => GY() + GH;           // physics body centre of ground
const CX  = () => cv.width / 2;        // horizontal centre
```

**Puzzle JSON uses relative X** (offset from `CX()`), so puzzles are layout-independent. At load time: `abs_x = CX() + json_x`.

---

## Rendering

Pure Canvas 2D API. No WebGL. The render loop is `requestAnimationFrame`-driven:

```js
function loop() {
  requestAnimationFrame(loop);
  tickPhys();           // advance physics if live test is running
  ctx.fillRect(...);    // clear
  drawGround();
  structStones.forEach(s => drawStone(s));
  launchStones.forEach((s, i) => drawStone(s, false, i+1));
  drawGhost();          // placement preview
  drawLauncher();
  drawHUD();
}
```

During live physics test (`physOn === true`), each stone's draw position is sourced from the live physics body, not the stored coordinates:

```js
function getPhysState(id) {
  if (!physOn) return null;
  const b = physBods.find(b => b._sid === id);
  return b ? { x: b.position.x, y: b.position.y, a: b.angle } : null;
}
```

---

## Builder Tool Architecture

`tools/builder.html` has two major sections:

### 1. Castle Generator

Produces a geometrically correct castle layout from 4 slider parameters:
- **Tower height** (TH): number of wall rows per tower
- **Tower width** (TW): number of wall columns per tower  
- **Gate width** (GW): clear span of the arch in wall-width units
- **Crenels** (CR): alternating block/arch decorations on tower caps

The generator guarantees:
- Every stone's bottom edge rests on a real support surface
- The bridge slab always has ≥14px bearing on each inner wall column
- Tower cap slabs always cover all TW wall columns (using 2 slabs if TW×WW > 82px)

After geometric layout, `settleAndReadback()` runs and the settled positions are loaded into the editor.

### 2. Editor

- **Structure layer**: place/move/rotate/delete structure stones
- **Launch layer**: place launched stones at their intended resting positions
- **Physics test**: runs a live simulation you can watch; ■ Stop resets to stored positions
- **Background stability check**: runs `verifySim()` 400ms after any edit, updates the overlay indicator

### 3. JSON Export

```js
{
  launcherX: Math.round(launcherX - CX()),   // relative to centre
  structure: [...],
  launch: [...]
}
```

---

## Adding a New Stone Type

To add a new structure or launched stone type:

1. Add its definition to the `STRUCT` or `LAUNCH` constant objects
2. Add a vertex builder function if it's not a standard shape
3. Handle it in `makeBody()` (the physics factory)
4. Handle it in `drawStone()` (the render path)
5. Handle it in the ghost preview in `drawGhost()`
6. Test with the builder — generate a structure using the new stone, run settle + verify

---

## Known Limitations / TODOs

- [ ] Shared physics constants between `game.html` and `builder.html` — currently duplicated
- [ ] No puzzle scheduling system — puzzles not yet wired to dates
- [ ] No shareable result card in game prototype
- [ ] Mobile layout: canvas is fixed size, not responsive
- [ ] Launcher drag arc preview uses a simplified ballistic approximation, not actual Matter.js integration — may diverge slightly at extreme angles
- [ ] Astroid vertex body has a slight centroid shift that is corrected by pre-settlement but not precisely documented
- [ ] No persistence layer — streaks and stats not yet implemented
