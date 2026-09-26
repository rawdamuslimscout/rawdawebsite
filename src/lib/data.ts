import { prisma } from "@/lib/prisma";
import type {
  ScoutStage,
  Activity,
  EventItem,
  CampItem,
  Milestone,
  NewsItem,
  GalleryItem,
  BlogPost,
  LibraryResource,
} from "@/data/content";

// ------------------------------------------------------------------
// DB-only data layer. No fallback to src/data/content.ts — if a table
// is empty or unreachable, callers get [] (or, for the singleton site
// settings, a thrown error) so problems surface instead of being
// silently masked by static placeholder content.
// ------------------------------------------------------------------

// Not yet columns on SiteSettings — move these into the DB and read
// them below once the schema has them.
const SITE_NAME_EN = "Rawda Al-Fayhaa Scout Troop";
const SITE_INSTAGRAM = "@rawda.fayhaa";

export async function getSiteSettings() {
  const row = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  if (!row) {
    throw new Error(
      "SiteSettings row 'singleton' not found — seed the database before rendering the site.",
    );
  }

  return {
    name: row.name,
    tagline: row.tagline,
    parent: row.parentOrg,
    instagram: SITE_INSTAGRAM,
    instagramUrl: row.instagramUrl,
    nameEn: SITE_NAME_EN,
    contactPhone: row.contactPhone,
    contactLocation: row.contactLocation,
    joinIntro:
      row.joinIntro ||
      "انضم إلى فوج روضة الفيحاء وابدأ رحلتك الكشفية عبر الأنشطة الأسبوعية والمخيمات والرحلات.",
  };
}

export async function getSiteStats() {
  const rows = await prisma.siteStat.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({
    value: r.value,
    label: r.label,
    placeholder: true,
  }));
}

const legacySlugs = new Set([
  "baraem",
  "ashbal",
  "kashafa",
  "mutaqadem",
  "jawwala",
  "qiyada",
]);

export async function getScoutStages(): Promise<ScoutStage[]> {
  const rows = await prisma.scoutStage.findMany({
    orderBy: { order: "asc" },
    include: { leaders: { orderBy: { order: "asc" } } },
  });

  return rows
    .filter((r) => !legacySlugs.has(r.slug))
    .map(
      (r): ScoutStage => ({
        id: r.slug,
        title: r.title,
        ageRange: r.ageRange,
        description: r.description,
        icon: r.icon as ScoutStage["icon"],
        imageUrl: r.imageUrl,
        fileUrl: r.fileUrl,
        leaders: r.leaders.map((leader) => ({
          id: leader.id,
          name: leader.name,
          rank: leader.rank,
          role: leader.role,
          bio: leader.bio,
          photoUrl: leader.photoUrl,
        })),
      }),
    );
}

export async function getActivities(): Promise<Activity[]> {
  const rows = await prisma.activity.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({
    id: r.slug,
    title: r.title,
    description: r.description,
    icon: r.icon as Activity["icon"],
  }));
}

export async function getEvents(): Promise<EventItem[]> {
  const rows = await prisma.eventItem.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    date: r.date,
    location: r.location,
    group: r.groupName,
    description: r.description,
  }));
}

export async function getCamps(): Promise<CampItem[]> {
  const rows = await prisma.camp.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    year: r.year,
    location: r.location,
    summary: r.summary,
  }));
}

export async function getMilestones(): Promise<Milestone[]> {
  const rows = await prisma.milestone.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({
    year: r.year,
    title: r.title,
    description: r.description,
  }));
}

export async function getValues(): Promise<{ id: string; title: string }[]> {
  const rows = await prisma.valueItem.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({ id: r.slug, title: r.title }));
}

export async function getNews(): Promise<NewsItem[]> {
  const rows = await prisma.newsItem.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    date: r.date,
    excerpt: r.excerpt,
    imageUrl: (r as { imageUrl?: string }).imageUrl,
  }));
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const rows = await prisma.galleryItem.findMany({
    orderBy: { order: "asc" },
  });
  return rows.map(
    (r) =>
      ({
        id: r.id,
        title: r.title,
        category: r.category as GalleryItem["category"],
        size: r.size as GalleryItem["size"],
        imageUrl: r.imageUrl,
      }) as GalleryItem,
  );
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const rows = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    category: r.category,
    date: r.date,
    author: r.author,
    excerpt: r.excerpt,
    content: r.content.split("\n\n"),
  }));
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const row = await prisma.blogPost.findUnique({ where: { slug } });
  if (!row) return undefined;
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    date: row.date,
    author: row.author,
    excerpt: row.excerpt,
    content: row.content.split("\n\n"),
  };
}

export async function getLibraryResources(): Promise<LibraryResource[]> {
  const rows = await prisma.libraryResource.findMany({
    orderBy: { order: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category as LibraryResource["category"],
    description: r.description,
    fileType: r.fileType as LibraryResource["fileType"],
    fileUrl: r.fileUrl,
  }));
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
  return prisma.joinPricing.findMany({ orderBy: { order: "asc" } });
}

export async function getJoinSchedule(): Promise<JoinScheduleItem[]> {
  return prisma.joinSchedule.findMany({ orderBy: { order: "asc" } });
}
