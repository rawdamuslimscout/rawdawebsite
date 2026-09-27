"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Settings, LayoutGrid } from "lucide-react";
import LogoutButton from "./LogoutButton";

type NavResource = { key: string; label: string };

function NavLink({
  href,
  active,
  children,
  onClick,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-brand-purple-tint text-brand-purple"
          : "text-brand-ink/75 hover:bg-brand-purple-tint hover:text-brand-purple"
      }`}
    >
      {children}
    </Link>
  );
}

export default function AdminNav({ resources }: { resources: NavResource[] }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-l border-brand-purple/10 bg-white p-5 md:block">
        <Link
          href="/admin"
          className="font-display text-lg font-bold text-brand-purple"
        >
          لوحة تحكم الفوج
        </Link>
        <nav className="mt-6 space-y-1">
          <NavLink href="/admin" active={isActive("/admin")}>
            الرئيسية
          </NavLink>
          <NavLink
            href="/admin/site-settings"
            active={isActive("/admin/site-settings")}
          >
            إعدادات الموقع العامة
          </NavLink>
          <div className="my-2 border-t border-brand-purple/10" />
          {resources.map((r) => (
            <NavLink
              key={r.key}
              href={`/admin/${r.key}`}
              active={isActive(`/admin/${r.key}`)}
            >
              {r.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 border-t border-brand-purple/10 pt-4">
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="mb-6 md:hidden">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="فتح القائمة"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-purple/15 text-brand-ink"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display text-lg font-bold text-brand-purple">
            لوحة تحكم الفوج
          </span>
          <LogoutButton compact />
        </div>

        {drawerOpen && (
          <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setDrawerOpen(false)}
            />
            <div
              dir="rtl"
              className="absolute inset-y-0 right-0 flex w-72 max-w-[85%] flex-col bg-white p-5 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold text-brand-purple">
                  لوحة تحكم الفوج
                </span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="إغلاق القائمة"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/60 hover:bg-brand-purple-tint"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
                <NavLink
                  href="/admin"
                  active={isActive("/admin")}
                  onClick={() => setDrawerOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" /> الرئيسية
                  </span>
                </NavLink>
                <NavLink
                  href="/admin/site-settings"
                  active={isActive("/admin/site-settings")}
                  onClick={() => setDrawerOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" /> إعدادات الموقع العامة
                  </span>
                </NavLink>
                <div className="my-2 border-t border-brand-purple/10" />
                {resources.map((r) => (
                  <NavLink
                    key={r.key}
                    href={`/admin/${r.key}`}
                    active={isActive(`/admin/${r.key}`)}
                    onClick={() => setDrawerOpen(false)}
                  >
                    {r.label}
                  </NavLink>
                ))}
              </nav>

              <div className="border-t border-brand-purple/10 pt-4">
                <LogoutButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
