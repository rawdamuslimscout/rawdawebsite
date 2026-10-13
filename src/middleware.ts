import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";

// Uploaded images/files are served from Supabase Storage (public bucket).
const SUPABASE_ORIGIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").origin;
  } catch {
    return "";
  }
})();
// Map tiles (LeafletMap / LocationPickerMap) and place search (LocationPicker).
const OSM_TILES = "https://tile.openstreetmap.org";
const OSM_SEARCH = "https://nominatim.openstreetmap.org";

const src = (...hosts: string[]) => hosts.filter(Boolean).join(" ");

/**
 * Security headers sent with every page response.
 * Scripts keep 'unsafe-inline': Next.js emits inline bootstrap scripts, and the
 * public pages are statically rendered / ISR, so a per-request nonce would force
 * every page to render dynamically. Remote content is limited to our own origin,
 * Supabase Storage and OpenStreetMap; framing, plugins, base tag and form
 * targets are locked down.
 */
const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'" +
      (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
    "style-src 'self' 'unsafe-inline'",
    `img-src ${src("'self'", "data:", "blob:", SUPABASE_ORIGIN, OSM_TILES)}`,
    "font-src 'self' data:",
    `connect-src ${src("'self'", SUPABASE_ORIGIN, OSM_SEARCH)}`,
    `frame-src ${src("'self'", SUPABASE_ORIGIN)}`,
    `media-src ${src("'self'", SUPABASE_ORIGIN)}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join("; "),
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-site",
  "X-DNS-Prefetch-Control": "on",
};

function withSecurityHeaders(res: NextResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

/**
 * Edge-side pre-check of the session cookie (same format as lib/session.ts):
 * HMAC signature + expiry via Web Crypto. Revocation (sessionVersion) needs the
 * database, so the authoritative check stays in the admin layout/pages/actions.
 */
async function hasValidSessionCookie(token: string | undefined): Promise<boolean> {
  const secret = process.env.SESSION_SECRET;
  if (!token || token.length > 300 || !secret || secret.length < 32) return false;
  const parts = token.split(".");
  if (parts.length !== 5 || parts[0] !== "v2") return false;
  const [, adminId, expiresAtStr, versionStr, signature] = parts;
  if (!/^\d{10,16}$/.test(expiresAtStr) || Date.now() > Number(expiresAtStr)) return false;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`v2.${adminId}.${expiresAtStr}.${versionStr}`));
    const expected = Array.from(new Uint8Array(mac), (b) => b.toString(16).padStart(2, "0")).join("");
    if (expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    return diff === 0;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");

  if (isAdmin) {
    const isLoginPage = req.nextUrl.pathname === "/admin/login";

    if (!isLoginPage && !(await hasValidSessionCookie(req.cookies.get(SESSION_COOKIE_NAME)?.value))) {
      const loginUrl = new URL("/admin/login", req.url);
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico|gif|woff2?)$).*)",
  ],
};
