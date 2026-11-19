function findPath(r, c) {
  const visited = Array(5).fill(0).map(() => Array(5).fill(false));
  visited[r][c] = true;
  const path = [{r, c, dir: null, num: 1}];

  function solve(currR, currC, lastDir, straight) {
    if (path.length === 25) return true;
    const dirs = [
      { dr: -1, dc: 0, d: 'UP' },
      { dr: 1, dc: 0, d: 'DOWN' },
      { dr: 0, dc: -1, d: 'LEFT' },
      { dr: 0, dc: 1, d: 'RIGHT' }
    ];
    const validMoves = [];
    for (const {dr, dc, d} of dirs) {
      const nr = currR + dr, nc = currC + dc;
      if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && !visited[nr][nc]) {
        if (d === lastDir && straight >= 3) continue;
        let unvisitedNeighbors = 0;
        for (const sub of dirs) {
          const snr = nr + sub.dr, snc = nc + sub.dc;
          if (snr >= 0 && snr < 5 && snc >= 0 && snc < 5 && !visited[snr][snc]) {
            unvisitedNeighbors++;
          }
        }
        validMoves.push({ dr, dc, d, nr, nc, deg: unvisitedNeighbors });
      }
    }
    // Warnsdorff heuristic
    validMoves.sort((a, b) => a.deg - b.deg);

    for (const move of validMoves) {
      const nextStraight = move.d === lastDir ? straight + 1 : 1;
      visited[move.nr][move.nc] = true;
      path.push({ r: move.nr, c: move.nc, dir: move.d });
      if (solve(move.nr, move.nc, move.d, nextStraight)) return true;
      path.pop();
      visited[move.nr][move.nc] = false;
    }
    return false;
  }

  const success = solve(r, c, null, 0);
  return success ? path : null;
}

const parityStarts = [];
for (let r = 0; r < 5; r++) {
  for (let c = 0; c < 5; c++) {
    if ((r + c) % 2 === 0) {
      const p = findPath(r, c);
      console.log(`Start (${r}, ${c}): ${p ? 'FOUND (' + p.length + ' steps)' : 'NONE'}`);
      if (p) parityStarts.push({r, c});
    }
  }
}
console.log('Total solvable starts out of 13 parity tiles:', parityStarts.length);
