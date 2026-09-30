import { ArrowLeft, Instagram } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { getSiteSettings } from "@/lib/data";

export default async function CTA() {
  const siteInfo = await getSiteSettings();
  return (
    <section className="relative overflow-hidden bg-brand-purple py-20 sm:py-24">
      <div className="texture-canvas absolute inset-0 opacity-30" />
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-brand-purple-dark/60 sm:h-32"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 160 L0 110 L220 40 L420 120 L680 20 L900 120 L1120 50 L1300 120 L1440 70 L1440 160Z" fill="currentColor" />
      </svg>
      <Reveal className="container-x relative text-center">
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          كن جزءًا من الحكاية
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
          انضم إلى رحلة كشفية تجمع القيم والمغامرة والأخوة، وابدأ فصلك الخاص
          في مسيرة فوج روضة الفيحاء.
        </p>
        <div className="mx-auto mt-9 flex max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row">
          <a href="/join" className="btn-gold">
            انضم إلينا
            <ArrowLeft className="btn-arrow h-4 w-4" aria-hidden="true" />
          </a>
          <a href="#contact" className="btn-outline-light">
            تواصل معنا
          </a>
          <a
            href={siteInfo.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-light"
          >
            <Instagram className="h-4 w-4" aria-hidden="true" />
            تابعنا على Instagram
          </a>
        </div>
      </Reveal>
    </section>
  );
}
