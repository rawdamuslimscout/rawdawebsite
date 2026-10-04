import type { NextRequest } from "next/server";
import { SITE_HOST } from "@/lib/site";

export function getClientIp(req: Pick<NextRequest, "headers">): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip")) || "unknown";
  return ip.trim().slice(0, 64);
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
