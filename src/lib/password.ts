import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCb) as (
  pw: string,
  salt: string,
  keylen: number,
  opts: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

// scrypt (built into Node, no native dependency). Current parameters follow
// OWASP guidance (N=2^15, r=8, p=1 ≈ 32 MB). Format: "s2$N$r$p$saltHex$hashHex".
// Legacy "<saltHex>:<hashHex>" hashes (N=16384) are still accepted and are
// upgraded transparently after the next successful login.
const N = 2 ** 15, R = 8, P = 1, KEYLEN = 64;
const MAXMEM = 128 * N * R * 2;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return `s2$${N}$${R}$${P}$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    let n = 16384, r = 8, p = 1, salt: string, hashHex: string;
    if (stored.startsWith("s2$")) {
      const parts = stored.split("$");
      if (parts.length !== 6) return false;
      n = Number(parts[1]); r = Number(parts[2]); p = Number(parts[3]);
      salt = parts[4]; hashHex = parts[5];
      if (![n, r, p].every(Number.isInteger) || n > 2 ** 17) return false;
    } else {
      [salt, hashHex] = stored.split(":");
    }
    if (!salt || !hashHex) return false;
    const expected = Buffer.from(hashHex, "hex");
    const actual = await scrypt(password, salt, expected.length, { N: n, r, p, maxmem: 128 * n * r * 2 });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function needsRehash(stored: string): boolean {
  return !stored.startsWith(`s2$${N}$`);
}

/** Used to burn equivalent time when the username does not exist. */
export const DUMMY_HASH =
  "s2$32768$8$1$00000000000000000000000000000000$" + "00".repeat(64);
