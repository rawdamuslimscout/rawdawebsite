import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, HelpCircle, Home, Library, UserPlus } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SkipLink from "@/components/layout/SkipLink";
import { getSiteSettings } from "@/lib/data";
import { SITE_NAME } from "@/lib/site";

// Next adds the noindex robots tag to 404 responses itself.
export const metadata: Metadata = {
  title: "الصفحة غير موجودة | فوج روضة الفيحاء",
};

const suggestions = [
  { href: "/", label: "الصفحة الرئيسية", icon: Home },
  { href: "/news", label: "الأخبار والمقالات", icon: BookOpen },
  { href: "/library", label: "المكتبة", icon: Library },
  { href: "/faq", label: "الأسئلة الشائعة", icon: HelpCircle },
  { href: "/join", label: "انضم إلينا", icon: UserPlus },
];

// The root not-found sits outside the (site) group, so it renders the public
// header/footer itself to keep 404s looking like the rest of the site.
export default async function NotFound() {
  // Only the header's name and the footer's contact details come from the
  // database here. During an outage a missing page must still answer 404 (not
  // a 500): use the static name and leave out the footer, which needs the DB.
  const settings = await getSiteSettings().then(
    (s) => s,
    () => null,
  );
  const siteName = settings?.name ?? SITE_NAME;
  return (
    <>
      <SkipLink />
      <Navbar siteName={siteName} />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <section className="flex min-h-[70vh] items-center justify-center px-5 pb-20 pt-32">
          <div className="w-full max-w-lg text-center">
            <p className="font-display text-7xl font-bold text-brand-purple/15 sm:text-8xl" aria-hidden>
              404
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-brand-ink sm:text-3xl">
              الصفحة غير موجودة
            </h1>
            <p className="mt-3 text-base leading-8 text-brand-ink/65">
              ربما تم نقل هذه الصفحة أو أن الرابط غير صحيح. جرّب إحدى هذه الوجهات:
            </p>
            <ul className="mt-8 grid gap-2 text-start sm:grid-cols-2">
              {suggestions.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex min-h-[52px] items-center gap-3 rounded-xl border border-brand-purple/10 bg-white px-4 font-semibold text-brand-ink shadow-soft transition hover:border-brand-purple/30 hover:shadow-lift"
                  >
                    <Icon size={18} className="shrink-0 text-brand-purple" aria-hidden />
                    <span className="flex-1">{label}</span>
                    <ArrowLeft
                      size={16}
                      className="shrink-0 text-brand-ink/30 transition-transform group-hover:-translate-x-1 group-hover:text-brand-purple"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      {settings && <Footer />}
    </>
  );
}
