import { prisma } from "@/lib/prisma";
import { safeHref } from "@/lib/safe-url";
import { parseOneDriveUrl } from "@/lib/onedrive";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date" // calendar day (<input type="date">), stored as a DateTime at 00:00 UTC
  | "select"
  | "relation" // pick one item from another section (e.g. a leader's stage)
  | "location" // map picker: fills the two columns latitude + longitude
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
  /** select fields only: store "true"/"false" as a real boolean. */
  valueType?: "boolean";
  /** Longest accepted text (characters). Defaults: 300 for text, 8000 for textarea. */
  maxLength?: number;
  /** Rendered as a link on the site: only http(s) or site-relative URLs are accepted. */
  url?: boolean;
  /** Must be an email address (or empty when optional). */
  email?: boolean;
  /** A OneDrive link or "Embed" iframe code; stored as the validated URL. */
  oneDrive?: boolean;
};

export type ResourceGroup =
  | "troop"
  | "home"
  | "join"
  | "content"
  | "faq"
  | "structure";

export const resourceGroups: Record<ResourceGroup, string> = {
  troop: "وحدات الفوج",
  home: "الصفحة الرئيسية",
  join: "صفحة «انضم إلينا»",
  content: "المدونة والمكتبة",
  faq: "الأسئلة الشائعة",
  structure: "الهيكل التنظيمي",
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
  /** Prisma `where` limiting which rows of the model belong to this section. */
  scope?: Record<string, unknown>;
  /** Values always written on create/update (e.g. a unit's kind). */
  fixed?: Record<string, string>;
  /** Reordering only swaps rows sharing this column's value (e.g. leaders of one unit). */
  orderScope?: string;
  /** Not listed in the nav or dashboard; edited inside its parent section. */
  navHidden?: boolean;
  /** Sections edited inside each row of this one, linked by `foreignKey`. */
  children?: { resource: string; foreignKey: string; label: string }[];
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
      "شريط الأرقام تحت الصورة الرئيسية. لا يظهر حاليًا في الموقع إلى حين تأكيد الأرقام من قيادة الفوج.",
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
  "troop-units": {
    key: "troop-units",
    label: "الوحدات: الأعمار والاجتماعات والقادة",
    group: "troop",
    singular: "وحدة",
    description:
      "المكان الوحيد لكل وحدة في الفوج: اسمها ومرحلتها وفئتها العمرية وموعد اجتماعها الأسبوعي وقادتها. تظهر في «وحدات الفوج» بصفحة «الهيكل التنظيمي»، وفي جدول الاجتماعات بصفحة «انضم إلينا» والصفحة الرئيسية، ويظهر قادتها في تبويب «القادة» داخل مرحلتها الكشفية.",
    siteHref: "/structure#units",
    titleField: "title",
    subtitleField: "stageId",
    thumbField: "logoUrl",
    orderBy: { order: "asc" },
    scope: { kind: "unit" },
    fixed: { kind: "unit" },
    children: [
      { resource: "unit-leaders", foreignKey: "nodeId", label: "قادة الوحدة" },
    ],
    fields: [
      {
        name: "title",
        label: "اسم الوحدة",
        type: "text",
        maxLength: 200,
        placeholder: "مثال: قطيع الكوالا",
      },
      {
        name: "section",
        label: "القسم",
        type: "text",
        optional: true,
        placeholder: "مثال: الأشبال (ذكور)",
        help: "يظهر بعد اسم الوحدة في جدول الاجتماعات.",
      },
      {
        name: "stageId",
        label: "المرحلة الكشفية",
        type: "relation",
        relation: "scout-stages",
        help: "يظهر قادة الوحدة في تبويب «القادة» داخل هذه المرحلة.",
      },
      {
        name: "ageRange",
        label: "الفئة العمرية",
        type: "text",
        optional: true,
        placeholder: "مثال: من ٩ إلى ١١ سنة",
        help: "اتركها فارغة لاستخدام الفئة العمرية للمرحلة الكشفية.",
      },
      {
        name: "meetingDay",
        label: "يوم الاجتماع",
        type: "text",
        optional: true,
        placeholder: "مثال: السبت",
        help: "الوحدة التي لها يوم اجتماع تظهر في جدول الاجتماعات الأسبوعية.",
      },
      {
        name: "meetingTime",
        label: "وقت الاجتماع",
        type: "text",
        optional: true,
        placeholder: "مثال: ٣:٠٠ – ٥:٠٠ م",
      },
      {
        name: "meetingLocation",
        label: "مكان الاجتماع",
        type: "text",
        optional: true,
        placeholder: "مثال: مدرسة روضة الفيحاء — المعرض",
      },
      {
        name: "parentId",
        label: "يتبع لـ",
        type: "relation",
        relation: "org-nodes",
        help: "الفوج الذي تتبع له الوحدة.",
      },
      {
        name: "description",
        label: "نبذة (اختياري)",
        type: "textarea",
        optional: true,
        maxLength: 2000,
      },
      {
        name: "logoUpload",
        label: "الشعار (اختياري)",
        type: "file",
        uploadTo: "logoUrl",
        accept: "image/*",
        optional: true,
      },
      {
        name: "isPublished",
        label: "الحالة",
        type: "select",
        valueType: "boolean",
        options: [
          { value: "true", label: "ظاهر في الموقع" },
          { value: "false", label: "مخفي (مسودة)" },
        ],
      },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  "unit-leaders": {
    key: "unit-leaders",
    label: "قادة الوحدات",
    group: "troop",
    singular: "قائد",
    description: "قادة كل وحدة، ويُدارون من داخل صفحة الوحدات.",
    siteHref: "/structure#units",
    titleField: "title",
    subtitleField: "personId",
    orderBy: { order: "asc" },
    scope: { node: { kind: "unit" } },
    orderScope: "nodeId",
    navHidden: true,
    fields: [
      {
        name: "nodeId",
        label: "الوحدة",
        type: "relation",
        relation: "troop-units",
      },
      {
        name: "personId",
        label: "الشخص",
        type: "relation",
        relation: "org-people",
        help: "إن لم تجد الشخص، أضف ملفه أولًا من «الأشخاص» في قسم «الهيكل التنظيمي».",
      },
      {
        name: "title",
        label: "الدور في الوحدة",
        type: "text",
        maxLength: 150,
        placeholder: "مثال: قائد القطيع",
      },
      {
        name: "responsibilities",
        label: "المهام والمسؤوليات (اختياري)",
        type: "textarea",
        optional: true,
        maxLength: 2000,
      },
      {
        name: "isPublished",
        label: "الحالة",
        type: "select",
        valueType: "boolean",
        options: [
          { value: "true", label: "ظاهر" },
          { value: "false", label: "مخفي" },
        ],
      },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  "scout-stages": {
    key: "scout-stages",
    label: "المراحل الكشفية",
    group: "troop",
    singular: "مرحلة",
    description:
      "بطاقات «المراحل الكشفية» في الصفحة الرئيسية، وتفاصيل كل مرحلة تظهر عند الضغط على البطاقة. قادة المرحلة هم قادة الوحدات المرتبطة بها، ويُضافون من صفحة الوحدات.",
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
  activities: {
    key: "activities",
    label: "الأنشطة",
    group: "home",
    singular: "نشاط",
    description:
      "قسم «أنشطتنا» في صفحة «من نحن»، كل نشاط ببطاقة صغيرة وأيقونة.",
    siteHref: "/about",
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
    label: "المناسبات",
    group: "home",
    singular: "مناسبة",
    description:
      "تظهر في قسم «آخر الأخبار» في الصفحة الرئيسية تحت عنوان «المناسبات القادمة»، فقط إذا أُدخل لها تاريخ بداية أو نهاية لم يمرّ بعد، وتختفي تلقائيًا بعد انتهائه. المناسبة بلا تاريخ لا تظهر.",
    siteHref: "/",
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
        help: "النص الذي يظهر للزوار كما تكتبه.",
      },
      {
        name: "startDate",
        label: "تاريخ البداية",
        type: "date",
        optional: true,
        help: "يُستخدم لمعرفة إن كانت المناسبة قادمة أم انتهت. المناسبة التي مرّ تاريخ نهايتها (أو تاريخ بدايتها إن لم يوجد تاريخ نهاية) تُعتبر سابقة تلقائيًا. إن تُرك فارغًا تظهر المناسبة بلا وسم «قادمة».",
      },
      {
        name: "endDate",
        label: "تاريخ النهاية",
        type: "date",
        optional: true,
        help: "اختياري، للمناسبات التي تمتد أكثر من يوم. يجب ألا يسبق تاريخ البداية.",
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
      "تظهر في صفحة «من نحن» في قسم «من مخيماتنا ورحلاتنا».",
    siteHref: "/about#camps",
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
  places: {
    key: "places",
    label: "أماكن الخريطة",
    group: "home",
    singular: "مكان",
    description:
      "قسم «أماكن من رحلتنا الكشفية» في صفحة «من نحن»: خريطة بالمخيمات والرحلات والدورات والأنشطة. لا يظهر على الخريطة إلا المكان الذي حُدّد موقعه وحالته «ظاهر».",
    siteHref: "/about#map",
    titleField: "title",
    subtitleField: "locationName",
    thumbField: "imageUrl",
    orderBy: { order: "asc" },
    fields: [
      {
        name: "title",
        label: "اسم النشاط",
        type: "text",
        placeholder: "مثال: دورة الدرجة الأولى",
      },
      {
        name: "category",
        label: "نوع النشاط",
        type: "select",
        options: [
          { value: "camps", label: "مخيم" },
          { value: "trips", label: "رحلة" },
          { value: "training", label: "تدريب" },
          { value: "service", label: "خدمة مجتمعية" },
          { value: "events", label: "مناسبة" },
          { value: "hikes", label: "مسير" },
        ],
      },
      {
        name: "locationName",
        label: "اسم المكان",
        type: "text",
        placeholder: "مثال: غابة العذر – فنيدق",
      },
      {
        name: "location",
        label: "الموقع على الخريطة",
        type: "location",
        help: "ابحث عن المكان بالاسم أو اضغط على الخريطة لتحديده، ثم تأكد أن الدبوس في المكان الصحيح قبل الحفظ.",
      },
      {
        name: "dateText",
        label: "التاريخ",
        type: "text",
        optional: true,
        placeholder: "مثال: ١٦–١٩ تموز ٢٠٢٦",
      },
      {
        name: "participants",
        label: "عدد المشاركين",
        type: "number",
        optional: true,
        help: "اتركه ٠ إن لم يكن العدد معروفًا، ولن يظهر في الموقع.",
      },
      {
        name: "description",
        label: "نبذة قصيرة",
        type: "textarea",
        optional: true,
        maxLength: 1000,
      },
      {
        name: "imageUpload",
        label: "صورة المكان",
        type: "file",
        uploadTo: "imageUrl",
        accept: "image/*",
        optional: true,
        help: "اختيارية. تظهر على بطاقة المكان.",
      },
      {
        name: "newsId",
        label: "الخبر المرتبط (اختياري)",
        type: "relation",
        relation: "news",
        optional: true,
        help: "عند اختيار خبر يظهر زر «عرض التفاصيل» على البطاقة ويفتح الخبر كاملًا.",
      },
      {
        name: "isPublished",
        label: "الحالة",
        type: "select",
        valueType: "boolean",
        options: [
          { value: "true", label: "ظاهر على الخريطة" },
          { value: "false", label: "مخفي (مسودة)" },
        ],
      },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  milestones: {
    key: "milestones",
    label: "محطات مسيرة الفوج",
    group: "home",
    singular: "محطة",
    description: "الخط الزمني «محطات من مسيرة الفوج» في صفحة «من نحن».",
    siteHref: "/about",
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
      {
        name: "order",
        label: "الترتيب",
        type: "number",
        optional: true,
        hidden: true,
      },
    ],
  },
  values: {
    key: "values",
    label: "القيم",
    group: "home",
    singular: "قيمة",
    description: "قائمة «قيمنا» في صفحة «من نحن».",
    siteHref: "/about",
    titleField: "title",
    orderBy: { order: "asc" },
    fields: [
      { name: "slug", label: "المعرّف", type: "slug", slugPrefix: "value" },
      {
        name: "title",
        label: "القيمة",
        type: "text",
        placeholder: "مثال: الأمانة",
      },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  news: {
    key: "news",
    label: "الأخبار",
    group: "home",
    singular: "خبر",
    description:
      "لكل خبر صفحة خاصة، ويظهر في صفحة «الأخبار والمقالات»، وتظهر أحدث ثلاثة أخبار لها تاريخ في قسم «آخر الأخبار» في الصفحة الرئيسية (يُخفى القسم إذا قلّ عددها عن خبرين). الصورة الأولى تظهر على البطاقة وباقي الصور داخل الخبر.",
    siteHref: "/news",
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
      {
        name: "publishedAt",
        label: "تاريخ النشر",
        type: "date",
        optional: true,
      },
      { name: "excerpt", label: "نص الخبر", type: "textarea" },
      {
        name: "body",
        label: "نص الخبر الكامل",
        type: "textarea",
        optional: true,
        maxLength: 60000,
        help: "اختياري. اترك سطرًا فارغًا بين كل فقرة وأخرى.",
      },
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
      "صفحة «معرض الصور»، وتظهر أول ثماني صور منها في الصفحة الرئيسية. يمكنك أيضًا اختيار صورتين منها لقسم «عن الفوج» من الإعدادات العامة.",
    siteHref: "/gallery",
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
    description: "مقالات المدونة، وتظهر مع الأخبار في صفحة «الأخبار والمقالات». المقالات الأحدث تظهر أولًا.",
    siteHref: "/news",
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
      {
        name: "date",
        label: "التاريخ",
        type: "text",
        placeholder: "مثال: ٣ تشرين الأول ٢٠٢٦",
      },
      {
        name: "publishedAt",
        label: "تاريخ النشر",
        type: "date",
        optional: true,
        help: "اختياري. تُرتَّب المقالات حسبه، والأحدث أولًا.",
      },
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
    description:
      "صفحة «المكتبة»: أدلة، متطلبات شارات، استمارات وأناشيد للتحميل.",
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
        help: "اختر الملف من جهازك (حتى 4 ميغابايت)، أو اتركه فارغًا وأضف رابط OneDrive بالأسفل. عند التعديل، اتركه فارغًا للإبقاء على الملف الحالي.",
      },
      {
        name: "oneDriveUrl",
        label: "رابط OneDrive (اختياري)",
        type: "text",
        optional: true,
        oneDrive: true,
        maxLength: 2000,
        placeholder: "https://1drv.ms/…",
        help: "للمعاينة داخل الموقع: افتح الملف في OneDrive ← «تضمين» (Embed) ← انسخ الرمز والصقه هنا. يمكن أيضًا لصق رابط مشاركة «أي شخص لديه الرابط يمكنه العرض»، وسيظهر حينها زر «فتح في OneDrive» بدل المعاينة.",
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
        url: true,
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
      {
        name: "title",
        label: "نوع الاشتراك",
        type: "text",
        placeholder: "مثال: الانتساب السنوي",
      },
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
  faqs: {
    key: "faqs",
    label: "الأسئلة الشائعة",
    group: "faq",
    singular: "سؤال",
    description:
      "صفحة «الأسئلة الشائعة». لا يظهر للزوار إلا ما كانت حالته «ظاهر في الموقع».",
    siteHref: "/faq",
    titleField: "question",
    subtitleField: "category",
    orderBy: { order: "asc" },
    fields: [
      { name: "question", label: "السؤال", type: "text", maxLength: 300 },
      { name: "answer", label: "الجواب", type: "textarea", maxLength: 5000 },
      {
        name: "category",
        label: "التصنيف",
        type: "select",
        options: [
          { value: "about", label: "عن الجمعية والفوج" },
          { value: "joining", label: "الانتساب والانضمام" },
          { value: "activities", label: "الأنشطة والمخيمات" },
          { value: "training", label: "التدريب والتأهيل" },
          { value: "contact", label: "التواصل والاستفسارات" },
        ],
      },
      {
        name: "isPublished",
        label: "الحالة",
        type: "select",
        valueType: "boolean",
        options: [
          { value: "true", label: "ظاهر في الموقع" },
          { value: "false", label: "مخفي (مسودة)" },
        ],
      },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  "org-nodes": {
    key: "org-nodes",
    label: "مستويات الهيكل (جمعية، مفوضية، فوج، مجلس…)",
    group: "structure",
    singular: "مستوى",
    description:
      "صفحة «الهيكل التنظيمي». كل مستوى يتبع مستوى أعلى منه. لا يظهر للزوار إلا المستوى الذي حالته «ظاهر» وكل ما فوقه ظاهر أيضًا. الوحدات تُدار من صفحة «الوحدات» في قسم «وحدات الفوج».",
    siteHref: "/structure",
    titleField: "title",
    subtitleField: "kind",
    thumbField: "logoUrl",
    orderBy: { order: "asc" },
    scope: { kind: { not: "unit" } },
    fields: [
      {
        name: "kind",
        label: "نوع المستوى",
        type: "select",
        options: [
          { value: "association", label: "الجمعية" },
          { value: "governorate", label: "المفوضية" },
          { value: "troop", label: "الفوج" },
          { value: "dean", label: "عميد الفوج" },
          { value: "council", label: "مجلس الفوج" },
          { value: "other", label: "أخرى" },
        ],
      },
      { name: "title", label: "الاسم", type: "text", maxLength: 200 },
      {
        name: "parentId",
        label: "يتبع لـ",
        type: "relation",
        relation: "org-nodes",
        optional: true,
        help: "اختر المستوى الأعلى. اتركه فارغًا للجمعية فقط.",
      },
      {
        name: "description",
        label: "نبذة (اختياري)",
        type: "textarea",
        optional: true,
        maxLength: 2000,
        help: "اكتب معلومات صحيحة فقط. إن لم تكن لديك معلومات اتركه فارغًا.",
      },
      {
        name: "logoUpload",
        label: "الشعار (اختياري)",
        type: "file",
        uploadTo: "logoUrl",
        accept: "image/*",
        optional: true,
        help: "استخدم شعارًا مصرّحًا باستخدامه فقط.",
      },
      {
        name: "isPublished",
        label: "الحالة",
        type: "select",
        valueType: "boolean",
        options: [
          { value: "false", label: "مخفي (مسودة)" },
          { value: "true", label: "ظاهر في الموقع" },
        ],
      },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  "org-people": {
    key: "org-people",
    label: "الأشخاص (ملفات القادة والأعضاء)",
    group: "structure",
    singular: "شخص",
    description:
      "ملف تعريفي لكل شخص. لا يظهر أي شخص للزوار إلا إذا كانت حالته «ظاهر» وكان مربوطًا بمنصب ظاهر. لا تُكتب هنا أرقام هواتف أو عناوين.",
    siteHref: "/structure",
    titleField: "fullName",
    subtitleField: "rank",
    thumbField: "photoUrl",
    orderBy: { fullName: "asc" },
    fields: [
      { name: "fullName", label: "الاسم الكامل", type: "text", maxLength: 150 },
      { name: "rank", label: "الرتبة الكشفية", type: "text", optional: true },
      {
        name: "section",
        label: "المرحلة / القسم الحالي",
        type: "text",
        optional: true,
      },
      {
        name: "education",
        label: "المؤهل العلمي",
        type: "text",
        optional: true,
      },
      { name: "fieldOfStudy", label: "التخصص", type: "text", optional: true },
      { name: "occupation", label: "المهنة", type: "text", optional: true },
      {
        name: "bio",
        label: "نبذة قصيرة",
        type: "textarea",
        optional: true,
        maxLength: 2000,
      },
      {
        name: "photoUpload",
        label: "الصورة الشخصية",
        type: "file",
        uploadTo: "photoUrl",
        accept: "image/*",
        optional: true,
        help: "اختيارية، وبموافقة صاحبها.",
      },
      {
        name: "showEducation",
        label: "إظهار المؤهل والتخصص",
        type: "select",
        valueType: "boolean",
        options: [
          { value: "true", label: "نعم" },
          { value: "false", label: "لا" },
        ],
      },
      {
        name: "showOccupation",
        label: "إظهار المهنة",
        type: "select",
        valueType: "boolean",
        options: [
          { value: "true", label: "نعم" },
          { value: "false", label: "لا" },
        ],
      },
      {
        name: "isPublic",
        label: "ظهور الملف للزوار",
        type: "select",
        valueType: "boolean",
        options: [
          { value: "false", label: "مخفي" },
          { value: "true", label: "ظاهر" },
        ],
      },
    ],
  },
  "org-assignments": {
    key: "org-assignments",
    label: "المناصب (ربط الأشخاص بالمستويات)",
    group: "structure",
    singular: "منصب",
    description:
      "هنا تربط الشخص بمستوى (عميد، أمين سر، عضو مجلس…). يمكن للشخص الواحد أن يكون له أكثر من منصب. قادة الوحدات يُضافون من صفحة «الوحدات».",
    siteHref: "/structure",
    titleField: "title",
    subtitleField: "personId",
    orderBy: { order: "asc" },
    scope: { node: { kind: { not: "unit" } } },
    orderScope: "nodeId",
    fields: [
      {
        name: "personId",
        label: "الشخص",
        type: "relation",
        relation: "org-people",
      },
      {
        name: "nodeId",
        label: "المستوى",
        type: "relation",
        relation: "org-nodes",
      },
      {
        name: "title",
        label: "المنصب",
        type: "text",
        maxLength: 150,
        placeholder: "مثال: أمين السر",
      },
      {
        name: "responsibilities",
        label: "المهام والمسؤوليات (اختياري)",
        type: "textarea",
        optional: true,
        maxLength: 2000,
      },
      {
        name: "contactEmail",
        label: "بريد التواصل الخاص بالمنصب (اختياري)",
        type: "text",
        optional: true,
        email: true,
        maxLength: 200,
        placeholder: "مثال: secretary@rawdamuslimscout.org",
        help: "بريد المنصب نفسه (لا البريد الشخصي)، ويظهر للزوار على بطاقة صاحب المنصب.",
      },
      {
        name: "isPublished",
        label: "الحالة",
        type: "select",
        valueType: "boolean",
        options: [
          { value: "true", label: "ظاهر" },
          { value: "false", label: "مخفي" },
        ],
      },
      { name: "order", label: "الترتيب", type: "number", optional: true },
    ],
  },
  "org-qualifications": {
    key: "org-qualifications",
    label: "الدورات والمؤهلات",
    group: "structure",
    singular: "دورة أو مؤهل",
    description:
      "الدورات التدريبية والمؤهلات التي تظهر في الملف التعريفي للشخص.",
    siteHref: "/structure",
    titleField: "title",
    subtitleField: "personId",
    orderBy: { order: "asc" },
    fields: [
      {
        name: "personId",
        label: "الشخص",
        type: "relation",
        relation: "org-people",
      },
      {
        name: "kind",
        label: "النوع",
        type: "select",
        options: [
          { value: "course", label: "دورة تدريبية" },
          { value: "education", label: "مؤهل علمي" },
        ],
      },
      { name: "title", label: "العنوان", type: "text", maxLength: 200 },
      {
        name: "issuer",
        label: "الجهة (اختياري)",
        type: "text",
        optional: true,
      },
      { name: "year", label: "السنة (اختياري)", type: "text", optional: true },
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
    case "activities":
      return prisma.activity;
    case "events":
      return prisma.eventItem;
    case "camps":
      return prisma.camp;
    case "places":
      return prisma.scoutPlace;
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
    case "faqs":
      return prisma.faq;
    case "org-nodes":
    case "troop-units":
      return prisma.orgNode;
    case "org-people":
      return prisma.orgPerson;
    case "org-assignments":
    case "unit-leaders":
      return prisma.orgAssignment;
    case "org-qualifications":
      return prisma.orgQualification;
    default:
      return null;
  }
}

export type CoercedValue = string | number | boolean | Date | null;

const ID_PATTERN = /^[a-z0-9_-]{8,40}$/i;
const EMAIL_PATTERN = /^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i;

/** Resources whose rows are all public content and may be listed by the public JSON API. */
export const PUBLIC_API_RESOURCES = new Set([
  "site-stats",
  "scout-stages",
  "activities",
  "events",
  "camps",
  "milestones",
  "values",
  "news",
  "gallery",
  "blog",
  "library",
  "join-pricing",
]);

/**
 * Coerces raw values into the right JS types per field config and validates
 * them (length, type, option membership, id shape). Only fields declared in
 * the config are ever read, so unknown fields can't be mass-assigned.
 * Throws an Arabic, admin-friendly Error on invalid input.
 */
export function coerceValues(
  config: ResourceConfig,
  get: (name: string) => unknown,
): Record<string, CoercedValue> {
  const data: Record<string, CoercedValue> = {};
  for (const field of config.fields) {
    if (field.type === "location") {
      const lat = parseCoordinate(get("latitude"));
      const lng = parseCoordinate(get("longitude"));
      if (lat === null || lng === null)
        throw new Error(
          `حدّد «${field.label}» بالضغط على الخريطة أو بكتابة خطّي العرض والطول.`,
        );
      if (Math.abs(lat) > 90 || Math.abs(lng) > 180)
        throw new Error(
          "خطّا العرض والطول غير صحيحين. خط العرض بين -90 و 90، وخط الطول بين -180 و 180.",
        );
      if (lat === 0 && lng === 0)
        throw new Error("الموقع غير صحيح. حدّد المكان على الخريطة.");
      data.latitude = Math.round(lat * 1e6) / 1e6;
      data.longitude = Math.round(lng * 1e6) / 1e6;
      continue;
    }
    if (
      field.type === "file" ||
      field.type === "file-multiple" ||
      field.type === "slug"
    )
      continue;
    const raw = get(field.name);
    if (raw === null || raw === undefined) continue;

    if (field.type === "number") {
      const n = Math.trunc(Number(raw));
      data[field.name] = Number.isFinite(n)
        ? Math.max(-100000, Math.min(100000, n))
        : 0;
      continue;
    }

    if (field.type === "date") {
      const text = String(raw).trim();
      if (!text) {
        if (field.optional) {
          data[field.name] = null;
          continue;
        }
        throw new Error(`الحقل «${field.label}» مطلوب.`);
      }
      const date = parseDate(text);
      if (!date) throw new Error(`«${field.label}» ليس تاريخًا صحيحًا.`);
      data[field.name] = date;
      continue;
    }

    const text = String(raw)
      .replace(/\u0000/g, "")
      .trim();
    const limit =
      field.maxLength ??
      (field.name === "content"
        ? 60000
        : field.type === "textarea"
          ? 8000
          : 300);
    if (text.length > limit)
      throw new Error(
        `«${field.label}» طويل جدًا (الحد الأقصى ${limit} حرفًا).`,
      );

    if (field.type === "select") {
      if (field.options && !field.options.some((o) => o.value === text))
        throw new Error(`القيمة المختارة في «${field.label}» غير صحيحة.`);
      data[field.name] = field.valueType === "boolean" ? text === "true" : text;
      continue;
    }
    if (field.type === "relation") {
      if (!text) {
        if (field.optional) {
          data[field.name] = null;
          continue;
        }
        throw new Error(`اختر «${field.label}» من القائمة.`);
      }
      if (!ID_PATTERN.test(text))
        throw new Error(`القيمة المختارة في «${field.label}» غير صحيحة.`);
      data[field.name] = text;
      continue;
    }
    if (!text && !field.optional && !field.hidden)
      throw new Error(`الحقل «${field.label}» مطلوب.`);
    if (field.email && text && !EMAIL_PATTERN.test(text))
      throw new Error(`«${field.label}» يجب أن يكون بريدًا إلكترونيًا صحيحًا.`);
    if (field.oneDrive && text) {
      const link = parseOneDriveUrl(text);
      if (!link)
        throw new Error(
          `«${field.label}» يجب أن يكون رابط OneDrive يبدأ بـ https:// (أو رمز «تضمين» من OneDrive).`,
        );
      data[field.name] = link.embedUrl ?? link.openUrl;
      continue;
    }
    // Stored XSS guard: a `javascript:` (or any non-http) link must never reach an href.
    if (field.url && text && !safeHref(text))
      throw new Error(
        `«${field.label}» يجب أن يكون رابطًا يبدأ بـ https:// أو http://.`,
      );
    data[field.name] = text;
  }
  return { ...data, ...config.fixed };
}

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** «2026-10-15» (from <input type="date">) → that day at 00:00 UTC; full ISO strings are also accepted. */
function parseDate(text: string): Date | null {
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  const date = day
    ? new Date(Date.UTC(Number(day[1]), Number(day[2]) - 1, Number(day[3])))
    : /^\d{4}-\d{2}-\d{2}T/.test(text)
      ? new Date(text)
      : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  // Reject overflowed days like 2026-02-31, and absurd years.
  if (day && date.toISOString().slice(0, 10) !== text) return null;
  const year = date.getUTCFullYear();
  return year >= 1900 && year <= 2200 ? date : null;
}

/** Accepts «34.4367», «٣٤٫٤٣٦٧» or «34,4367»; returns null when empty or not a number. */
function parseCoordinate(raw: unknown): number | null {
  const text = String(raw ?? "")
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
    .replace(/[٫،,]/g, ".")
    .trim();
  if (!text) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

/** Coerces raw form-data strings into the right JS types per field config. */
export function coerceFormData(
  config: ResourceConfig,
  formData: FormData,
): Record<string, CoercedValue> {
  return coerceValues(config, (name) => formData.get(name));
}

/** Technical identifier for new items (e.g. "post-lq3k9a2f") — the admin never types this. */
export function generateSlug(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${Date.now().toString(36)}${rand}`;
}
