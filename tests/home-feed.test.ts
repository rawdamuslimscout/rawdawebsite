import { test } from "node:test";
import assert from "node:assert/strict";

import { hasDate, homeEvents, homeNews } from "@/lib/home-feed";

test("only dated news qualify; at most three, newest publish date first", () => {
  const items = [
    { id: "a", date: "أيلول ٢٠٢٦" },
    { id: "b", date: "" },
    { id: "c", date: "", publishedAt: "2026-09-20T00:00:00.000Z" },
    { id: "d", date: "آب ٢٠٢٦" },
    { id: "e", date: "رمضان ٢٠٢٦" },
  ];
  assert.deepEqual(homeNews(items).map((i) => i.id), ["c", "a", "d"]);
});

test("the news section is hidden when fewer than two items are dated", () => {
  assert.deepEqual(homeNews([{ date: "أيلول ٢٠٢٦" }, { date: "" }, { date: "  " }]), []);
  assert.deepEqual(homeNews([]), []);
  assert.equal(homeNews([{ date: "أيلول" }, { date: "آب" }]).length, 2);
});

test("an invalid publish date doesn't count as a date", () => {
  assert.equal(hasDate({ date: "", publishedAt: "not a date" }), false);
  assert.equal(hasDate({ date: "", publishedAt: "2026-10-01T00:00:00.000Z" }), true);
});

test("events appear only when their real dates are still ahead, soonest first", () => {
  const events = [
    { id: "past", isUpcoming: false, startDate: "2026-08-21" },
    { id: "undated", isUpcoming: undefined },
    { id: "later", isUpcoming: true, startDate: "2026-12-01" },
    { id: "soon", isUpcoming: true, startDate: "2026-10-20" },
  ];
  assert.deepEqual(homeEvents(events).map((e) => e.id), ["soon", "later"]);
  assert.deepEqual(homeEvents([{ isUpcoming: undefined }, { isUpcoming: false }]), []);
});
