import { prisma } from "@/lib/prisma";
import { siteInfo } from "@/data/content";
import { saveSiteSettings } from "./actions";

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

  const inputClass =
    "w-full rounded-lg border border-brand-purple/15 px-3 py-2 text-sm outline-none focus:border-brand-purple";

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-ink">إعدادات الموقع العامة</h1>

      {dbError && (
        <p className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{dbError}</p>
      )}

      {settings && (
        <form
          action={saveSiteSettings}
          className="mt-8 grid gap-4 rounded-2xl border border-brand-purple/10 bg-white p-6 shadow-sm sm:grid-cols-2"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">اسم الفوج</label>
            <input name="name" defaultValue={settings.name} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">الشعار (tagline)</label>
            <input name="tagline" defaultValue={settings.tagline} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
              الجهة الأم (الجمعية / المفوضية)
            </label>
            <input name="parentOrg" defaultValue={settings.parentOrg} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">رابط Instagram</label>
            <input name="instagramUrl" defaultValue={settings.instagramUrl} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">رقم الهاتف</label>
            <input name="contactPhone" defaultValue={settings.contactPhone} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">الموقع / العنوان</label>
            <input name="contactLocation" defaultValue={settings.contactLocation} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
              مقدمة صفحة «انضم إلينا»
            </label>
            <textarea
              name="joinIntro"
              defaultValue={settings.joinIntro}
              rows={3}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-brand-purple px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark"
            >
              حفظ الإعدادات
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
