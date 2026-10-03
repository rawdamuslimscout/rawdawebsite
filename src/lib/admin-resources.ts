import { prisma } from "@/lib/prisma";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "relation" // pick one item from another section (e.g. a leader's stage)
  | "slug" // technical identifier — never shown to the admin, generated automatically
  | "file"
  | "file-multiple";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  help?: string;
  uploadTo?: string;
  accept?: string;
  /** Not required to save. Fields are required unless this is set. */
  optional?: boolean;
  /** File fields only: the file must be chosen when creating a new item. */
  requiredOnCreate?: boolean;
  /** relation fields: the resource key whose items are offered as choices. */
  relation?: string;
  /** slug fields: prefix for the auto-generated identifier. */
  slugPrefix?: string;
  /** Kept in the data but not shown in the form. */
  hidden?: boolean;
  placeholder?: string;
};

export type ResourceGroup = "home" | "join" | "content";

export const resourceGroups: Record<ResourceGroup, string> = {
  home: "الصفحة الرئيسية",
  join: "صفحة «انضم إلينا»",
  content: "المدونة والمكتبة",
};

export type ResourceConfig = {
  key: string;
  label: string; // Arabic label shown in the admin nav
  group: ResourceGroup;
  /** One item, e.g. "خبر" — used in buttons: "إضافة خبر جديد". */
  singular: string;
  /** Where this content appears on the public site, in plain words. */
  description: string;
  /** Public page/anchor that shows this content ("شاهد في الموقع"). */
  siteHref: string;
  fields: FieldConfig[];
  titleField: string; // which field represents each row in the list
  subtitleField?: string; // small grey line under the title in the list
  thumbField?: string; // image column (or JSON array of images) shown as a thumbnail
  /** When set, the site orders items itself, so manual ordering is hidden. */
  autoSortNote?: string;
  orderBy: Record<string, "asc" | "desc">;
};

const scoutIconOptions = [
  { value: "sprout", label: "نبتة" },
  { value: "tent", label: "خيمة" },
  { value: "compass", label: "بوصلة" },
  { value: "flag", label: "علم" },
  { value: "mountain", label: "جبل" },
  { value: "shield", label: "درع" },
];

const activityIconOptions = [
  { value: "tent", label: "خيمة" },
  { value: "map", label: "خريطة (رحلات)" },
  { value: "dumbbell", label: "رياضة" },
  { value: "handHeart", label: "خدمة وعطاء" },
  { value: "trophy", label: "كأس (مسابقات)" },
  { value: "graduationCap", label: "قبعة تخرّج (تدريب)" },
  { value: "moonStar", label: "هلال ونجمة (سهرات)" },
  { value: "flame", label: "نار المخيم" },
];

