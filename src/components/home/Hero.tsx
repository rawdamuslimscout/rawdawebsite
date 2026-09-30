import Image from "next/image";
import { ArrowLeft } from "lucide-react";

import { getSiteSettings } from "@/lib/data";

export default async function Hero() {
  const siteInfo = await getSiteSettings();

  return (
    <section
      id="home"
      className="
        relative overflow-hidden
        bg-brand-purple-dark
        pb-32 pt-28
        sm:pb-36 sm:pt-32
        lg:pb-40 lg:pt-32
        xl:pb-44 xl:pt-36
      "
    >
      {/* =========================================================
          Background texture
      ========================================================= */}
      <div className="texture-canvas absolute inset-0 opacity-40" />

      {/* =========================================================
          Ambient background glow
      ========================================================= */}
      <div
        className="
          pointer-events-none absolute
          left-[18%] top-[18%]
          h-[520px] w-[520px]
          -translate-x-1/2
          rounded-full
          bg-brand-purple-light/10
          blur-[130px]
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none absolute
          right-[8%] top-[20%]
          h-[420px] w-[420px]
          rounded-full
          bg-brand-yellow/[0.035]
          blur-[120px]
        "
        aria-hidden="true"
      />

      {/* =========================================================
          Mountain ridge — back layer
      ========================================================= */}
      <svg
        className="
          pointer-events-none absolute inset-x-0 bottom-0
          h-40 w-full
          text-brand-purple/50
          sm:h-52
          lg:h-64
        "
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 260 L0 170 L170 80 L300 170 L470 40 L640 170 L760 110 L900 180 L1120 30 L1300 150 L1440 90 L1440 260 Z"
          fill="currentColor"
        />
      </svg>

      {/* =========================================================
          Mountain ridge — front layer
      ========================================================= */}
      <svg
        className="
          pointer-events-none absolute inset-x-0 bottom-0
          h-24 w-full
          text-brand-purple/80
          sm:h-32
          lg:h-40
        "
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 160 L0 120 L230 50 L420 130 L660 30 L860 120 L1080 60 L1260 130 L1440 70 L1440 160 Z"
          fill="currentColor"
        />
      </svg>

      {/* =========================================================
          Main content

          IMPORTANT:
          dir="ltr" guarantees:
          LEFT  = logo
          RIGHT = text

          The Arabic text container below switches back to RTL.
      ========================================================= */}
      <div className="container-x relative z-10">
        <div
          dir="ltr"
          className="
            grid
            items-center
            gap-12
            lg:grid-cols-[1.05fr_0.95fr]
            lg:gap-14
            xl:gap-20
          "
        >
          {/* =====================================================
              LEFT — CREST
          ===================================================== */}
          <div
            className="
              relative
              hidden
              min-h-[500px]
              lg:flex
              lg:items-center
              lg:justify-center
            "
          >
            {/* Main soft glow */}
            <div
              className="
                absolute
                left-1/2
                top-1/2
                h-[330px]
                w-[330px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-brand-yellow/[0.055]
                blur-[100px]
              "
              aria-hidden="true"
            />

            {/* Secondary glow */}
            <div
              className="
                absolute
                left-1/2
                top-1/2
                h-[250px]
                w-[250px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-white/[0.025]
                blur-[70px]
              "
              aria-hidden="true"
            />

            {/* Outer decorative circle */}
            <div
              className="
                absolute
                left-1/2
                top-1/2
                h-[430px]
                w-[430px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-white/[0.045]
              "
              aria-hidden="true"
            />

            {/* Yellow accent arc */}
            <div
              className="
                absolute
                left-1/2
                top-1/2
                h-[370px]
                w-[370px]
                -translate-x-1/2
                -translate-y-1/2
                rotate-[25deg]
                rounded-full
                border
                border-transparent
                border-r-brand-yellow/10
                border-t-brand-yellow/20
              "
              aria-hidden="true"
            />

            {/* Inner subtle arc */}
            <div
              className="
                absolute
                left-1/2
                top-1/2
                h-[315px]
                w-[315px]
                -translate-x-1/2
                -translate-y-1/2
                -rotate-[20deg]
                rounded-full
                border
                border-transparent
                border-b-white/[0.08]
                border-l-white/[0.04]
              "
              aria-hidden="true"
            />

            {/* Decorative yellow dot */}
            <span
              className="
                absolute
                left-[15%]
                top-[25%]
                h-2
                w-2
                rounded-full
                bg-brand-yellow/60
                shadow-[0_0_18px_rgba(255,193,7,0.45)]
              "
              aria-hidden="true"
            />

            {/* Decorative white dot */}
            <span
              className="
                absolute
                right-[14%]
                top-[30%]
                h-1.5
                w-1.5
                rounded-full
                bg-white/30
              "
              aria-hidden="true"
            />

            {/* Decorative white dot */}
            <span
              className="
                absolute
                bottom-[22%]
                left-[22%]
                h-1.5
                w-1.5
                rounded-full
                bg-white/20
              "
              aria-hidden="true"
            />

            {/* Decorative yellow dot */}
            <span
              className="
                absolute
                bottom-[27%]
                right-[18%]
                h-1
                w-1
                rounded-full
                bg-brand-yellow/40
              "
              aria-hidden="true"
            />

            {/* =================================================
                White transparent-background crest
            ================================================= */}
            <div
              className="
                relative
                z-10
                w-[245px]
                xl:w-[275px]
              "
            >
              <Image
                src="/images/logo-about-white.png"
                alt="شعار فوج روضة الفيحاء"
                width={376}
                height={629}
                sizes="275px"
                priority
                className="
                  h-auto
                  w-full
                  object-contain
                  drop-shadow-[0_24px_45px_rgba(0,0,0,0.42)]
                "
              />
            </div>
          </div>

          {/* =====================================================
              RIGHT — TEXT
          ===================================================== */}
          <div
            dir="rtl"
            className="
              text-center
              lg:text-start
            "
          >
            {/* Association identity */}
            <div
              className="
                flex
                items-center
                justify-center
                gap-3
                lg:justify-start
              "
            >
              {/* Association logo */}
              <div
                className="
                  relative
                  h-12
                  w-12
                  shrink-0
                  sm:h-14
                  sm:w-14
                "
              >
                <Image
                  src="/images/muslim-scout-emblem-white.png"
                  alt="جمعية الكشّاف المسلم في لبنان"
                  fill
                  sizes="56px"
                  className="object-contain"
                  priority
                />
              </div>

              {/* Association name */}
              <div className="text-start">
                <p
                  className="
                    font-display
                    text-sm
                    font-bold
                    text-white
                    sm:text-base
                  "
                >
                  جمعية الكشّاف المسلم في لبنان
                </p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    font-medium
                    text-brand-yellow
                    sm:text-sm
                  "
                >
                  مفوضية الشمال
                </p>
              </div>
            </div>

            {/* =================================================
                Main title
            ================================================= */}
            <h1
              className="
                mt-8
                font-display
                text-4xl
                font-bold
                leading-[1.12]
                tracking-[-0.02em]
                text-white
                sm:text-5xl
                lg:text-[4rem]
                xl:text-[4rem]
              "
            >
              {siteInfo.name}
            </h1>

            {/* =================================================
                Tagline
            ================================================= */}
            <p
              className="
                mx-auto
                mt-5
                max-w-2xl
                font-display
                text-xl
                font-semibold
                leading-relaxed
                text-brand-yellow
                sm:text-2xl
                lg:mx-0
                lg:max-w-xl
              "
            >
              {siteInfo.tagline}
            </p>

            {/* =================================================
                Description
            ================================================= */}
            <p
              className="
                mx-auto
                mt-5
                max-w-xl
                text-base
                leading-8
                text-white/70
                sm:text-lg
                lg:mx-0
              "
            >
              نجمع بين الكشافة والتربية والقيم، ونبني القيادة عبر الخدمة
              والأخوة، في مخيمات وأنشطة تصنع الذكريات وتنمّي الإنسان.
            </p>

            {/* =================================================
                CTA buttons
            ================================================= */}
            <div
              className="
                mt-9
                flex
                flex-col
                items-stretch
                gap-3
                sm:flex-row
                sm:justify-center
                lg:justify-start
              "
            >
              <a href="#about" className="btn-gold">
                تعرّف على الفوج
                <ArrowLeft className="btn-arrow h-4 w-4" aria-hidden="true" />
              </a>

              <a href="#activities" className="btn-outline-light">
                استكشف أنشطتنا
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
