"use server";

import { revalidatePath } from "next/cache";
import { getSessionAdminId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function saveSiteSettings(formData: FormData) {
  const adminId = await getSessionAdminId();
  if (!adminId) throw new Error("يلزم تسجيل الدخول");

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
}
