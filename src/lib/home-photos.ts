import { cache } from "react";

import { getGalleryItems, getSiteSettings } from "@/lib/data";

/** Most photos the admin can pick for the "about" section (the homepage band shows three). */
export const ABOUT_PHOTO_MAX = 3;
const INTRO_COUNT = 3;
const GALLERY_COUNT = 6;
const ABOUT_UPLOAD_ALT = "من أنشطة فوج روضة الفيحاء";

export type Photo = { id: string; title: string; imageUrl: string };

// getGalleryItems() already drops items without an image.
const toPhoto = (item: { id: string; title: string; imageUrl?: string }): Photo => ({
  id: item.id,
  title: item.title,
  imageUrl: item.imageUrl ?? "",
});

/**
 * The admin's "about" photos: the ones uploaded straight to the section
 * first, then the ones picked from the gallery (deleted gallery items drop out).
 */
export const getAboutPhotos = cache(async () => {
  const [settings, gallery] = await Promise.all([getSiteSettings(), getGalleryItems()]);
  const uploads: Photo[] = settings.aboutImageUrls.map((url) => ({
    id: url,
    title: ABOUT_UPLOAD_ALT,
    imageUrl: url,
  }));
  const picks = settings.aboutImageIds
    .map((id) => gallery.find((item) => item.id === id))
    .filter((item): item is (typeof gallery)[number] => Boolean(item))
    .map(toPhoto);
  return { picked: [...uploads, ...picks].slice(0, ABOUT_PHOTO_MAX), gallery: gallery.map(toPhoto) };
});

/**
 * Splits the photos between the homepage's photo sections so no photo shows
 * twice: the intro band takes the admin's "about" photos first, the join band
 * uses its own uploaded photo (or else the next gallery photo), and the
 * gallery teaser the rest in admin order. With a small gallery the teaser
 * falls back to the first photos, repeats and all.
 */
export const getHomePhotos = cache(async () => {
  const [settings, { picked }, gallery] = await Promise.all([
    getSiteSettings(),
    getAboutPhotos(),
    getGalleryItems(),
  ]);

  const pickedIds = new Set(picked.map((photo) => photo.id));
  const pool: Photo[] = [...picked, ...gallery.filter((item) => !pickedIds.has(item.id)).map(toPhoto)];

  const intro = pool.slice(0, INTRO_COUNT);
  const joinFromGallery = settings.joinImageUrl ? null : (pool[INTRO_COUNT] ?? null);
  const joinImageUrl = settings.joinImageUrl || joinFromGallery?.imageUrl || null;

  const used = new Set([...intro, ...(joinFromGallery ? [joinFromGallery] : [])].map((item) => item.id));
  const unused = gallery.filter((item) => !used.has(item.id));
  const source = unused.length >= 3 ? unused : gallery;
  // Whole rows only: the grid is three across on tablets and desktop.
  const n = Math.min(source.length, GALLERY_COUNT);
  const teaser = source.slice(0, n >= 3 ? n - (n % 3) : n);

  return { intro, joinImageUrl, teaser, total: gallery.length };
});