export const resourceRegistry: Record<string, ResourceConfig> = {
  "site-stats": {
    key: "site-stats",
    label: "إحصاءات الصفحة الرئيسية",
    group: "home",
    singular: "رقم",
    description:
      "الشريط الذي يحمل الأرقام تحت الصورة الرئيسية. يُنصح بثلاثة أرقام فقط ليبقى الشكل مرتبًا.",
    siteHref: "/",
    titleField: "label",
    subtitleField: "value",
    orderBy: { order: "asc" },
    fields: [
      {
        name: "value",
        label: "الرقم",
        type: "text",
        placeholder: "مثال: +300",
        help: "اكتب الرقم كما تريده أن يظهر، مثل +300 أو 15.",
      },
      {
        name: "label",
        label: "الوصف تحت الرقم",
        type: "text",
        placeholder: "مثال: كشاف وكشافة",
      },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  "scout-stages": {
    key: "scout-stages",
    label: "المراحل الكشفية",
    group: "home",
    singular: "مرحلة",
    description:
      "بطاقات «المراحل الكشفية» في الصفحة الرئيسية، وتفاصيل كل مرحلة تظهر عند الضغط على البطاقة.",
    siteHref: "/#sections",
    titleField: "title",
    subtitleField: "ageRange",
    thumbField: "imageUrl",
    orderBy: { order: "asc" },
    fields: [
      { name: "slug", label: "المعرّف", type: "slug", slugPrefix: "stage" },
      { name: "title", label: "اسم المرحلة", type: "text" },
      {
        name: "ageRange",
        label: "الفئة العمرية",
        type: "text",
        placeholder: "مثال: ٦ – ٨ سنوات",
      },
      { name: "description", label: "وصف قصير", type: "textarea" },
      {
        name: "icon",
        label: "الأيقونة على البطاقة",
        type: "select",
        options: scoutIconOptions,
      },
      {
        name: "imageUpload",
        label: "صورة المرحلة",
        type: "file",
        uploadTo: "imageUrl",
        accept: "image/*",
        optional: true,
        help: "اختيارية. اختر صورة واضحة من جهازك، ويتم تصغيرها ورفعها تلقائيًا.",
      },
      {
        name: "fileUpload",
        label: "ملف المنهج (اختياري)",
        type: "file",
        uploadTo: "fileUrl",
        accept: ".pdf,.doc,.docx",
        optional: true,
        help: "اختياري. ملف PDF أو Word لمنهج المرحلة أو مطالبها (حتى 4 ميغابايت).",
      },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  "scout-leaders": {
    key: "scout-leaders",
    label: "قادة المراحل الكشفية",
    group: "home",
    singular: "قائد",
    description:
      "تظهر داخل نافذة كل مرحلة كشفية (تبويب «القادة») عند الضغط على بطاقة المرحلة في الصفحة الرئيسية.",
    siteHref: "/#sections",
    titleField: "name",
    subtitleField: "stageId",
    thumbField: "photoUrl",
    orderBy: { order: "asc" },
    fields: [
      {
        name: "stageId",
        label: "المرحلة",
        type: "relation",
        relation: "scout-stages",
        help: "اختر المرحلة التي يقودها هذا القائد. أضف المرحلة أولًا من قسم «المراحل الكشفية» إن لم تجدها.",
      },
      { name: "name", label: "اسم القائد/ة", type: "text" },
      {
        name: "rank",
        label: "الرتبة الكشفية",
        type: "text",
        placeholder: "مثال: قائد فوج",
      },
      {
        name: "role",
        label: "الدور في الفوج",
        type: "text",
        placeholder: "مثال: قائد مرحلة الأشبال",
      },
      { name: "bio", label: "نبذة قصيرة", type: "textarea" },
      {
        name: "photoUpload",
        label: "الصورة الشخصية",
        type: "file",
        uploadTo: "photoUrl",
        accept: "image/*",
        optional: true,
        help: "اختيارية. صورة واضحة للوجه.",
      },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  activities: {
    key: "activities",
    label: "الأنشطة",
    group: "home",
    singular: "نشاط",
    description:
      "الشريط البنفسجي «الأنشطة» في الصفحة الرئيسية، كل نشاط ببطاقة صغيرة وأيقونة.",
    siteHref: "/#activities",
    titleField: "title",
    orderBy: { order: "asc" },
    fields: [
      { name: "slug", label: "المعرّف", type: "slug", slugPrefix: "activity" },
      { name: "title", label: "اسم النشاط", type: "text" },
      { name: "description", label: "الوصف", type: "textarea" },
      {
        name: "icon",
        label: "الأيقونة",
        type: "select",
        options: activityIconOptions,
      },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  events: {
    key: "events",
    label: "المناسبات القادمة",
    group: "home",
    singular: "مناسبة",
    description:
      "تظهر في قسم «آخر ما يحدث في الفوج» مع الأخبار والمخيمات (وسمها: مناسبة).",
    siteHref: "/#news",
    titleField: "title",
    subtitleField: "date",
    orderBy: { order: "asc" },
    fields: [
      { name: "title", label: "عنوان المناسبة", type: "text" },
      {
        name: "date",
        label: "التاريخ",
        type: "text",
        placeholder: "مثال: ١٥ تشرين الأول",
      },
      { name: "location", label: "المكان", type: "text" },
      {
        name: "groupName",
        label: "الفئة المعنية",
        type: "text",
        placeholder: "مثال: الأشبال والزهرات",
      },
      { name: "description", label: "الوصف", type: "textarea" },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  camps: {
    key: "camps",
    label: "المخيمات",
    group: "home",
    singular: "مخيم",
    description:
      "تظهر في قسم «آخر ما يحدث في الفوج» مع الأخبار والمناسبات (وسمها: مخيم).",
    siteHref: "/#camps",
    titleField: "title",
    subtitleField: "year",
    orderBy: { order: "asc" },
    fields: [
      { name: "title", label: "اسم المخيم", type: "text" },
      { name: "year", label: "السنة", type: "text", placeholder: "مثال: ٢٠٢٦" },
      { name: "location", label: "المكان", type: "text" },
      { name: "summary", label: "نبذة عن المخيم", type: "textarea" },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  milestones: {
    key: "milestones",
    label: "محطات مسيرة الفوج",
    group: "home",
    singular: "محطة",
    description:
      "الخط الزمني «محطات من مسيرة الفوج» في الصفحة الرئيسية.",
    siteHref: "/#history",
    titleField: "title",
    subtitleField: "year",
    autoSortNote:
      "تُرتَّب المحطات تلقائيًا في الموقع من الأقدم إلى الأحدث حسب السنة، لذلك لا حاجة لترتيبها يدويًا.",
    orderBy: { order: "asc" },
    fields: [
      {
        name: "year",
        label: "السنة",
        type: "text",
        placeholder: "مثال: ٢٠١٥",
        help: "اكتب سنة واحدة فقط (أرقامًا) لتترتّب المحطات بشكل صحيح.",
      },
      { name: "title", label: "العنوان", type: "text" },
      { name: "description", label: "الوصف", type: "textarea" },
      { name: "order", label: "الترتيب", type: "number", optional: true, hidden: true },
    ],
  },
  values: {
    key: "values",
    label: "القيم",
    group: "home",
    singular: "قيمة",
    description: "قائمة «قيمنا» المرقّمة في الصفحة الرئيسية.",
    siteHref: "/#values",
    titleField: "title",
    orderBy: { order: "asc" },
    fields: [
      { name: "slug", label: "المعرّف", type: "slug", slugPrefix: "value" },
      { name: "title", label: "القيمة", type: "text", placeholder: "مثال: الأمانة" },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  news: {
    key: "news",
    label: "الأخبار",
    group: "home",
    singular: "خبر",
    description:
      "قسم «آخر ما يحدث في الفوج» في الصفحة الرئيسية. الصورة الأولى تظهر على البطاقة وباقي الصور داخل الخبر.",
    siteHref: "/#news",
    titleField: "title",
    subtitleField: "date",
    thumbField: "imageUrls",
    orderBy: { order: "asc" },
    fields: [
      { name: "title", label: "عنوان الخبر", type: "text" },
      {
        name: "category",
        label: "التصنيف",
        type: "text",
        placeholder: "مثال: مخيم، دورة، رحلة",
      },
      {
        name: "date",
        label: "التاريخ",
        type: "text",
        placeholder: "مثال: ١٢ أيلول ٢٠٢٦",
      },
      { name: "excerpt", label: "نص الخبر", type: "textarea" },
      {
        name: "imageUploads",
        label: "صور الخبر",
        type: "file-multiple",
        uploadTo: "imageUrls",
        accept: "image/*",
        optional: true,
        help: "اختيارية. يمكنك اختيار عدة صور معًا، وستظهر كمعرض داخل الخبر.",
      },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  gallery: {
    key: "gallery",
    label: "معرض الصور",
    group: "home",
    singular: "صورة",
    description:
      "قسم «معرض الصور» في الصفحة الرئيسية. يمكنك أيضًا اختيار صورتين منها لقسم «عن الفوج» من الإعدادات العامة.",
    siteHref: "/#gallery",
    titleField: "title",
    subtitleField: "category",
    thumbField: "imageUrl",
    orderBy: { order: "asc" },
    fields: [
      { name: "title", label: "عنوان الصورة", type: "text" },
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
        label: "حجم الصورة في المعرض",
        type: "select",
        options: [
          { value: "large", label: "كبيرة" },
          { value: "medium", label: "متوسطة" },
          { value: "small", label: "صغيرة" },
        ],
      },
      {
        name: "imageUpload",
        label: "الصورة",
        type: "file",
        uploadTo: "imageUrl",
        accept: "image/*",
        optional: true,
        requiredOnCreate: true,
        help: "اختر صورة من جهازك. لا تحتاج إلى نسخ أي رابط.",
      },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  blog: {
    key: "blog",
    label: "المدونة",
    group: "content",
    singular: "مقال",
    description: "صفحة «المدونة» ومقالاتها. المقالات الأحدث تظهر أولًا.",
    siteHref: "/blog",
    titleField: "title",
    subtitleField: "date",
    orderBy: { createdAt: "desc" },
    fields: [
      { name: "slug", label: "الرابط", type: "slug", slugPrefix: "post" },
      { name: "title", label: "عنوان المقال", type: "text" },
      {
        name: "category",
        label: "التصنيف",
        type: "text",
        placeholder: "مثال: قيادة، مهارات كشفية",
      },
      { name: "date", label: "التاريخ", type: "text", placeholder: "مثال: ٣ تشرين الأول ٢٠٢٦" },
      { name: "author", label: "الكاتب", type: "text" },
      { name: "excerpt", label: "مقتطف قصير", type: "textarea" },
      {
        name: "content",
        label: "نص المقال",
        type: "textarea",
        help: "اترك سطرًا فارغًا بين كل فقرة وأخرى.",
      },
    ],
  },
  library: {
    key: "library",
    label: "المكتبة",
    group: "content",
    singular: "ملف",
    description: "صفحة «المكتبة»: أدلة، متطلبات شارات، استمارات وأناشيد للتحميل.",
    siteHref: "/library",
    titleField: "title",
    subtitleField: "category",
    orderBy: { order: "asc" },
    fields: [
      { name: "title", label: "عنوان الملف", type: "text" },
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
      { name: "description", label: "وصف قصير", type: "textarea" },
      {
        name: "fileUpload",
        label: "الملف (PDF أو Word)",
        type: "file",
        uploadTo: "fileUrl",
        accept: ".pdf,.doc,.docx",
        optional: true,
        requiredOnCreate: true,
        help: "اختر الملف من جهازك (حتى 4 ميغابايت). عند التعديل، اتركه فارغًا للإبقاء على الملف الحالي.",
      },
      {
        name: "fileType",
        label: "نوع الملف",
        type: "select",
        options: [
          { value: "PDF", label: "PDF" },
          { value: "DOCX", label: "Word" },
        ],
        help: "يتحدّد تلقائيًا عند رفع ملف جديد.",
      },
      {
        name: "fileUrl",
        label: "أو رابط خارجي للملف (اختياري)",
        type: "text",
        optional: true,
        hidden: true,
      },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  "join-pricing": {
    key: "join-pricing",
    label: "أسعار الانتساب",
    group: "join",
    singular: "اشتراك",
    description: "بطاقات الاشتراكات في صفحة «انضم إلينا».",
    siteHref: "/join",
    titleField: "title",
    subtitleField: "price",
    orderBy: { order: "asc" },
    fields: [
      { name: "title", label: "نوع الاشتراك", type: "text", placeholder: "مثال: الانتساب السنوي" },
      { name: "price", label: "السعر", type: "text", placeholder: "مثال: ٢٠$" },
      {
        name: "period",
        label: "المدّة",
        type: "text",
        placeholder: "مثال: سنويًا، لكل مخيم",
      },
      { name: "description", label: "الوصف", type: "textarea" },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  "join-schedule": {
    key: "join-schedule",
    label: "جدول الاجتماعات الأسبوعية",
    group: "join",
    singular: "اجتماع",
    description: "جدول الاجتماعات الأسبوعية لكل مرحلة في صفحة «انضم إلينا».",
    siteHref: "/join",
    titleField: "stage",
    subtitleField: "day",
    orderBy: { order: "asc" },
    fields: [
      { name: "stage", label: "المرحلة الكشفية", type: "text" },
      { name: "ageRange", label: "الفئة العمرية", type: "text" },
      { name: "day", label: "اليوم", type: "text", placeholder: "مثال: السبت" },
      { name: "time", label: "الوقت", type: "text", placeholder: "مثال: ٣:٠٠ – ٥:٠٠ م" },
      { name: "location", label: "المكان", type: "text" },
      { name: "leaders", label: "عدد القادة", type: "number" },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
};

export function getResourceConfig(key: string): ResourceConfig | undefined {
  return resourceRegistry[key];
}

/** Whether this resource has a manual numeric "order" field that quick-reorder buttons can use. */
export function resourceHasOrderField(config: ResourceConfig): boolean {
  if (config.autoSortNote) return false;
  return config.fields.some((f) => f.name === "order" && f.type === "number");
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
    case "scout-leaders":
      return prisma.scoutLeader;
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
  formData: FormData,
): Record<string, string | number> {
  const data: Record<string, string | number> = {};
  for (const field of config.fields) {
    if (
      field.type === "file" ||
      field.type === "file-multiple" ||
      field.type === "slug"
    )
      continue;
    const raw = formData.get(field.name);
    if (raw === null) continue;
    data[field.name] = field.type === "number" ? Number(raw) || 0 : String(raw);
  }
  return data;
}

/** Technical identifier for new items (e.g. "post-lq3k9a2f") — the admin never types this. */
export function generateSlug(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${Date.now().toString(36)}${rand}`;
}
