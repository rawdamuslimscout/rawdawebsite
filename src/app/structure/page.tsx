import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import StructureTree from "@/components/structure/StructureTree";
import { getPublicStructure } from "@/lib/data-structure";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "الهيكل التنظيمي | فوج روضة الفيحاء",
  description:
    "تعرّف على موقع فوج روضة الفيحاء ضمن مفوضية الشمال وجمعية الكشّاف المسلم في لبنان: عميد الفوج، مجلس الفوج، والوحدات.",
  alternates: { canonical: "/structure" },
  openGraph: {
    title: "الهيكل التنظيمي | فوج روضة الفيحاء",
    url: "/structure",
    locale: "ar_LB",
    type: "website",
  },
};

export default async function StructurePage() {
  const { roots, failed } = await getPublicStructure();
  return (
    <>
      <PageHeader
        title="الهيكل التنظيمي"
        subtitle="من الجمعية إلى المفوضية إلى الفوج: من نحن وكيف نعمل."
      />
      <section className="bg-brand-cream py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {failed ? (
            <p
              role="alert"
              className="rounded-2xl bg-white p-8 text-center text-sm text-brand-ink/70 ring-1 ring-brand-purple/10"
            >
              تعذّر تحميل الهيكل التنظيمي حاليًا. حاول مجددًا بعد قليل.
            </p>
          ) : roots.length === 0 ? (
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
