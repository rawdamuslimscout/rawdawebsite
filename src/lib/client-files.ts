/**
 * Browser-side helpers that make uploads reliable for non-technical admins:
 *  - phone photos (often 5–12 MB) are resized/compressed before upload, so they
 *    never exceed the server's request size limit;
 *  - wrong file types / oversized documents are rejected up front with a clear
 *    Arabic message instead of failing deep inside the server.
 */

export const DOC_MAX_BYTES = 4 * 1024 * 1024; // keep under typical hosting request limits
export const IMAGE_TARGET_BYTES = 800 * 1024;

export class FilePrepError extends Error {}

const mb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

function extOf(name: string): string {
  return (name.split(".").pop() || "").toLowerCase();
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new FilePrepError("تعذّر معالجة الصورة.")),
      "image/jpeg",
      quality,
    );
  });
}

async function decodeImage(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await createImageBitmap(file);
  }
}

async function compressImage(file: File): Promise<File> {
  const ext = extOf(file.name);

  // Vector / animated images can't be re-drawn safely — only enforce size.
  if (ext === "svg" || ext === "gif") {
    if (file.size > DOC_MAX_BYTES)
      throw new FilePrepError(
        `حجم الصورة ${mb(file.size)} ميغابايت وهو كبير. اختر صورة أصغر من ${mb(DOC_MAX_BYTES)} ميغابايت.`,
      );
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await decodeImage(file);
  } catch {
    if (file.size <= IMAGE_TARGET_BYTES) return file;
    throw new FilePrepError(
      "تعذّر قراءة هذه الصورة. جرّب صورة بصيغة JPG أو PNG (يمكنك أخذ لقطة شاشة للصورة).",
    );
  }

  try {
    // Already small and a web-friendly format: keep it untouched.
    if (file.size <= IMAGE_TARGET_BYTES && /^(jpe?g|png|webp|avif)$/.test(ext))
      return file;

    let maxDim = 1920;
    let quality = 0.82;
    let blob: Blob | null = null;

    for (let attempt = 0; attempt < 7; attempt++) {
      const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new FilePrepError("تعذّر معالجة الصورة.");
      ctx.fillStyle = "#ffffff"; // PNGs with transparency become white, not black
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      blob = await canvasToBlob(canvas, quality);
      if (blob.size <= IMAGE_TARGET_BYTES) break;

      quality -= 0.08;
      if (quality < 0.55) {
        quality = 0.75;
        maxDim = Math.round(maxDim * 0.8);
      }
    }

    if (!blob || blob.size > IMAGE_TARGET_BYTES * 3)
      throw new FilePrepError("تعذّر تصغير الصورة. اختر صورة أصغر.");

    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${base}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close?.();
  }
}

/** Validates (and, for images, shrinks) a file chosen by the admin. */
export async function prepareFile(
  file: File,
  accept: string | undefined,
): Promise<File> {
  const wantsImage = accept === "image/*";
  const isImage = file.type.startsWith("image/");

  if (wantsImage || isImage) {
    if (!isImage)
      throw new FilePrepError(
        `الملف «${file.name}» ليس صورة. اختر صورة بصيغة JPG أو PNG.`,
      );
    return compressImage(file);
  }

  const ext = extOf(file.name);
  if (!["pdf", "doc", "docx"].includes(ext))
    throw new FilePrepError(
      `الملف «${file.name}» غير مدعوم. اختر ملف PDF أو Word.`,
    );
  if (file.size > DOC_MAX_BYTES)
    throw new FilePrepError(
      `حجم الملف ${mb(file.size)} ميغابايت والحد الأقصى ${mb(DOC_MAX_BYTES)} ميغابايت. قلّل حجمه (مثلًا بضغط الـ PDF) ثم أعد المحاولة.`,
    );
  return file;
}
