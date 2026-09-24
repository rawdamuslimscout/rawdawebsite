import { prisma } from "@/lib/prisma";

export type FieldType = "text" | "textarea" | "number" | "select";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  help?: string;
};

export type ResourceConfig = {
  key: string;
  label: string; // Arabic label shown in the admin nav
  fields: FieldConfig[];
  titleField: string; // which field represents each row in the list
  orderBy: Record<string, "asc" | "desc">;
};

const scoutIconOptions = [
  { value: "sprout", label: "sprout" },
  { value: "tent", label: "tent" },
  { value: "compass", label: "compass" },
  { value: "flag", label: "flag" },
  { value: "mountain", label: "mountain" },
  { value: "shield", label: "shield" },
];

const activityIconOptions = [
  { value: "tent", label: "tent" },
  { value: "map", label: "map" },
  { value: "dumbbell", label: "dumbbell" },
  { value: "handHeart", label: "handHeart" },
  { value: "trophy", label: "trophy" },
  { value: "graduationCap", label: "graduationCap" },
  { value: "moonStar", label: "moonStar" },
  { value: "flame", label: "flame" },
];

export const resourceRegistry: Record<string, ResourceConfig> = {
  "site-stats": {
    key: "site-stats",
    label: "إحصاءات الصفحة الرئيسية",
    titleField: "label",
    orderBy: { order: "asc" },
    fields: [
      { name: "value", label: "القيمة (مثال: +300)", type: "text" },
      { name: "label", label: "الوصف", type: "text" },
      { name: "order", label: "الترتيب", type: "number" },
    ],
  },
  "scout-stages": {
    key: "scout-stages",
    label: "المراحل الكشفية",
    titleField: "title",
    orderBy: { order: "asc" },
    fields: [
      { name: "slug", label: "المعرّف (بالإنكليزية، فريد)", type: "text" },
      { name: "title", label: "العنوان", type: "text" },
      { name: "ageRange", label: "الفئة العمرية", type: "text" },
      { name: "description", label: "الوصف", type: "textarea" },
      { name: "icon", label: "الأيقونة", type: "select", options: scoutIconOptions },
      { name: "order", label: "الترتيب", type: "number" },
    ],
  },
  activities: {
    key: "activities",
    label: "الأنشطة",
    titleField: "title",
    orderBy: { order: "asc" },
    fields: [
      { name: "slug", label: "المعرّف (بالإنكليزية، فريد)", type: "text" },
      { name: "title", label: "العنوان", type: "text" },
      { name: "description", label: "الوصف", type: "textarea" },
      { name: "icon", label: "الأيقونة", type: "select", options: activityIconOptions },
      { name: "order", label: "الترتيب", type: "number" },
    ],
  },
  events: {
    key: "events",
    label: "المناسبات القادمة",
    titleField: "title",
    orderBy: { order: "asc" },
    fields: [
      { name: "title", label: "العنوان", type: "text" },
      { name: "date", label: "التاريخ", type: "text" },
      { name: "location", label: "المكان", type: "text" },
      { name: "groupName", label: "المجموعة المعنية", type: "text" },
      { name: "description", label: "الوصف", type: "textarea" },
      { name: "order", label: "الترتيب", type: "number" },
    ],
  },
  camps: {
    key: "camps",
    label: "المخيمات",
    titleField: "title",
    orderBy: { order: "asc" },
    fields: [
      { name: "title", label: "العنوان", type: "text" },
      { name: "year", label: "السنة", type: "text" },
      { name: "location", label: "المكان", type: "text" },
      { name: "summary", label: "الملخص", type: "textarea" },
      { name: "order", label: "الترتيب", type: "number" },
    ],
  },
  milestones: {
    key: "milestones",
    label: "محطات مسيرة الفوج",
    titleField: "title",
    orderBy: { order: "asc" },
    fields: [
      { name: "year", label: "السنة", type: "text" },
      { name: "title", label: "العنوان", type: "text" },
      { name: "description", label: "الوصف", type: "textarea" },
      { name: "order", label: "الترتيب", type: "number" },
    ],
  },
  values: {
    key: "values",
    label: "القيم",
    titleField: "title",
    orderBy: { order: "asc" },
    fields: [
      { name: "slug", label: "المعرّف (بالإنكليزية، فريد)", type: "text" },
      { name: "title", label: "العنوان", type: "text" },
      { name: "order", label: "الترتيب", type: "number" },
    ],
  },
  news: {
    key: "news",
    label: "الأخبار",
    titleField: "title",
    orderBy: { order: "asc" },
    fields: [
      { name: "title", label: "العنوان", type: "text" },
      { name: "category", label: "التصنيف", type: "text" },
      { name: "date", label: "التاريخ", type: "text" },
      { name: "excerpt", label: "المقتطف", type: "textarea" },
      { name: "order", label: "الترتيب", type: "number" },
    ],
  },
  gallery: {
    key: "gallery",
    label: "معرض الصور",
    titleField: "title",
    orderBy: { order: "asc" },
    fields: [
      { name: "title", label: "العنوان", type: "text" },
      {
        name: "category",
        label: "التصنيف",
        type: "select",
        options: [
          { value: "camps", label: "المخيمات" },
          { value: "activities", label: "الأنشطة" },
          { value: "trips", label: "الرحلات" },
          { value: "training", label: "التدريبات" },
          { value: "events", label: "المناسبات" },
        ],
      },
      {
        name: "size",
        label: "الحجم في الشبكة",
        type: "select",
        options: [
          { value: "large", label: "كبير" },
          { value: "medium", label: "متوسط" },
          { value: "small", label: "صغير" },
        ],
      },
      { name: "order", label: "الترتيب", type: "number" },
    ],
  },
  blog: {
    key: "blog",
    label: "المدونة",
    titleField: "title",
    orderBy: { createdAt: "desc" },
    fields: [
      { name: "slug", label: "الرابط (بالإنكليزية، فريد)", type: "text" },
      { name: "title", label: "العنوان", type: "text" },
      { name: "category", label: "التصنيف", type: "text" },
      { name: "date", label: "التاريخ", type: "text" },
      { name: "author", label: "الكاتب", type: "text" },
      { name: "excerpt", label: "مقتطف قصير", type: "textarea" },
      {
        name: "content",
        label: "نص المقال",
        type: "textarea",
        help: "افصل بين الفقرات بسطر فارغ.",
      },
    ],
  },
  library: {
    key: "library",
    label: "المكتبة",
    titleField: "title",
    orderBy: { order: "asc" },
    fields: [
      { name: "title", label: "العنوان", type: "text" },
      {
        name: "category",
        label: "التصنيف",
        type: "select",
        options: [
          { value: "guides", label: "أدلة تدريبية" },
          { value: "badges", label: "متطلبات الشارات" },
          { value: "forms", label: "استمارات" },
          { value: "songs", label: "أناشيد" },
        ],
      },
      { name: "description", label: "الوصف", type: "textarea" },
      {
        name: "fileType",
        label: "نوع الملف",
        type: "select",
        options: [
          { value: "PDF", label: "PDF" },
          { value: "DOCX", label: "DOCX" },
        ],
      },
      { name: "fileUrl", label: "رابط الملف", type: "text", help: "مثال: /library/file.pdf" },
      { name: "order", label: "الترتيب", type: "number" },
    ],
  },
  "join-pricing": {
    key: "join-pricing",
    label: "أسعار الانتساب",
    titleField: "title",
    orderBy: { order: "asc" },
    fields: [
      { name: "title", label: "العنوان", type: "text" },
      { name: "price", label: "السعر", type: "text" },
      { name: "period", label: "الدورية (سنويًا، لكل مخيم...)", type: "text" },
      { name: "description", label: "الوصف", type: "textarea" },
      { name: "order", label: "الترتيب", type: "number" },
    ],
  },
  "join-schedule": {
    key: "join-schedule",
    label: "جدول الاجتماعات الأسبوعية",
    titleField: "stage",
    orderBy: { order: "asc" },
    fields: [
      { name: "stage", label: "المرحلة الكشفية", type: "text" },
      { name: "ageRange", label: "الفئة العمرية", type: "text" },
      { name: "day", label: "اليوم", type: "text" },
      { name: "time", label: "الوقت", type: "text" },
      { name: "location", label: "المكان", type: "text" },
      { name: "leaders", label: "عدد القادة", type: "number" },
      { name: "order", label: "الترتيب", type: "number" },
    ],
  },
};

