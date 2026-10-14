"use server";

import { revalidatePath } from "next/cache";
import { getSessionAdminId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { friendlyMessage } from "@/lib/errors";
import { safeHref } from "@/lib/safe-url";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { isOwnStorageUrl, removeFromStorage, uploadToStorage } from "@/lib/supabase-storage";
import { parseStringArray } from "@/lib/json";
import { ABOUT_PHOTO_MAX } from "@/lib/home-photos";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

const NOT_LOGGED_IN = "انتهت جلسة الدخول. حدّث الصفحة وسجّل الدخول من جديد.";

/**
 * Uploads a settings photo (the "about" or "join" section; already resized in
 * the browser) and returns its URL; it is only stored once the settings form
 * is saved. Shares the per-admin upload budget with the content sections.
 */
export async function uploadSettingsImage(formData: FormData): Promise<UploadResult> {
  try {
    const adminId = await getSessionAdminId();
    if (!adminId) return { ok: false, error: NOT_LOGGED_IN };
    if (!(await rateLimit(`upload:${adminId}`, 60, 10 * 60)).allowed)
      return { ok: false, error: "رفعت ملفات كثيرة خلال وقت قصير. انتظر بضع دقائق ثم أعد المحاولة." };

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "لم يتم اختيار صورة." };
    if (!file.type.startsWith("image/")) return { ok: false, error: "الملف المختار ليس صورة." };

    const thumb = formData.get("thumb");
    const url = await uploadToStorage(file, "site-settings", thumb instanceof File ? thumb : null);
    if (!url) return { ok: false, error: "تعذّر رفع الصورة." };

    await audit({ action: "upload", adminId, resource: "site-settings" });
    return { ok: true, url };
  } catch (err) {
    console.error("uploadSettingsImage failed", err);
    return { ok: false, error: friendlyMessage(err, "تعذّر رفع الصورة. حاول مجددًا.") };
  }
}

export async function saveSiteSettings(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const adminId = await getSessionAdminId();
    if (!adminId) return { ok: false, error: NOT_LOGGED_IN };

    const selectedImageIds = formData.getAll("aboutImageIds").map(String);
    const aboutImageUrls = parseStringArray(formData.get("aboutImageUrls"));
    if (aboutImageUrls.some((url) => !isOwnStorageUrl(url)))
      return { ok: false, error: "إحدى صور قسم «عن الفوج» غير صالحة. ارفعها من جديد." };
    const validImageIds = new Set(
      (
        await prisma.galleryItem.findMany({
          where: { id: { in: selectedImageIds } },
          select: { id: true },
        })
      ).map((item) => item.id),
    );

    const name = String(formData.get("name") || "").trim();
    if (!name) return { ok: false, error: "اسم الفوج مطلوب." };

    const text = (key: string, max: number) => String(formData.get(key) || "").trim().slice(0, max);
    const rawInstagram = text("instagramUrl", 300);
    const instagramUrl = safeHref(rawInstagram);
    if (rawInstagram && !instagramUrl)
      return { ok: false, error: "رابط إنستغرام غير صحيح. يجب أن يبدأ بـ https://" };

    // Only "" (use a gallery photo) or a file in our own bucket is accepted.
    const joinImageUrl = String(formData.get("joinImageUrl") || "").trim();
    if (joinImageUrl && !isOwnStorageUrl(joinImageUrl))
      return { ok: false, error: "صورة قسم «انضمّوا إلينا» غير صالحة. ارفعها من جديد." };

    const aboutImageIds = selectedImageIds.filter((id) => validImageIds.has(id));
    if (aboutImageUrls.length + aboutImageIds.length > ABOUT_PHOTO_MAX)
      return { ok: false, error: `يمكن اختيار ${ABOUT_PHOTO_MAX} صور كحدّ أقصى لقسم «عن الفوج».` };

    const previous = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: { joinImageUrl: true, aboutImageUrls: true },
    });

    const data = {
      name: name.slice(0, 150),
      tagline: text("tagline", 300),
      parentOrg: text("parentOrg", 200),
      instagramUrl,
      contactPhone: text("contactPhone", 40),
      contactLocation: text("contactLocation", 200),
      joinIntro: text("joinIntro", 3000),
      aboutImageIds: JSON.stringify(aboutImageIds),
      aboutImageUrls: JSON.stringify(aboutImageUrls),
      joinImageUrl,
    };

    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });

    // Photos uploaded to these sections live nowhere else, so replaced or
    // removed ones are deleted from storage.
    const dropped = [
      ...(previous?.joinImageUrl && previous.joinImageUrl !== joinImageUrl ? [previous.joinImageUrl] : []),
      ...parseStringArray(previous?.aboutImageUrls).filter((url) => !aboutImageUrls.includes(url)),
    ];
    if (dropped.length) await removeFromStorage(dropped);

    await audit({ action: "update", adminId, resource: "site-settings" });
    // Settings (name, contact details) render in the footer of every page.
    revalidatePath("/", "layout");
    revalidatePath("/admin/site-settings");
    return { ok: true };
  } catch (err) {
    console.error("saveSiteSettings failed", err);
    return {
      ok: false,
      error: friendlyMessage(err, "تعذّر حفظ الإعدادات. حاول مجددًا."),
    };
  }
}
