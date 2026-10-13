import { test } from "node:test";
import assert from "node:assert/strict";
import { isEventUpcoming } from "@/lib/events";

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
const now = new Date("2026-10-12T15:30:00.000Z");

test("events without dates are unknown, never upcoming", () => {
  assert.equal(isEventUpcoming(null, null, now), undefined);
  assert.equal(isEventUpcoming(undefined, undefined, now), undefined);
});

test("past events are not upcoming", () => {
  // The August 2026 camp from the audit, checked in October.
  assert.equal(isEventUpcoming(day("2026-08-27"), day("2026-08-29"), now), false);
  assert.equal(isEventUpcoming(day("2026-10-11"), null, now), false);
});

test("an event is upcoming through its whole last day", () => {
  assert.equal(isEventUpcoming(day("2026-10-12"), null, now), true);
  assert.equal(isEventUpcoming(day("2026-10-10"), day("2026-10-12"), now), true);
});

test("future events are upcoming; endDate takes precedence over startDate", () => {
  assert.equal(isEventUpcoming(day("2026-11-01"), null, now), true);
  assert.equal(isEventUpcoming(day("2026-10-01"), day("2026-10-20"), now), true);
});
