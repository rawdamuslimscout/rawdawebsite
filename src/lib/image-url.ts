/**
 * Uploads made since thumbnails were introduced are stored as
 *   <folder>/<uuid>/full.<ext>   original (lightbox, modals)
 *   <folder>/<uuid>/thumb.jpg    THUMB_WIDTH px wide (cards, grids, avatars)
 * Older single-file uploads, <folder>/<name>.<ext>, get their thumbnail as a
 * sibling file next to the untouched original:
 *   <folder>/<name>.thumb.jpg
 * (added afterwards, so stored URLs never change). If a sibling is missing,
 * SafeImage falls back to the original.
 *
 * Safe to import from both server and client code.
 */

export const THUMB_WIDTH = 640;
/** Width full-size images are optimized to (lightbox, modals, wide tiles). */
export const FULL_WIDTH = 1920;

const FULL_IMAGE =
  /\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/full\.(jpe?g|png|webp|avif)$/i;

/**
 * A legacy single-file image inside a bucket: exactly "<folder>/<name>.<ext>",
 * one folder level, an image extension, and a plain name (letters, digits,
 * "-" and "_"; no dots, so a ".thumb.jpg" file never matches itself).
 */
const LEGACY_IMAGE_PATH = /^([a-z0-9-]+)\/([a-z0-9_-]+)\.(jpe?g|png|webp|avif)$/i;

/** "<folder>/<name>.thumb.jpg" for a legacy image path inside a bucket, else null. */
export function legacyThumbPath(pathInBucket: string): string | null {
  const m = LEGACY_IMAGE_PATH.exec(pathInBucket);
  return m ? `${m[1]}/${m[2]}.thumb.jpg` : null;
}

/** "<this site's Supabase origin>/storage/v1/object/public/", or "" when not configured. */
function ownPublicStoragePrefix(): string {
  try {
    return `${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin}/storage/v1/object/public/`;
  } catch {
    return "";
  }
}

/** The small version of an uploaded image, or the URL itself if it has none. */
export function thumbUrl(url: string): string {
  if (FULL_IMAGE.test(url)) return url.replace(FULL_IMAGE, "/$1/thumb.jpg");
  // Legacy single-file images: only on this site's own Storage, never elsewhere.
  const prefix = ownPublicStoragePrefix();
  if (!prefix || !url.startsWith(prefix)) return url;
  const rest = url.slice(prefix.length); // "<bucket>/<folder>/<name>.<ext>"
  const slash = rest.indexOf("/");
  if (slash <= 0 || !/^[a-z0-9-]+$/i.test(rest.slice(0, slash))) return url;
  const thumb = legacyThumbPath(rest.slice(slash + 1));
  return thumb ? `${prefix}${rest.slice(0, slash + 1)}${thumb}` : url;
}

/**
 * `url` resized and re-encoded by the Next.js image optimizer, which caches the
 * result, so Supabase serves each file about once instead of once per visitor.
 * Only for this site's own Storage (the host allowed in next.config.js); any
 * other URL is returned unchanged. `width` must be one of Next's image sizes.
 */
export function optimizedImageUrl(url: string, width: number): string {
  const prefix = ownPublicStoragePrefix();
  if (!prefix || !url.startsWith(prefix)) return url;
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;
}

/**
 * src/srcSet for an <img>: the thumbnail by default, the original only when
 * the browser needs more pixels (wide tiles, high-density screens).
 * Spread these props after `sizes` and `loading` (React 18 sets attributes in
 * prop order), and keep srcSet before src — the same order next/image uses.
 */
export function responsiveImage(url: string | undefined): { srcSet?: string; src?: string } {
  if (!url) return { src: url };
  const thumb = thumbUrl(url);
  if (thumb === url) return { src: url };
  return { srcSet: `${thumb} ${THUMB_WIDTH}w, ${url} ${FULL_WIDTH}w`, src: thumb };
}

/**
 * Which file a slot needs:
 *   "responsive" thumbnail by default, original when the browser needs more pixels;
 *   "thumb"      small slots (avatars, list icons): thumbnail only;
 *   "original"   full-size viewers.
 */
