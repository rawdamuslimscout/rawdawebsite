import Link from "next/link";
import { Settings, ArrowLeft } from "lucide-react";
import {
  resourceGroups,
  resourceRegistry,
  getDelegate,
} from "@/lib/admin-resources";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const entries = Object.values(resourceRegistry);

  const counts = await Promise.all(
    entries.map(async (r) => {
      try {
        const delegate = getDelegate(r.key);
        const count: number = (await delegate?.count?.()) ?? 0;
        return { key: r.key, count, error: false };
      } catch (err) {
        console.error(`[admin] counting ${r.key} failed`, err);
        return { key: r.key, count: 0, error: true };
      }
    }),
  );
  const countByKey = new Map(counts.map((c) => [c.key, c]));
  const anyDbError = counts.length > 0 && counts.every((c) => c.error);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-ink">
        لوحة التحكم
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-ink/65">
        اختر القسم الذي تريد تعديله. كل بطاقة تذكر لك أين يظهر هذا المحتوى في
        الموقع، والتغييرات تظهر مباشرة بعد الحفظ.
      </p>

      {anyDbError && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700">
          تعذّر الاتصال بقاعدة البيانات الآن. حدّث الصفحة بعد قليل، وإن استمرت
          المشكلة تواصل مع المطوّر.
        </p>
      )}

      <Link
        href="/admin/site-settings"
        className="mt-6 flex items-center justify-between rounded-2xl border border-brand-purple/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-purple-tint text-brand-purple">
            <Settings className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-base font-semibold text-brand-ink">
              إعدادات الموقع العامة
            </span>
            <span className="block text-xs text-brand-ink/55">
              اسم الفوج، رقم الهاتف، العنوان، رابط إنستغرام، صور «عن الفوج»
            </span>
          </span>
        </span>
        <ArrowLeft className="h-4 w-4 text-brand-ink/30" />
      </Link>

      {Object.entries(resourceGroups).map(([groupKey, groupLabel]) => {
        const items = entries.filter((r) => r.group === groupKey);
        if (items.length === 0) return null;
        return (
          <section key={groupKey} className="mt-8">
            <h2 className="font-display text-lg font-bold text-brand-purple">
              {groupLabel}
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((r) => {
                const stat = countByKey.get(r.key);
                return (
                  <Link
                    key={r.key}
                    href={`/admin/${r.key}`}
                    className="flex flex-col rounded-2xl border border-brand-purple/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-base font-semibold text-brand-ink">
                        {r.label}
                      </h3>
                      {stat && !stat.error && (
                        <span className="shrink-0 rounded-full bg-brand-purple-tint px-2.5 py-1 text-xs font-bold text-brand-purple">
                          {stat.count}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-brand-ink/55">
                      {r.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
