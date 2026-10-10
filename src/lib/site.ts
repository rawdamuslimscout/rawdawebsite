/** Single source of truth for the canonical origin (Vercel redirects the apex to www). */
export const SITE_URL = "https://www.rawdamuslimscout.org";
export const SITE_HOST = "www.rawdamuslimscout.org";
export const SITE_NAME = "فوج روضة الفيحاء";
export const ORG_NAME = "جمعية الكشّاف المسلم في لبنان";

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
