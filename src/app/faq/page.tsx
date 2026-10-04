import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import FaqList from "@/components/faq/FaqList";
import { FAQ_CATEGORIES, getPublishedFaqs } from "@/lib/data-faq";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "الأسئلة الشائعة | فوج روضة الفيحاء",
  description:
    "أجوبة عن أكثر الأسئلة شيوعًا حول فوج روضة الفيحاء وجمعية الكشّاف المسلم في لبنان: الانتساب، الأنشطة والمخيمات، والتدريب.",
  alternates: { canonical: "/faq" },
  openGraph: { title: "الأسئلة الشائعة | فوج روضة الفيحاء", url: "/faq", locale: "ar_LB", type: "website" },
};

export default async function FaqPage() {
  const { items, failed } = await getPublishedFaqs();

  return (
    <>
      <PageHeader title="الأسئلة الشائعة" subtitle="إجابات مختصرة عن أهم ما يسأل عنه الأهالي والمنتسبون." />
      <section className="bg-brand-cream py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          {failed ? (
            <p role="alert" className="rounded-2xl bg-white p-8 text-center text-sm text-brand-ink/70 ring-1 ring-brand-purple/10">
              تعذّر تحميل الأسئلة حاليًا. حاول مجددًا بعد قليل.
            </p>
          ) : items.length === 0 ? (
            <p className="rounded-2xl bg-white p-8 text-center text-sm text-brand-ink/70 ring-1 ring-brand-purple/10">
              لم تتم إضافة أسئلة بعد.
            </p>
          ) : (
            <FaqList items={items} categories={FAQ_CATEGORIES} />
          )}
        </div>
      </section>
    </>
  );
}
