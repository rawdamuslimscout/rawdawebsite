import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { getGalleryItems, getSiteSettings } from "@/lib/data";
import SafeImage from "@/components/ui/SafeImage";

/**
 * "عن الفوج". On the homepage (`variant="home"`) it is a short teaser that
 * links to /about; on /about (`variant="page"`) it opens the page.
 */
export default async function About({
  variant = "home",
}: {
  variant?: "home" | "page";
}) {
  const [siteInfo, gallery] = await Promise.all([
    getSiteSettings(),
    getGalleryItems(),
  ]);
  const isHome = variant === "home";

  const selectedPhotos = siteInfo.aboutImageIds
    .map((id) => gallery.find((item) => item.id === id))
    .filter((item): item is (typeof gallery)[number] => Boolean(item));
  const photos =
    selectedPhotos.length > 0 ? selectedPhotos : gallery.slice(0, 2);

  return (
    <section
      id={isHome ? "about" : "intro"}
      className="section-y relative overflow-hidden bg-brand-cream"
    >
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ---------- Editorial text (start / right in RTL) ---------- */}
          <Reveal className="lg:col-span-6 xl:col-span-6">
            {/* On /about the affiliation is spelled out by OrgChain right
                below, so the intro doesn't repeat it. */}
            <SectionHeading
              title="عن الفوج"
              subtitle={isHome ? `${siteInfo.parent} — ${siteInfo.name}` : undefined}
            />

            {isHome ? (
              <>
                <p className="mt-8 max-w-xl text-lg leading-[2.1] text-brand-ink/80 sm:text-xl">
                  فوج روضة الفيحاء هو أحد أفواج جمعية الكشاف المسلم في لبنان ضمن
                  مفوضية الشمال.
                </p>
                <p className="mt-4 max-w-xl text-base leading-[2.1] text-brand-ink/70 sm:text-lg">
                  نُقيم ونُنظّم مغامرات وتحديات وأوقاتًا كشفية مميزة للأشبال
                  والزهرات والكشافة والمرشدات، ضمن رحلة تربوية متكاملة تجمع بين
                  القيم الإسلامية وروح القيادة والخدمة.
                </p>
              </>
            ) : (
              <>
                <p className="mt-8 max-w-xl text-lg leading-[2.1] text-brand-ink/80 sm:text-xl">
                  فوج روضة الفيحاء مساحةٌ تربوية تجمع بين التعلّم والمغامرة
                  والعمل الجماعي، للأشبال والزهرات والكشافة والمرشدات.
                </p>
                <p className="mt-4 max-w-xl text-base leading-[2.1] text-brand-ink/70 sm:text-lg">
                  ومن خلال الاجتماعات الأسبوعية والمخيمات والرحلات والمبادرات
                  المجتمعية، نخوض معًا تجربةً كشفية تنمّي الاعتماد على النفس
                  وروح القيادة والأخوّة، وتُرسّخ القيم الإسلامية في الممارسة
                  والسلوك.
                </p>
              </>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2">
              {isHome && (
                <Link
                  href="/about"
                  className="group inline-flex min-h-11 items-center gap-2 text-base font-bold text-brand-purple"
                >
                  <span className="link-underline pb-1">اعرف المزيد عنّا</span>
                  <ArrowLeft
                    className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1 group-focus-visible:-translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              )}
              <Link
                href="/#sections"
                className="group inline-flex min-h-11 items-center gap-2 text-base font-bold text-brand-purple"
              >
                <span className="link-underline pb-1">تعرّف على مراحلنا الكشفية</span>
                <ArrowLeft
                  className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1 group-focus-visible:-translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </Reveal>

          {/* ---------- Visual composition ---------- */}
          <Reveal delay={120} className="lg:col-span-6">
            {photos.length > 0 ? (
              <div className="relative mx-auto grid max-w-xl grid-cols-12 gap-3 sm:gap-4">
                <div className="col-span-7 aspect-[4/5] overflow-hidden rounded-2xl bg-brand-purple-tint shadow-soft">
                  <SafeImage
                    src={photos[0].imageUrl}
                    alt={photos[0].title}
                    sizes="(min-width: 640px) 340px, 58vw"
                    width={640}
                    height={800}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="col-span-5 flex flex-col gap-3 pt-10 sm:gap-4 sm:pt-14">
                  {photos[1] ? (
                    <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-brand-purple-tint shadow-soft">
                      <SafeImage
                        src={photos[1].imageUrl}
                        alt={photos[1].title}
                        sizes="(min-width: 640px) 240px, 42vw"
                        width={480}
                        height={600}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  {/* <div className="rounded-2xl bg-brand-purple p-5 text-white shadow-soft">
                    <Mountain (import from lucide-react if restored)
                      className="h-6 w-6 text-brand-yellow"
                      aria-hidden="true"
                    />
                    <p className="mt-3 font-display text-lg font-semibold leading-relaxed">
                      {siteInfo.tagline}
                    </p>
                  </div> */}
                </div>
              </div>
            ) : (
              <div className="relative mx-auto max-w-xl overflow-hidden rounded-2xl bg-brand-purple-dark p-8 shadow-soft sm:p-12">
                <div aria-hidden="true" className="texture-canvas absolute inset-0 opacity-40" />
                <svg
                  className="absolute inset-x-0 bottom-0 h-1/2 w-full text-brand-purple/70"
                  viewBox="0 0 400 200"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0 200 L0 130 L90 50 L170 130 L250 20 L330 120 L400 70 L400 200Z"
                    fill="currentColor"
                  />
                </svg>
                <p className="relative font-display text-2xl font-bold leading-relaxed text-brand-yellow sm:text-3xl">
                  {siteInfo.tagline}
                </p>
                <div className="relative h-40 sm:h-48" />
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
