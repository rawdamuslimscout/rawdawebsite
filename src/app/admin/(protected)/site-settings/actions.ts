"use server";

import { revalidatePath } from "next/cache";
import { getSessionAdminId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveSiteSettings(formData: FormData): Promise<ActionResult> {
  try {
    const adminId = await getSessionAdminId();
    if (!adminId) return { ok: false, error: "يلزم تسجيل الدخول" };

    const data = {
      name: String(formData.get("name") || ""),
      tagline: String(formData.get("tagline") || ""),
      parentOrg: String(formData.get("parentOrg") || ""),
      instagramUrl: String(formData.get("instagramUrl") || ""),
      contactPhone: String(formData.get("contactPhone") || ""),
      contactLocation: String(formData.get("contactLocation") || ""),
      joinIntro: String(formData.get("joinIntro") || ""),
    };

    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });

    revalidatePath("/");
    revalidatePath("/join");
    revalidatePath("/admin/site-settings");
    return { ok: true };
  } catch (err) {
    console.error("saveSiteSettings failed", err);
    return {
      ok: false,
      error:
        err instanceof Error && err.message
          ? err.message
          : "تعذّر حفظ الإعدادات. حاول مجددًا.",
    };
  }
}
