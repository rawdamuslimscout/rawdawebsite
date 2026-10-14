import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/session";
import { siteInfo } from "@/data/content";
import { parseStringArray } from "@/lib/json";
import { ABOUT_PHOTO_MAX } from "@/lib/home-photos";
import SiteSettingsForm from "./SiteSettingsForm";

// Like every other admin page: always rendered per request, never prerendered.
export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  await requireAdminPage();
  let settings: {
    name: string;
    tagline: string;
    parentOrg: string;
    instagramUrl: string;
    contactPhone: string;
    contactLocation: string;
    joinIntro: string;
    aboutImageIds: string[];
    aboutImageUrls: string[];
    joinImageUrl: string;
  } | null = null;
  let gallery: { id: string; title: string; imageUrl: string }[] = [];
  let dbError: string | null = null;

  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });
    gallery = await prisma.galleryItem.findMany({
      where: { imageUrl: { not: "" } },
      orderBy: { order: "asc" },
      select: { id: true, title: true, imageUrl: true },
    });
    if (row) {
      settings = {
        ...row,
        aboutImageIds: parseStringArray(row.aboutImageIds),
        aboutImageUrls: parseStringArray(row.aboutImageUrls),
      };
    } else {
      settings = {
        name: siteInfo.name,
        tagline: siteInfo.tagline,
        parentOrg: siteInfo.parent,
        instagramUrl: siteInfo.instagramUrl,
        contactPhone: "",
        contactLocation: "",
        joinIntro: "",
        aboutImageIds: [],
        aboutImageUrls: [],
        joinImageUrl: "",
      };
    }
  } catch (err) {
    console.error("[admin] loading site settings failed", err);
    dbError =
      "تعذّر تحميل الإعدادات الآن بسبب مشكلة في الاتصال بقاعدة البيانات. حدّث الصفحة بعد قليل، وإن استمرت المشكلة تواصل مع المطوّر.";
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-ink">
        إعدادات الموقع العامة
      </h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-brand-ink/60">
        معلومات الفوج التي تظهر في أعلى الموقع وأسفله وفي صفحة «انضم إلينا».
      </p>

      {dbError && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700">
          {dbError}
        </p>
      )}

      {settings && <SiteSettingsForm settings={settings} gallery={gallery} aboutPhotoMax={ABOUT_PHOTO_MAX} />}
    </div>
  );
}
