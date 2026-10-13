import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { getBlogPosts, getEvents, getNews, getSiteSettings } from "@/lib/data";

// setup.cjs points DATABASE_URL at an unreachable port. The getters must
// fail loudly so ISR keeps the last good page instead of caching an empty one.
test("public data getters throw when the database is unreachable", { timeout: 60_000 }, async () => {
  const silence = console.error;
  console.error = () => {};
  try {
    for (const getter of [getEvents, getNews, getBlogPosts, getSiteSettings]) {
      await assert.rejects(getter());
    }
  } finally {
    console.error = silence;
  }
});

test("the seed never overwrites existing rows", () => {
  const seed = readFileSync(join(process.cwd(), "prisma/seed.ts"), "utf8");
  const updates = [...seed.matchAll(/update:\s*(\{[^}]*\})/g)].map((m) => m[1].replace(/\s/g, ""));
  assert.ok(updates.length > 0, "expected upserts in the seed");
  for (const update of updates) assert.equal(update, "{}", `seed upsert overwrites data: ${update}`);
  assert.doesNotMatch(seed, /deleteMany/);
});

test("every admin page checks the session itself, not only through the layout", () => {
  const pages: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name === "page.tsx") pages.push(path);
    }
  };
  walk(join(process.cwd(), "src/app/admin/(protected)"));
  assert.ok(pages.length >= 3);
  for (const page of pages) {
    assert.match(readFileSync(page, "utf8"), /await requireAdminPage\(\)/, page);
  }
});
