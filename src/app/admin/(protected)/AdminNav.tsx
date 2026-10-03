"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Settings, LayoutGrid } from "lucide-react";
import LogoutButton from "./LogoutButton";

type NavResource = { key: string; label: string; group: string };
type NavGroup = { key: string; label: string };

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

function ResourceLinks({
  resources,
  groups,
  isActive,
  onClick,
}: {
  resources: NavResource[];
  groups: NavGroup[];
  isActive: (href: string) => boolean;
  onClick?: () => void;
}) {
  return (
    <>
      {groups.map((group) => {
        const items = resources.filter((r) => r.group === group.key);
        if (items.length === 0) return null;
        return (
          <div key={group.key} className="pt-3">
            <p className="px-3 pb-1 text-[11px] font-bold tracking-wide text-brand-ink/40">
              {group.label}
            </p>
            {items.map((r) => (
              <NavLink
                key={r.key}
                href={`/admin/${r.key}`}
                active={isActive(`/admin/${r.key}`)}
                onClick={onClick}
              >
                {r.label}
              </NavLink>
            ))}
          </div>
        );
      })}
    </>
  );
}

export default function AdminNav({
  resources,
  groups,
}: {
  resources: NavResource[];
  groups: NavGroup[];
}) {
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
      <aside className="hidden max-h-screen w-64 shrink-0 overflow-y-auto border-l border-brand-purple/10 bg-white p-5 md:sticky md:top-0 md:block">
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
          <ResourceLinks
            resources={resources}
            groups={groups}
            isActive={isActive}
          />
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
                <ResourceLinks
                  resources={resources}
                  groups={groups}
                  isActive={isActive}
                  onClick={() => setDrawerOpen(false)}
                />
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
