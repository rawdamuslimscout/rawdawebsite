// Seeds an EMPTY database with the site's structural content (settings,
// scout stages, activities, values from src/data/content.ts) plus one admin
// login. Run after connecting Supabase and applying migrations:
//
//   pnpm prisma migrate deploy
//   pnpm db:seed
//
// Safe to re-run: every write is create-only (`update: {}`), so existing rows
// (including admin edits and the admin's password) are never changed.
// To change the admin password use `pnpm admin:reset-password`.

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import { siteInfo, scoutStages, activities, values } from "../src/data/content";

const prisma = new PrismaClient();

async function main() {
  // --- Admin user --------------------------------------------------
  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    console.warn(
      "SEED_ADMIN_PASSWORD not set — skipping admin user creation. " +
        "Set it in .env and re-run the seed to create the admin login.",
    );
  } else if (await prisma.admin.findUnique({ where: { username } })) {
    // Never reset an existing password here (use `pnpm admin:reset-password`).
    console.log(`Admin user already exists: ${username} (password unchanged)`);
  } else {
    await prisma.admin.create({
      data: { username, passwordHash: await hashPassword(password) },
    });
    console.log(`Admin user created: ${username}`);
  }

  // --- Site settings -------------------------------------------------
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      name: siteInfo.name,
      tagline: siteInfo.tagline,
      parentOrg: siteInfo.parent,
      instagramUrl: siteInfo.instagramUrl,
      contactPhone: "+961 81 348 184",
      contactLocation: "طرابلس، لبنان",
      joinIntro:
        "انضم إلى فوج روضة الفيحاء وابدأ رحلتك الكشفية عبر الأنشطة الأسبوعية والمخيمات والرحلات.",
    },
  });

  // --- Scout stages ------------------------------------------------
  // Create-only: a stage that already exists (by slug) is never touched, so
  // re-running the seed can't overwrite admin edits or cascade-delete leaders.
  for (const [i, s] of scoutStages.entries()) {
    await prisma.scoutStage.upsert({
      where: { slug: s.id },
      update: {},
      create: {
        slug: s.id,
        title: s.title,
        ageRange: s.ageRange,
        description: s.description,
        icon: s.icon,
        order: i,
      },
    });
  }

  // --- Activities --------------------------------------------------
  for (const [i, a] of activities.entries()) {
    await prisma.activity.upsert({
      where: { slug: a.id },
      update: {},
      create: {
        slug: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon,
        order: i,
      },
    });
  }

  // --- Values ------------------------------------------------------
  for (const [i, v] of values.entries()) {
    await prisma.valueItem.upsert({
      where: { slug: v.id },
      update: {},
      create: { slug: v.id, title: v.title, order: i },
    });
  }

  // Stats, events, camps, milestones, news, gallery, blog, library and the
  // join pricing/schedule are NOT seeded: src/data/content.ts marks them as
  // sample/placeholder data, and seeding them put fake content on the live
  // site. The troop adds the real entries from the admin panel.

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
