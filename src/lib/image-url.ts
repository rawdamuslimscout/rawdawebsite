/**
 * Uploads made since thumbnails were introduced are stored as
 *   <folder>/<uuid>/full.<ext>   original (lightbox, modals)
 *   <folder>/<uuid>/thumb.jpg    THUMB_WIDTH px wide (cards, grids, avatars)
 * Older uploads have no thumbnail; their URLs are returned unchanged.
 *
 * Safe to import from both server and client code.
 */

export const THUMB_WIDTH = 640;

const FULL_IMAGE =
  /\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/full\.(jpe?g|png|webp|avif)$/i;

/** The small version of an uploaded image, or the URL itself if it has none. */
export function thumbUrl(url: string): string {
  return FULL_IMAGE.test(url) ? url.replace(FULL_IMAGE, "/$1/thumb.jpg") : url;
}

/**
 * src/srcSet for an <img>: the thumbnail by default, the original only when
 * the browser needs more pixels (wide tiles, high-density screens).
 * Pass `sizes` on the <img> alongside these props.
 */
export function responsiveImage(url: string | undefined): { src?: string; srcSet?: string } {
  if (!url) return { src: url };
  const thumb = thumbUrl(url);
  if (thumb === url) return { src: url };
  return { src: thumb, srcSet: `${thumb} ${THUMB_WIDTH}w, ${url} 1920w` };
}
