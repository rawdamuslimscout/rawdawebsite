import Link from "next/link";
import { resourceRegistry } from "@/lib/admin-resources";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-ink">لوحة التحكم</h1>
      <p className="mt-2 text-sm text-brand-ink/65">
        اختر قسمًا لتعديل محتواه. التغييرات تظهر على الموقع فورًا.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.values(resourceRegistry).map((r) => (
          <Link
            key={r.key}
            href={`/admin/${r.key}`}
            className="rounded-2xl border border-brand-purple/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="font-display text-base font-semibold text-brand-ink">{r.label}</h2>
            <p className="mt-1 text-xs text-brand-ink/50">{r.fields.length} حقول قابلة للتعديل</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
