# Fade 25

> *"The board forgets. You must remember."*

A minimalist spatial memory puzzle game built with pure HTML5, Tailwind CSS, and Web Audio API.

---

## Grid Progression & Levels

- **4×4 — Guided Tutorial**: 16 tiles with live move suggestions and full blueprint route preview.
- **5×5 — Classic**: 25 tiles. The quintessential spatial memory challenge.
- **6×6 — Advanced**: 36 tiles. Unlocks after clearing 5×5 Classic.
- **7×7 — Expert**: 49 tiles. Unlocks after clearing 6×6 Advanced.
- **8×8 — Master**: 64 tiles. Unlocks after clearing 7×7 Expert.

---

## How to Play

1. **The Goal:** Visit all tiles on the board. Each tile can only be visited once.
2. **Natural Momentum & Turning:**
   - Continuing in the same direction builds count: `1 → 2 → 3`.
   - Changing direction (turning) resets count back to `1`.
   - Maximum 3 straight steps in one direction; you must turn on or before the 4th step.
3. **Numbers Dissolve (Fade):**
   - When your number touches an identical visible number on an adjacent tile, both numbers fade away simultaneously.
4. **Memory Trap:**
   - Faded tiles appear blank and identical to unvisited cells, but remain permanently occupied.
   - Stepping on an already visited tile results in Game Over.
5. **Winnable Path Guarantee:**
   - Every selectable starting tile is mathematically verified with a complete Hamiltonian path solver.
6. **Path Review & Replay:**
   - Review your complete step-by-step path using the interactive scrubber.
7. **Share Score:**
   - Copy a clean grid score card to share.

---

## How to Run

1. Open `index.html` in any modern web browser, or run a local server:
   ```bash
   node server.js
   # or
   npx serve .
   ```
2. Controls:
   - **Arrow Keys** or **W, A, S, D** to move.
   - **Click / Tap** on adjacent boxes.
   - **Swipe** on mobile touchscreens.
   - **R** to restart.

---

## Automated Test Suite

Run the headless verification suite:
```bash
node test_expansion.js
```
