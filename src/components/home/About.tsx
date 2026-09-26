import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import { getSiteSettings, getSiteStats } from "@/lib/data";

export default async function About() {
  const [stats, siteInfo] = await Promise.all([
    getSiteStats(),
    getSiteSettings(),
  ]);

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-brand-cream py-24 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24">
          {/* =========================
              ABOUT CONTENT
          ========================== */}
          <div className="order-1 text-right lg:order-1">
            <SectionHeading
              title="عن الفوج"
              subtitle={`${siteInfo.parent} — ${siteInfo.name}`}
            />

            <p className="mt-6 max-w-xl text-base leading-[2] text-brand-ink/70 sm:text-lg">
              فوج روضة الفيحاء هو أحد أفواج جمعية الكشاف المسلم في لبنان ضمن
              مفوضية الشمال. نُقيم ونُنظّم مغامرات وتحديات وأوقاتًا كشفية مميزة
              للاشبال والزهرات والكشافة والمرشدات، ضمن رحلة تربوية متكاملة تجمع
              بين القيم الإسلامية وروح القيادة والخدمة.
            </p>

            {/* Statistics */}
            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-brand-purple/10 pt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="sr-only">{stat.label}</dt>

                  <dd className="font-display text-2xl font-bold text-brand-purple sm:text-3xl">
                    {stat.value}
                  </dd>

                  <p className="mt-1 text-xs text-brand-ink/60 sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </dl>
          </div>

          {/* =========================
              CREST
          ========================== */}
          <div className="order-2 lg:order-2">
            <div className="relative mx-auto flex h-[380px] w-full max-w-[430px] items-center justify-center sm:h-[440px]">
              {/* Large soft background shape */}
              <div
                className="
                  absolute
                  h-[70%]
                  w-[70%]
                  rounded-full
                  bg-brand-purple-tint/70
                  blur-3xl
                "
              />

              {/* Very subtle vertical glow */}
              <div
                className="
                  absolute
                  h-[85%]
                  w-[35%]
                  rounded-full
                  bg-brand-purple/[0.035]
                  blur-2xl
                "
              />

              {/* Crest */}
              <div
                className="
                  relative
                  z-10
                  w-[52%]
                  max-w-[245px]
                  sm:w-[54%]
                  sm:max-w-[260px]
                "
              >
                <Image
                  src="/images/logo-about.png"
                  alt="شعار فوج روضة الفيحاء"
                  width={376}
                  height={629}
                  priority
                  className="
                    h-auto
                    w-full
                    object-contain
                    drop-shadow-[0_20px_30px_rgba(67,40,110,0.13)]
                  "
                />
              </div>

              {/* Minimal decorative line */}
              <div className="absolute bottom-[7%] left-1/2 flex -translate-x-1/2 items-center gap-3">
                <span className="h-px w-8 bg-brand-purple/15" />
                <span className="h-1.5 w-1.5 rounded-full bg-brand-purple/30" />
                <span className="h-px w-8 bg-brand-purple/15" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
