// Seeds the database from the site's existing static content
// (src/data/content.ts) plus one admin login. Run after connecting
// Supabase and migrating:
//
//   npx prisma migrate dev
//   npx prisma db seed
//
// Safe to re-run: it upserts everything by a stable key.

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import {
  siteInfo,
  stats,
  scoutStages,
  activities,
  events,
  camps,
  milestones,
  values,
  news,
  galleryItems,
  blogPosts,
  libraryResources,
  joinPricing,
  joinSchedule,
} from "../src/data/content";

const prisma = new PrismaClient();

async function main() {
  // --- Admin user --------------------------------------------------
  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    console.warn(
      "SEED_ADMIN_PASSWORD not set — skipping admin user creation. " +
        "Set it in .env and re-run the seed to create the admin login."
    );
  } else {
    await prisma.admin.upsert({
      where: { username },
      update: { passwordHash: hashPassword(password) },
      create: { username, passwordHash: hashPassword(password) },
    });
    console.log(`Admin user ready: ${username}`);
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

  // --- Stats -----------------------------------------------------
  for (const [i, s] of stats.entries()) {
    await prisma.siteStat.upsert({
      where: { id: `stat-${i}` },
      update: { value: s.value, label: s.label, order: i },
      create: { id: `stat-${i}`, value: s.value, label: s.label, order: i },
    });
  }

  // --- Scout stages ------------------------------------------------
  for (const [i, s] of scoutStages.entries()) {
    await prisma.scoutStage.upsert({
      where: { slug: s.id },
      update: { title: s.title, ageRange: s.ageRange, description: s.description, icon: s.icon, order: i },
      create: { slug: s.id, title: s.title, ageRange: s.ageRange, description: s.description, icon: s.icon, order: i },
    });
  }

  // --- Activities --------------------------------------------------
  for (const [i, a] of activities.entries()) {
    await prisma.activity.upsert({
      where: { slug: a.id },
      update: { title: a.title, description: a.description, icon: a.icon, order: i },
      create: { slug: a.id, title: a.title, description: a.description, icon: a.icon, order: i },
    });
  }

  // --- Events --------------------------------------------------------
  for (const [i, e] of events.entries()) {
    await prisma.eventItem.upsert({
      where: { id: e.id },
      update: { title: e.title, date: e.date, location: e.location, groupName: e.group, description: e.description, order: i },
      create: { id: e.id, title: e.title, date: e.date, location: e.location, groupName: e.group, description: e.description, order: i },
    });
  }

  // --- Camps -----------------------------------------------------
  for (const [i, c] of camps.entries()) {
    await prisma.camp.upsert({
      where: { id: c.id },
      update: { title: c.title, year: c.year, location: c.location, summary: c.summary, order: i },
      create: { id: c.id, title: c.title, year: c.year, location: c.location, summary: c.summary, order: i },
    });
  }

  // --- Milestones ------------------------------------------------
  for (const [i, m] of milestones.entries()) {
    const id = `milestone-${i}`;
    await prisma.milestone.upsert({
      where: { id },
      update: { year: m.year, title: m.title, description: m.description, order: i },
      create: { id, year: m.year, title: m.title, description: m.description, order: i },
    });
  }

  // --- Values ------------------------------------------------------
  for (const [i, v] of values.entries()) {
    await prisma.valueItem.upsert({
      where: { slug: v.id },
      update: { title: v.title, order: i },
      create: { slug: v.id, title: v.title, order: i },
    });
  }

  // --- News ------------------------------------------------------
  for (const [i, n] of news.entries()) {
    await prisma.newsItem.upsert({
      where: { id: n.id },
      update: { title: n.title, category: n.category, date: n.date, excerpt: n.excerpt, order: i },
      create: { id: n.id, title: n.title, category: n.category, date: n.date, excerpt: n.excerpt, order: i },
    });
  }

  // --- Gallery ---------------------------------------------------
  for (const [i, g] of galleryItems.entries()) {
    await prisma.galleryItem.upsert({
      where: { id: g.id },
      update: { title: g.title, category: g.category, size: g.size, order: i },
      create: { id: g.id, title: g.title, category: g.category, size: g.size, order: i },
    });
  }

  // --- Blog --------------------------------------------------------
  for (const p of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        category: p.category,
        date: p.date,
        author: p.author,
        excerpt: p.excerpt,
        content: p.content.join("\n\n"),
      },
      create: {
        slug: p.slug,
        title: p.title,
        category: p.category,
        date: p.date,
        author: p.author,
        excerpt: p.excerpt,
        content: p.content.join("\n\n"),
      },
    });
  }

  // --- Library -----------------------------------------------------
  for (const [i, l] of libraryResources.entries()) {
    await prisma.libraryResource.upsert({
      where: { id: l.id },
      update: {
        title: l.title,
        category: l.category,
        description: l.description,
        fileType: l.fileType,
        fileUrl: l.fileUrl,
        order: i,
      },
      create: {
        id: l.id,
        title: l.title,
        category: l.category,
        description: l.description,
        fileType: l.fileType,
        fileUrl: l.fileUrl,
        order: i,
      },
    });
  }

  // --- Join pricing --------------------------------------------------
  for (const [i, p] of joinPricing.entries()) {
    await prisma.joinPricing.upsert({
      where: { id: p.id },
      update: { title: p.title, price: p.price, period: p.period, description: p.description, order: i },
      create: { id: p.id, title: p.title, price: p.price, period: p.period, description: p.description, order: i },
    });
  }

  // --- Join schedule ---------------------------------------------
  for (const [i, s] of joinSchedule.entries()) {
    await prisma.joinSchedule.upsert({
      where: { id: s.id },
      update: {
        stage: s.stage,
        ageRange: s.ageRange,
        day: s.day,
        time: s.time,
        location: s.location,
        leaders: s.leaders,
        order: i,
      },
      create: {
        id: s.id,
        stage: s.stage,
        ageRange: s.ageRange,
        day: s.day,
        time: s.time,
        location: s.location,
        leaders: s.leaders,
        order: i,
      },
    });
  }

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
