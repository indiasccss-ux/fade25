const fs = require('fs');

function solveGrid(N, maxBudget = 2500000) {
  const total = N * N;
  const dirs = [
    { dr: -1, dc: 0, d: 'UP' },
    { dr: 1, dc: 0, d: 'DOWN' },
    { dr: 0, dc: -1, d: 'LEFT' },
    { dr: 0, dc: 1, d: 'RIGHT' }
  ];

  function findPathForStart(startR, startC) {
    const visited = new Uint8Array(total);
    visited[startR * N + startC] = 1;
    const path = [{ r: startR, c: startC, dir: null, num: 1 }];
    let steps = 0;

    function solve(currR, currC, lastDir, straight) {
      if (path.length === total) return true;
      if (++steps > maxBudget) return false;

      const validMoves = [];
      for (let i = 0; i < 4; i++) {
        const { dr, dc, d } = dirs[i];
        const nr = currR + dr, nc = currC + dc;
        if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
          if (!visited[nr * N + nc]) {
            if (d === lastDir && straight >= 3) continue;
            let degree = 0;
            for (let j = 0; j < 4; j++) {
              const snr = nr + dirs[j].dr, snc = nc + dirs[j].dc;
              if (snr >= 0 && snr < N && snc >= 0 && snc < N && !visited[snr * N + snc]) {
                degree++;
              }
            }
            validMoves.push({ dr, dc, d, nr, nc, deg: degree });
          }
        }
      }
      validMoves.sort((a, b) => a.deg - b.deg);

      for (let i = 0; i < validMoves.length; i++) {
        const move = validMoves[i];
        const nextStraight = (lastDir === null) ? 2 : ((move.d === lastDir) ? straight + 1 : 1);
        visited[move.nr * N + move.nc] = 1;
        path.push({ r: move.nr, c: move.nc, dir: move.d, num: nextStraight });
        if (solve(move.nr, move.nc, move.d, nextStraight)) return true;
        path.pop();
        visited[move.nr * N + move.nc] = 0;
      }
      return false;
    }

    const ok = solve(startR, startC, null, 1);
    return ok ? path : null;
  }

  const samplePaths = {};
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if ((N % 2 === 1) && (r + c) % 2 !== 0) continue;
      const p = findPathForStart(r, c);
      if (p) {
        samplePaths[`${r},${c}`] = p;
        console.log(`[PASS] N=${N} (${r}, ${c}) solved in ${p.length} steps`);
      } else {
        console.log(`[SKIP] N=${N} (${r}, ${c}) no direct path within budget`);
      }
    }
  }
  return samplePaths;
}

function transformPath(path, N, op) {
  return path.map(pt => {
    let r = pt.r, c = pt.c;
    let nr = r, nc = c;
    if (op === 1) { nr = c; nc = N - 1 - r; }
    else if (op === 2) { nr = N - 1 - r; nc = N - 1 - c; }
    else if (op === 3) { nr = N - 1 - c; nc = r; }
    else if (op === 4) { nr = r; nc = N - 1 - c; }
    else if (op === 5) { nr = N - 1 - r; nc = c; }
    else if (op === 6) { nr = c; nc = r; }
    else if (op === 7) { nr = N - 1 - c; nc = N - 1 - r; }
    return { r: nr, c: nc };
  });
}

function rebuildPathDirections(coords) {
  const path = [];
  let lastDir = null;
  let straight = 1;
  for (let i = 0; i < coords.length; i++) {
    const { r, c } = coords[i];
    if (i === 0) {
      path.push({ r, c, dir: null, num: 1 });
    } else {
      const prev = coords[i - 1];
      const dr = r - prev.r;
      const dc = c - prev.c;
      let dir;
      if (dr === -1) dir = 'UP';
      else if (dr === 1) dir = 'DOWN';
      else if (dc === -1) dir = 'LEFT';
      else if (dc === 1) dir = 'RIGHT';

      if (lastDir === null) straight = 2;
      else if (dir === lastDir) straight++;
      else straight = 1;

      path.push({ r, c, dir, num: straight });
      lastDir = dir;
    }
  }
  return path;
}

