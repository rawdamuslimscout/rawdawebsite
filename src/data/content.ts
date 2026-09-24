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

// Hrefs are absolute ("/#section") rather than bare hashes so they
// resolve correctly from every route, not just the homepage.
export const navLinks = [
  { href: "/#home", label: "الرئيسية" },
  { href: "/#about", label: "عن الفوج" },
  { href: "/#sections", label: "المراحل الكشفية" },
  { href: "/#activities", label: "الأنشطة" },
  { href: "/#camps", label: "المخيمات" },
  { href: "/blog", label: "المدونة" },
  { href: "/library", label: "المكتبة" },
  { href: "/#news", label: "الأخبار" },
  { href: "/#gallery", label: "معرض الصور" },
  { href: "/#contact", label: "تواصل معنا" },
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

// ============================================================
// BLOG — long-form posts. Sample content only; replace with the
// group's real writing. `content` is a small array of paragraphs
// so the detail page can render it without a markdown dependency.
// ============================================================

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  author: string;
  excerpt: string;
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "roh-al-jawwala",
    title: "روح الجوّالة: من الطاعة إلى المبادرة",
    category: "قيادة",
    date: "أيلول ٢٠٢٦",
    author: "قيادة الفوج",
    excerpt: "كيف تتحوّل مرحلة الجوّالة من تنفيذ التعليمات إلى بناء المبادرة الذاتية والمسؤولية الجماعية.",
    content: [
      "تبدأ رحلة الكشاف بتعلّم الانضباط والطاعة، لكنها لا تنتهي هناك. في مرحلة الجوّالة، يُطلب من الفتى والفتاة أن يتحوّلا من منفّذَين إلى مبادرَين، يقترحان المشاريع ويتحمّلان نتائجها.",
      "هذا التحوّل لا يحدث فجأة، بل عبر سنوات من التدرّج داخل الفرق، من البراعم حتى الجوّالة، حيث تُمنح مسؤوليات أكبر تدريجيًا مع كل مرحلة عمرية.",
      "في فوج روضة الفيحاء، نحرص على أن يشارك الجوّالة في تخطيط أنشطتهم الخاصة، بدل أن تُفرض عليهم من القيادة، لأن القيادة الحقيقية تُمارَس ولا تُلقَّن.",
    ],
  },
  {
    slug: "adab-al-mukhayam",
    title: "آداب المخيّم: نظافة الموقع وأثر الإنسان",
    category: "مهارات كشفية",
    date: "آب ٢٠٢٦",
    author: "فرقة المتقدم",
    excerpt: "مبدأ كشفي أساسي: غادر الموقع أنظف مما وجدته. كيف نطبّق هذا القول في مخيمات الفوج؟",
    content: [
      "من أقدم المبادئ الكشفية أن يُغادر الكشاف موقع التخييم أنظف مما وجده، وهو مبدأ يتجاوز النظافة إلى احترام الطبيعة والمكان المشترك.",
      "في كل مخيم، تُخصَّص مهمة يومية لكل فرقة لجمع النفايات وفرزها، وتذكير الجميع بأن أثرنا في الطبيعة يجب أن يكون خفيفًا قدر الإمكان.",
      "هذه العادة الصغيرة تبني عند الكشاف حسًّا بالمسؤولية يرافقه خارج المخيم أيضًا، في بيته وحيّه ومدرسته.",
    ],
  },
  {
    slug: "ramadan-wal-khidma",
    title: "رمضان في الفوج: العبادة والخدمة معًا",
    category: "خدمة المجتمع",
    date: "رمضان ٢٠٢٦",
    author: "قيادة الفوج",
    excerpt: "كيف تتحول أنشطة الفوج خلال رمضان إلى مزيج من العبادة الفردية والعمل الجماعي الخدمي.",
    content: [
      "يحمل شهر رمضان طابعًا خاصًا في برنامج الفوج، حيث تتوازى الأنشطة الروحية مع المبادرات الخدمية كتوزيع التمر والماء وإفطارات الصائمين.",
      "يشارك الأشبال والزهرات في تحضير التمر ومي، بينما تتولى فرق المرشدات والكشافة الأكبر سنًا تنظيم إفطارات جماعية للفوج وللمحتاجين في الحي.",
      "الهدف ليس فقط إحياء الشعائر، بل ترسيخ فكرة أن العبادة والخدمة وجهان لعملة واحدة في التربية الكشفية الإسلامية.",
    ],
  },
  {
    // Sourced from "جمعية الكشاف المسلم في لبنان — مائة عام في خدمة
    // الناشئة" (the association's official centennial book, 2010,
    // by Dr. Mohammad Khair Al-Qadi). Facts and dates below are drawn
    // from its founding and international-recognition chapters;
    // wording here is an original summary, not a reproduction of the
    // book's text. This covers the parent association's history, not
    // Rawda Al Fayhaa's own troop history.
    slug: "nashaat-al-haraka-al-kashfiya",
    title: "من أين بدأت الحركة الكشفية المسلمة في لبنان؟",
    category: "تاريخ",
    date: "أيلول ٢٠٢٦",
    author: "قيادة الفوج",
    excerpt: "نبذة عن نشأة جمعية الكشاف المسلم في لبنان، من فكرة بادن باول العالمية إلى أول فرقة كشفية في بيروت.",
    content: [
      "تعود فكرة الكشافة عالميًا إلى اللورد الإنكليزي روبرت بادن باول، الذي أطلق الحركة عام ١٩٠٧ بوصفها وسيلة تربوية تعتمد على الحياة في الهواء الطلق والاعتماد على النفس، لتنمية شخصية الفرد وأخلاقه وصحته وإمكاناته العلمية، وغرس روح الخدمة الوطنية فيه.",
      "في بيروت، عمل عبد الجبار خيري على إضفاء طابع ديني على الفكرة الكشفية بما يتناسب مع التعاليم الإسلامية، فجرى تطوير شارة الكشاف لتصبح الكف المبسوطة بأصابعها الخمس، رمزًا لأركان الإسلام الخمسة، بدلًا من شارة الزنبقة الغربية.",
      "أسّس عبد الجبار خيري أول فرقة كشفية إسلامية في مدرسة «دار العلوم» في بيروت (المنطقة المعروفة اليوم بكليمنصو)، بعد عودته من بريطانيا، وقامت الفرقة برحلات ميدانية عدة من بينها رحلة سير إلى دمشق والأستانة عام ١٩١٤.",
      "أدّى اندلاع الحرب العالمية الأولى إلى توقف نشاط الحركة وإغلاق «دار العلوم»، إلى أن أحياها عدد من القادة بعد الهدنة عام ١٩١٦، وكانت رحلة دمشق عام ١٩٢٠ باكورة استئناف النشاط الكشفي.",
      "حصلت الحركة الكشفية في لبنان وسوريا على الاعتراف الدولي عام ١٩٢٤، حين اعترف بها المؤتمر الكشفي العالمي المنعقد في كوبنهاغن، وسُجّلت رسميًا في المكتب الكشفي العالمي في لندن.",
      "أقيم أول مخيم كشفي كبير عام ١٩٣٠ في غابة الشوبانية بقيادة مصطفى فتح الله، شارك فيه ممثلون عن جمعية الكشاف المسلم في لبنان وسوريا، وقرّر المشاركون خلاله المشاركة في المؤتمر الكشفي العالمي في فيينا واجتماع الجوّالة في كاندرشتاغ (سويسرا) عام ١٩٣١.",
      "واصلت الجمعية حضورها الدولي عبر السنوات، من المؤتمر العالمي السابع والجامبوري الرابع في غودولو (هنغاريا) عام ١٩٣٣، إلى المؤتمر العالمي الثالث عشر والجامبوري السابع في سالزبورغ وباد إيشل (النمسا) عام ١٩٥١.",
      "اليوم، وبعد أكثر من قرن على انطلاقتها، لا تزال جمعية الكشاف المسلم في لبنان تحمل الرسالة نفسها التي بدأت بها: تربية جيل يجمع بين الأصالة والانفتاح، ضمن أفواجها المنتشرة في مختلف المناطق اللبنانية، ومنها فوج روضة الفيحاء ضمن مفوضية الشمال.",
    ],
  },
];

