/** Returns the URL only if it is http(s) (or a site-relative path); otherwise "". Blocks javascript:/data: links. */
export function safeHref(value: string | null | undefined): string {
  const v = (value ?? "").trim();
  if (!v) return "";
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : "";
  } catch {
    return "";
  }
}
