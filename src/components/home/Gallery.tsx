import SectionHeading from "@/components/ui/SectionHeading";
import GalleryFilterGrid from "@/components/home/GalleryFilterGrid";
import { getGalleryItems } from "@/lib/data";

export default async function Gallery() {
  const galleryItems = await getGalleryItems();

  return (
    <section id="gallery" className="bg-brand-cream py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          title="معرض الصور"
          subtitle="لحظات من رحلاتنا ومخيماتنا وأنشطتنا الكشفية."
        />
        <GalleryFilterGrid items={galleryItems} />
      </div>
    </section>
  );
}
