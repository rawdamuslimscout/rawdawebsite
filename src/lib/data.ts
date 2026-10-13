import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { retryRead } from "@/lib/db-retry";
import { safeHref } from "@/lib/safe-url";
import { isEventUpcoming } from "@/lib/events";
import { parseStringArray } from "@/lib/json";
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
// placeholders in src/data/content.ts.
//
// A failing query is logged and RETHROWN, never turned into an empty
// result: public pages are statically generated (ISR), so an empty
// result would be cached over the last good page. Throwing keeps the
// stale page (ISR regeneration) or fails the build so the previous
// deployment stays live.
//
// Getters are wrapped in React `cache()` so repeated calls within one
// render (layout, header, footer...) hit the database only once.
// Brief connection failures are retried a couple of times first
// (lib/db-retry.ts); anything else, or a lasting outage, still throws.
// ------------------------------------------------------------------

const SITE_NAME_EN = "Rawda Al-Fayhaa Scout Troop";
const SITE_INSTAGRAM = "@rawda.fayhaa";

async function query<T>(name: string, run: () => Promise<T>): Promise<T> {
  try {
    return await retryRead(name, run);
  } catch (err) {
    console.error(`[data] ${name} failed`, err);
    throw err;
  }
}

/** Splits stored text into paragraphs on blank lines (also \r\n from form submissions). */
function toParagraphs(text: string): string[] {
  return text
    .split(/\r?\n[ \t]*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const toIso = (d: Date | null | undefined) => (d ? d.toISOString() : undefined);

export const getSiteSettings = cache(async () => {
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

  const row = await query("getSiteSettings", () =>
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  );
  // A missing row is a setup issue, not an outage: defaults are fine here.
  if (!row) {
    console.error(
      "[data] SiteSettings row 'singleton' not found — seed the database. Using defaults.",
    );
  }
  const settings = row ?? defaults;

  return {
    name: settings.name,
    tagline: settings.tagline,
    parent: settings.parentOrg,
    instagram: SITE_INSTAGRAM,
    instagramUrl: safeHref(settings.instagramUrl) || defaults.instagramUrl,
    nameEn: SITE_NAME_EN,
    contactPhone: settings.contactPhone,
    contactLocation: settings.contactLocation,
    aboutImageIds: parseStringArray(settings.aboutImageIds),
    joinIntro:
      settings.joinIntro ||
      "انضم إلى فوج روضة الفيحاء وابدأ رحلتك الكشفية عبر الأنشطة الأسبوعية والمخيمات والرحلات.",
  };
});

export const getSiteStats = cache(async () => {
  const rows = await query("getSiteStats", () =>
    prisma.siteStat.findMany({ orderBy: { order: "asc" } }),
  );
  return rows.map((r) => ({
    value: r.value,
    label: r.label,
    placeholder: true,
  }));
});

const legacySlugs = new Set([
  "baraem",
  "ashbal",
  "kashbal",
  "kashafa",
  "mutaqadem",
  "jawwala",
  "qiyada",
]);

export const getScoutStages = cache(async (): Promise<ScoutStage[]> => {
  const rows = await query("getScoutStages", () =>
    prisma.scoutStage.findMany({
      orderBy: { order: "asc" },
      include: { leaders: { orderBy: { order: "asc" } } },
    }),
  );

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
        fileUrl: safeHref(r.fileUrl),
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
});

export const getActivities = cache(async (): Promise<Activity[]> => {
  const rows = await query("getActivities", () =>
    prisma.activity.findMany({ orderBy: { order: "asc" } }),
  );
  return rows.map((r) => ({
    id: r.slug,
    title: r.title,
    description: r.description,
    icon: r.icon as Activity["icon"],
  }));
});

export const getEvents = cache(async (): Promise<EventItem[]> => {
  const rows = await query("getEvents", () =>
    prisma.eventItem.findMany({ orderBy: { order: "asc" } }),
  );
  const now = new Date();
  return rows.map((r) => {
    return {
      id: r.id,
      title: r.title,
      date: r.date,
      location: r.location,
      group: r.groupName,
      description: r.description,
      startDate: toIso(r.startDate),
      endDate: toIso(r.endDate),
      // undefined = no real dates entered, so it is unknown.
      isUpcoming: isEventUpcoming(r.startDate, r.endDate, now),
    };
  });
});

export const getCamps = cache(async (): Promise<CampItem[]> => {
  const rows = await query("getCamps", () =>
    prisma.camp.findMany({ orderBy: { order: "asc" } }),
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    year: r.year,
    location: r.location,
    summary: r.summary,
  }));
});

