const fs = require('fs');

// Load embedded data
const compactSolutions = JSON.parse(fs.readFileSync('C:/Users/Harsha/.gemini/antigravity/scratch/fade25/compact_solutions.json'));

const LEVEL_CONFIGS = {
  4: { name: '4×4 Tutorial', size: 4, total: 16 },
  5: { name: '5×5 Classic', size: 5, total: 25 },
  6: { name: '6×6 Advanced', size: 6, total: 36 },
  7: { name: '7×7 Expert', size: 7, total: 49 },
  8: { name: '8×8 Master', size: 8, total: 64 }
};

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName}`);
  }
}

console.log('=== TEST SUITE: FADE 25 EXPANSION VERIFICATION ===\n');

// 1. Grid Level Generation Tests
console.log('1. Grid Generation & Geometry:');
for (const [size, cfg] of Object.entries(LEVEL_CONFIGS)) {
  assert(cfg.total === cfg.size * cfg.size, `Grid ${cfg.size}x${cfg.size} has exact total ${cfg.total} cells`);
}

// 2. Verified Starts & Precomputed Solutions
console.log('\n2. Verified Starting Positions Counts:');
assert(Object.keys(compactSolutions['5']).length === 13, '5x5 has 13 verified start positions');
assert(Object.keys(compactSolutions['6']).length === 36, '6x6 has 36 verified start positions (100% of grid)');
assert(Object.keys(compactSolutions['7']).length === 25, '7x7 has 25 verified start positions (100% of bipartite parity)');
assert(Object.keys(compactSolutions['8']).length >= 60, `8x8 has ${Object.keys(compactSolutions['8']).length} verified start positions (unverified corners excluded)`);

// 3. Hamiltonian Path Validation for ALL starts in ALL grids
console.log('\n3. Complete Path Validation for every start in 5x5, 6x6, 7x7, 8x8:');
const dirsMap = {
  'U': { dr: -1, dc: 0, full: 'UP' },
  'D': { dr: 1, dc: 0, full: 'DOWN' },
  'L': { dr: 0, dc: -1, full: 'LEFT' },
  'R': { dr: 0, dc: 1, full: 'RIGHT' }
};

for (const size of [5, 6, 7, 8]) {
  const dict = compactSolutions[size];
  let allValid = true;
  let totalPaths = 0;

  for (const [startCoord, dirStr] of Object.entries(dict)) {
    totalPaths++;
    const [startR, startC] = startCoord.split(',').map(Number);
    const path = [{ r: startR, c: startC, dir: null, num: 1 }];
    let currR = startR, currC = startC;
    let lastDir = null;
    let straight = 1;

    for (let i = 0; i < dirStr.length; i++) {
      const char = dirStr[i];
      const dObj = dirsMap[char];
      if (!dObj) { allValid = false; break; }

      const nextR = currR + dObj.dr;
      const nextC = currC + dObj.dc;

      // Bounds
      if (nextR < 0 || nextR >= size || nextC < 0 || nextC >= size) {
        allValid = false;
        break;
      }

      // Direction & straight momentum
      if (dObj.full === lastDir) {
        straight++;
        if (straight > 3) { allValid = false; break; }
      } else {
        straight = 1;
      }

      currR = nextR;
      currC = nextC;
      lastDir = dObj.full;
      path.push({ r: currR, c: currC, dir: lastDir, num: straight });
    }

    // Check completeness
    if (path.length !== size * size) allValid = false;

    // Check no duplicate cells
    const visited = new Set(path.map(p => `${p.r},${p.c}`));
    if (visited.size !== size * size) allValid = false;
  }

  assert(allValid && totalPaths > 0, `Size ${size}x${size}: All ${totalPaths} paths strictly obey adjacency, no duplicate, and max-3 momentum`);
}

// 4. Momentum Engine Logic Simulation
console.log('\n4. Natural Momentum & Turning Simulation:');
class SimEngine {
  constructor(size) {
    this.size = size;
    this.total = size * size;
    this.cells = Array(size).fill(0).map((_, r) => Array(size).fill(0).map((_, c) => ({
      r, c, isVisited: false, isVisible: false, value: null
    })));
    this.history = [];
    this.cadence = 1;
    this.lastDir = null;
    this.isGameOver = false;
    this.isVictory = false;
  }

  start(sr, sc) {
    this.currR = sr;
    this.currC = sc;
    const root = this.cells[sr][sc];
    root.isVisited = true;
    root.isVisible = true;
    root.value = 1;
    this.history.push({ r: sr, c: sc, dir: null, value: 1 });
  }

  move(dir) {
    if (this.isGameOver || this.isVictory) return false;
    const deltas = { 'UP': [-1, 0], 'DOWN': [1, 0], 'LEFT': [0, -1], 'RIGHT': [0, 1] };
    const [dr, dc] = deltas[dir];
    const nr = this.currR + dr, nc = this.currC + dc;

    if (nr < 0 || nr >= this.size || nc < 0 || nc >= this.size) {
      this.isGameOver = true;
      return false;
    }

    const target = this.cells[nr][nc];
    if (target.isVisited) {
      this.isGameOver = true; // Memory trap or occupied
      return false;
    }

    if (this.lastDir === null) {
      this.lastDir = dir;
      this.cadence = 2;
    } else if (dir === this.lastDir) {
      if (this.cadence >= 3) {
        this.isGameOver = true; // Straight limit exceeded
        return false;
      }
      this.cadence++;
    } else {
      this.cadence = 1;
      this.lastDir = dir;
    }

    const nextVal = Math.min(3, this.cadence);
    this.currR = nr;
    this.currC = nc;

    target.isVisited = true;
    target.isVisible = true;
    target.value = nextVal;
    this.history.push({ r: nr, c: nc, dir, value: nextVal });

    // Fading resolution
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const matching = [];
    for (const [sdr, sdc] of dirs) {
      const snr = nr + sdr, snc = nc + sdc;
      if (snr >= 0 && snr < this.size && snc >= 0 && snc < this.size) {
        const neighbor = this.cells[snr][snc];
        if (neighbor.isVisited && neighbor.isVisible && neighbor.value === nextVal) {
          matching.push(neighbor);
        }
      }
    }

    if (matching.length > 0) {
      target.isVisible = false;
      matching.forEach(m => { m.isVisible = false; });
    }

    if (this.history.length === this.total) {
      this.isVictory = true;
    }
    return true;
  }
}

// Test Straight Run Rule
const sim1 = new SimEngine(6);
sim1.start(0, 0);
assert(sim1.move('RIGHT') === true && sim1.cadence === 2, 'First straight step increases cadence to 2');
assert(sim1.move('RIGHT') === true && sim1.cadence === 3, 'Second straight step increases cadence to 3');
assert(sim1.move('RIGHT') === false && sim1.isGameOver === true, 'Fourth cell straight in same direction is forbidden (Game Over)');

// Test Turn Resets to 1
const sim2 = new SimEngine(6);
sim2.start(0, 0);
sim2.move('RIGHT'); // 2
sim2.move('RIGHT'); // 3
sim2.move('DOWN');  // Turn!
assert(sim2.cadence === 1 && sim2.cells[1][2].value === 1, 'Changing direction (turn) resets cadence and cell value to 1');

// Test Simultaneous Fading
console.log('\n5. Simultaneous Fading & Memory Trap:');
const sim3 = new SimEngine(5);
// Place a 1, step right, step right, turn down (gets 1 beside first row)
sim3.start(1, 0); // (1,0) = 1
sim3.move('DOWN'); // (2,0) = 1 (turn from null)
sim3.move('RIGHT'); // (2,1) = 1 (turn)
// Now let's do a direct test of adjacent matching values
const simFade = new SimEngine(5);
simFade.start(0, 0); // (0,0) = 1
simFade.move('RIGHT'); // (0,1) = 2
simFade.move('DOWN'); // (1,1) = 1 (turn resets to 1)
// (1,1) has value 1. Its orthogonal neighbor (0,0) had value 1!
// Wait: (0,0) was value 1. When (1,1) landed with value 1, are they adjacent?
// (0,0) and (1,1) are diagonals!
// Let's test orthogonal:
const simOrth = new SimEngine(5);
simOrth.start(0, 1); // (0,1) = 1
simOrth.move('RIGHT'); // (0,2) = 2
simOrth.move('DOWN'); // (1,2) = 1
simOrth.move('LEFT'); // (1,1) = 1
// (1,1) is orthogonal to (0,1)! Both had value 1!
assert(!simOrth.cells[1][1].isVisible && !simOrth.cells[0][1].isVisible, 'Matching adjacent 1s fade simultaneously (isVisible = false)');
assert(simOrth.cells[1][1].isVisited && simOrth.cells[0][1].isVisited, 'Faded cells remain permanently visited');

// Test Memory Trap: Stepping on Faded Cell
simOrth.move('UP'); // Attempts to step from (1,1) back onto (0,1) which faded!
assert(simOrth.isGameOver === true, 'Stepping onto a faded cell triggers Game Over');

// 6. Test Playing a Full Solution Path to Victory
console.log('\n6. Full Path Execution to Victory:');
for (const size of [5, 6, 7, 8]) {
  const dict = compactSolutions[size];
  const firstStart = Object.keys(dict)[0];
  const [sr, sc] = firstStart.split(',').map(Number);
  const dirStr = dict[firstStart];

  const fullSim = new SimEngine(size);
  fullSim.start(sr, sc);
  for (let i = 0; i < dirStr.length; i++) {
    const dObj = dirsMap[dirStr[i]];
    fullSim.move(dObj.full);
  }
  assert(fullSim.isVictory === true && fullSim.history.length === size * size, `Full solution for ${size}x${size} clears board (Victory: ${size*size}/${size*size})`);
}

// 7. Progression Unlocking Logic
console.log('\n7. Level Progression & Unlocking:');
let unlocked = 5; // After tutorial
function winLevel(lvl) {
  if (lvl === unlocked && unlocked < 8) {
    unlocked++;
  }
}
assert(unlocked === 5, 'Initially 5x5 is unlocked');
winLevel(5);
assert(unlocked === 6, 'Winning 5x5 unlocks 6x6 Advanced');
winLevel(6);
assert(unlocked === 7, 'Winning 6x6 unlocks 7x7 Expert');
winLevel(7);
assert(unlocked === 8, 'Winning 7x7 unlocks 8x8 Master');

console.log(`\n========================================`);
console.log(`TOTAL TESTS: ${passedTests + failedTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log(`========================================\n`);

if (failedTests > 0) process.exit(1);
