import { createHmac, timingSafeEqual } from "crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/session-constants";

export { SESSION_COOKIE_NAME };

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to a random value of at least 32 characters.");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/** Token: "v2.<adminId>.<expiresAt>.<sessionVersion>.<hmac>" */
export function createSessionToken(adminId: string, sessionVersion: number): string {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = `v2.${adminId}.${expiresAt}.${sessionVersion}`;
  return `${payload}.${sign(payload)}`;
}

type Verified = { adminId: string; sessionVersion: number };

/** Signature + expiry check only. The database check happens in getSessionAdminId(). */
export function verifySessionToken(token: string): Verified | null {
  if (token.length > 300) return null;
  const parts = token.split(".");
  if (parts.length !== 5 || parts[0] !== "v2") return null;
  const [, adminId, expiresAtStr, versionStr, signature] = parts;
  if (!/^[a-z0-9]{10,40}$/i.test(adminId)) return null;
  if (!/^\d{10,16}$/.test(expiresAtStr) || !/^\d{1,9}$/.test(versionStr)) return null;

  const expected = sign(`v2.${adminId}.${expiresAtStr}.${versionStr}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Date.now() > Number(expiresAtStr)) return null;
  return { adminId, sessionVersion: Number(versionStr) };
}

export async function setSessionCookie(adminId: string, sessionVersion: number) {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, createSessionToken(adminId, sessionVersion), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Authoritative session check: valid signature, not expired, the admin still
 * exists and the session version matches (so logout / password change revoke
 * every older cookie). Cached per request.
 */
export const getSessionAdminId = cache(async (): Promise<string | null> => {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    const verified = verifySessionToken(token);
    if (!verified) return null;
    const admin = await prisma.admin.findUnique({
      where: { id: verified.adminId },
      select: { id: true, sessionVersion: true },
    });
    if (!admin || admin.sessionVersion !== verified.sessionVersion) return null;
    return admin.id;
  } catch (err) {
    console.error("[session] verification failed", err instanceof Error ? err.message : err);
    return null;
  }
});

/** Invalidates every session of this admin (used by logout and password changes). */
export async function revokeAdminSessions(adminId: string) {
  await prisma.admin.update({
    where: { id: adminId },
    data: { sessionVersion: { increment: 1 } },
  });
}
