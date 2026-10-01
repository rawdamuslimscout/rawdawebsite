import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getSiteSettings } from "@/lib/data";

export default async function Hero() {
  const siteInfo = await getSiteSettings();

  return (
    <section
      id="home"
      className="
        relative isolate flex min-h-[620px]
        items-center overflow-hidden
        bg-brand-purple-dark
        pb-14 pt-24
        sm:min-h-[700px]
        lg:min-h-[760px]
      "
    >
      {/* Background video */}
      <div className="absolute inset-0 -z-30 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="
            h-full w-full
            object-cover
            object-center
          "
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Overall video overlay */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-20
          bg-gradient-to-b
          from-[#211337]/30
          via-[#211337]/20
          to-[#211337]/65
        "
      />

      {/* Content-side gradient */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-10
          bg-gradient-to-l
          from-[#24133e]/85
          via-[#24133e]/50
          to-transparent
        "
      />

      {/* Mobile readability overlay */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-10
          bg-[#24133e]/20
          lg:bg-transparent
        "
      />

      {/* Subtle ambient glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          -top-40 left-1/3 -z-10
          h-[400px] w-[500px]
          rounded-full bg-purple-500/10
          blur-[130px]
        "
      />

      {/* Content */}
      <div className="container-x relative z-10 w-full">
        <div
          dir="ltr"
          className="
            grid items-center gap-6
            lg:grid-cols-[0.8fr_1.2fr]
            lg:gap-10
            xl:gap-16
          "
        >
          {/* Scout logo - desktop only */}
          <div
            className="
              hidden items-center justify-center
              lg:flex
            "
          >
            <Image
              src="/images/logo-about-white.png"
              alt="شعار فوج روضة الفيحاء"
              width={190}
              height={320}
              sizes="155px"
              className="
                h-auto w-[140px] object-contain
                drop-shadow-[0_8px_24px_rgba(0,0,0,0.3)]
                xl:w-[155px]
              "
            />
          </div>

          {/* Hero content */}
          <div
            dir="rtl"
            className="
              mx-auto w-full max-w-2xl
              text-center
              lg:mx-0 lg:text-start
            "
          >
            {/* Association identity */}
            <div
              className="
                mb-5 flex items-center
                justify-center gap-3
                lg:mb-6 lg:justify-start
              "
            >
              <div
                className="
                  relative h-9 w-9 shrink-0
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
                    mt-0.5 text-xs font-medium
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
                text-3xl leading-[1.25]
                tracking-tight text-white
                drop-shadow-[0_3px_16px_rgba(0,0,0,0.4)]
                sm:text-5xl
                lg:text-[3.6rem]
                xl:text-6xl
              "
            >
              {siteInfo.name}
            </h1>

            {/* Tagline */}
            <p
              className="
                mt-3 font-display
                text-lg font-semibold
                leading-relaxed text-brand-yellow
                drop-shadow-md
                sm:mt-4 sm:text-2xl
                lg:text-3xl
              "
            >
              {siteInfo.tagline}
            </p>

            {/* Description */}
            <p
              className="
                mx-auto mt-4 max-w-xl
                text-[15px] leading-7
                text-white/90
                drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]
                sm:text-lg sm:leading-9
                lg:mx-0
              "
            >
              نجمع بين الكشافة والتربية والقيم، ونبني القيادة عبر الخدمة
              والأخوة، في مخيمات وأنشطة تصنع الذكريات وتنمّي الإنسان.
            </p>

            {/* CTA buttons */}
            <div
              className="
                mt-6 flex flex-col
                items-stretch gap-2.5
                sm:mt-8 sm:flex-row sm:justify-center
                lg:justify-start
              "
            >
              <a href="#about" className="btn-gold justify-center">
                تعرّف على الفوج
                <ArrowLeft className="btn-arrow h-4 w-4" aria-hidden="true" />
              </a>

              <a
                href="#activities"
                className="
                  btn-outline-light justify-center
                  border-white/35
                  bg-white/5
                  backdrop-blur-sm
                "
              >
                استكشف أنشطتنا
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom transition */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          inset-x-0 bottom-0 h-24
          bg-gradient-to-t
          from-brand-purple-dark
          via-brand-purple-dark/35
          to-transparent
        "
      />
    </section>
  );
}
