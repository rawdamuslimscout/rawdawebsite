// ============================================================
// All content below is structured, easily-replaceable data.
// Numbers marked "placeholder" are illustrative only and must
// be swapped for real figures before launch.
// ============================================================

export const siteInfo = {
  name: "فوج روضة الفيحاء",
  nameEn: "Rawda Al Fayhaa Scout Group",
  parent: "جمعية الكشاف المسلم في لبنان — مفوضية الشمال",
  instagram: "@rawda_muslim_scout",
  instagramUrl: "https://instagram.com/rawda_muslim_scout",
  tagline: "نُنمّي الإنسان، ونبني القائد، ونصنع الذكريات.",
};

export const navLinks = [
  { href: "#home", label: "الرئيسية" },
  { href: "#about", label: "عن الفوج" },
  { href: "#sections", label: "المراحل الكشفية" },
  { href: "#activities", label: "الأنشطة" },
  { href: "#camps", label: "المخيمات" },
  { href: "#news", label: "الأخبار" },
  { href: "#gallery", label: "معرض الصور" },
  { href: "#contact", label: "تواصل معنا" },
];

export const stats = [
  { value: "+50", label: "سنة من العطاء", placeholder: true },
  { value: "+300", label: "كشاف وقائد", placeholder: true },
  { value: "+100", label: "نشاط سنوي", placeholder: true },
];

export type ScoutStage = {
  id: string;
  title: string;
  ageRange: string;
  description: string;
  icon: "sprout" | "tent" | "compass" | "flag" | "mountain" | "shield";
};

export const scoutStages: ScoutStage[] = [
  {
    id: "baraem",
    title: "البراعم",
    ageRange: "٦ – ٨ سنوات",
    description: "الخطوة الأولى في الرحلة الكشفية، حيث يتعلّم الأشبال قيم الانضباط واللعب الجماعي بأسلوب مبسّط وممتع.",
    icon: "sprout",
  },
  {
    id: "ashbal",
    title: "الأشبال والزهرات",
    ageRange: "٩ – ١١ سنة",
    description: "بناء الروح الجماعية عبر الألعاب الكشفية والأناشيد والمهارات الأساسية داخل الفرقة.",
    icon: "tent",
  },
  {
    id: "kashafa",
    title: "الكشافة والمرشدات",
    ageRange: "١٢ – ١٤ سنة",
    description: "مرحلة اكتساب المهارات الميدانية: نصب الخيام، القيادة، التخييم، والخدمة العامة.",
    icon: "compass",
  },
  {
    id: "mutaqadem",
    title: "فرقة المتقدم",
    ageRange: "١٥ – ١٦ سنة",
    description: "تعميق روح القيادة والمسؤولية من خلال مشاريع خدمية ورحلات تحدٍّ أطول وأكثر تعقيدًا.",
    icon: "flag",
  },
  {
    id: "jawwala",
    title: "الجوّالة",
    ageRange: "١٧ سنة فما فوق",
    description: "مرحلة النضج الكشفي، حيث يصبح الفتى والفتاة قادة مبادرين في مجتمعهم وفوجهم.",
    icon: "mountain",
  },
  {
    id: "qiyada",
    title: "القيادة",
    ageRange: "قادة وقائدات",
    description: "فريق القادة والقائدات المتطوعين الذين يشرفون على تدريب وتوجيه جميع المراحل الكشفية.",
    icon: "shield",
  },
];

export type Activity = {
  id: string;
  title: string;
  description: string;
  icon: "tent" | "map" | "dumbbell" | "handHeart" | "trophy" | "graduationCap" | "moonStar" | "flame";
};

export const activities: Activity[] = [
  { id: "camps", title: "مخيمات", description: "مخيمات صيفية وشتوية تجمع الفرق في الطبيعة لعيش تجربة كشفية كاملة.", icon: "tent" },
  { id: "trips", title: "رحلات", description: "رحلات استكشافية إلى الجبال والغابات ومسارات المشي الطويلة.", icon: "map" },
  { id: "training", title: "تدريبات", description: "تدريبات ميدانية على المهارات الكشفية والقيادية على مدار السنة.", icon: "dumbbell" },
  { id: "service", title: "خدمة المجتمع", description: "مبادرات تطوعية وخدمية لخدمة الحي والمدينة والمجتمع المحلي.", icon: "handHeart" },
  { id: "competitions", title: "مسابقات", description: "مسابقات بين الفرق تختبر المهارة والروح الجماعية والريادة.", icon: "trophy" },
  { id: "educational", title: "أنشطة تربوية", description: "ورشات ونقاشات تنمّي القيم والمعرفة لدى الأشبال والكشافة.", icon: "graduationCap" },
  { id: "ramadan", title: "مبادرات رمضانية", description: "أنشطة وتمر ومي وإفطارات جماعية خلال شهر رمضان المبارك.", icon: "moonStar" },
  { id: "bonfire", title: "سهرات ونيران", description: "سهرات كشفية حول النار تجمع الفرق على الأناشيد والحكايا.", icon: "flame" },
];

export type EventItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  group: string;
  description: string;
};

