import type { NextRequest } from "next/server";
import { SITE_HOST } from "@/lib/site";

/**
 * Client IP for rate limiting. Vercel sets x-real-ip / x-vercel-forwarded-for
 * itself (a client can't spoof them), while the first X-Forwarded-For entry is
 * client-controlled, so XFF is only the fallback for other hosts / local dev.
 */
export function getClientIp(req: Pick<NextRequest, "headers">): string {
  const first = (name: string) => req.headers.get(name)?.split(",")[0]?.trim() || "";
  const ip =
    first("x-real-ip") || first("x-vercel-forwarded-for") || first("x-forwarded-for") || "unknown";
  return ip.slice(0, 64);
}

/** CSRF defence in depth for cookie-authenticated JSON endpoints (on top of SameSite=Strict). */
export function isSameOrigin(req: Pick<NextRequest, "headers">): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production" ? true : req.headers.get("sec-fetch-site") === "same-origin";
  try {
    const host = new URL(origin).host;
    const reqHost = req.headers.get("host");
    return host === reqHost || host === SITE_HOST;
  } catch {
    return false;
  }
}

/** Reads a small JSON body safely (size + content-type limited). */
export async function readJson(req: NextRequest, maxBytes = 20_000): Promise<Record<string, unknown> | null> {
  if (!(req.headers.get("content-type") || "").includes("application/json")) return null;
  const len = Number(req.headers.get("content-length") || 0);
  if (len > maxBytes) return null;
  try {
    const text = await req.text();
    if (text.length > maxBytes) return null;
    const data = JSON.parse(text);
    return data && typeof data === "object" && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}
