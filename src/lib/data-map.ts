import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { retryRead } from "@/lib/db-retry";
import { safeHref } from "@/lib/safe-url";
import { toNewsItem } from "@/lib/data";
import { isMapCategory, type MapPlace } from "@/data/map";

/** `failed` is kept for the map component; a DB error now throws instead (see lib/data.ts). */
export type MapPlacesResult = { places: MapPlace[]; failed: boolean };

const validCoords = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180 &&
  !(lat === 0 && lng === 0);

/**
 * Published places with valid coordinates, for the public map.
 * Same contract as the other getters in lib/data.ts: a failing query is logged
 * and rethrown, so ISR keeps the last good page instead of caching an empty map.
 */
export const getMapPlaces = cache(async (): Promise<MapPlacesResult> => {
  try {
    const rows = await retryRead("getMapPlaces", () =>
      prisma.scoutPlace.findMany({
        where: { isPublished: true },
        orderBy: { order: "asc" },
        include: { news: true },
      }),
    );

    const places: MapPlace[] = [];
    for (const r of rows) {
      if (!isMapCategory(r.category) || !validCoords(r.latitude, r.longitude)) continue;

      const news = r.news ? toNewsItem(r.news) : null;

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
    throw err;
  }
});
