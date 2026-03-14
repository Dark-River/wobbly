# Puzzle Format

Every Wobbly puzzle is a JSON object. This is the canonical format used by both the builder tool and the game engine.

---

## Schema

```json
{
  "id": 42,
  "label": "The Gatehouse",
  "date": "2026-03-15",
  "launcherX": -280,
  "structure": [
    { "t": "wall",  "x": -96,  "y": 424 },
    { "t": "wall",  "x": -70,  "y": 424 },
    { "t": "slab",  "x": -83,  "y": 372 },
    { "t": "wall",  "x": 70,   "y": 424 },
    { "t": "wall",  "x": 96,   "y": 424 },
    { "t": "slab",  "x": 83,   "y": 372 },
    { "t": "slab",  "x": 0,    "y": 476 },
    { "t": "block", "x": -100, "y": 338 },
    { "t": "arch",  "x": -66,  "y": 325 },
    { "t": "block", "x": 66,   "y": 338 },
    { "t": "arch",  "x": 100,  "y": 325 }
  ],
  "solution": [
    { "order": 1, "t": "circle",  "x":  0,   "y": 462 },
    { "order": 2, "t": "decagon", "x": -83,  "y": 358 },
    { "order": 3, "t": "decagon", "x":  83,  "y": 358 },
    { "order": 4, "t": "astroid", "x": -100, "y": 304 },
    { "order": 5, "t": "circle",  "x":  66,  "y": 304 }
  ]
}
```

---

## Field Reference

### Top-level

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | integer | yes (prod) | Sequential puzzle number |
| `label` | string | no | Human-readable name for the puzzle |
| `date` | string | no | ISO date this puzzle is scheduled for |
| `launcherX` | integer | yes | X position of the slingshot, **relative to canvas centre** |
| `structure` | array | yes | Array of structure stone descriptors |
| `solution` | array | yes | Array of solution stone descriptors (ordered 1–5) |

---

### Structure stone descriptor

```json
{ "t": "wall", "x": -96, "y": 424, "a": 0.05 }
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `t` | string | yes | Stone type: `"wall"`, `"slab"`, `"block"`, `"arch"` |
| `x` | integer | yes | Centre X, **relative to canvas centre** (negative = left) |
| `y` | integer | yes | Centre Y, **in canvas pixels from top** (ground ≈ 580 at 640px canvas height) |
| `a` | float | no | Rotation angle in **radians**. Omit if zero. |

> **Important**: `x` and `y` are the physics centroid position as read back after pre-settlement simulation. Do not hand-calculate these — use the builder tool, which runs the settle-and-readback process automatically.

---

### Solution stone descriptor

```json
{ "order": 1, "t": "circle", "x": 0, "y": 462 }
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order` | integer | yes | Shot order: 1 (first/easiest) to 5 (last/hardest) |
| `t` | string | yes | Stone type: `"circle"`, `"decagon"`, `"astroid"` |
| `x` | integer | yes | Target resting X, relative to canvas centre |
| `y` | integer | yes | Target resting Y, in canvas pixels |
| `a` | float | no | Expected resting angle in radians. Usually omitted. |

> **Note on solution positions**: These are the *target resting positions* where the stone should end up, not the trajectory the player must use. The game uses these for result evaluation (did the stone come to rest near here?). The player is free to reach these positions via any valid shot.

---

## Coordinate System

```
(0,0) ─────────────────────────────────── (canvas width, 0)
  │
  │   All Y increases downward
  │
  │          Structure centred here
  │               ↓
  │         (CX, various Y)
  │
  │
(0, GY) ─── ground surface ─────────── (canvas width, GY)
```

- **`launcherX`** and **structure `x`** values are offsets from `canvas.width / 2`
- In the game engine: `absolute_x = canvas.width / 2 + relative_x`
- Ground surface Y ≈ `canvas.height - 38` at the default canvas size (640px tall)
- Canvas size can vary by device — the coordinate system scales with it

---

## Stone Type Keys

### Structure
| Key | Description |
|-----|-------------|
| `wall` | 26×52 tall rectangle |
| `slab` | 82×14 wide flat rectangle |
| `block` | 34×34 square |
| `arch` | r=20 semicircle (half-disc, flat side down) |

### Launched
| Key | Description |
|-----|-------------|
| `circle` | r=13 perfect circle |
| `decagon` | r=14 regular 10-sided polygon |
| `astroid` | r=14 4-cusp hypocycloid |

---

## Example Minimal Puzzle

The simplest valid puzzle — a single wall on the ground, one stone to land on it:

```json
{
  "id": 0,
  "label": "Tutorial",
  "launcherX": -200,
  "structure": [
    { "t": "wall", "x": 0, "y": 502 }
  ],
  "solution": [
    { "order": 1, "t": "circle", "x": 0, "y": 475 }
  ]
}
```

---

## Building Puzzles

Use **`tools/builder.html`**:

1. Click **⟳ Generate** to create a castle from sliders
2. Use **▶ Test Physics** to confirm the structure is stable (nothing should move)
3. Switch to **Launched Stones** palette and manually place solution stones
4. Verify arc reachability (dashed arcs show if each target is reachable from the launcher)
5. Drag the **◈** launcher marker to adjust position
6. Click **Copy JSON** — paste into your puzzle catalogue

See [`docs/CONTRIBUTING.md`](CONTRIBUTING.md) for the full puzzle submission process.
