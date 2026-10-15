"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import Logo from "@/components/ui/Logo";
import LinkPending from "@/components/layout/LinkPending";
import { navLinks } from "@/data/content";

// Main links visible on desktop; the rest go under "المزيد".
const primaryLinks = navLinks.filter((l) => l.primary);
const moreLinks = navLinks.filter((l) => !l.primary);

const contactLink = { href: "/contact", label: "تواصل معنا" };

// Home-page section ids we track for the "you are here" highlight.
const sectionIds = navLinks
  .filter((l) => l.href.startsWith("/#"))
  .map((l) => l.href.slice(2));

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Navbar({ siteName }: { siteName: string }) {
  // Never null in the App Router; typed nullable because pages/500.tsx exists.
  const pathname = usePathname() ?? "";
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus whenever the route changes.
  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Collapsed menu must be unreachable by Tab/AT. React 18 has no `inert` prop.
  useEffect(() => {
    mobilePanelRef.current?.toggleAttribute("inert", !open);
  }, [open]);

  // Mobile menu: lock scroll, move focus in, trap Tab between the toggle and
  // the panel, Esc closes; focus returns to the toggle when it closes.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    mobileNavRef.current?.querySelector<HTMLElement>("a")?.focus();
    const panel = mobilePanelRef.current;
    const toggle = menuButtonRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panel || !toggle) return;
      const items = [toggle, ...panel.querySelectorAll<HTMLElement>("a[href], button")];
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement as HTMLElement | null;
      if (!current || !items.includes(current)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      // The panel turns inert on close, so don't leave focus stranded in it.
      const active = document.activeElement;
      if (!active || active === document.body || panel?.contains(active)) {
        toggle?.focus({ preventScroll: true });
      }
    };
  }, [open]);

  // Desktop "more" dropdown: close on outside click / Esc / focus leaving.
  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  // Scroll-spy: highlight the home section currently under the header.
  useEffect(() => {
    if (!isHome) {
      setActiveSection(null);
      return;
    }
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
          else visible.delete(entry.target.id);
        }
        // Topmost visible section wins.
        let best: string | null = null;
        let bestTop = Infinity;
        visible.forEach((top, id) => {
          if (top < bestTop) {
            bestTop = top;
            best = id;
          }
        });
        setActiveSection(best);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isHome]);

  const isActive = useCallback(
    (href: string) => {
      if (href.startsWith("/#")) return isHome && activeSection === href.slice(2);
      if (href.startsWith("#")) return false;
      if (href === "/") return pathname === "/";
      // Blog posts are listed in the combined news feed.
      if (href === "/news" && pathname.startsWith("/blog")) return true;
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [isHome, activeSection, pathname],
  );

  const handleNavigation = (event: React.MouseEvent, href: string) => {
    setOpen(false);
    setMoreOpen(false);

    // Same-page anchors: smooth-scroll without a navigation round-trip.
    const hash = href.startsWith("/#") && isHome ? href.slice(1) : href.startsWith("#") ? href : null;
    if (!hash) return;
    const target = document.querySelector<HTMLElement>(hash);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
    history.replaceState(null, "", hash);
  };

  const moreHasActive = moreLinks.some((l) => isActive(l.href));

  const desktopLinkClass = (active: boolean) =>
    `relative whitespace-nowrap py-2 text-sm font-medium transition-colors hover:text-brand-yellow after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand-yellow after:transition-transform after:duration-300 ${
      active ? "text-brand-yellow after:scale-x-100" : "text-white/85 after:scale-x-0"
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "bg-brand-purple-dark/95 shadow-md backdrop-blur-md"
          : "bg-brand-purple-dark/75 backdrop-blur-sm"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 transition-all duration-300 sm:gap-4 sm:px-8 ${
          scrolled ? "py-2.5" : "py-4"
        }`}
      >
        {/* Logo and site name */}
        <Link
          href="/"
          onClick={(e) => {
            setOpen(false);
            setMoreOpen(false);
            // Already home: just scroll back to the top.
            if (!isHome) return;
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
            history.replaceState(null, "", "/");
          }}
          className="flex min-w-0 items-center gap-2 rounded-full sm:gap-2.5"
          aria-label={`${siteName} — الصفحة الرئيسية`}
        >
          <Logo size={scrolled ? 38 : 44} dark alt="" />
          <span className="font-display truncate whitespace-nowrap text-sm font-bold text-white sm:text-base">
            {siteName}
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-5 xl:flex 2xl:gap-7">
          {primaryLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavigation(e, link.href)}
                aria-current={active ? (link.href.startsWith("/#") ? "location" : "page") : undefined}
                className={desktopLinkClass(active)}
              >
                {link.label}
                <LinkPending />
              </Link>
            );
          })}

          {moreLinks.length > 0 && (
            <div
              ref={moreRef}
              className="relative"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setMoreOpen(false);
                }
              }}
            >
              <button
                ref={moreButtonRef}
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                aria-controls="more-navigation"
                className={`flex items-center gap-1 ${desktopLinkClass(moreHasActive)}`}
              >
                المزيد
                <ChevronDown
                  size={15}
                  aria-hidden
                  className={`transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div
                id="more-navigation"
                hidden={!moreOpen}
                className="absolute end-0 top-full z-50 mt-3 min-w-52 rounded-xl border border-white/10 bg-brand-purple-dark p-2 shadow-xl"
              >
                {moreLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavigation(e, link.href)}
                      aria-current={active ? (link.href.startsWith("/#") ? "location" : "page") : undefined}
                      className={`flex items-center rounded-lg px-4 py-3 text-sm transition-colors hover:bg-white/10 hover:text-brand-yellow ${
                        active ? "bg-white/10 text-brand-yellow" : "text-white/85"
                      }`}
                    >
                      {link.label}
                      <LinkPending variant="dot" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <Link
            href={contactLink.href}
            onClick={(e) => handleNavigation(e, contactLink.href)}
            aria-current={isActive(contactLink.href) ? "page" : undefined}
            className={desktopLinkClass(isActive(contactLink.href))}
          >
            {contactLink.label}
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Join CTA — compact on phones, so it's always one tap away */}
          <Link
            href="/join"
            aria-current={pathname === "/join" ? "page" : undefined}
            className="relative inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-full bg-brand-yellow px-3 text-xs font-bold text-brand-purple-dark transition-colors hover:bg-white sm:px-4 sm:text-sm 2xl:px-5"
          >
            انضم إلينا
            <LinkPending />
          </Link>

          {/* Mobile / tablet menu button */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => {
              setOpen((v) => !v);
              setMoreOpen(false);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 xl:hidden"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X size={25} aria-hidden /> : <Menu size={25} aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet navigation */}
      <div
        id="mobile-navigation"
        className={`grid overflow-hidden bg-brand-purple-dark transition-all duration-300 xl:hidden ${
          open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"
        }`}
        ref={mobilePanelRef}
      >
        <div className="min-h-0">
          <nav
            ref={mobileNavRef}
            aria-label="قائمة التنقل"
            className="flex max-h-[calc(100dvh-76px)] flex-col gap-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-2"
          >
            {[...navLinks, contactLink].map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavigation(e, link.href)}
                  aria-current={active ? (link.href.includes("#") ? "location" : "page") : undefined}
                  className={`flex min-h-[48px] items-center rounded-lg px-3 text-base font-medium transition-colors hover:bg-white/10 hover:text-brand-yellow ${
                    active ? "bg-white/10 text-brand-yellow" : "text-white/90"
                  }`}
                >
                  {link.label}
                  <LinkPending variant="dot" />
                </Link>
              );
            })}

            <Link
              href="/join"
              onClick={() => setOpen(false)}
              className="mt-2 flex min-h-[48px] items-center justify-center rounded-full bg-brand-yellow px-5 text-center text-sm font-bold text-brand-purple-dark transition-colors hover:bg-white"
            >
              انضم إلينا
            </Link>
          </nav>
        </div>
      </div>

      {/* Tap-outside scrim for the mobile menu */}
      {open && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => setOpen(false)}
          className="absolute inset-x-0 top-full h-screen cursor-default bg-brand-ink/40 xl:hidden"
        />
      )}
    </header>
  );
}
