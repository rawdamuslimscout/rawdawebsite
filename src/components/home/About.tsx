/* eslint-disable @next/next/no-img-element */
import { Mountain } from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { getGalleryItems, getSiteSettings } from "@/lib/data";

export default async function About() {
  const [siteInfo, gallery] = await Promise.all([
    getSiteSettings(),
    getGalleryItems().catch(() => []),
  ]);

  const selectedPhotos = siteInfo.aboutImageIds
    .map((id) => gallery.find((item) => item.id === id))
    .filter((item): item is (typeof gallery)[number] => Boolean(item));
  const photos =
    selectedPhotos.length > 0 ? selectedPhotos : gallery.slice(0, 2);

  return (
    <section
      id="about"
      className="section-y relative overflow-hidden bg-brand-cream"
    >
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ---------- Editorial text (start / right in RTL) ---------- */}
          <Reveal className="lg:col-span-6 xl:col-span-6">
            <SectionHeading
              title="عن الفوج"
              subtitle={`${siteInfo.parent} — ${siteInfo.name}`}
            />

            <p className="mt-8 max-w-xl text-lg leading-[2.1] text-brand-ink/80 sm:text-xl">
              فوج روضة الفيحاء هو أحد أفواج جمعية الكشاف المسلم في لبنان ضمن
              مفوضية الشمال.
            </p>
            <p className="mt-4 max-w-xl text-base leading-[2.1] text-brand-ink/70 sm:text-lg">
              نُقيم ونُنظّم مغامرات وتحديات وأوقاتًا كشفية مميزة للاشبال
              والزهرات والكشافة والمرشدات، ضمن رحلة تربوية متكاملة تجمع بين
              القيم الإسلامية وروح القيادة والخدمة.
            </p>

            <a
              href="#sections"
              className="link-underline mt-8 inline-block pb-1 text-base font-bold text-brand-purple"
            >
              تعرّف على مراحلنا الكشفية
            </a>
          </Reveal>

          {/* ---------- Visual composition ---------- */}
          <Reveal delay={120} className="lg:col-span-6">
            {photos.length > 0 ? (
              <div className="relative mx-auto grid max-w-xl grid-cols-12 gap-3 sm:gap-4">
                <div className="col-span-7 aspect-[4/5] overflow-hidden rounded-2xl shadow-soft">
                  <img
                    src={photos[0].imageUrl}
                    alt={photos[0].title}
                    width={640}
                    height={800}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="col-span-5 flex flex-col gap-3 pt-10 sm:gap-4 sm:pt-14">
                  {photos[1] ? (
                    <div className="aspect-[4/5] overflow-hidden rounded-2xl shadow-soft">
                      <img
                        src={photos[1].imageUrl}
                        alt={photos[1].title}
                        width={480}
                        height={600}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  {/* <div className="rounded-2xl bg-brand-purple p-5 text-white shadow-soft">
                    <Mountain
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
                <div className="texture-canvas absolute inset-0 opacity-40" />
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
