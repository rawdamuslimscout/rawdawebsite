/**
 * Bounded retry for READ queries that fail before reaching the database
 * (pooler briefly unreachable, connection reset, pool timeout). Seen in
 * practice as an occasional P1001 while a build prerenders pages.
 *
 * - Only connection-level errors are retried; query errors (bad data,
 *   constraint violations, missing columns) fail immediately.
 * - After the last attempt the original error is rethrown, so callers keep
 *   their "never cache an empty page" behaviour.
 * - Never wrap writes: a connection dropped mid-write could already have
 *   committed, and a retry would apply it twice.
 */

const TRANSIENT_CODES = new Set(["P1001", "P1002", "P1008", "P1017", "P2024"]);
const TRANSIENT_MESSAGE =
  /can'?t reach database server|connection (?:refused|reset|terminated|closed)|timed out fetching a new connection|ECONNRESET|ETIMEDOUT/i;

export function isTransientDbError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = "code" in err ? String((err as { code?: unknown }).code ?? "") : "";
  if (TRANSIENT_CODES.has(code)) return true;
  // PrismaClientInitializationError carries the code in `errorCode`.
  const initCode =
    "errorCode" in err ? String((err as { errorCode?: unknown }).errorCode ?? "") : "";
  if (TRANSIENT_CODES.has(initCode)) return true;
  return err instanceof Error && TRANSIENT_MESSAGE.test(err.message);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// A failed build costs a manual redeploy, so it retries a little more. At run
// time an outage is usually not brief, and every retry keeps the visitor (and
// the serverless function) waiting, so one retry is enough there.
const DEFAULT_RETRIES = process.env.NEXT_PHASE === "phase-production-build" ? 2 : 1;

/** Retries `read` up to `retries` more times on transient connection errors. */
export async function retryRead<T>(
  name: string,
  read: () => Promise<T>,
  { retries = DEFAULT_RETRIES, baseDelayMs = 400 }: { retries?: number; baseDelayMs?: number } = {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await read();
    } catch (err) {
      if (attempt >= retries || !isTransientDbError(err)) throw err;
      const delay = baseDelayMs * 3 ** attempt; // 400 ms, then 1.2 s
      console.warn(`[db] ${name}: transient connection error, retry ${attempt + 1}/${retries} in ${delay} ms`);
      await sleep(delay);
    }
  }
}