// ============================================================
// JOIN US — pricing tiers and weekly schedule for the /join page.
// Sample data only; replace with the group's real figures.
// ============================================================

export type JoinPricingTier = {
  id: string;
  title: string;
  price: string;
  period: string;
  description: string;
};

export const joinPricing: JoinPricingTier[] = [
  {
    id: "annual",
    title: "الاشتراك السنوي",
    price: "$50",
    period: "سنويًا",
    description: "يشمل العضوية في الفوج، القميص الكشفي، والمشاركة في الأنشطة الأسبوعية العادية.",
  },
  {
    id: "camp",
    title: "مخيم الفوج",
    price: "$45",
    period: "لكل مخيم",
    description: "يشمل الإقامة والطعام والنقل خلال أيام المخيم؛ يُعلن عن كل مخيم بتفاصيله على حدة.",
  },
  {
    id: "family",
    title: "اشتراك عائلي (أخوة)",
    price: "$80",
    period: "سنويًا",
    description: "تخفيض للعائلات التي تنتسب بأكثر من طفل إلى الفوج في نفس السنة الكشفية.",
  },
];

export type JoinScheduleGroup = {
  id: string;
  stage: string;
  ageRange: string;
  day: string;
  time: string;
  location: string;
  leaders: number;
};

export const joinSchedule: JoinScheduleGroup[] = [
  { id: "js1", stage: "البراعم", ageRange: "٦ – ٨ سنوات", day: "السبت", time: "٣:٠٠ – ٤:٣٠ م", location: "مركز الفوج — طرابلس", leaders: 2 },
  { id: "js2", stage: "الأشبال والزهرات", ageRange: "٩ – ١١ سنة", day: "السبت", time: "٣:٠٠ – ٥:٠٠ م", location: "مركز الفوج — طرابلس", leaders: 3 },
  { id: "js3", stage: "الكشافة والمرشدات", ageRange: "١٢ – ١٤ سنة", day: "الأحد", time: "١٠:٠٠ – ١٢:٠٠ ظ", location: "مركز الفوج — طرابلس", leaders: 3 },
  { id: "js4", stage: "فرقة المتقدم", ageRange: "١٥ – ١٦ سنة", day: "الأحد", time: "١٢:٣٠ – ٢:٣٠ م", location: "مركز الفوج — طرابلس", leaders: 2 },
  { id: "js5", stage: "الجوّالة", ageRange: "١٧ سنة فما فوق", day: "الأحد", time: "٥:٠٠ – ٧:٠٠ م", location: "مركز الفوج — طرابلس", leaders: 2 },
];

