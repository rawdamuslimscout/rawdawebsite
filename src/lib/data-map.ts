import { prisma } from "@/lib/prisma";
import { safeHref } from "@/lib/safe-url";
import { isMapCategory, type MapPlace } from "@/data/map";
import type { NewsItem } from "@/data/content";

export type MapPlacesResult = { places: MapPlace[]; failed: boolean };

function parseImageUrls(value: string): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((u): u is string => typeof u === "string")
      : [];
  } catch {
    return [];
  }
}

const validCoords = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180 &&
  !(lat === 0 && lng === 0);

/**
 * Published places with valid coordinates, for the public map.
 * Same contract as the other getters in lib/data.ts: a failing query is logged
 * on the server and reported as `failed` so only this section shows a message —
 * the rest of the page keeps working.
 */
export async function getMapPlaces(): Promise<MapPlacesResult> {
  try {
    const rows = await prisma.scoutPlace.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: { news: true },
    });

    const places: MapPlace[] = [];
    for (const r of rows) {
      if (!isMapCategory(r.category) || !validCoords(r.latitude, r.longitude)) continue;

      let news: NewsItem | null = null;
      if (r.news) {
        news = {
          id: r.news.id,
          title: r.news.title,
          category: r.news.category,
          date: r.news.date,
          excerpt: r.news.excerpt,
          imageUrl: r.news.imageUrl,
          imageUrls: [r.news.imageUrl, ...parseImageUrls(r.news.imageUrls)].filter(Boolean),
        };
      }

      places.push({
        id: r.id,
        title: r.title,
        category: r.category,
        locationName: r.locationName,
        latitude: r.latitude,
        longitude: r.longitude,
        dateText: r.dateText,
        description: r.description,
        participants: r.participants > 0 ? r.participants : null,
        imageUrl: safeHref(r.imageUrl) || null,
        news,
      });
    }
    return { places, failed: false };
  } catch (err) {
    console.error("[data] getMapPlaces failed", err);
    return { places: [], failed: true };
  }
}
