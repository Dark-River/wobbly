# Wobbly 🪨

A daily physics puzzle game. Five stones. One ruin. Don't knock it down.

---

## What is Wobbly?

Wobbly is a browser-based daily puzzle game in the spirit of Wordle — one puzzle per day, shared by everyone, shareable result. The player launches five stones at a precarious castle ruin using a slingshot. The goal is to land all five without toppling the structure.

The game is deceptively simple to understand and brutally hard to master. The structures are designed so that there are many more ways to fail than to succeed. A stone that lands a centimeter too far to the left can send a tower crashing. Every shot feels tense.

### Core loop

1. A balanced castle ruin is displayed in side view
2. The player drags back on a slingshot launcher and releases to fire
3. Each of 5 stones must come to rest on the structure without causing anything to fall
4. After all 5 are placed (or the structure falls), the result is shown
5. A shareable emoji grid summarises the attempt (à la Wordle)

### Why it's interesting

- **Physics is the puzzle** — no hidden logic, no memorisation. The same rules that govern the visual apply to the outcome
- **Precariousness is designed in** — structures are not randomly generated at runtime; they are hand-curated (or generator-assisted then hand-verified) so they stand perfectly still before the first stone is thrown, but are tuned to be sensitive to where weight lands
- **Stone variety creates strategy** — three launched stone shapes (circle, decagon, astroid) roll, wedge, and grip differently. Choosing which stone to use where is part of the challenge
- **Daily cadence** — one puzzle per day, same puzzle for everyone, streak tracking for subscribers

---

## Repository Structure

```
wobbly/
├── README.md               ← you are here
├── src/
│   └── game.html           ← the playable game (prototype)
├── tools/
│   └── builder.html        ← puzzle design tool (castle generator + physics test)
├── docs/
│   ├── GAME_DESIGN.md      ← full design spec: mechanics, stone types, scoring
│   ├── PUZZLE_FORMAT.md    ← JSON schema for puzzle definitions
│   ├── ARCHITECTURE.md     ← technical overview of the physics engine usage
│   └── CONTRIBUTING.md     ← how to contribute puzzles and code
└── assets/
    └── (future: fonts, icons, sprite sheets)
```

---

## Quick Start

No build step. Everything runs as plain HTML files in the browser.

**To play the prototype:**
```
open src/game.html
```

**To design a puzzle:**
```
open tools/builder.html
```
Click **⟳ Generate** to create a castle, test it with **▶ Test Physics**, place launched stones manually to verify shot lines, then **Copy JSON** to export the puzzle definition.

---

## Tech Stack

- **Vanilla JS + HTML Canvas** — no framework, no bundler
- **Matter.js 0.19.0** — 2D rigid body physics (loaded from CDN)
- No backend required for the prototype — puzzles are JSON objects

---

## Status

Early prototype / pre-alpha. The builder tool is functional. The game prototype is in development. Core physics and puzzle format are stable.

---

## Vision / Monetisation

- Free tier: today's daily puzzle
- $1/month: full archive, streaks, personal stats
- No ads, ever

---

## Contributing

See [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).
