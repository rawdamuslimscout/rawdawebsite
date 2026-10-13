// Sets (or creates) the admin login from SEED_ADMIN_USERNAME / SEED_ADMIN_PASSWORD
// and signs out every existing session of that admin (sessionVersion + 1).
//
//   SEED_ADMIN_USERNAME=... SEED_ADMIN_PASSWORD=... pnpm admin:reset-password
//
// Values may also come from .env. Runs against whatever DATABASE_URL points at —
// double-check it before running.

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

try {
  process.loadEnvFile?.(); // .env, if present (shell variables take precedence)
} catch {}

const prisma = new PrismaClient();

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error("Set SEED_ADMIN_USERNAME and SEED_ADMIN_PASSWORD first.");
  }
  if (password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters.");
  }

  const passwordHash = await hashPassword(password);
  const admin = await prisma.admin.upsert({
    where: { username },
    update: { passwordHash, sessionVersion: { increment: 1 } },
    create: { username, passwordHash },
  });
  console.log(`Password set for admin "${admin.username}". Existing sessions were signed out.`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
