"use client";

import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { navLinks } from "@/data/content";

export default function Navbar({ siteName }: { siteName: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Main links visible on desktop
  const primaryLabels = ["الرئيسية", "عن الفوج", "الأنشطة", "تواصل معنا"];

  const primaryLinks = navLinks.filter((link) =>
    primaryLabels.includes(link.label),
  );

  const moreLinks = navLinks.filter(
    (link) => !primaryLabels.includes(link.label),
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setMoreOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleNavigation = (href: string) => {
    setOpen(false);
    setMoreOpen(false);

    if (href.startsWith("/#") && window.location.pathname === "/") {
      const target = document.querySelector(href.slice(1));

      target?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-brand-purple-dark/95 shadow-md backdrop-blur-md"
          : "bg-brand-purple-dark/75 backdrop-blur-sm"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 transition-all duration-300 sm:px-8 ${
          scrolled ? "py-2.5" : "py-4"
        }`}
      >
        {/* Logo and site name */}
        <a
          href="/#home"
          onClick={() => handleNavigation("/#home")}
          className="flex shrink-0 items-center gap-2.5"
        >
          <Logo size={scrolled ? 38 : 44} dark />
          <span className="font-display whitespace-nowrap text-sm font-bold text-white sm:text-base">
            {siteName}
          </span>
        </a>

        {/* Desktop navigation */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden items-center gap-4 xl:flex 2xl:gap-6"
        >
          {primaryLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => handleNavigation(link.href)}
              className="whitespace-nowrap text-sm font-medium text-white/85 transition-colors hover:text-brand-yellow"
            >
              {link.label}
            </a>
          ))}

          {/* More dropdown */}
          {moreLinks.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                aria-haspopup="true"
                className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-white/85 transition-colors hover:text-brand-yellow"
              >
                المزيد
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${
                    moreOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {moreOpen && (
                <div
                  className="absolute end-0 top-full z-50 mt-3 min-w-52 rounded-xl border border-white/10 bg-brand-purple-dark p-2 shadow-xl"
                  role="menu"
                >
                  {moreLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      role="menuitem"
                      onClick={() => handleNavigation(link.href)}
                      className="block rounded-lg px-4 py-3 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-brand-yellow"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Desktop CTA */}
        <a
          href="/join"
          className="hidden shrink-0 whitespace-nowrap rounded-full bg-brand-yellow px-4 py-2.5 text-sm font-bold text-brand-purple-dark transition-colors hover:bg-white 2xl:px-5 xl:inline-flex"
        >
          انضم إلينا
        </a>

        {/* Mobile / tablet menu button */}
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            setMoreOpen(false);
          }}
          className="rounded-lg p-2 text-white transition-colors hover:bg-white/10 xl:hidden"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {/* Mobile / tablet navigation */}
      <div
        id="mobile-navigation"
        className={`grid overflow-hidden bg-brand-purple-dark transition-all duration-300 xl:hidden ${
          open
            ? "grid-rows-[1fr] opacity-100"
            : "pointer-events-none grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="min-h-0">
          <nav
            aria-label="قائمة التنقل"
            className="flex max-h-[calc(100dvh-76px)] flex-col gap-1 overflow-y-auto px-5 pb-5 pt-2"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                tabIndex={open ? 0 : -1}
                onClick={() => handleNavigation(link.href)}
                className="rounded-lg px-3 py-3 text-base font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-brand-yellow"
              >
                {link.label}
              </a>
            ))}

            <a
              href="/join"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-brand-yellow px-5 py-3 text-center text-sm font-bold text-brand-purple-dark transition-colors hover:bg-white"
            >
              انضم إلينا
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
