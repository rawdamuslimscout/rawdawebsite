import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionAdminId } from "@/lib/session";
import { resourceRegistry } from "@/lib/admin-resources";
import LogoutButton from "./LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminId = await getSessionAdminId();
  if (!adminId) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-brand-cream" dir="rtl">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-l border-brand-purple/10 bg-white p-5 md:block">
          <Link
            href="/admin"
            className="font-display text-lg font-bold text-brand-purple"
          >
            لوحة تحكم الفوج
          </Link>
          <nav className="mt-6 space-y-1">
            <Link
              href="/admin/site-settings"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-brand-purple transition-colors hover:bg-brand-purple-tint"
            >
              إعدادات الموقع العامة
            </Link>
            <div className="my-2 border-t border-brand-purple/10" />
            {Object.values(resourceRegistry).map((r) => (
              <Link
                key={r.key}
                href={`/admin/${r.key}`}
                className="block rounded-lg px-3 py-2 text-sm text-brand-ink/75 transition-colors hover:bg-brand-purple-tint hover:text-brand-purple"
              >
                {r.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 border-t border-brand-purple/10 pt-4">
            <LogoutButton />
          </div>
        </aside>

        <main className="flex-1 p-5 sm:p-8">
          <div className="mb-6 md:hidden">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold text-brand-purple">
                لوحة تحكم الفوج
              </span>
              <LogoutButton />
            </div>
            <nav className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
              <Link
                href="/admin"
                className="shrink-0 rounded-full bg-brand-purple px-3 py-2 text-xs font-semibold text-white"
              >
                الرئيسية
              </Link>
              <Link
                href="/admin/site-settings"
                className="shrink-0 rounded-full border border-brand-purple/15 bg-white px-3 py-2 text-xs font-semibold text-brand-ink"
              >
                الإعدادات
              </Link>
              {Object.values(resourceRegistry).map((resource) => (
                <Link
                  key={resource.key}
                  href={`/admin/${resource.key}`}
                  className="shrink-0 rounded-full border border-brand-purple/15 bg-white px-3 py-2 text-xs text-brand-ink/75"
                >
                  {resource.label}
                </Link>
              ))}
            </nav>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