function validatePath(path, N) {
  const total = N * N;
  if (path.length !== total) return false;
  const visited = new Set();
  let lastDir = null;
  let straight = 0;
  for (let i = 0; i < path.length; i++) {
    const { r, c, dir } = path[i];
    if (r < 0 || r >= N || c < 0 || c >= N) return false;
    const key = `${r},${c}`;
    if (visited.has(key)) return false;
    visited.add(key);
    if (i > 0) {
      const prev = path[i - 1];
      const dr = r - prev.r;
      const dc = c - prev.c;
      if (Math.abs(dr) + Math.abs(dc) !== 1) return false;
      let expectedDir;
      if (dr === -1) expectedDir = 'UP';
      else if (dr === 1) expectedDir = 'DOWN';
      else if (dc === -1) expectedDir = 'LEFT';
      else if (dc === 1) expectedDir = 'RIGHT';
      if (dir !== expectedDir) return false;

      if (lastDir === null) straight = 2;
      else if (dir === lastDir) {
        straight++;
        if (straight > 3) return false;
      } else {
        straight = 1;
      }
      lastDir = dir;
    } else {
      straight = 1;
    }
  }
  return true;
}

function expandSymmetries(N, samplePaths) {
  const allSolved = {};
  for (const [k, p] of Object.entries(samplePaths)) {
    for (let op = 0; op < 8; op++) {
      const transformedCoords = transformPath(p, N, op);
      const newPath = rebuildPathDirections(transformedCoords);
      const startKey = `${newPath[0].r},${newPath[0].c}`;
      if (!allSolved[startKey] && validatePath(newPath, N)) {
        allSolved[startKey] = newPath;
      }
    }
  }
  return allSolved;
}

console.log('Solving 5x5...');
const p5 = solveGrid(5);
const exp5 = expandSymmetries(5, p5);

console.log('Solving 6x6...');
const p6 = solveGrid(6);
const exp6 = expandSymmetries(6, p6);

console.log('Solving 7x7...');
const p7 = solveGrid(7);
const exp7 = expandSymmetries(7, p7);

console.log('Solving 8x8...');
const p8 = solveGrid(8);
const exp8 = expandSymmetries(8, p8);

console.log(`Summary:
5x5: ${Object.keys(exp5).length} starts
6x6: ${Object.keys(exp6).length} starts
7x7: ${Object.keys(exp7).length} starts
8x8: ${Object.keys(exp8).length} starts
`);

function compactPaths(expDict) {
  const res = {};
  for (const [k, p] of Object.entries(expDict)) {
    res[k] = p.slice(1).map(step => step.dir[0]).join('');
  }
  return res;
}

const compactSolutions = {
  5: compactPaths(exp5),
  6: compactPaths(exp6),
  7: compactPaths(exp7),
  8: compactPaths(exp8)
};

fs.writeFileSync('C:/Users/Harsha/.gemini/antigravity/scratch/fade25/compact_solutions.json', JSON.stringify(compactSolutions));

const verifiedStarts = {
  5: Object.keys(exp5).map(k => k.split(',').map(Number)),
  6: Object.keys(exp6).map(k => k.split(',').map(Number)),
  7: Object.keys(exp7).map(k => k.split(',').map(Number)),
  8: Object.keys(exp8).map(k => k.split(',').map(Number))
};

const code = `
    /* Verified Winnable Starting Positions & Precomputed Solutions (Solver-Validated) */
    const VERIFIED_STARTS = ${JSON.stringify(verifiedStarts)};

    const COMPACT_SOLUTIONS = ${JSON.stringify(compactSolutions)};
`;

fs.writeFileSync('C:/Users/Harsha/.gemini/antigravity/scratch/fade25/embedded_data.js', code);
console.log('Updated embedded_data.js and compact_solutions.json!');
