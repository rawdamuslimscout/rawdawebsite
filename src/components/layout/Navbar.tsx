"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { navLinks } from "@/data/content";

export default function Navbar({ siteName }: { siteName: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-brand-purple-dark/95 shadow-md backdrop-blur-sm"
          : "bg-brand-purple-dark/70 backdrop-blur-sm"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-300 sm:px-8 ${
          scrolled ? "py-2.5" : "py-4"
        }`}
      >
        <a href="#home" className="flex items-center gap-3">
          <Logo size={scrolled ? 38 : 44} dark />
          <span className="font-display text-base font-semibold text-white sm:text-lg">
            {siteName}
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/85 transition-colors hover:text-brand-yellow"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <a
            href="/join"
            className="rounded-full bg-brand-yellow px-5 py-2.5 text-sm font-bold text-brand-purple-dark transition-colors hover:bg-white"
          >
            انضم إلينا
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-white lg:hidden"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={`grid overflow-hidden bg-brand-purple-dark transition-all duration-300 lg:hidden ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <nav className="flex flex-col gap-1 px-5 pb-5 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-white/90 transition-colors hover:bg-white/10"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/join"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-brand-yellow px-5 py-3 text-center text-sm font-bold text-brand-purple-dark"
            >
              انضم إلينا
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
