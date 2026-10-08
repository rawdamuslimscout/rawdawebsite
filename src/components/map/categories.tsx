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
  { key: "training", label: "تدريب" },
  { key: "activities", label: "أنشطة" },
];

const nf = new Intl.NumberFormat("ar-EG");

export function formatNumber(n: number): string {
  return nf.format(n);
}

/** «٩٢ مشاركًا» with correct Arabic number agreement. */
export function participantsLabel(n: number): string {
  if (n === 1) return "مشارك واحد";
  if (n === 2) return "مشاركان";
  if (n >= 3 && n <= 10) return `${formatNumber(n)} مشاركين`;
  return `${formatNumber(n)} مشاركًا`;
}

/** «٦ أماكن» / «مكان واحد» … */
export function placesCountLabel(n: number): string {
  if (n === 0) return "لا توجد أماكن";
  if (n === 1) return "مكان واحد";
  if (n === 2) return "مكانان";
  if (n >= 3 && n <= 10) return `${formatNumber(n)} أماكن`;
  return `${formatNumber(n)} مكانًا`;
}