export function getResourceConfig(key: string): ResourceConfig | undefined {
  return resourceRegistry[key];
}

// The generic CRUD layer only needs findMany/create/update/delete with
// the same shapes across every Prisma model, so a loose structural
// type is used here deliberately instead of Prisma's per-model types.
type GenericDelegate = any;

export function getDelegate(resource: string): GenericDelegate | null {
  switch (resource) {
    case "site-stats":
      return prisma.siteStat;
    case "scout-stages":
      return prisma.scoutStage;
    case "activities":
      return prisma.activity;
    case "events":
      return prisma.eventItem;
    case "camps":
      return prisma.camp;
    case "milestones":
      return prisma.milestone;
    case "values":
      return prisma.valueItem;
    case "news":
      return prisma.newsItem;
    case "gallery":
      return prisma.galleryItem;
    case "blog":
      return prisma.blogPost;
    case "library":
      return prisma.libraryResource;
    case "join-pricing":
      return prisma.joinPricing;
    case "join-schedule":
      return prisma.joinSchedule;
    default:
      return null;
  }
}

/** Coerces raw form-data strings into the right JS types per field config. */
export function coerceFormData(
  config: ResourceConfig,
  formData: FormData
): Record<string, string | number> {
  const data: Record<string, string | number> = {};
  for (const field of config.fields) {
    const raw = formData.get(field.name);
    if (raw === null) continue;
    data[field.name] = field.type === "number" ? Number(raw) || 0 : String(raw);
  }
  return data;
}