// ============================================================
// LIBRARY — downloadable resources (guides, badge requirements,
// forms). `fileUrl` is a placeholder path; point it at real PDFs
// once available, e.g. under /public/library/.
// ============================================================

export type LibraryResource = {
  id: string;
  title: string;
  category: "guides" | "badges" | "forms" | "songs";
  description: string;
  fileType: "PDF" | "DOCX";
  fileUrl: string;
};

export const libraryFilters = [
  { id: "all", label: "الكل" },
  { id: "guides", label: "أدلة تدريبية" },
  { id: "badges", label: "متطلبات الشارات" },
  { id: "forms", label: "استمارات" },
  { id: "songs", label: "أناشيد" },
] as const;

export const libraryResources: LibraryResource[] = [
  {
    id: "l1",
    title: "دليل نصب الخيام الميداني",
    category: "guides",
    description: "خطوات مصوّرة لنصب أنواع الخيام المستخدمة في مخيمات الفوج.",
    fileType: "PDF",
    fileUrl: "/library/tent-setup-guide.pdf",
  },
  {
    id: "l2",
    title: "متطلبات شارة الكشاف الأول",
    category: "badges",
    description: "قائمة المهارات والاختبارات المطلوبة لنيل شارة الكشاف الأول.",
    fileType: "PDF",
    fileUrl: "/library/first-scout-badge.pdf",
  },
  {
    id: "l3",
    title: "استمارة تسجيل عضو جديد",
    category: "forms",
    description: "استمارة الانتساب الرسمية للأشبال والزهرات والكشافة.",
    fileType: "DOCX",
    fileUrl: "/library/registration-form.docx",
  },
  {
    id: "l4",
    title: "استمارة موافقة ولي الأمر على المخيم",
    category: "forms",
    description: "موافقة خطية مطلوبة قبل مشاركة أي عضو قاصر في مخيمات الفوج.",
    fileType: "PDF",
    fileUrl: "/library/camp-consent-form.pdf",
  },
  {
    id: "l5",
    title: "ديوان أناشيد الفوج",
    category: "songs",
    description: "مجموعة الأناشيد الكشفية المعتمدة في تجمعات ومخيمات الفوج.",
    fileType: "PDF",
    fileUrl: "/library/songbook.pdf",
  },
  {
    id: "l6",
    title: "دليل قائد الفرقة",
    category: "guides",
    description: "مرجع للقادة الجدد حول تنظيم الاجتماعات الأسبوعية وبرامج الفرق.",
    fileType: "PDF",
    fileUrl: "/library/troop-leader-guide.pdf",
  },
];
