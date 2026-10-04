import { createClient } from "@supabase/supabase-js";

const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

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

export async function uploadToStorage(file: File, folder: string) {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("حجم الملف يتجاوز 10 ميغابايت");

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) throw new Error("نوع الملف غير مدعوم. استخدم صورة (JPG / PNG / WebP) أو PDF أو Word.");

  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!signatureMatches(ext, head)) throw new Error("محتوى الملف لا يطابق نوعه. اختر ملفًا سليمًا.");

  // Server-generated name only: no user-controlled path segments, no traversal.
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "misc";
  const path = `${safeFolder}/${crypto.randomUUID()}.${ext}`;
  const client = getStorageClient();
  const { error } = await client.storage.from(bucket).upload(path, file, {
    contentType,
    upsert: false,
    cacheControl: "31536000",
  });
  if (error) {
    console.error("[storage] upload failed", error.message);
    throw new Error("تعذّر رفع الملف. تحقق من اتصالك وأعد المحاولة.");
  }
  return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
