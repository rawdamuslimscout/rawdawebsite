/**
 * Parses a JSON-encoded array of strings (e.g. `imageUrls`, `aboutImageIds`).
 * Anything that isn't valid JSON or isn't an array yields [], and non-string
 * entries are dropped. Safe to import from both server and client code.
 */
export function parseStringArray(value: unknown): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}
