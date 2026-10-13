/**
 * Whether an event is still upcoming (or running) on `now`'s calendar day.
 * The last day is `endDate`, falling back to `startDate` for one-day events.
 * Returns undefined when no real dates were entered, so callers can tell
 * "unknown" apart from "past" and avoid labelling either as upcoming.
 * Days are compared in UTC: close enough to Asia/Beirut for a date-only check.
 */
export function isEventUpcoming(
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  now: Date = new Date(),
): boolean | undefined {
  const last = endDate ?? startDate;
  if (!last) return undefined;
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  return last.getTime() >= today.getTime();
}
