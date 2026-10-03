import { prisma } from "@/lib/prisma";
import { siteInfo as defaultSiteInfo } from "@/data/content";
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
// DB-only data layer. Content never falls back to the static
// placeholders in src/data/content.ts. But a failing query must never
// take the whole website down: every getter logs the real error on the
// server and returns an empty result, so only the affected section is
// hidden while the rest of the page keeps working.
// ------------------------------------------------------------------

const SITE_NAME_EN = "Rawda Al-Fayhaa Scout Troop";
const SITE_INSTAGRAM = "@rawda.fayhaa";

function parseStringArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export async function getSiteSettings() {
  const defaults = {
    name: defaultSiteInfo.name,
    tagline: defaultSiteInfo.tagline,
    parentOrg: defaultSiteInfo.parent,
    instagramUrl: defaultSiteInfo.instagramUrl,
    contactPhone: "",
    contactLocation: "",
    joinIntro: "",
    aboutImageIds: "[]",
  };

  let row: typeof defaults | null = null;
  try {
    row = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });
    if (!row) {
      console.error(
        "[data] SiteSettings row 'singleton' not found — seed the database. Using defaults.",
      );
    }
  } catch (err) {
    console.error("[data] getSiteSettings failed — using defaults", err);
  }
  const settings = row ?? defaults;

  return {
    name: settings.name,
    tagline: settings.tagline,
    parent: settings.parentOrg,
    instagram: SITE_INSTAGRAM,
    instagramUrl: settings.instagramUrl,
    nameEn: SITE_NAME_EN,
    contactPhone: settings.contactPhone,
    contactLocation: settings.contactLocation,
    aboutImageIds: parseStringArray(settings.aboutImageIds),
    joinIntro:
      settings.joinIntro ||
      "انضم إلى فوج روضة الفيحاء وابدأ رحلتك الكشفية عبر الأنشطة الأسبوعية والمخيمات والرحلات.",
  };
}

export async function getSiteStats() {
  try {
    const rows = await prisma.siteStat.findMany({ orderBy: { order: "asc" } });
    return rows.map((r) => ({
      value: r.value,
      label: r.label,
      placeholder: true,
    }));
  } catch (err) {
    console.error("[data] getSiteStats failed", err);
    return [];
  }
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
  try {
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
  } catch (err) {
    console.error("[data] getScoutStages failed", err);
    return [];
  }
}

export async function getActivities(): Promise<Activity[]> {
  try {
    const rows = await prisma.activity.findMany({ orderBy: { order: "asc" } });
    return rows.map((r) => ({
      id: r.slug,
      title: r.title,
      description: r.description,
      icon: r.icon as Activity["icon"],
    }));
  } catch (err) {
    console.error("[data] getActivities failed", err);
    return [];
  }
}

export async function getEvents(): Promise<EventItem[]> {
  try {
    const rows = await prisma.eventItem.findMany({ orderBy: { order: "asc" } });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      date: r.date,
      location: r.location,
      group: r.groupName,
      description: r.description,
    }));
  } catch (err) {
    console.error("[data] getEvents failed", err);
    return [];
  }
}

export async function getCamps(): Promise<CampItem[]> {
  try {
    const rows = await prisma.camp.findMany({ orderBy: { order: "asc" } });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      year: r.year,
      location: r.location,
      summary: r.summary,
    }));
  } catch (err) {
    console.error("[data] getCamps failed", err);
    return [];
  }
}

export async function getMilestones(): Promise<Milestone[]> {
  try {
    const rows = await prisma.milestone.findMany({ orderBy: { order: "asc" } });
    return rows.map((r) => ({
      year: r.year,
      title: r.title,
      description: r.description,
    }));
  } catch (err) {
    console.error("[data] getMilestones failed", err);
    return [];
  }
}

export async function getValues(): Promise<{ id: string; title: string }[]> {
  try {
    const rows = await prisma.valueItem.findMany({ orderBy: { order: "asc" } });
    return rows.map((r) => ({ id: r.slug, title: r.title }));
  } catch (err) {
    console.error("[data] getValues failed", err);
    return [];
  }
}

export async function getNews(): Promise<NewsItem[]> {
  try {
    const rows = await prisma.newsItem.findMany({ orderBy: { order: "asc" } });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      date: r.date,
      excerpt: r.excerpt,
      imageUrl: r.imageUrl,
      imageUrls: [r.imageUrl, ...parseImageUrls(r.imageUrls)].filter(Boolean),
    }));
  } catch (err) {
    console.error("[data] getNews failed", err);
    return [];
  }
}

function parseImageUrls(value: string): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((url): url is string => typeof url === "string")
      : [];
  } catch {
    return [];
  }
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const rows = await prisma.galleryItem.findMany({
      orderBy: { order: "asc" },
    });
    return rows
      .map(
        (r) =>
          ({
            id: r.id,
            title: r.title,
            category: r.category as GalleryItem["category"],
            size: r.size as GalleryItem["size"],
            imageUrl: r.imageUrl.trim(),
          }) as GalleryItem,
      )
      .filter((item) => Boolean(item.imageUrl));
  } catch (err) {
    console.error("[data] getGalleryItems failed", err);
    return [];
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
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
  } catch (err) {
    console.error("[data] getBlogPosts failed", err);
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  try {
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
  } catch (err) {
    console.error("[data] getBlogPost failed", err);
    return undefined;
  }
}

export async function getLibraryResources(): Promise<LibraryResource[]> {
  try {
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
  } catch (err) {
    console.error("[data] getLibraryResources failed", err);
    return [];
  }
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
  try {
    return prisma.joinPricing.findMany({ orderBy: { order: "asc" } });
  } catch (err) {
    console.error("[data] getJoinPricing failed", err);
    return [];
  }
}

export async function getJoinSchedule(): Promise<JoinScheduleItem[]> {
  try {
    return prisma.joinSchedule.findMany({ orderBy: { order: "asc" } });
  } catch (err) {
    console.error("[data] getJoinSchedule failed", err);
    return [];
  }
}
