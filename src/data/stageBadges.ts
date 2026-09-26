// src/data/stageBadges.ts
// Curated, real badges from "كتاب بمناهجنا نرتقي" (2018) — a representative
// slice per stage (the full book has 25+/35+/4 respectively) so the UI stays
// scannable while still being grounded in the actual curriculum.

export type StageBadge = {
  id: string;
  title: string;
  icon: string; // key into badgeIconMap
  summary: string; // one line, plain-language version of the real requirement
};

export const stageBadges: Record<
  string,
  { items: StageBadge[]; totalCount: number }
> = {
  "ashbal-zahrat": {
    totalCount: 25,
    items: [
      {
        id: "rassam",
        title: "الرسام",
        icon: "palette",
        summary: "يتعرف على الألوان الأساسية وكيفية خلطها ويرسم لوحة من خياله.",
      },
      {
        id: "jarmouz",
        title: "الجرموز الكشفي",
        icon: "shield",
        summary: "يحفظ الوعد والقانون ويتقن خمس عقد كشفية أساسية.",
      },
      {
        id: "bahith",
        title: "الباحث",
        icon: "search",
        summary: "يعدّ ملفًا بحثيًا كاملاً عن موضوع من اختيار القائد.",
      },
      {
        id: "mous3ef",
        title: "المسعف",
        icon: "heart-pulse",
        summary: "يعالج جرحًا وحرقًا بسيطين ويعرف محتويات حقيبة الإسعافات.",
      },
      {
        id: "mutale3",
        title: "المطالع",
        icon: "book-open",
        summary: "يواظب على القراءة ويلخص قصتين بالعربية ولغة أجنبية.",
      },
      {
        id: "munshid",
        title: "المنشد",
        icon: "mic",
        summary: "يحفظ النشيد الوطني ويدرّب أفراد سادوسه على ثلاثة أناشيد.",
      },
      {
        id: "muhibb-tabi3a",
        title: "محب الطبيعة",
        icon: "leaf",
        summary: "يشارك في تنظيف الأماكن العامة ويزرع نبتة ويهتم بها.",
      },
      {
        id: "tahi",
        title: "الطاهي",
        icon: "chef-hat",
        summary: "يعدّ وجبة صغيرة ويشرح فوائد الخضار والفاكهة.",
      },
    ],
  },
  "kashafa-morshedat": {
    totalCount: 35,
    items: [
      {
        id: "amin-sir",
        title: "أمين السر",
        icon: "notebook",
        summary: "يسجّل محاضر اجتماعات الطليعة وسجل الحضور والغياب.",
      },
      {
        id: "mous3ef",
        title: "المسعف",
        icon: "heart-pulse",
        summary: "يجيد الحمل على حمّالة ويعالج الجروح والحروق واللدغات.",
      },
      {
        id: "istikshaf-magha2er",
        title: "استكشاف المغاور",
        icon: "mountain",
        summary: "يشارك في ست استكشافات على الأقل ويعبر مغارتين مختلفتين.",
      },
      {
        id: "mukhatib-ishara",
        title: "مخاطب الإشارة",
        icon: "radio",
        summary: "يتقن التخاطب بالمورس والسيمافور ويبتكر شيفرة خاصة بفرقته.",
      },
      {
        id: "mukhayam",
        title: "المخيم",
        icon: "tent",
        summary:
          "يمضي عشرين ليلة في المخيم ويعدّ برنامج مخيم متكامل بمستنداته.",
      },
      {
        id: "hasoubi",
        title: "الحاسوبي",
        icon: "monitor",
        summary: "يجيد برامج الحاسوب الأساسية ويدرّب أحد رفاقه على استخدامها.",
      },
      {
        id: "3aqqad",
        title: "العقاد",
        icon: "link",
        summary: "يتقن 25 عقدة كشفية ويعلّم عشرًا منها لأفراد طليعته.",
      },
      {
        id: "riyada",
        title: "أعمال الريادة",
        icon: "hammer",
        summary: "يخطط وينفذ عملاً ريادياً على مستوى فرقته.",
      },
    ],
  },
  "jawwala-dalilat": {
    totalCount: 4,
    items: [
      {
        id: "bahatha",
        title: "البحاثة",
        icon: "book-open",
        summary:
          "يعدّ بحثًا علميًا كاملاً خلال ستة أشهر ويناقشه أمام لجنة متخصصة.",
      },
      {
        id: "mudarrib",
        title: "المدرب",
        icon: "users",
        summary: "يدرّب وحدة من الأشبال أو الكشافة لمدة ستة أشهر على الأقل.",
      },
      {
        id: "rahhala",
        title: "الرحالة",
        icon: "footprints",
        summary:
          "يقطع 150 كلم سيرًا على الأقدام على مراحل ويوثّق رحلاته بتقرير.",
      },
      {
        id: "raheel",
        title: "شارة الرحيل",
        icon: "flame",
        summary:
          "اختبار ختامي في التحمل والاعتماد على الذات، بمراسيم خاصة لليلة كاملة.",
      },
    ],
  },
};
