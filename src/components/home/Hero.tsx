import Image from "next/image";

import { getSiteSettings } from "@/lib/data";

export default async function Hero() {
  const siteInfo = await getSiteSettings();

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-brand-purple-dark pt-28 pb-24 sm:pt-36 sm:pb-32"
    >
      {/* Background texture */}
      <div className="texture-canvas absolute inset-0 opacity-40" />

      {/* Decorative mountain silhouette */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-brand-purple/60 sm:h-56"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 220 L220 60 L340 220 Z M300 220 L520 20 L720 220 Z M650 220 L820 90 L980 220 Z M900 220 L1140 30 L1440 220 Z"
          fill="currentColor"
        />
      </svg>

      {/* Decorative rope */}
      <svg
        className="pointer-events-none absolute right-[6%] top-24 hidden h-64 w-24 text-brand-yellow/50 md:block"
        viewBox="0 0 100 260"
        aria-hidden="true"
      >
        <path
          d="M50 0 C 20 40, 80 80, 50 120 S 20 200, 50 260"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="1000"
          className="animate-rope-draw"
        />
      </svg>

      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        {/* =====================================================
            OFFICIAL MUSLIM SCOUT IDENTITY
        ===================================================== */}
        <div className="flex flex-col items-center">
          {/* Official association emblem */}
          <div className="relative h-16 w-24 sm:h-20 sm:w-20">
            <Image
              src="/images/muslim-scout-emblem-white.png"
              alt="جمعية الكشّاف المسلم في لبنان"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Association name */}
          <p className="mt-3 font-display text-sm font-bold text-white sm:text-base">
            جمعية الكشّاف المسلم في لبنان
          </p>

          {/* North Commissionerate */}
          <p className="mt-1 text-xs font-medium text-brand-yellow sm:text-sm">
            مفوضية الشمال
          </p>

          {/* Elegant divider */}
          <div className="mt-5 flex items-center gap-3">
            <span className="h-px w-8 bg-brand-yellow/40" />
            <span className="h-1 w-1 rounded-full bg-brand-yellow" />
            <span className="h-px w-8 bg-brand-yellow/40" />
          </div>
        </div>

        {/* =====================================================
            GROUP
        ===================================================== */}
        <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-white sm:text-6xl md:text-7xl">
          {siteInfo.name}
        </h1>

        {/* Tagline */}
        <p className="mx-auto mt-6 max-w-2xl font-display text-xl font-semibold text-brand-yellow sm:text-2xl">
          {siteInfo.tagline}
        </p>

        {/* Description */}
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
          نجمع بين الكشافة والتربية والقيم، ونبني القيادة عبر الخدمة والأخوة، في
          مخيمات وأنشطة تصنع الذكريات وتنمّي الإنسان.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#about"
            className="w-full rounded-full bg-brand-yellow px-8 py-3.5 text-center text-sm font-bold text-brand-purple-dark transition-colors hover:bg-white sm:w-auto"
          >
            تعرّف على الفوج
          </a>

          <a
            href="#activities"
            className="w-full rounded-full border border-white/30 px-8 py-3.5 text-center text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10 sm:w-auto"
          >
            استكشف أنشطتنا
          </a>
        </div>
      </div>
    </section>
  );
}
