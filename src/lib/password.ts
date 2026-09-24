import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// Node's built-in scrypt is used instead of bcrypt/argon2 so the
// project needs no extra native dependency. Format stored in the DB:
// "<saltHex>:<hashHex>".

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const hash = scryptSync(password, salt, 64);
  const storedHash = Buffer.from(hashHex, "hex");
  if (hash.length !== storedHash.length) return false;
  return timingSafeEqual(hash, storedHash);
}
