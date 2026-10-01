import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getSiteSettings } from "@/lib/data";

export default async function Hero() {
  const siteInfo = await getSiteSettings();

  return (
    <section
      id="home"
      className="
        relative isolate flex min-h-[760px]
        items-center overflow-hidden
        bg-brand-purple-dark
        pb-20 pt-16
        sm:min-h-[720px]
        lg:min-h-[760px]
        lg:pb-20 lg:pt-24
      "
    >
      {/* Desktop background */}
      <div className="absolute inset-0 -z-30 hidden lg:block">
        <Image
          src="/images/hero.png"
          alt="راية فوج روضة الفيحاء في الطبيعة"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[left_32%]"
        />
      </div>

      {/* Mobile background */}
      {/* Mobile background */}
      <div className="absolute inset-0 -z-30 overflow-hidden lg:hidden">
        <Image
          src="/images/hero-mobile.png"
          alt="راية فوج روضة الفيحاء"
          fill
          priority
          sizes="100vw"
          className="
      object-cover
      object-[left_35%]
      scale-[1.25]
    "
        />
      </div>

      {/* Base overlay */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-20
          bg-[#24133e]/35
          lg:bg-[#24133e]/45
        "
      />

      {/* Desktop content-side gradient */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-20
          hidden lg:block
          bg-gradient-to-l
          from-[#24133e]/95
          via-[#24133e]/65
          to-[#24133e]/10
        "
      />

      {/* Mobile gradient */}
      {/* Mobile gradient */}
      <div
        aria-hidden="true"
        className="
    pointer-events-none absolute inset-0 -z-20
    bg-gradient-to-b
    from-[#24133e]/5
    via-[#24133e]/30
    to-[#24133e]/85
    lg:hidden
  "
      />

      {/* Mobile text readability layer */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-10
          bg-[radial-gradient(ellipse_at_center,rgba(36,19,62,0.45)_0%,rgba(36,19,62,0.2)_60%,transparent_100%)]
          lg:hidden
        "
      />

      {/* Desktop vertical gradient */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-10
          hidden lg:block
          bg-gradient-to-b
          from-[#24133e]/15
          via-transparent
          to-brand-purple-dark/90
        "
      />

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          -top-40 right-0 -z-10
          h-[400px] w-[400px]
          rounded-full bg-purple-500/10
          blur-[130px]
        "
      />

      {/* Content */}
      <div className="container-x relative z-10 w-full">
        <div
          dir="rtl"
          className="
            mx-auto w-full
            lg:ml-auto lg:mr-0
            lg:max-w-[850px]
          "
        >
          {/* Association identity */}
          <div
            className="
              mb-6 flex items-center
              justify-center gap-3
              sm:mb-8
              lg:mb-6 lg:justify-start
            "
          >
            <div
              className="
                relative h-10 w-10 shrink-0
                sm:h-11 sm:w-11
              "
            >
              <Image
                src="/images/muslim-scout-emblem-white.png"
                alt="شعار جمعية الكشّاف المسلم في لبنان"
                fill
                sizes="44px"
                className="object-contain"
              />
            </div>

            <div className="text-start">
              <p
                className="
                  font-display text-sm font-bold
                  text-white sm:text-base
                "
              >
                جمعية الكشّاف المسلم في لبنان
              </p>

              <p
                className="
                  mt-1 text-xs font-medium
                  text-brand-yellow sm:text-sm
                "
              >
                مفوضية الشمال
              </p>
            </div>
          </div>

          {/* Main title */}
          <h1
            className="
              font-display font-bold
              text-3xl leading-[1.4]
              tracking-tight text-white
              drop-shadow-[0_3px_16px_rgba(0,0,0,0.4)]
              sm:text-5xl
              lg:text-6xl
              xl:text-7xl
              text-center lg:text-right
            "
          >
            {siteInfo.name}
          </h1>

          {/* Tagline */}
          <p
            className="
              mx-auto mt-4 max-w-[600px]
              font-display text-[21px] font-semibold
              leading-[1.6] text-brand-yellow
              drop-shadow-md
              sm:mt-5 sm:text-2xl
              lg:mx-0 lg:max-w-none lg:text-3xl
              text-center lg:text-right
            "
          >
            {siteInfo.tagline}
          </p>

          {/* Description */}
          <p
            className="
              mx-auto mt-5 max-w-2xl
              text-[15px] leading-[1.9]
              text-white/95
              drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]
              sm:mt-6 sm:text-lg sm:leading-9
              lg:mx-0
              text-center lg:text-right
            "
          >
            نجمع بين الكشافة والتربية والقيم، ونبني القيادة عبر الخدمة والأخوة،
            في مخيمات وأنشطة تصنع الذكريات وتنمّي الإنسان.
          </p>

          {/* CTA buttons */}
          <div
            className="
              mx-auto mt-7 flex w-full max-w-[520px]
              flex-col items-stretch gap-3
              sm:mt-9 sm:flex-row
              sm:justify-center
              lg:mx-0 lg:max-w-none
              lg:justify-start
            "
          >
            <a
              href="#about"
              className="
                btn-gold justify-center
                min-h-14
                text-base
                sm:min-h-12
              "
            >
              تعرّف على الفوج
              <ArrowLeft className="btn-arrow h-4 w-4" aria-hidden="true" />
            </a>

            <a
              href="#activities"
              className="
                btn-outline-light justify-center
                min-h-14
                border-white/40
                bg-white/10
                backdrop-blur-md
                text-base
                sm:min-h-12
              "
            >
              استكشف أنشطتنا
            </a>
          </div>
        </div>
      </div>

      {/* Bottom transition */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          inset-x-0 bottom-0 h-20
          bg-gradient-to-t
          from-brand-purple-dark
          via-brand-purple-dark/50
          to-transparent
          sm:h-28
        "
      />
    </section>
  );
}
