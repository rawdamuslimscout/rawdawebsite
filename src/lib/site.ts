/** Single source of truth for the canonical origin (Vercel redirects the apex to www). */
export const SITE_URL = "https://www.rawdamuslimscout.org";
export const SITE_HOST = "www.rawdamuslimscout.org";
export const SITE_NAME = "فوج روضة الفيحاء";
/** Homepage / default document title. */
export const SITE_DEFAULT_TITLE =
  "فوج روضة الفيحاء | الكشاف المسلم في لبنان – مفوضية الشمال، طرابلس";
export const SITE_NAME_LATIN = "Rawda Al-Fayhaa Scout Troop";
export const ORG_NAME = "جمعية الكشاف المسلم في لبنان";
export const SITE_EMAIL = "info@rawdamuslimscout.org";
export const SITE_LOGO_PATH = "/images/logo.png";

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
