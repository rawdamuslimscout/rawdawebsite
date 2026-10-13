import { ImageOff } from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import GalleryFilterGrid from "@/components/home/GalleryFilterGrid";
import { getGalleryItems } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "معرض الصور",
  description:
    "صور من مخيمات فوج روضة الفيحاء ورحلاته وتدريباته وأنشطته الكشفية.",
  path: "/gallery",
});

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <>
      <PageHeader
        title="معرض الصور"
        subtitle="لحظات من رحلاتنا ومخيماتنا وأنشطتنا الكشفية."
        path="/gallery"
      />
      <section className="bg-brand-cream pb-16 pt-6 sm:pb-20 sm:pt-8">
        <div className="container-x">
          {items.length === 0 ? (
            <div className="mx-auto mt-8 flex max-w-md flex-col items-center rounded-2xl border border-dashed border-brand-purple/15 bg-white/60 px-6 py-14 text-center">
              <ImageOff
                className="h-10 w-10 text-brand-purple/30"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="mt-4 text-base font-semibold text-brand-ink/70">
                لا توجد صور في المعرض بعد.
              </p>
            </div>
          ) : (
            <GalleryFilterGrid items={items} />
          )}
        </div>
      </section>
    </>
  );
}
