# Fade 25

> *"The board forgets. You must remember."*

A minimalist spatial memory puzzle game built with pure HTML5, Tailwind CSS, and Web Audio API.

---

## How to Play

1. **The Goal:** Visit all 25 tiles on the board. Each tile can only be visited once.
2. **Moving & Numbers:**
   - Continuing in the same direction builds count: `1 → 2 → 3`.
   - Changing direction (turning) resets count back to `1`.
   - Maximum 3 straight steps in one direction; you must turn on or before the 4th step.
3. **Numbers Dissolve (Fade):**
   - When your number touches an identical visible number on an adjacent tile, both numbers fade away.
4. **Memory Trap:**
   - Faded tiles appear blank, but remain permanently occupied.
   - Stepping on an already visited tile results in Game Over.
5. **Path Review:**
   - Review your complete step-by-step path using the interactive scrubber.
6. **Share Score:**
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
   - **R** to restart.
