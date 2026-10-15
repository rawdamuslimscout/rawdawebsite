import type { MetadataRoute } from "next";
import { getBlogPosts, getNews } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

// Static pages carry no lastModified: a build-time `new Date()` would claim
// every page changed on every deploy. Articles use their real dates.
// The getters throw on a DB error, so the last good sitemap is kept instead
// of one that silently drops every article.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, news] = await Promise.all([getBlogPosts(), getNews()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/join`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/news`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/gallery`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/structure`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/library`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${encodeURIComponent(p.slug)}`,
    ...(p.updatedAt ?? p.publishedAt
      ? { lastModified: p.updatedAt ?? p.publishedAt }
      : {}),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const newsPages: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${SITE_URL}/news/${encodeURIComponent(n.id)}`,
    ...(n.publishedAt ? { lastModified: n.publishedAt } : {}),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...postPages, ...newsPages];
}
