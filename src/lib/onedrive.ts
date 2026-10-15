/**
 * OneDrive-hosted library files. The site never fetches these files itself:
 * the visitor's browser loads Microsoft's own viewer in an iframe (or opens
 * the link in a new tab), so file bytes never pass through our servers.
 */

/** Origins allowed in the CSP `frame-src` for the OneDrive embed viewer. */
export const ONEDRIVE_FRAME_ORIGINS = [
  "https://onedrive.live.com",
  "https://1drv.ms",
];

export type OneDriveLink = {
  /** Opens the file on OneDrive in a new tab. */
  openUrl: string;
  /** Microsoft embed URL for the in-page preview, or null when the link isn't an embed link. */
  embedUrl: string | null;
};

const PERSONAL_HOSTS = new Set(["onedrive.live.com", "1drv.ms"]);
// OneDrive for Business / SharePoint (e.g. contoso-my.sharepoint.com). Links
// only: their pages refuse to be framed by other sites without tenant setup.
const BUSINESS_HOST = /^[a-z0-9-]+\.sharepoint\.com$/;

/** Accepts the URL itself or OneDrive's "Embed" <iframe> code and returns the URL. */
export function extractOneDriveUrl(input: string): string {
  const text = input.trim();
  if (!text.startsWith("<")) return text;
  const match = text.match(/\ssrc\s*=\s*(["'])(.*?)\1/i);
  return match ? match[2].replace(/&amp;/gi, "&").trim() : "";
}

/**
 * Parses a stored OneDrive link (untrusted). Returns null unless it is an
 * https URL on a Microsoft OneDrive host. Only recognised embed URLs
 * (`onedrive.live.com/embed…` or `1drv.ms/…?embed=1`) are used for the
 * in-page preview; any other share link is offered as "open in OneDrive".
 */
export function parseOneDriveUrl(
  value: string | null | undefined,
): OneDriveLink | null {
  const raw = extractOneDriveUrl(value ?? "");
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port)
    return null;

  const host = url.hostname.toLowerCase();
  const personal = PERSONAL_HOSTS.has(host);
  if (!personal && !BUSINESS_HOST.test(host)) return null;

  const href = url.toString();
  if (!personal) return { openUrl: href, embedUrl: null };

  if (host === "onedrive.live.com" && /^\/embed\b/i.test(url.pathname))
    return { openUrl: href, embedUrl: href };

  if (host === "1drv.ms" && url.searchParams.get("embed") === "1") {
    // The plain share link (without the embed flags) opens the full viewer.
    const open = new URL(href);
    open.searchParams.delete("embed");
    open.searchParams.delete("em");
    return { openUrl: open.toString(), embedUrl: href };
  }

  return { openUrl: href, embedUrl: null };
}
