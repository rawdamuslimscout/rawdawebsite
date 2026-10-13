/**
 * Meeting-schedule helpers shared by the homepage and /join. They only
 * regroup what the admin entered; no value is invented or normalised.
 */

export type ScheduleRow = {
  id: string;
  stage: string;
  ageRange: string;
  day: string;
  time: string;
  location: string;
};

export type MeetingSummary = {
  /** Set when every row has the same (non-empty) value; otherwise "". */
  day: string;
  time: string;
  location: string;
  /** True when day, time and location are all shared, so one statement covers every unit. */
  uniform: boolean;
};

const shared = (values: string[]) => {
  const v = values.map((x) => x.trim());
  return v.length > 0 && v[0] !== "" && v.every((x) => x === v[0]) ? v[0] : "";
};

export function summarizeSchedule(rows: ScheduleRow[]): MeetingSummary {
  const day = shared(rows.map((r) => r.day));
  const time = shared(rows.map((r) => r.time));
  const location = shared(rows.map((r) => r.location));
  return { day, time, location, uniform: !!(day && time && location) };
}
