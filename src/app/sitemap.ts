import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/join`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/structure`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/library`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
  try {
    const posts = await prisma.blogPost.findMany({ select: { slug: true, updatedAt: true } });
    for (const p of posts) {
      entries.push({
        url: `${SITE_URL}/blog/${encodeURIComponent(p.slug)}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch (err) {
    console.error("[sitemap] blog posts unavailable", err instanceof Error ? err.message : err);
  }
  return entries;
}
