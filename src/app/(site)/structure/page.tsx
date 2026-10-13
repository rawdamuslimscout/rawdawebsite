import PageHeader from "@/components/ui/PageHeader";
import StructureTree from "@/components/structure/StructureTree";
import { getPublicStructure } from "@/lib/data-structure";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "الهيكل التنظيمي",
  description:
    "تعرّف على موقع فوج روضة الفيحاء ضمن مفوضية الشمال وجمعية الكشاف المسلم في لبنان: عميد الفوج، ومجلس الفوج، والوحدات.",
  path: "/structure",
});

export default async function StructurePage() {
  const { roots } = await getPublicStructure();
  return (
    <>
      <PageHeader
        title="الهيكل التنظيمي"
        subtitle="من الجمعية إلى المفوضية إلى الفوج: من نحن وكيف نعمل."
        path="/structure"
      />
      <section className="bg-brand-cream py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {roots.length === 0 ? (
            <p className="rounded-2xl bg-white p-8 text-center text-sm text-brand-ink/70 ring-1 ring-brand-purple/10">
              سيتم نشر الهيكل التنظيمي قريبًا.
            </p>
          ) : (
            <StructureTree roots={roots} />
          )}
        </div>
      </section>
    </>
  );
}
