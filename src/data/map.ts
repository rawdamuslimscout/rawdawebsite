import type { NewsItem } from "@/data/content";

/** The five kinds of place shown on the map. Stored as plain strings in ScoutPlace.category. */
export const MAP_CATEGORIES = ["camps", "trips", "training", "service", "events"] as const;
export type MapCategory = (typeof MAP_CATEGORIES)[number];

/** Filter chips above the map. «أنشطة» groups community service and events. */
export type MapFilterKey = "all" | "camps" | "trips" | "training" | "activities";

export const FILTER_CATEGORIES: Record<MapFilterKey, readonly MapCategory[]> = {
  all: MAP_CATEGORIES,
  camps: ["camps"],
  trips: ["trips"],
  training: ["training"],
  activities: ["service", "events"],
};

export function isMapCategory(value: string): value is MapCategory {
  return (MAP_CATEGORIES as readonly string[]).includes(value);
}

/** One place on the public map. Everything here comes from the database — nothing is invented. */
export type MapPlace = {
  id: string;
  title: string;
  category: MapCategory;
  locationName: string;
  latitude: number;
  longitude: number;
  /** Free text, written by the admin the same way dates are written elsewhere on the site. */
  dateText: string;
  description: string;
  /** null when unknown (stored as 0). */
  participants: number | null;
  imageUrl: string | null;
  /** Linked news item, opened in the existing news modal by «عرض التفاصيل». */
  news: NewsItem | null;
};
