import { test } from "node:test";
import assert from "node:assert/strict";
import { coerceValues, getResourceConfig } from "@/lib/admin-resources";

const library = getResourceConfig("library")!;
const events = getResourceConfig("events")!;
const getter = (values: Record<string, unknown>) => (name: string) => values[name];

test("library fileUrl rejects javascript: and other non-http links (stored XSS)", () => {
  for (const bad of ["javascript:alert(document.cookie)", "data:text/html,x", "vbscript:x"]) {
    assert.throws(() => coerceValues(library, getter({ fileUrl: bad })), bad);
  }
});

test("library fileUrl accepts https links and empty values", () => {
  assert.equal(
    coerceValues(library, getter({ fileUrl: "https://example.com/guide.pdf" })).fileUrl,
    "https://example.com/guide.pdf",
  );
  assert.equal(coerceValues(library, getter({ fileUrl: "" })).fileUrl, "");
});

test("undeclared fields are never mass-assigned", () => {
  const data = coerceValues(library, getter({ id: "x", createdAt: "2020-01-01", isAdmin: true }));
  assert.deepEqual(Object.keys(data), []);
});

test("event dates are parsed as UTC calendar days", () => {
  const data = coerceValues(events, getter({ startDate: "2026-08-27", endDate: "2026-08-29" }));
  assert.equal((data.startDate as Date).toISOString(), "2026-08-27T00:00:00.000Z");
  assert.equal((data.endDate as Date).toISOString(), "2026-08-29T00:00:00.000Z");
});

test("event dates are optional, and invalid dates are rejected", () => {
  assert.equal(coerceValues(events, getter({ startDate: "", endDate: "" })).startDate, null);
  for (const bad of ["2026-02-31", "31/08/2026", "tomorrow", "1800-01-01"]) {
    assert.throws(() => coerceValues(events, getter({ startDate: bad })), bad);
  }
});
