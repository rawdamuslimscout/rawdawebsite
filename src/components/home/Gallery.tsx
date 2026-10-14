import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import GalleryStrip from "@/components/home/GalleryStrip";
import { getHomePhotos } from "@/lib/home-photos";

/** Homepage teaser: a plain grid of photos; the full, filterable gallery lives on /gallery. */
export default async function Gallery() {
  const { teaser, total } = await getHomePhotos();

  // Don't render the section at all if there are no images.
  if (!teaser.length) return null;

  return (
    <section id="gallery" className="section-y relative overflow-hidden bg-white">
      <div className="container-x">
        <Reveal className="flex flex-col items-center gap-4">
          <SectionHeading
            title="معرض الصور"
            subtitle="لحظات من رحلاتنا ومخيماتنا وأنشطتنا الكشفية."
            align="center"
          />
          <Link
            href="/gallery"
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-base font-bold text-brand-purple"
          >
            <span className="link-underline pb-1">
              {total > teaser.length ? "عرض المعرض كاملًا" : "افتح المعرض"}
            </span>
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1 group-focus-visible:-translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </Reveal>

        <GalleryStrip items={teaser} />
      </div>
    </section>
  );
}
