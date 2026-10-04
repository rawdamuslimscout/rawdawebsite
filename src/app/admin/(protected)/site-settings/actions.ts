"use server";

import { revalidatePath } from "next/cache";
import { getSessionAdminId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { friendlyMessage } from "@/lib/errors";
import { safeHref } from "@/lib/safe-url";
import { audit } from "@/lib/audit";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveSiteSettings(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const adminId = await getSessionAdminId();
    if (!adminId) return { ok: false, error: "انتهت جلسة الدخول. حدّث الصفحة وسجّل الدخول من جديد." };

    const selectedImageIds = formData.getAll("aboutImageIds").map(String);
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

    const data = {
      name: name.slice(0, 150),
      tagline: text("tagline", 300),
      parentOrg: text("parentOrg", 200),
      instagramUrl,
      contactPhone: text("contactPhone", 40),
      contactLocation: text("contactLocation", 200),
      joinIntro: text("joinIntro", 3000),
      aboutImageIds: JSON.stringify(
        selectedImageIds.filter((id) => validImageIds.has(id)).slice(0, 2),
      ),
    };

    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });

    await audit({ action: "update", adminId, resource: "site-settings" });
    revalidatePath("/");
    revalidatePath("/join");
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
