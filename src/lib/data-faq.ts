import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { retryRead } from "@/lib/db-retry";

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

/**
 * Published entries only, with an explicit field selection (no admin/draft data),
 * in the admin's manual order. A failing query is logged and rethrown so ISR keeps
 * the last good page; `failed` stays in the shape for the page but is always false.
 */
export const getPublishedFaqs = cache(async (): Promise<{
  items: PublicFaq[];
  failed: boolean;
}> => {
  try {
    const items = await retryRead("getPublishedFaqs", () =>
      prisma.faq.findMany({
        where: { isPublished: true },
        select: { id: true, question: true, answer: true, category: true },
        // Faq has no createdAt column; id is the deterministic tie-breaker.
        orderBy: [{ order: "asc" }, { id: "asc" }],
        take: 200,
      }),
    );
    return { items, failed: false };
  } catch (err) {
    console.error(
      "[data] getPublishedFaqs failed",
      err instanceof Error ? err.message : err,
    );
    throw err;
  }
});
