import { createClient } from "@supabase/supabase-js";
import { legacyThumbPath } from "@/lib/image-url";

const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_THUMB_BYTES = 400 * 1024;
/** Image types that get a "<uuid>/full.<ext>" + "<uuid>/thumb.jpg" pair (see lib/image-url.ts). */
const THUMB_EXTS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

// Extension -> the ONLY content type we ever store it with (never trust file.type).
// SVG is intentionally not allowed: it can carry scripts.
const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function startsWith(buf: Uint8Array, sig: number[], offset = 0) {
  return sig.every((b, i) => buf[offset + i] === b);
}

/** File-signature (magic byte) check so a renamed .exe/.html can't pass as an image. */
function signatureMatches(ext: string, b: Uint8Array): boolean {
  switch (ext) {
    case "jpg": case "jpeg": return startsWith(b, [0xff, 0xd8, 0xff]);
    case "png": return startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "gif": return startsWith(b, [0x47, 0x49, 0x46, 0x38]);
    case "webp": return startsWith(b, [0x52, 0x49, 0x46, 0x46]) && startsWith(b, [0x57, 0x45, 0x42, 0x50], 8);
    case "avif": return startsWith(b, [0x66, 0x74, 0x79, 0x70], 4);
    case "pdf": return startsWith(b, [0x25, 0x50, 0x44, 0x46]);
    case "docx": return startsWith(b, [0x50, 0x4b, 0x03, 0x04]);
    case "doc": return startsWith(b, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    default: return false;
  }
}

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Supabase Storage is not configured");
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

/** A browser-made thumbnail is only used if it really is a small JPEG. */
async function validThumb(thumb: File | null | undefined): Promise<File | null> {
  if (!thumb || thumb.size === 0 || thumb.size > MAX_THUMB_BYTES) return null;
  const head = new Uint8Array(await thumb.slice(0, 16).arrayBuffer());
  return signatureMatches("jpg", head) ? thumb : null;
}

export async function uploadToStorage(file: File, folder: string, thumb?: File | null) {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("حجم الملف يتجاوز 10 ميغابايت");

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) throw new Error("نوع الملف غير مدعوم. استخدم صورة (JPG / PNG / WebP) أو PDF أو Word.");

  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!signatureMatches(ext, head)) throw new Error("محتوى الملف لا يطابق نوعه. اختر ملفًا سليمًا.");

  // Server-generated name only: no user-controlled path segments, no traversal.
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "misc";
  const id = crypto.randomUUID();
  const client = getStorageClient();
  const store = client.storage.from(bucket);
  const options = { upsert: false, cacheControl: "31536000" };

  // Thumbnail first, so a saved ".../full.<ext>" URL always has its thumb.jpg.
  // If the thumbnail is missing or fails, fall back to the single-file layout.
  let path = `${safeFolder}/${id}.${ext}`;
  let thumbPath: string | null = null;
  const thumbFile = THUMB_EXTS.has(ext) ? await validThumb(thumb) : null;
  if (thumbFile) {
    const candidate = `${safeFolder}/${id}/thumb.jpg`;
    const { error } = await store.upload(candidate, thumbFile, { ...options, contentType: "image/jpeg" });
    if (error) {
      console.error("[storage] thumbnail upload failed", error.message);
    } else {
      thumbPath = candidate;
      path = `${safeFolder}/${id}/full.${ext}`;
    }
  }

  const { error } = await store.upload(path, file, { ...options, contentType });
  if (error) {
    console.error("[storage] upload failed", error.message);
    if (thumbPath) await store.remove([thumbPath]);
    throw new Error("تعذّر رفع الملف. تحقق من اتصالك وأعد المحاولة.");
  }
  return store.getPublicUrl(path).data.publicUrl;
}

/** "<SUPABASE_URL>/storage/v1/object/public/<bucket>/" — the prefix of every URL we hand out. */
function publicPrefix(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return `${new URL(url).origin}/storage/v1/object/public/${bucket}/`;
  } catch {
    return null;
  }
}

/** Object path inside OUR bucket for one of our public URLs, else null. */
function storagePath(url: string): string | null {
  const prefix = publicPrefix();
  if (!prefix || typeof url !== "string" || !url.startsWith(prefix)) return null;
  let path: string;
  try {
    path = decodeURIComponent(url.slice(prefix.length).split(/[?#]/)[0]);
  } catch {
    return null;
  }
  // Only the shapes uploads have: "<folder>/<file>" or "<folder>/<uuid>/<file>".
  // File names may contain "_" (early uploads kept the phone's file name, e.g.
  // "..._n.jpg"); folders, slashes and ".." stay forbidden.
  return /^[a-z0-9-]+\/(?:[0-9a-f-]{36}\/)?[a-z0-9._-]+$/i.test(path) && !path.includes("..")
    ? path
    : null;
}

/** True only for public URLs of files in this site's own Storage bucket. */
export function isOwnStorageUrl(url: string): boolean {
  return storagePath(url) !== null;
}

/**
 * Best-effort removal of uploaded files (plus their thumbnails). URLs outside
 * our bucket are ignored. Never throws: a failed cleanup only leaves an orphan.
 */
/**
 * The object paths to delete for these URLs: each file of ours, plus the
 * thumbnail that belongs to it ("<uuid>/thumb.jpg" next to "<uuid>/full.<ext>",
 * or "<name>.thumb.jpg" next to a legacy "<name>.<ext>"). URLs outside our
 * bucket are ignored, and a thumbnail never adds anything else.
 */
export function storagePathsToRemove(urls: string[]): string[] {
  const paths = new Set<string>();
  for (const url of urls) {
    const path = storagePath(url);
    if (!path) continue;
    paths.add(path);
    if (/\/full\.[a-z]+$/i.test(path)) paths.add(path.replace(/\/full\.[a-z]+$/i, "/thumb.jpg"));
    const sibling = legacyThumbPath(path);
    if (sibling) paths.add(sibling);
  }
  return [...paths];
}

export async function removeFromStorage(urls: string[]): Promise<void> {
  const paths = new Set(storagePathsToRemove(urls));
  if (paths.size === 0) return;
  try {
    const { error } = await getStorageClient().storage.from(bucket).remove([...paths]);
    if (error) console.error("[storage] cleanup failed", error.message);
  } catch (err) {
    console.error("[storage] cleanup failed", err instanceof Error ? err.message : err);
  }
}