// Sample / illustrative events — replace with real event data.
export const events: EventItem[] = [
  {
    id: "camp-2026",
    title: "مخيم الفوج",
    date: "٢٧ – ٢٩ آب ٢٠٢٦",
    location: "بشعزين",
    group: "الكشافة والمرشدات",
    description: "شاركونا مخيم فوج روضة الفيحاء، وخوضوا معنا تجربة كشفية مليئة بالحماس والمغامرة.",
  },
  {
    id: "rowaysat",
    title: "رويسات صوفر",
    date: "٢١ – ٢٣ آب ٢٠٢٦",
    location: "صوفر",
    group: "فرقة المتقدم",
    description: "رحلة تحدٍّ جبلية لفرقة المتقدم ضمن سلسلة رحلات الصعود السنوية.",
  },
  {
    id: "seir-al-dinniyeh",
    title: "سير الضنية",
    date: "١٣ – ١٦ آب ٢٠٢٦",
    location: "الضنية",
    group: "الأشبال والزهرات",
    description: "مسيرة ميدانية للأشبال والزهرات في أجواء طبيعية بين الوديان والتلال.",
  },
];

export type CampItem = {
  id: string;
  title: string;
  year: string;
  location: string;
  summary: string;
};

export const camps: CampItem[] = [
  { id: "c1", title: "مخيم الفوج الصيفي", year: "٢٠٢٦", location: "بشعزين", summary: "مخيم الفوج السنوي بمشاركة جميع الفرق الكشفية." },
  { id: "c2", title: "مبيت الأشبال", year: "٢٠٢٦", location: "مركز الفوج", summary: "ليلة تخييم داخلية للأشبال بأجواء من الألعاب والسهرات." },
  { id: "c3", title: "مبيت المرشدات", year: "٢٠٢٦", location: "مركز الفوج", summary: "مبيت كشفي لفرقة المرشدات يجمع المهارات والصداقة." },
  { id: "c4", title: "رحلة درب المسيلحة", year: "٢٠٢٦", location: "المسيلحة", summary: "رحلة سير على الأقدام عبر الطبيعة الساحلية الشمالية." },
];

export type Milestone = {
  year: string;
  title: string;
  description: string;
};

// Sample timeline — replace with the group's real history.
export const milestones: Milestone[] = [
  { year: "٢٠٢٦", title: "توسّع الفرق", description: "انطلاق فرق جديدة وازدياد عدد الكشافة والقادة المنتسبين للفوج." },
  { year: "٢٠٢٥", title: "مخيمات ورحلات متعددة", description: "سلسلة مخيمات ورحلات ميدانية جمعت مختلف المراحل الكشفية." },
  { year: "٢٠٢٤", title: "مبادرات خدمية", description: "إطلاق مبادرات تطوعية وخدمية لخدمة المجتمع المحلي في طرابلس." },
];

export const values = [
  { id: "brotherhood", title: "الأخوة" },
  { id: "leadership", title: "القيادة" },
  { id: "service", title: "الخدمة" },
  { id: "discipline", title: "الانضباط" },
  { id: "cooperation", title: "التعاون" },
  { id: "responsibility", title: "المسؤولية" },
  { id: "faith", title: "الإيمان" },
  { id: "giving", title: "العطاء" },
];

export type NewsItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
};

// Sample news — clearly replaceable placeholder content.
export const news: NewsItem[] = [
  {
    id: "n1",
    title: "نشاط باقة الزهرات في حديقة المدرسة",
    category: "الزهرات",
    date: "أيلول ٢٠٢٦",
    excerpt: "نشاط جماعي جمع فرقة الزهرات في أجواء من الألعاب والأناشيد الكشفية.",
  },
  {
    id: "n2",
    title: "رحلة مرشدات إلى درب المسيلحة",
    category: "المرشدات",
    date: "آب ٢٠٢٦",
    excerpt: "سير على الأقدام عبر الساحل الشمالي في تجربة تجمع المغامرة والصداقة.",
  },
  {
    id: "n3",
    title: "مساء تمر ومي لشهر رمضان",
    category: "خدمة المجتمع",
    date: "رمضان ٢٠٢٦",
    excerpt: "مبادرة كشفية لتوزيع التمر والماء على الصائمين قبل آذان المغرب.",
  },
];

export type GalleryItem = {
  id: string;
  title: string;
  category: "camps" | "activities" | "trips" | "training" | "events";
  size: "large" | "medium" | "small";
};

export const galleryFilters = [
  { id: "all", label: "الكل" },
  { id: "camps", label: "المخيمات" },
  { id: "activities", label: "الأنشطة" },
  { id: "trips", label: "الرحلات" },
  { id: "training", label: "التدريبات" },
  { id: "events", label: "المناسبات" },
] as const;

export const galleryItems: GalleryItem[] = [
  { id: "g1", title: "خيمة المخيم بين الصنوبر", category: "camps", size: "large" },
  { id: "g2", title: "رايات الفوج عند شروق الشمس", category: "events", size: "medium" },
  { id: "g3", title: "نيران المخيم الليلية", category: "camps", size: "small" },
  { id: "g4", title: "مسار الرحلة الجبلية", category: "trips", size: "medium" },
  { id: "g5", title: "تدريب نصب الخيام", category: "training", size: "small" },
  { id: "g6", title: "شارات وأوسمة الفوج", category: "activities", size: "small" },
  { id: "g7", title: "ساحة التجمّع الصباحي", category: "events", size: "medium" },
  { id: "g8", title: "درب الغابة الصنوبرية", category: "trips", size: "large" },
];
