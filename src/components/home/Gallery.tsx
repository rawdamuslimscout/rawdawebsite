import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import GalleryStrip from "@/components/home/GalleryStrip";
import { getGalleryItems } from "@/lib/data";

/** Homepage teaser: one row of photos; the full, filterable gallery lives on /gallery. */
const TEASER_LIMIT = 4;

export default async function Gallery() {
  const galleryItems = await getGalleryItems();

  // Don't render the section at all if there are no images.
  if (!galleryItems.length) return null;

  const hasMore = galleryItems.length > TEASER_LIMIT;

  return (
    <section
      id="gallery"
      className="section-y relative overflow-hidden bg-brand-cream"
    >
      <div className="container-x">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            title="معرض الصور"
            subtitle="لحظات من رحلاتنا ومخيماتنا وأنشطتنا الكشفية."
          />
          <Link
            href="/gallery"
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 self-start text-base font-bold text-brand-purple md:self-end"
          >
            <span className="link-underline pb-1">
              {hasMore ? "عرض المعرض كاملًا" : "افتح المعرض"}
            </span>
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1 group-focus-visible:-translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </Reveal>

        <GalleryStrip items={galleryItems.slice(0, TEASER_LIMIT)} />
      </div>
    </section>
  );
}
