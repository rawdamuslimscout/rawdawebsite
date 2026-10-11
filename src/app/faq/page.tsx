import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import PageHeader from "@/components/ui/PageHeader";
import FaqList from "@/components/faq/FaqList";
import { getContactLinks } from "@/lib/contact";
import { getSiteSettings } from "@/lib/data";
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
  const [{ items, failed }, settings] = await Promise.all([
    getPublishedFaqs(),
    getSiteSettings(),
  ]);
  const { phone, whatsappHref, telHref } = getContactLinks(settings.contactPhone);

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

          {/* Fallback: always offer a human answer. */}
          <aside
            aria-labelledby="faq-contact-h"
            className="mt-10 rounded-2xl bg-brand-purple p-6 text-center text-white sm:p-8"
          >
            <h2 id="faq-contact-h" className="font-display text-xl font-bold sm:text-2xl">
              لم تجد إجابة سؤالك؟
            </h2>
            <p className="mt-2 text-sm leading-7 text-white/75">
              تواصلوا معنا مباشرةً وسنجيبكم في أقرب وقت.
            </p>
            <div className="mx-auto mt-5 flex max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:justify-center">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-gold">
                <FaWhatsapp className="h-[18px] w-[18px]" aria-hidden="true" />
                راسلنا عبر واتساب
              </a>
              <a href={telHref} className="btn-outline-light">
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span dir="ltr">{phone}</span>
              </a>
            </div>
            <a
              href="/join"
              className="mt-4 inline-flex min-h-[44px] items-center text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
            >
              معلومات الانتساب والمواعيد ←
            </a>
          </aside>
        </div>
      </section>
    </>
  );
}
