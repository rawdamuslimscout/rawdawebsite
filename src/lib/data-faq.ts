import { prisma } from "@/lib/prisma";

export const FAQ_CATEGORIES: { value: string; label: string }[] = [
  { value: "about", label: "عن الجمعية والفوج" },
  { value: "joining", label: "الانتساب والانضمام" },
  { value: "activities", label: "الأنشطة والمخيمات" },
  { value: "training", label: "التدريب والتأهيل" },
  { value: "contact", label: "التواصل والاستفسارات" },
];

export type PublicFaq = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

/** Published entries only, with an explicit field selection (no admin/draft data). */
export async function getPublishedFaqs(): Promise<{
  items: PublicFaq[];
  failed: boolean;
}> {
  try {
    const items = await prisma.faq.findMany({
      where: { isPublished: true },
      select: { id: true, question: true, answer: true, category: true },
      take: 200,
    });
    return { items, failed: false };
  } catch (err) {
    console.error(
      "[data] getPublishedFaqs failed",
      err instanceof Error ? err.message : err,
    );
    return { items: [], failed: true };
  }
}
