import Link from "next/link";
import { Settings, ArrowLeft } from "lucide-react";
import { resourceRegistry, getDelegate } from "@/lib/admin-resources";

export default async function AdminDashboard() {
  const entries = Object.values(resourceRegistry);

  const counts = await Promise.all(
    entries.map(async (r) => {
      try {
        const delegate = getDelegate(r.key);
        const count: number = (await delegate?.count?.()) ?? 0;
        return { key: r.key, count, error: false };
      } catch {
        return { key: r.key, count: 0, error: true };
      }
    }),
  );
  const countByKey = new Map(counts.map((c) => [c.key, c]));
  const anyDbError = counts.every((c) => c.error) && counts.length > 0;
  const totalItems = counts.reduce((sum, c) => sum + c.count, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-ink">لوحة التحكم</h1>
      <p className="mt-2 text-sm text-brand-ink/65">
        اختر قسمًا لتعديل محتواه. التغييرات تظهر على الموقع فورًا.
      </p>

      {anyDbError ? (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          تعذّر الاتصال بقاعدة البيانات. تحقق من DATABASE_URL و DIRECT_URL في ملف .env، وتأكد من
          تشغيل prisma migrate.
        </p>
      ) : (
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="rounded-2xl border border-brand-purple/10 bg-white px-5 py-4 shadow-sm">
            <p className="text-2xl font-bold text-brand-purple">{totalItems}</p>
            <p className="text-xs text-brand-ink/50">إجمالي العناصر عبر كل الأقسام</p>
          </div>
          <div className="rounded-2xl border border-brand-purple/10 bg-white px-5 py-4 shadow-sm">
            <p className="text-2xl font-bold text-brand-purple">{entries.length}</p>
            <p className="text-xs text-brand-ink/50">قسم قابل للتعديل</p>
          </div>
        </div>
      )}

      <Link
        href="/admin/site-settings"
        className="mt-6 flex items-center justify-between rounded-2xl border border-brand-purple/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-purple-tint text-brand-purple">
            <Settings className="h-4 w-4" />
          </span>
          <span>
            <span className="block font-display text-base font-semibold text-brand-ink">
              إعدادات الموقع العامة
            </span>
            <span className="block text-xs text-brand-ink/50">
              الاسم، الشعار، وسائل التواصل، ومعلومات التواصل
            </span>
          </span>
        </span>
        <ArrowLeft className="h-4 w-4 text-brand-ink/30" />
      </Link>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((r) => {
          const stat = countByKey.get(r.key);
          return (
            <Link
              key={r.key}
              href={`/admin/${r.key}`}
              className="rounded-2xl border border-brand-purple/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-brand-ink">
                  {r.label}
                </h2>
                {stat && !stat.error && (
                  <span className="shrink-0 rounded-full bg-brand-purple-tint px-2.5 py-1 text-xs font-bold text-brand-purple">
                    {stat.count}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-brand-ink/50">{r.fields.length} حقول قابلة للتعديل</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
