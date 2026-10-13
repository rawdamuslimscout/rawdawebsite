import { test } from "node:test";
import assert from "node:assert/strict";

import { countGaps, fillGalleryGaps, type TileSpan } from "@/lib/gallery-layout";

const S = (col: number, row: number): TileSpan => ({ col, row });
const large = S(2, 2), medium = S(2, 1), small = S(1, 1), tall = S(1, 2);

test("the current gallery (medium, large, medium, 3x small, medium) has no holes on desktop", () => {
  const spans = [medium, large, medium, small, small, small, medium];
  assert.ok(countGaps(spans, 4) > 0, "the unfilled layout really had holes");
  const out = fillGalleryGaps(spans, 4);
  assert.equal(countGaps(out, 4), 0);
  // Only tiles next to a hole grow; nothing shrinks, order is kept.
  assert.deepEqual(out, [medium, large, medium, small, small, S(2, 1), S(4, 1)]);
});

test("phones (2 columns) and tablets (3 columns): an odd last row is filled", () => {
  const seven = Array.from({ length: 7 }, () => small);
  assert.equal(countGaps(seven, 2), 1);
  assert.equal(countGaps(seven, 3), 2);
  assert.equal(countGaps(fillGalleryGaps(seven, 2), 2), 0);
  assert.equal(countGaps(fillGalleryGaps(seven, 3), 3), 0);
});

test("filtered views: one 2x2 tile and one 1x1 tile fill a full desktop block", () => {
  const out = fillGalleryGaps([large, small], 4);
  assert.equal(countGaps(out, 4), 0);
  assert.deepEqual(out, [large, S(2, 2)]);
});

test("layouts that already fill every row are left unchanged", () => {
  const spans = [large, medium, small, small, small, small, small, small];
  assert.equal(countGaps(spans, 4), 0);
  assert.deepEqual(fillGalleryGaps(spans, 4), spans);
});

test("any combination at 2, 3 or 4 columns ends with no holes; widths never shrink and stay in the grid", () => {
  const kinds = [large, medium, small, tall];
  let checked = 0;
  for (let seed = 0; seed < 400; seed++) {
    const n = 1 + (seed % 12);
    const spans = Array.from({ length: n }, (_, i) => kinds[(seed * 7 + i * 3 + (seed >> 3)) % kinds.length]);
    for (const columns of [2, 3, 4]) {
      // Below desktop every tile is 1x1 (spans start at the lg breakpoint).
      const input = columns === 4 ? spans : spans.map(() => small);
      const out = fillGalleryGaps(input, columns);
      assert.equal(countGaps(out, columns), 0, `seed ${seed}, ${columns} cols: ${JSON.stringify(input)}`);
      out.forEach((s, i) => {
        // Width never shrinks; a tile only loses height when growing alone can't close a boxed-in hole.
        assert.ok(s.col >= Math.min(input[i].col, columns) && s.row >= 1, `seed ${seed}: shrank`);
        assert.ok(s.col <= columns, `seed ${seed}: wider than the grid`);
      });
      checked++;
    }
  }
  assert.equal(checked, 1200);
});

test("oversized tiles are clamped to the grid width; empty input stays empty", () => {
  assert.deepEqual(fillGalleryGaps([S(9, 1)], 4), [S(4, 1)]);
  assert.deepEqual(fillGalleryGaps([], 4), []);
});
