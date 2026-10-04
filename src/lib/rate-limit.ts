import { prisma } from "@/lib/prisma";

export type RateResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };

/**
 * Fixed-window limiter stored in Postgres (shared across serverless instances).
 * One atomic parameterised upsert per call. Windows expire by themselves, so a
 * lockout is always temporary. Fails OPEN on database errors so an outage can't
 * lock the real admin out (login itself needs the DB anyway).
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateResult> {
  try {
    const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, NOW() + (${windowSeconds} * INTERVAL '1 second'))
      ON CONFLICT ("key") DO UPDATE SET
        "count"   = CASE WHEN "RateLimit"."resetAt" < NOW() THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" < NOW() THEN NOW() + (${windowSeconds} * INTERVAL '1 second') ELSE "RateLimit"."resetAt" END
      RETURNING "count", "resetAt"`;
    const { count, resetAt } = rows[0];
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: Math.max(1, Math.ceil((new Date(resetAt).getTime() - Date.now()) / 1000)),
    };
  } catch (err) {
    console.error("[rate-limit] failed open", err instanceof Error ? err.message : err);
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
  }
}

export async function resetRateLimit(key: string) {
  try {
    await prisma.rateLimit.delete({ where: { key } });
  } catch {
    /* nothing to reset */
  }
}

/** Opportunistic cleanup of expired windows (cheap, indexed). */
export async function purgeExpiredRateLimits() {
  try {
    await prisma.rateLimit.deleteMany({ where: { resetAt: { lt: new Date() } } });
  } catch {}
}
