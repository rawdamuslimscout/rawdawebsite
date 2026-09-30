import SectionHeading from "@/components/ui/SectionHeading";
import GalleryFilterGrid from "@/components/home/GalleryFilterGrid";
import { getGalleryItems } from "@/lib/data";

export default async function Gallery() {
  const galleryItems = await getGalleryItems();

  // Don't render the entire gallery section if there are no images...
  if (!galleryItems?.length) {
    return null;
  }

  return (
    <section
      id="gallery"
      className="section-y relative overflow-hidden bg-brand-cream"
    >
      <div className="container-x">
        <SectionHeading
          title="معرض الصور"
          subtitle="لحظات من رحلاتنا ومخيماتنا وأنشطتنا الكشفية."
        />

        <GalleryFilterGrid items={galleryItems} />
      </div>
    </section>
  );
}
