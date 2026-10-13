import { test } from "node:test";
import assert from "node:assert/strict";

import { summarizeSchedule, type ScheduleRow } from "@/lib/schedule";

const row = (over: Partial<ScheduleRow>): ScheduleRow => ({
  id: Math.random().toString(36),
  stage: "وحدة",
  ageRange: "",
  day: "السبت",
  time: "٣:٠٠ – ٥:٠٠ م",
  location: "مدرسة روضة الفيحاء — المعرض",
  ...over,
});

test("one shared day, time and place is summarised once", () => {
  const s = summarizeSchedule([row({}), row({ stage: "أخرى" }), row({ stage: "ثالثة" })]);
  assert.deepEqual(s, { day: "السبت", time: "٣:٠٠ – ٥:٠٠ م", location: "مدرسة روضة الفيحاء — المعرض", uniform: true });
});

test("values that differ between units are not merged (nothing is guessed)", () => {
  const s = summarizeSchedule([row({}), row({ day: "الأحد" })]);
  assert.equal(s.uniform, false);
  assert.equal(s.day, "");
  assert.equal(s.time, "٣:٠٠ – ٥:٠٠ م");
});

test("empty schedules and blank values are never reported as shared", () => {
  assert.deepEqual(summarizeSchedule([]), { day: "", time: "", location: "", uniform: false });
  assert.equal(summarizeSchedule([row({ location: " " }), row({ location: "" })]).uniform, false);
});
