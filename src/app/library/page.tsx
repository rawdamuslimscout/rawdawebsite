import PageHeader from "@/components/ui/PageHeader";
import LibraryFilterGrid from "@/components/home/LibraryFilterGrid";
import { getLibraryResources } from "@/lib/data";

export const metadata = {
  title: "المكتبة | فوج روضة الفيحاء",
  description: "أدلة تدريبية، متطلبات شارات، استمارات وأناشيد فوج روضة الفيحاء.",
};

export default async function LibraryPage() {
  const resources = await getLibraryResources();

  return (
    <>
      <PageHeader
        title="المكتبة"
        subtitle="أدلة تدريبية، متطلبات شارات، استمارات وأناشيد — جاهزة للتحميل."
      />
      <section className="bg-brand-cream py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <LibraryFilterGrid resources={resources} />
        </div>
      </section>
    </>
  );
}
