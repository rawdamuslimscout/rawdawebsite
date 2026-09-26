import { createClient } from "@supabase/supabase-js";

const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey)
    throw new Error("Supabase Storage is not configured");
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

export async function uploadToStorage(file: File, folder: string) {
  if (!file || file.size === 0) return null;
  if (file.size > 25 * 1024 * 1024)
    throw new Error("حجم الملف يتجاوز 25 ميغابايت");

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const client = getStorageClient();
  const { error } = await client.storage.from(bucket).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(`تعذّر رفع الملف: ${error.message}`);
  return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
