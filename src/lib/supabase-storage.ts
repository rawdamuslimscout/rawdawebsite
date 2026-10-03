import { createClient } from "@supabase/supabase-js";

const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
  "svg",
  "pdf",
  "doc",
  "docx",
]);

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey)
    throw new Error("Supabase Storage is not configured");
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

export async function uploadToStorage(file: File, folder: string) {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES)
    throw new Error("حجم الملف يتجاوز 25 ميغابايت");

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext))
    throw new Error("نوع الملف غير مدعوم. استخدم صورة (JPG / PNG) أو PDF أو Word.");

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const client = getStorageClient();
  const { error } = await client.storage.from(bucket).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) {
    console.error("[storage] upload failed", error);
    throw new Error("تعذّر رفع الملف. تحقق من اتصالك وأعد المحاولة.");
  }
  return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
