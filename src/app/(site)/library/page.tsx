import PageHeader from "@/components/ui/PageHeader";
import LibraryFilterGrid from "@/components/home/LibraryFilterGrid";
import { getLibraryResources } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "المكتبة",
  description:
    "أدلة تدريبية ومتطلبات شارات واستمارات وأناشيد فوج روضة الفيحاء، للمعاينة والتحميل والمشاركة.",
  path: "/library",
});

export default async function LibraryPage() {
  const resources = await getLibraryResources();

  return (
    <>
      <PageHeader
        title="المكتبة"
        subtitle="وثائق وأدلة الفوج، للمعاينة والتحميل والمشاركة."
        path="/library"
      />
      <section
        aria-labelledby="library-list-heading"
        className="bg-brand-cream py-16 sm:py-20"
      >
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <h2 id="library-list-heading" className="sr-only">
            الموارد
          </h2>
          <LibraryFilterGrid resources={resources} />
        </div>
      </section>
    </>
  );
}
