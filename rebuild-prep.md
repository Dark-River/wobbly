# Wobbly — Game Vision (from planning session)

## One-sentence pitch

A daily physics puzzle where you launch items onto a precarious structure, trying to land all 5 without toppling it.

## Core game

- **Side-view**, stone ruins aesthetic
- A structure made of ~4 types of stone components, visually distinct (color/size indicates weight and friction)
- Player launches balls at the structure one at a time using an **Angry Birds-style slingshot** (no arc preview by default)
- Goal: **land all 5 items** on the structure
- Structures look solid but get **increasingly precarious** as weight is added — physics creates natural escalating tension
- **Miss the structure** (fly past, fall short) → round over
- **Topple the structure** → round over
- **Knock a piece loose but it doesn't fall off** → not game over, but hurts score
- Player can **retry** the same puzzle (full reset), score is primarily **how many rounds it took**
- **Bonus scoring** for structural integrity at the end (how close to optimal solution)

## Item selection (undecided, not for MVP)

Three possible models — to be decided later:
1. All 5 items are the same type
2. Player picks from a palette of 3 types (adds strategy)
3. Puzzle dictates what you get (curated difficulty)

MVP uses **one item type (ball)** — the core game should be fun without variety

## Arc preview (undecided, not for MVP)

The trajectory arc preview is a potential game mechanic, not just UI:
- Maybe you get practice shots with arc visible
- Maybe turning it on lowers your score ceiling
- MVP: no arc preview, pure skill

## Puzzle creation

- Daily puzzle, one per day, same for everyone
- **AI-assisted but human-curated** — tool generates candidates, human approves
- Puzzle designer tool is not needed for MVP

## Scoring

- **Primary:** Number of rounds to solve (fewer = better, like golf)
- **Bonus:** Structural integrity at the end — reward clean solutions

## MVP scope

**In:**
- A structure on screen made of physics-enabled stone pieces
- Slingshot launch mechanic (drag, aim, release)
- One ball type
- Physics simulation — balls land, structure reacts
- Win state (landed all 5) and lose state (missed/toppled)
- Reset to retry

**Out (for now):**
- Daily puzzle rotation
- Multiple item types
- Arc preview
- Scoring system
- Share results
- Puzzle builder tool
- AI puzzle generation
- Accounts, streaks, subscription
- Mobile support
