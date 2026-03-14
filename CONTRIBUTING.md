# Contributing to Wobbly

Thanks for your interest. There are two main ways to contribute: **puzzle design** and **code**.

---

## Puzzle Design

The most immediately useful contribution. We need a library of hand-curated puzzles with a good difficulty spread.

### Requirements for a valid puzzle

- [ ] Structure is perfectly stable at rest — no movement when Test Physics is run on an unmodified generated structure
- [ ] All 5 solution stones are reachable from the launcher (green arc indicator in the builder)
- [ ] Stone 1 has a clearly forgiving landing zone (tolerance > 0.7 on manual test)
- [ ] Stone 5 has a clearly difficult landing zone (tolerance < 0.3)
- [ ] The structure has at least 2 distinct ways to fail (not just one fragile point)
- [ ] The puzzle has been play-tested — someone has actually completed it

### Steps

1. Open `tools/builder.html`
2. Use the **Generate** sliders to get a base castle, or build from scratch
3. Click **▶ Test Physics** on the unmodified structure — nothing should move
4. Switch to **Launched Stones** and place 5 stones in order, easiest first
5. Verify green arcs for all 5 stones
6. Click **Copy JSON**
7. Open a PR adding your puzzle JSON to `puzzles/` (create the folder if it doesn't exist yet) as `puzzle-NNN.json`
8. Include a note in the PR about difficulty and any interesting features of the puzzle

### Difficulty labelling

Label your puzzle in the PR description as one of: `easy` / `medium` / `hard` / `expert`

Rough guide:
- **Easy**: Stone 5 has a surface > 30px wide, structure has 1 clear failure mode
- **Medium**: Stone 5 surface 15–30px, 2–3 failure modes
- **Hard**: Stone 5 surface < 15px or structurally interdependent
- **Expert**: Requires intentional use of stone type (e.g., wedging an astroid into a gap)

---

## Code Contributions

### Getting started

```bash
git clone https://github.com/YOUR_ORG/wobbly.git
cd wobbly
# No install step. Open HTML files directly in browser.
open tools/builder.html
open src/game.html
```

### What's most useful right now

Check the [Issues](../../issues) tab. High-priority areas:

1. **Game prototype** (`src/game.html`) — the launcher mechanic, arc preview, win/lose detection, result card
2. **Shared physics module** — extract `STRUCT`, `LAUNCH`, `makeBody()`, `groundBodies()` etc. into a shared `src/physics.js` so `game.html` and `builder.html` don't duplicate constants
3. **Puzzle scheduling** — a lightweight system for mapping puzzle JSON to calendar dates
4. **Mobile layout** — canvas currently doesn't scale to small screens
5. **Result sharing** — Wordle-style emoji grid generation and clipboard copy

### Code style

- Vanilla JS, no TypeScript (for now)
- No build step — keep everything importable as plain `<script>` tags or ES modules
- Keep files self-contained where possible — the "one big HTML file" approach is fine for prototyping
- Physics constants live in the JS header of each file — document any change to gravity, friction, etc. with a comment explaining why

### PR checklist

- [ ] Tested in Chrome (primary target) and Firefox
- [ ] No new external dependencies without discussion first
- [ ] If you change physics constants, update both `src/game.html` and `tools/builder.html`
- [ ] If you change the puzzle JSON format, update `docs/PUZZLE_FORMAT.md`

---

## Questions

Open an issue or start a Discussion. No question is too basic.
