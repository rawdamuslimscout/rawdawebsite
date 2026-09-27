import { prisma } from "@/lib/prisma";
import { siteInfo } from "@/data/content";
import SiteSettingsForm from "./SiteSettingsForm";

export default async function SiteSettingsPage() {
  let settings: {
    name: string;
    tagline: string;
    parentOrg: string;
    instagramUrl: string;
    contactPhone: string;
    contactLocation: string;
    joinIntro: string;
  } | null = null;
  let dbError: string | null = null;

  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    settings = row ?? {
      name: siteInfo.name,
      tagline: siteInfo.tagline,
      parentOrg: siteInfo.parent,
      instagramUrl: siteInfo.instagramUrl,
      contactPhone: "",
      contactLocation: "",
      joinIntro: "",
    };
  } catch {
    dbError =
      "تعذّر الاتصال بقاعدة البيانات. تحقق من DATABASE_URL و DIRECT_URL في ملف .env، وتأكد من تشغيل prisma migrate.";
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-ink">
        إعدادات الموقع العامة
      </h1>

      {dbError && (
        <p className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{dbError}</p>
      )}

      {settings && <SiteSettingsForm settings={settings} />}
    </div>
  );
}
