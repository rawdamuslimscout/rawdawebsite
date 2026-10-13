import {
  GraduationCap,
  HandHeart,
  Star,
  Tent,
  Trees,
  type LucideIcon,
} from "lucide-react";
import type { MapCategory, MapFilterKey } from "@/data/map";

/** Label + icon for each kind of place. Icons are the same lucide set used across the site. */
export const CATEGORY_META: Record<
  MapCategory,
  { label: string; Icon: LucideIcon }
> = {
  camps: { label: "مخيم", Icon: Tent },
  trips: { label: "رحلة", Icon: Trees },
  training: { label: "تدريب", Icon: GraduationCap },
  service: { label: "خدمة مجتمعية", Icon: HandHeart },
  events: { label: "مناسبة", Icon: Star },
  hikes: { label: "مسير", Icon: Trees },
};

export const FILTERS: { key: MapFilterKey; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "camps", label: "مخيمات" },
  { key: "trips", label: "رحلات" },
  { key: "training", label: "تدريبات" },
  { key: "activities", label: "أنشطة" },
];

// Western digits (the Lebanese norm), matching the rest of the site.
const nf = new Intl.NumberFormat("ar-LB-u-nu-latn");

export function formatNumber(n: number): string {
  return nf.format(n);
}

/**
 * Arabic counted-noun form for n ≥ 3, decided by the last two digits:
 * 3–10 → plural, 11–99 → accusative singular, 00–02 (100, 101, 200…) → singular.
 */
function countedForm(n: number, plural: string, accusative: string, singular: string): string {
  const tail = n % 100;
  if (tail >= 3 && tail <= 10) return plural;
  if (tail >= 11) return accusative;
  return singular;
}

/** «92 مشاركًا» with correct Arabic number agreement. */
export function participantsLabel(n: number): string {
  if (n === 1) return "مشارك واحد";
  if (n === 2) return "مشاركان";
  return `${formatNumber(n)} ${countedForm(n, "مشاركين", "مشاركًا", "مشارك")}`;
}

/** «6 أماكن» / «مكان واحد» … */
export function placesCountLabel(n: number): string {
  if (n === 0) return "لا توجد أماكن";
  if (n === 1) return "مكان واحد";
  if (n === 2) return "مكانان";
  return `${formatNumber(n)} ${countedForm(n, "أماكن", "مكانًا", "مكان")}`;
}
