import { prisma } from "@/lib/prisma";
import * as fallback from "@/data/content";

// ------------------------------------------------------------------
// Every function here tries the database first and falls back to the
// static data in src/data/content.ts if the DB isn't reachable yet
// (e.g. DATABASE_URL not set, or Supabase not connected yet). This
// means the site runs out of the box, and once Supabase is connected
// and seeded, admin-edited data takes over automatically — nothing
// in the UI components needs to change either way.
// ------------------------------------------------------------------

async function safe<T>(query: () => Promise<T>, fallbackValue: T): Promise<T> {
  try {
    return await query();
  } catch {
    return fallbackValue;
  }
}

export async function getSiteSettings() {
  const defaultJoinIntro =
    "انضم إلى فوج روضة الفيحاء وابدأ رحلتك الكشفية عبر الأنشطة الأسبوعية والمخيمات والرحلات.";

  return safe(async () => {
    const row: any = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (!row) throw new Error("no site settings row");
    return {
      name: row.name,
      tagline: row.tagline,
      parent: row.parentOrg,
      instagram: fallback.siteInfo.instagram,
      instagramUrl: row.instagramUrl,
      nameEn: fallback.siteInfo.nameEn,
      contactPhone: row.contactPhone,
      contactLocation: row.contactLocation,
      joinIntro: row.joinIntro || defaultJoinIntro,
    };
  }, { ...fallback.siteInfo, contactPhone: "", contactLocation: "", joinIntro: defaultJoinIntro });
}

export async function getSiteStats() {
  return safe(async () => {
    const rows: any[] = await prisma.siteStat.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) throw new Error("empty");
    return rows.map((r: any) => ({ value: r.value, label: r.label, placeholder: true }));
  }, fallback.stats);
}

export async function getScoutStages(): Promise<fallback.ScoutStage[]> {
  return safe(async () => {
    const rows: any[] = await prisma.scoutStage.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) throw new Error("empty");
    return rows.map((r: any) => ({
      id: r.slug,
      title: r.title,
      ageRange: r.ageRange,
      description: r.description,
      icon: r.icon as fallback.ScoutStage["icon"],
    }));
  }, fallback.scoutStages);
}

export async function getActivities(): Promise<fallback.Activity[]> {
  return safe(async () => {
    const rows: any[] = await prisma.activity.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) throw new Error("empty");
    return rows.map((r: any) => ({
      id: r.slug,
      title: r.title,
      description: r.description,
      icon: r.icon as fallback.Activity["icon"],
    }));
  }, fallback.activities);
}

export async function getEvents(): Promise<fallback.EventItem[]> {
  return safe(async () => {
    const rows: any[] = await prisma.eventItem.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) throw new Error("empty");
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      date: r.date,
      location: r.location,
      group: r.groupName,
      description: r.description,
    }));
  }, fallback.events);
}

export async function getCamps(): Promise<fallback.CampItem[]> {
  return safe(async () => {
    const rows: any[] = await prisma.camp.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) throw new Error("empty");
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      year: r.year,
      location: r.location,
      summary: r.summary,
    }));
  }, fallback.camps);
}

export async function getMilestones(): Promise<fallback.Milestone[]> {
  return safe(async () => {
    const rows: any[] = await prisma.milestone.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) throw new Error("empty");
    return rows.map((r: any) => ({ year: r.year, title: r.title, description: r.description }));
  }, fallback.milestones);
}

export async function getValues(): Promise<{ id: string; title: string }[]> {
  return safe(async () => {
    const rows: any[] = await prisma.valueItem.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) throw new Error("empty");
    return rows.map((r: any) => ({ id: r.slug, title: r.title }));
  }, fallback.values);
}

export async function getNews(): Promise<fallback.NewsItem[]> {
  return safe(async () => {
    const rows: any[] = await prisma.newsItem.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) throw new Error("empty");
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      date: r.date,
      excerpt: r.excerpt,
    }));
  }, fallback.news);
}

export async function getGalleryItems(): Promise<fallback.GalleryItem[]> {
  return safe(async () => {
    const rows: any[] = await prisma.galleryItem.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) throw new Error("empty");
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      category: r.category as fallback.GalleryItem["category"],
      size: r.size as fallback.GalleryItem["size"],
    }));
  }, fallback.galleryItems);
}

export async function getBlogPosts(): Promise<fallback.BlogPost[]> {
  return safe(async () => {
    const rows: any[] = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
    if (rows.length === 0) throw new Error("empty");
    return rows.map((r: any) => ({
      slug: r.slug,
      title: r.title,
      category: r.category,
      date: r.date,
      author: r.author,
      excerpt: r.excerpt,
      content: r.content.split("\n\n"),
    }));
  }, fallback.blogPosts);
}

export async function getBlogPost(slug: string): Promise<fallback.BlogPost | undefined> {
  const dbPost = await safe(async () => {
    const row: any = await prisma.blogPost.findUnique({ where: { slug } });
    if (!row) throw new Error("not found");
    return {
      slug: row.slug,
      title: row.title,
      category: row.category,
      date: row.date,
      author: row.author,
      excerpt: row.excerpt,
      content: row.content.split("\n\n"),
    };
  }, undefined as fallback.BlogPost | undefined);

  if (dbPost) return dbPost;
  return fallback.blogPosts.find((p) => p.slug === slug);
}

export async function getLibraryResources(): Promise<fallback.LibraryResource[]> {
  return safe(async () => {
    const rows: any[] = await prisma.libraryResource.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) throw new Error("empty");
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      category: r.category as fallback.LibraryResource["category"],
      description: r.description,
      fileType: r.fileType as fallback.LibraryResource["fileType"],
      fileUrl: r.fileUrl,
    }));
  }, fallback.libraryResources);
}

export type JoinPricingItem = {
  id: string;
  title: string;
  price: string;
  period: string;
  description: string;
};

export type JoinScheduleItem = {
  id: string;
  stage: string;
  ageRange: string;
  day: string;
  time: string;
  location: string;
  leaders: number;
};

export async function getJoinPricing(): Promise<JoinPricingItem[]> {
  return safe(async () => {
    const rows: any[] = await prisma.joinPricing.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) throw new Error("empty");
    return rows;
  }, fallback.joinPricing);
}

export async function getJoinSchedule(): Promise<JoinScheduleItem[]> {
  return safe(async () => {
    const rows: any[] = await prisma.joinSchedule.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) throw new Error("empty");
    return rows;
  }, fallback.joinSchedule);
}