export type ImageVariant = "responsive" | "thumb" | "original";

export type ImageSource = { src: string; srcSet?: string };

/** Only http(s) and site-relative URLs are ever put in an <img>. */
function usableImageUrl(url: string | null | undefined): string {
  const v = (url ?? "").trim();
  if (!v) return "";
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  try {
    const { protocol } = new URL(v);
    return protocol === "https:" || protocol === "http:" ? v : "";
  } catch {
    return "";
  }
}

/**
 * The sources to try, in order, for one stored image URL (see SafeImage).
 * When an upload has both files, each list contains both, so a broken
 * thumbnail falls back to the original and a broken original falls back to
 * the thumbnail. An empty list means "show the placeholder".
 */
export function imageSources(
  url: string | null | undefined,
  variant: ImageVariant = "responsive",
): ImageSource[] {
  const full = usableImageUrl(url);
  if (!full) return [];
  const thumb = thumbUrl(full);
  const direct = sourceChain(full, thumb, variant);
  const optimizedFull = optimizedImageUrl(full, FULL_WIDTH);
  if (optimizedFull === full) return direct;
  // Optimized copies first; the Storage files themselves stay as a last resort
  // in case the optimizer is unavailable (e.g. a hosting plan limit). Without
  // a thumbnail file the optimizer still makes a small version of the original.
  return [...sourceChain(optimizedFull, optimizedImageUrl(thumb, THUMB_WIDTH), variant), ...direct];
}

function sourceChain(full: string, thumb: string, variant: ImageVariant): ImageSource[] {
  if (thumb === full) return [{ src: full }];
  if (variant === "original") return [{ src: full }, { src: thumb }];
  if (variant === "thumb") return [{ src: thumb }, { src: full }];
  // The browser picks either file from the srcset; whichever one fails, the
  // next entries offer the other one on its own.
  return [
    { srcSet: `${thumb} ${THUMB_WIDTH}w, ${full} ${FULL_WIDTH}w`, src: thumb },
    { src: full },
    { src: thumb },
  ];
}

/** Which source is showing, and every URL that has already failed. */
export type ImageState = { index: number; failed: string[] };

export const INITIAL_IMAGE_STATE: ImageState = { index: 0, failed: [] };

/**
 * The state after the source at `failedIndex` failed to load `failedUrl`.
 * - Only the source on screen can advance (late or repeated errors from an
 *   earlier attempt are ignored).
 * - Sources whose URL already failed are skipped, so no URL is requested twice.
 * - The index only moves forward: past the last source the placeholder shows,
 *   so a failing image can never loop.
 */
export function advanceImage(
  sources: ImageSource[],
  state: ImageState,
  failedIndex: number,
  failedUrl: string,
): ImageState {
  if (failedIndex !== state.index || state.index >= sources.length) return state;
  const failed =
    failedUrl && !state.failed.includes(failedUrl) ? [...state.failed, failedUrl] : state.failed;
  let index = state.index + 1;
  while (index < sources.length && failed.includes(sources[index].src)) index++;
  return { index, failed };
}

/** The parts of an image element that watchImage() needs (an HTMLImageElement in the app). */
export type WatchedImage = Pick<
  HTMLImageElement,
  "complete" | "naturalWidth" | "currentSrc" | "src" | "addEventListener" | "removeEventListener"
>;

/**
 * Reports a failed load of `img` once, with the URL that failed (the srcset
 * candidate the browser actually chose, when it chose one).
 * - An image that already failed before this was attached (e.g. a
 *   server-rendered image whose error fired before React hydrated) is
 *   reported immediately.
 * - A lazy image that has not started loading reports complete === false and
 *   is left alone; its error event is caught when it happens.
 * Returns the cleanup function.
 */
export function watchImage(img: WatchedImage, onFail: (failedUrl: string) => void): () => void {
  let reported = false;
  const report = () => {
    if (reported) return;
    reported = true;
    onFail(img.currentSrc || img.src);
  };
  if (img.complete && img.naturalWidth === 0 && (img.currentSrc || img.src)) report();
  img.addEventListener("error", report);
  return () => img.removeEventListener("error", report);
}
