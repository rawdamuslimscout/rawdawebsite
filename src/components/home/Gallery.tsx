import SectionHeading from "@/components/ui/SectionHeading";
import GalleryFilterGrid from "@/components/home/GalleryFilterGrid";
import { getGalleryItems } from "@/lib/data";

export default async function Gallery() {
  const galleryItems = await getGalleryItems();

  // Don't render the entire gallery section if there are no images.
  if (!galleryItems?.length) {
    return null;
  }

  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-brand-cream py-20 sm:py-24 lg:py-28"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-40
          top-20
          h-80
          w-80
          rounded-full
          bg-brand-purple/5
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-40
          bottom-0
          h-96
          w-96
          rounded-full
          bg-brand-purple/5
          blur-3xl
        "
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          title="معرض الصور"
          subtitle="لحظات من رحلاتنا ومخيماتنا وأنشطتنا الكشفية."
        />

        <GalleryFilterGrid items={galleryItems} />
      </div>
    </section>
  );
}
