# Wobbly — Game Design Document

## Overview

Wobbly is a daily physics puzzle game played in the browser. Each day, everyone in the world gets the same hand-curated castle ruin. The player fires five stones at it using a slingshot. The goal: land all five stones on the structure without knocking anything over.

---

## Core Mechanics

### The Structure

A "castle ruin" is a static arrangement of stone pieces that:
- Is perfectly balanced at rest (zero movement before the first shot)
- Has multiple flat surfaces where a launched stone could plausibly land
- Is sensitive enough to topple if weight lands in the wrong place
- Has visual precariousness — it should *look* like it might fall

Structures are built from exactly **4 structure stone types** (see below). They are designed or generator-assisted, then manually verified using the builder tool. The exported JSON is the canonical puzzle definition.

### The Launcher

A slingshot positioned to the left of the structure (position varies per puzzle). The player:
1. Clicks and holds anywhere near the launcher
2. Drags back to set angle and power (visualised as an arc preview)
3. Releases to fire

Maximum pull distance is capped to prevent trivially powerful shots.

### The Five Stones

Each puzzle has exactly **5 solution stones** — the set of stones the player must land. Stones are fired one at a time. The player can see how many remain via pip indicators.

**Stone order matters.** The solution is designed so that stone 1 has the most forgiving landing zone, and stone 5 has the smallest. This gives a difficulty curve within each puzzle.

If the structure collapses (any piece falls off the canvas), the attempt ends immediately.

### Win / Lose

- **Win**: All 5 stones come to rest on the structure without anything falling
- **Lose**: Any structure stone falls before all 5 are placed

After the attempt, a shareable result card is generated (similar to Wordle's emoji grid).

---

## Structure Stone Types (4 total)

These are the building blocks of every castle ruin.

| Key | Shape | Dimensions | Physical behaviour |
|-----|-------|-----------|-------------------|
| `wall` | Rectangle | 26 × 52 px | Tall and narrow. Stacks into towers. Topples sideways when top-loaded off-centre |
| `slab` | Rectangle | 82 × 14 px | Wide and flat. Used as bridge spans and tower caps. Tips catastrophically if load is off-centre |
| `block` | Rectangle | 34 × 34 px | Square. Used as crenellations. Stable on flat surfaces but can be knocked off ledges |
| `arch` | Semicircle | r = 20 px | Half-disc with flat base. The only non-quadrilateral structure stone. Unstable crown piece — rocks if hit |

### Physics parameters (structure stones)

All structure stones are dynamic bodies (not static) so they can fall. They start at rest because their positions are pre-settled using the physics engine before the puzzle is served.

| Key | friction | restitution | density |
|-----|----------|-------------|---------|
| wall | 0.92 | 0.02 | 0.006 |
| slab | 0.98 | 0.01 | 0.003 |
| block | 0.95 | 0.02 | 0.005 |
| arch | 0.90 | 0.03 | 0.004 |

---

## Launched Stone Types (3 total)

These are the stones the player fires. They are chosen per puzzle (the puzzle JSON specifies which stone type to use for each of the 5 shots, and in what order).

| Key | Shape | Radius | Behaviour |
|-----|-------|--------|-----------|
| `circle` | Circle | 13 px | Rolls freely on any slope. Hardest to keep stationary on non-flat surfaces |
| `decagon` | 10-sided polygon | 14 px | Has slight grip on flat surfaces. Rolls if tipped past a flat side edge |
| `astroid` | 4-cusp hypocycloid | 14 px | Wedges into gaps and corners. Unpredictable on slopes |

### Physics parameters (launched stones)

| Key | friction | restitution | density |
|-----|----------|-------------|---------|
| circle | 0.50 | 0.15 | 0.003 |
| decagon | 0.85 | 0.08 | 0.004 |
| astroid | 0.90 | 0.06 | 0.004 |

---

## Castle Anatomy

The generator produces a specific silhouette every time (which can then be manually modified):

```
  [BK][  ][BK]        [BK][  ][BK]   ← crenellations: blocks with gaps
  [======= SLAB =====] [======= SLAB =]  ← tower cap slab (ties wall columns)
  [W ][W ]                 [W ][W ]   ← upper tower walls (rows 1..TH-1)
  [W ][W ]  [=== BRIDGE ===] [W ][W ]  ← row-0 walls + gate bridge slab
  ═══════════════════════════════════  ground
```

**Tower cap slabs** are critical — they tie adjacent wall columns together laterally. Without them, individual wall columns (26px wide, 52px tall) would lean on each other and eventually drift. The cap slab is the equivalent of a real lintel.

**The bridge slab** spans the gate arch at the height of the first wall row. It creates the castle's most prominent landing surface — wide and flat, but it will tip if the landing is off-centre.

**Crenellations** alternate block / gap across each tower cap. The innermost crenel position uses an arch stone instead of a block — it rocks when hit.

---

## Difficulty Design

Puzzle difficulty is determined by:

1. **Landing zone size** — smaller surfaces = harder to hit accurately
2. **Surface slope** — flat is easy, sloped/pointed is hard
3. **Structural dependency** — some surfaces are stable; others tip when a stone lands off-centre
4. **Shot geometry** — some zones are hard to reach from the launcher due to walls blocking the arc
5. **Stone type** — circles are harder to keep still than decagons or astroids in tight spots

### The 5-stone difficulty curve

Within each puzzle, stones should be ordered roughly easiest → hardest:
- **Stone 1**: Large flat surface, forgiving. Player learns the launcher feel.
- **Stone 2–3**: Medium surfaces, moderate forgiveness. Requires some precision.
- **Stone 4**: Small or sloped surface, or a structurally sensitive position.
- **Stone 5**: The hardest — tiny window, or a position that risks toppling everything if slightly off.

---

## Physics Engine

Matter.js 0.19.0 is used for all physics simulation.

Key settings:
```js
gravity: { x: 0, y: 2.0 }
positionIterations: 20
velocityIterations: 16
enableSleeping: true
frictionAir: 0.05   // on all bodies
slop: 0.04          // overlap tolerance
```

### Pre-settlement

The most important engineering decision: **puzzle structures are pre-settled**. The builder runs a 700-step physics simulation on the designed structure, reads back the final resting positions of every body, and stores those as the canonical coordinates. When the player loads the puzzle, bodies are placed at those exact settled coordinates — so the structure starts at rest with zero movement.

This avoids the subtle bug where geometric placement coordinates differ from physics-centroid coordinates (due to Matter.js's internal centroid calculation for chamfered and vertex-based bodies).

---

## Sharing / Social

After each attempt, the player sees a result card:

```
Wobbly #42 — 4/5 🪨

🟩🟩🟨🟨🟥
```

- 🟩 Stone landed cleanly
- 🟨 Stone landed but was close to the edge (within tolerance)
- 🟥 Structure fell on this shot
- 🟫 Stone not yet thrown (incomplete attempt)

The result is copyable and shareable as plain text.

---

## Monetisation

- **Free**: Today's daily puzzle only
- **$1/month**: Full archive access, personal streaks, historical stats
- **No ads, no tracking beyond subscription status**