export const getMilestones = cache(async (): Promise<Milestone[]> => {
  const rows = await query("getMilestones", () =>
    prisma.milestone.findMany({ orderBy: { order: "asc" } }),
  );
  return rows.map((r) => ({
    year: r.year,
    title: r.title,
    description: r.description,
  }));
});

export const getValues = cache(
  async (): Promise<{ id: string; title: string }[]> => {
    const rows = await query("getValues", () =>
      prisma.valueItem.findMany({ orderBy: { order: "asc" } }),
    );
    return rows.map((r) => ({ id: r.slug, title: r.title }));
  },
);

type NewsRow = {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  body: string;
  publishedAt: Date | null;
  imageUrl: string;
  imageUrls: string;
};

/** Shared by the news section and the map (places linked to a news item). */
export function toNewsItem(r: NewsRow): NewsItem {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    date: r.date,
    excerpt: r.excerpt,
    body: toParagraphs(r.body),
    publishedAt: toIso(r.publishedAt),
    imageUrl: r.imageUrl,
    imageUrls: [r.imageUrl, ...parseStringArray(r.imageUrls)].filter(Boolean),
  };
}

export const getNews = cache(async (): Promise<NewsItem[]> => {
  const rows = await query("getNews", () =>
    prisma.newsItem.findMany({ orderBy: { order: "asc" } }),
  );
  return rows.map(toNewsItem);
});

/** One news item, or undefined when it doesn't exist. A failing query throws (see getBlogPost). */
export const getNewsItem = cache(
  async (id: string): Promise<NewsItem | undefined> => {
    const row = await query("getNewsItem", () =>
      prisma.newsItem.findUnique({ where: { id } }),
    );
    return row ? toNewsItem(row) : undefined;
  },
);

export const getGalleryItems = cache(async (): Promise<GalleryItem[]> => {
  const rows = await query("getGalleryItems", () =>
    prisma.galleryItem.findMany({
      orderBy: { order: "asc" },
    }),
  );
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
});

type BlogRow = {
  slug: string;
  title: string;
  category: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
  publishedAt: Date | null;
  updatedAt: Date;
};

function toBlogPost(r: BlogRow): BlogPost {
  return {
    slug: r.slug,
    title: r.title,
    category: r.category,
    date: r.date,
    author: r.author,
    excerpt: r.excerpt,
    content: toParagraphs(r.content),
    publishedAt: toIso(r.publishedAt),
    updatedAt: toIso(r.updatedAt),
  };
}

export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const rows = await query("getBlogPosts", () =>
    prisma.blogPost.findMany({
      orderBy: [
        { publishedAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
    }),
  );
  return rows.map(toBlogPost);
});

// Rethrows instead of returning undefined: "not found" would bake a 404 for
// a real post into the static cache. Throwing keeps the last good page
// (ISR) or fails the build so the previous deployment stays live.
export const getBlogPost = cache(
  async (slug: string): Promise<BlogPost | undefined> => {
    const row = await query("getBlogPost", () =>
      prisma.blogPost.findUnique({ where: { slug } }),
    );
    return row ? toBlogPost(row) : undefined;
  },
);

export const getLibraryResources = cache(
  async (): Promise<LibraryResource[]> => {
    const rows = await query("getLibraryResources", () =>
      prisma.libraryResource.findMany({
        orderBy: { order: "asc" },
      }),
    );
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category as LibraryResource["category"],
      description: r.description,
      fileType: r.fileType as LibraryResource["fileType"],
      fileUrl: safeHref(r.fileUrl),
    }));
  },
);

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
};

export const getJoinPricing = cache(
  async (): Promise<JoinPricingItem[]> =>
    query("getJoinPricing", () =>
      prisma.joinPricing.findMany({ orderBy: { order: "asc" } }),
    ),
);

export const getJoinSchedule = cache(
  async (): Promise<JoinScheduleItem[]> =>
    query("getJoinSchedule", () =>
      prisma.joinSchedule.findMany({ orderBy: { order: "asc" } }),
    ),
);
