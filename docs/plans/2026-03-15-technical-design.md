# Wobbly — Technical Design

Approved during in-person planning session, 2026-03-15.

## Game Summary

A daily physics puzzle where you launch balls at a precarious stone structure, trying to land all 5 without toppling it. Side-view, stone ruins aesthetic. Angry Birds-style slingshot, no arc preview. Retry-based scoring (fewer rounds = better). AI-assisted but human-curated daily puzzles.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Physics | **Planck.js** | Box2D port — proven stacking stability (powered original Angry Birds). Pure JS, no WASM complexity. Active maintenance. |
| Rendering | **Canvas 2D API** | Zero dependencies, adequate for ~50 bodies. PixiJS can be layered in later for polish. |
| Build | **Vite + vanilla JS** | HMR for fast iteration, proper ES module imports, no framework overhead. 2-minute setup. |

## Project Structure

```
wobbly/
  src/
    game/
      main.js            -- entry point, game loop
      renderer.js        -- Canvas 2D drawing
      physics.js         -- Planck.js world setup, body creation
      launcher.js        -- slingshot drag/release mechanic
      state.js           -- game state machine
    shared/
      constants.js       -- gravity, friction, density values
      stone-types.js     -- structure stone definitions
      puzzle-loader.js   -- parse puzzle JSON, create bodies
  puzzles/
    tutorial.json        -- first hardcoded puzzle
  index.html
  package.json
  vite.config.js
```

Physics, rendering, and game state are separate modules connected through the game loop.

## Game Loop

```
each frame:
  1. step physics (Planck world.step())
  2. check game state (did anything fall? is the ball at rest?)
  3. render everything (read positions from physics, draw to canvas)
```

## State Machine

```
AIMING → FLYING → SETTLING → (check) → AIMING or ROUND_OVER

AIMING:     Player drags slingshot. Structure visible. Shows shot N of 5.
FLYING:     Ball released. Physics running. Player watches.
SETTLING:   Ball hit/missed. Wait for bodies to come to rest.
ROUND_OVER: Miss or topple. Offer retry (full reset).
WIN:        All 5 landed successfully.
```

## Slingshot Mechanic

- Fixed position per puzzle (left side of screen)
- Click/touch near anchor → drag to aim
- Ball follows pointer, clamped to max pull radius
- Two elastic band lines from fork prongs to ball for visual feedback
- Release → velocity = (anchor - pointer) * speedFactor
- Direct velocity approach (not spring-based) for simplicity and tunability

## Win/Lose Detection

- **Miss:** Ball comes to rest on the ground (below structure), or goes off-screen. Even if it touched the structure first — final resting position matters.
- **Topple:** Any structure stone drops below ground surface during SETTLING.
- **Knocked loose:** Structure stone moved significantly from starting position but didn't fall. Doesn't end the round, tracked for future scoring.
- **Landed:** Ball at rest, above ground level. Proceed to next shot.

## Pre-Settlement (Puzzle Loading)

1. Parse puzzle JSON — stone types and geometric positions
2. Create all bodies in Planck.js
3. Run physics headlessly for N steps until at rest
4. Read back settled positions as canonical starting positions
5. Begin rendering — structure is genuinely stable before player sees it

## Puzzle Format

```json
{
  "id": 1,
  "label": "Tutorial",
  "launcher": { "x": -250, "y": -20 },
  "structure": [
    { "type": "wall", "x": 0, "y": -26 },
    { "type": "slab", "x": 0, "y": -58 }
  ]
}
```

- Coordinates relative to center-bottom (ground center)
- Y negative = up (physics convention)
- Stone types reference shared definitions in `stone-types.js`
- No solution stones — player finds their own approach
- Launcher position per-puzzle

## Stone Types (Structure)

~4 types, each visually distinct with different physics properties:
- Dimensions, weight, friction vary per type
- Color/size communicates physics properties to the player
- Exact definitions to be tuned during implementation

## MVP Scope

**In:**
- One hardcoded puzzle (tutorial)
- Slingshot launch, one ball type
- Physics simulation with Planck.js
- Win/lose detection
- Retry (full reset)
- Stone ruins visual style

**Out:**
- Daily puzzle rotation
- Multiple ball types
- Arc preview
- Scoring system
- Share results
- Puzzle builder tool
- AI puzzle generation
- Accounts, streaks, subscription
- Mobile optimization
