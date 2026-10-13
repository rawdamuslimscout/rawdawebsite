/**
 * Gallery grid layout without holes.
 *
 * Tiles come in admin-chosen sizes (2x2, 2x1, 1x2, 1x1) on desktop and 1x1
 * on smaller screens. Some combinations leave empty cells that no remaining
 * tile can fill (e.g. 7 tiles on a 2- or 3-column grid, or a filtered view
 * with one 2x2 and one 1x1 tile). This mirrors the browser's
 * `grid-auto-flow: dense` placement, then grows tiles into the empty cells
 * next to them (sideways, or downwards) until every row is full.
 *
 * Order is never changed. Growing never moves anything: a bigger tile still
 * fits where it was placed (the extra cells were empty), it could not have
 * fitted anywhere earlier (a smaller tile would have), and no later tile used
 * those cells.
 *
 * Rarely, a hole is boxed in (e.g. between a tall tile and a wide one) and no
 * neighbour can grow into it. Then the multi-row tile next to the hole loses
 * one row and the layout is rebuilt. Rows of single-height tiles can always be
 * completed by widening, so this always ends with no holes.
 */

export type TileSpan = { col: number; row: number };

/** Dense auto-placement, as the browser does it. Returns each tile's top-left cell and the grid. */
export function placeTiles(spans: TileSpan[], columns: number) {
  const grid: number[][] = [];
  const rowAt = (r: number) => (grid[r] ??= new Array<number>(columns).fill(-1));
  const fits = (r: number, c: number, s: TileSpan) => {
    for (let dr = 0; dr < s.row; dr++)
      for (let dc = 0; dc < s.col; dc++) if (rowAt(r + dr)[c + dc] !== -1) return false;
    return true;
  };
  const pos: { r: number; c: number }[] = [];
  spans.forEach((s, i) => {
    for (let r = 0; ; r++) {
      for (let c = 0; c + s.col <= columns; c++) {
        if (!fits(r, c, s)) continue;
        for (let dr = 0; dr < s.row; dr++)
          for (let dc = 0; dc < s.col; dc++) rowAt(r + dr)[c + dc] = i;
        pos[i] = { r, c };
        return;
      }
    }
  });
  return { grid, pos };
}

/** Number of empty cells inside the occupied rows of a dense layout. */
export function countGaps(spans: TileSpan[], columns: number): number {
  return placeTiles(spans, columns).grid.reduce((n, row) => n + row.filter((cell) => cell === -1).length, 0);
}

export function fillGalleryGaps(spans: TileSpan[], columns = 4): TileSpan[] {
  const sizes = spans.map((s) => ({
    col: Math.max(1, Math.min(s.col, columns)),
    row: Math.max(1, s.row),
  }));
  // Each pass either succeeds or removes one row from one tile, so this ends.
  for (;;) {
    const { out, hole } = growIntoGaps(sizes, columns);
    if (!hole) return out;
    const { grid, pos } = placeTiles(sizes, columns);
    const near = [hole.c > 0 ? grid[hole.r][hole.c - 1] : -1, hole.r > 0 ? grid[hole.r - 1][hole.c] : -1, grid[hole.r][hole.c + 1] ?? -1];
    const k = near.find((i) => i >= 0 && sizes[i].row > 1) ?? sizes.findIndex((s, i) => s.row > 1 && pos[i].r <= hole.r);
    if (k < 0) return out; // unreachable: single-row layouts never keep a hole
    sizes[k] = { ...sizes[k], row: sizes[k].row - 1 };
  }
}

/** Grows tiles into empty cells; returns the result and the first hole left, if any. */
function growIntoGaps(spans: TileSpan[], columns: number): { out: TileSpan[]; hole?: { r: number; c: number } } {
  const out = spans.map((s) => ({ ...s }));
  if (out.length === 0) return { out };
  const { grid, pos } = placeTiles(out, columns);
  const empty = (r: number, c: number) => (grid[r]?.[c] ?? 0) === -1;

  // Widen tile k by one column (its whole height must be free at `c`).
  const widen = (k: number, c: number) => {
    const { r: top } = pos[k];
    for (let dr = 0; dr < out[k].row; dr++) if (!empty(top + dr, c)) return false;
    for (let dr = 0; dr < out[k].row; dr++) grid[top + dr][c] = k;
    out[k].col += 1;
    return true;
  };
  // Grow tile k one row down (its whole width must be free in row `r`).
  const deepen = (k: number, r: number) => {
    const { c: left } = pos[k];
    for (let dc = 0; dc < out[k].col; dc++) if (!empty(r, left + dc)) return false;
    for (let dc = 0; dc < out[k].col; dc++) grid[r][left + dc] = k;
    out[k].row += 1;
    return true;
  };

  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < columns; c++) {
        if (!empty(r, c)) continue;
        // 1) the tile ending just before this cell, in this row, grows sideways;
        const before = c > 0 ? grid[r][c - 1] : -1;
        if (before >= 0 && pos[before].c + out[before].col === c && widen(before, c)) {
          changed = true;
          continue;
        }
        // 2) otherwise the tile ending just above this cell grows downwards.
        const above = r > 0 ? grid[r - 1][c] : -1;
        if (above >= 0 && pos[above].r + out[above].row === r && deepen(above, r)) changed = true;
      }
    }
  }
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < columns; c++) if (empty(r, c)) return { out, hole: { r, c } };
  return { out };
}
