import { Instagram } from "lucide-react";
import { getSiteSettings } from "@/lib/data";

export default async function CTA() {
  const siteInfo = await getSiteSettings();
  return (
    <section className="relative overflow-hidden bg-brand-purple py-20">
      <div className="texture-canvas absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-2xl px-5 text-center sm:px-8">
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
          كن جزءًا من الحكاية
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
          انضم إلى رحلة كشفية تجمع القيم والمغامرة والأخوة، وابدأ فصلك الخاص
          في مسيرة فوج روضة الفيحاء.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#contact"
            className="w-full rounded-full bg-brand-yellow px-8 py-3.5 text-center text-sm font-bold text-brand-purple-dark transition-colors hover:bg-white sm:w-auto"
          >
            تواصل معنا
          </a>
          <a
            href={siteInfo.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10 sm:w-auto"
          >
            <Instagram className="h-4 w-4" />
            تابعنا على Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
