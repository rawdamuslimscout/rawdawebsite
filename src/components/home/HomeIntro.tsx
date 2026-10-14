import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import { getHomePhotos } from "@/lib/home-photos";

/** Homepage "who we are": one short statement, then the photos do the talking. */
export default async function HomeIntro() {
  const { intro } = await getHomePhotos();
  const triple = intro.length >= 3;

  return (
    <section id="about" className="bg-brand-cream pt-16 sm:pt-24 lg:pt-28">
      <Reveal className="container-x max-w-4xl text-center">
        <h2 className="font-display text-sm font-bold text-brand-purple">عن الفوج</h2>
        <p className="mt-5 font-display text-2xl font-semibold leading-[1.75] text-brand-ink sm:text-3xl sm:leading-[1.7] lg:text-4xl lg:leading-[1.65]">
          أحد أفواج جمعية الكشاف المسلم في لبنان ضمن مفوضية الشمال، نرافق
          الأشبال والزهرات والكشافة والمرشدات في رحلة تجمع القيم الإسلامية وروح
          القيادة والخدمة.
        </p>
        <Link
          href="/about"
          className="group mt-7 inline-flex min-h-11 items-center gap-2 text-base font-bold text-brand-purple"
        >
          <span className="link-underline pb-1">اعرف المزيد عنّا</span>
          <ArrowLeft
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1 group-focus-visible:-translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </Reveal>

      {intro.length > 0 && (
        <Reveal
          as="ul"
          delay={100}
          className={`mt-12 grid gap-1 sm:mt-16 sm:gap-1.5 ${
            triple ? "grid-cols-2 sm:grid-cols-3" : intro.length === 2 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {intro.map((photo, i) => (
            <li
              key={photo.id}
              className={`h-56 overflow-hidden bg-brand-purple-tint sm:h-[340px] lg:h-[440px] ${
                triple && i === 0 ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              <SafeImage
                src={photo.imageUrl}
                alt={photo.title}
                sizes={triple ? "(min-width: 640px) 33vw, 100vw" : "50vw"}
                width={900}
                height={900}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </li>
          ))}
        </Reveal>
      )}
    </section>
  );
}
