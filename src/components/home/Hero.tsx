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
          src="/images/hero-purple.png"
          alt="راية فوج روضة الفيحاء في الطبيعة"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[left_32%]"
        />
      </div>

      {/* Mobile background */}
      <div className="absolute inset-0 -z-30 overflow-hidden lg:hidden">
        <Image
          src="/images/hero-mobile-purple.png"
          alt="راية فوج روضة الفيحاء"
          fill
          priority
          sizes="100vw"
          className="scale-[1.25] object-cover object-[left_35%]"
        />
      </div>

      {/* Base overlay */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-20
          bg-[#21133c]/20
        "
      />

      {/* Desktop right-side gradient */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-20
          hidden lg:block
          bg-gradient-to-l
          from-[#21133c]/60
          via-[#21133c]/25
          to-transparent
        "
      />

      {/* Mobile gradient */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-20
          bg-gradient-to-b
          from-[#21133c]/10
          via-[#21133c]/35
          to-[#21133c]/80
          lg:hidden
        "
      />

      {/* Mobile text readability */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-10
          bg-[radial-gradient(ellipse_at_center,rgba(33,19,60,0.25)_0%,transparent_75%)]
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
          from-transparent
          via-transparent
          to-[#281747]/55
        "
      />

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          -top-40 right-0 -z-10
          h-[400px] w-[400px]
          rounded-full bg-[#a78bfa]/10
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
            <div className="relative h-10 w-10 shrink-0 sm:h-11 sm:w-11">
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
                  drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]
                "
              >
                جمعية الكشّاف المسلم في لبنان
              </p>

              <p
                className="
                  mt-1 text-xs font-semibold
                  text-[#ffc52e] sm:text-sm
                  drop-shadow-sm
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
              drop-shadow-[0_3px_16px_rgba(0,0,0,0.45)]
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
              leading-[1.6] text-[#ffc52e]
              drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]
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
              text-white
              drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]
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
                shadow-[0_6px_20px_rgba(0,0,0,0.12)]
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
                border border-white/50
                bg-[#281747]/25
                backdrop-blur-md
                text-base text-white
                hover:bg-white/15
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
