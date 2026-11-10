import Link from "next/link";
import {
  ArrowDown,
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck2,
  FileDown,
  FileText,
  Info,
  Languages,
  Megaphone,
  MessagesSquare,
  NotebookPen,
  Puzzle,
  ShieldCheck,
  SquareCheckBig,
  Stamp,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import PageHeader from "@/components/ui/PageHeader";
import SectionHeading from "@/components/ui/SectionHeading";
import CopyExampleButton from "./CopyExampleButton";
import SetupTabs from "./SetupTabs";
import { ComputerSteps, MobileSteps } from "./SetupSteps";
import { UiPath } from "./UiPath";
import {
  EXAMPLE_PROMPT,
  GUIDE_PATH,
  PAGE_PATHS,
  PAGE_TITLE,
  SKILL_VERSION,
  SKILL_ZIP_PATH,
  SKILL_ZIP_SIZE,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_WHATSAPP_URL,
  translator,
  type Lang,
} from "@/data/scoutLetters";

// The /scout-letters page in Arabic or English. Every piece of copy is kept
// in both languages side by side, so the two versions stay in step.

type Text = Record<Lang, string>;

const intro: { Icon: LucideIcon; title: Text; text: Text }[] = [
  {
    Icon: Bot,
    title: { ar: "Claude", en: "Claude" },
    text: {
      ar: "مساعد ذكاء اصطناعي من شركة Anthropic. تكتب له كما تكتب في محادثة عادية، فيفهم طلبك ويجيبك.",
      en: "An AI assistant made by Anthropic. You write to it as you would in an ordinary chat, and it understands your request and replies.",
    },
  },
  {
    Icon: Puzzle,
    title: { ar: "الإضافة (Skill)", en: "The skill" },
    text: {
      ar: "ملف صغير يعطي Claude تعليمات وقوالب لمهمة محددة. هذه الإضافة مخصّصة للمراسلات الكشفية.",
      en: "A small file that gives Claude instructions and templates for a specific task. This skill is made for scout correspondence.",
    },
  },
  {
    Icon: Upload,
    title: { ar: "كيف تصل إليها؟", en: "How do you get it?" },
    text: {
      ar: "تنزّل ملف ZIP من موقع الفوج، وترفعه مرة واحدة إلى حسابك في Claude، ثم تكتب طلبك داخل Claude.",
      en: "You download a ZIP file from the troop's website, upload it once to your Claude account, then write your request in Claude.",
    },
  },
];

const documentTypes: { Icon: LucideIcon; title: Text; text: Text }[] = [
  {
    Icon: FileCheck2,
    title: { ar: "طلب موافقة", en: "Approval request" },
    text: {
      ar: "لنشاط أو مخيم أو رحلة.",
      en: "For an activity, camp or trip.",
    },
  },
  {
    Icon: FileText,
    title: { ar: "تقرير", en: "Report" },
    text: {
      ar: "الأنشطة والنتائج والتوصيات.",
      en: "Activities, results and recommendations.",
    },
  },
  {
    Icon: Megaphone,
    title: { ar: "تعميم", en: "Circular" },
    text: {
      ar: "التعليمات والمواعيد للمعنيين.",
      en: "Instructions and dates for those concerned.",
    },
  },
  {
    Icon: NotebookPen,
    title: { ar: "محضر جلسة", en: "Meeting minutes" },
    text: {
      ar: "الحضور والقرارات والتكليفات.",
      en: "Attendance, decisions and assignments.",
    },
  },
];

const letterheadOrder: Text[] = [
  {
    ar: "ترويسة الفوج المسجّلة، إذا كانت متوفرة.",
    en: "Your troop's registered letterhead, if there is one.",
  },
  {
    ar: "وإلا ترويسة مفوضية الشمال، للجهات التابعة لها التي ليس لفوجها ترويسة مسجّلة.",
    en: "Otherwise the North Legation letterhead, for units under it whose troop has no registered letterhead.",
  },
  {
    ar: "وإلا النموذج العام ثنائي اللغة.",
    en: "Otherwise the general bilingual template.",
  },
];

/** `term` is the label printed in the (Arabic) document. */
const numberLabels: { term: string; label: Text; use: Text }[] = [
  {
    term: "رقم الصادر",
    label: { ar: "رقم الصادر", en: "Outgoing No." },
    use: {
      ar: "للكتب والطلبات والتقارير",
      en: "for letters, requests and reports",
    },
  },
  {
    term: "تعميم رقم",
    label: { ar: "تعميم رقم", en: "Circular No." },
    use: { ar: "للتعاميم", en: "for circulars" },
  },
  {
    term: "محضر رقم",
    label: { ar: "محضر رقم", en: "Minutes No." },
    use: { ar: "للمحاضر", en: "for minutes" },
  },
];

// Sample general letterhead, from the skill's own example. The first line is
// printed in the template; Claude fills the rest from the confirmed issuer.
const bilingualHeader = [
  {
    ar: "جمعية الكشاف المسلم في لبنان",
    en: "Muslim Scout Association in Lebanon",
  },
  { ar: "مفوضية جبل لبنان", en: "Mount Lebanon Legation" },
  { ar: "فوج علي بن أبي طالب", en: "Ali Bin Abi Taleb Troop" },
  { ar: "عشيرة العقاب", en: "Al-Oqab Clan" },
];

const flow: Text[] = [
  { ar: "اكتب الطلب", en: "Write your request" },
  { ar: "جاوب عن التفاصيل الناقصة", en: "Fill in the missing details" },
  { ar: "راجع الكتاب", en: "Review the letter" },
  { ar: "نزّل Word", en: "Download the Word file" },
];

const checklist: Text[] = [
  { ar: "الترويسة والجهة المُصدِرة", en: "Letterhead and issuing body" },
  { ar: "اسم المرسَل إليه وصفته", en: "Recipient's name and title" },
  { ar: "رقم المستند", en: "Document number" },
  { ar: "التاريخان الميلادي والهجري", en: "Gregorian and Hijri dates" },
  { ar: "الإمضاءات", en: "Signatures" },
];

const LANGUAGE_NAMES: Text = { ar: "العربية", en: "English" };

function LanguageSwitch({ lang }: { lang: Lang }) {
  const t = translator(lang);
  return (
    <nav aria-label={t("لغة الصفحة", "Page language")}>
      <ul className="inline-flex gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/20">
        {(["ar", "en"] as const).map((code) => (
          <li key={code} lang={code}>
            {code === lang ? (
              <span
                aria-current="page"
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold text-brand-purple-dark"
              >
                <Languages className="h-4 w-4" aria-hidden="true" />
                {LANGUAGE_NAMES[code]}
              </span>
            ) : (
              <Link
                href={PAGE_PATHS[code]}
                hrefLang={code}
                className="inline-flex min-h-[36px] items-center rounded-full px-4 text-sm font-bold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
              >
                {LANGUAGE_NAMES[code]}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Feature({
  Icon,
  title,
  children,
}: {
  Icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4 rounded-2xl border border-brand-purple/10 bg-white p-5 shadow-soft sm:p-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-purple-tint text-brand-purple">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="font-display text-lg font-bold text-brand-ink">
          {title}
        </h4>
        <div className="mt-2 space-y-3 text-sm leading-7 text-brand-ink/80 sm:text-base sm:leading-8">
          {children}
        </div>
      </div>
    </li>
  );
}

export default function ScoutLettersPage({ lang }: { lang: Lang }) {
  const t = translator(lang);
  const en = lang === "en";
  const NextStep = en ? ChevronRight : ChevronLeft;

  return (
    <div lang={lang} dir={en ? "ltr" : "rtl"}>
      <PageHeader
        title={PAGE_TITLE[lang]}
        subtitle={t(
          "صف ما تريد بكلماتك، وجهّز كتابك الكشفي بصيغة Word.",
          "Describe what you need in your own words, and get your scout letter as a Word file.",
        )}
        lang={lang}
        toolbar={<LanguageSwitch lang={lang} />}
      >
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
          {t(
            "أداة تعمل داخل Claude وتساعد القادة على إعداد طلبات الموافقة والتقارير والتعاميم ومحاضر الجلسات والمراسلات الرسمية، باستخدام القالب المناسب.",
            "A tool that works inside Claude and helps leaders prepare approval requests, reports, circulars, meeting minutes and other official correspondence, using the right template.",
          )}
        </p>
        <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <a href={SKILL_ZIP_PATH} download className="btn-gold">
            <Download className="h-[18px] w-[18px]" aria-hidden="true" />
            {t("نزّل الإضافة", "Download the skill")}
          </a>
          <a href="#setup" className="btn-outline-light">
            {t("كيف أستخدمها؟", "How do I use it?")}
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <p className="mt-4 text-xs text-white/65">
          {t("ملف ZIP · الإصدار", "ZIP file · Version")} {SKILL_VERSION} ·{" "}
          <span dir="ltr">{SKILL_ZIP_SIZE}</span>
        </p>
      </PageHeader>

      {/* What Claude and the Skill are */}
      <section className="section-y bg-white">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <SectionHeading
            title={t(
              "ما هو Claude وما هي الإضافة؟",
              "What are Claude and the skill?",
            )}
            subtitle={t(
              "لا تحتاج أي خبرة تقنية لاستعمالها.",
              "You don't need any technical experience to use it.",
            )}
          />
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {intro.map(({ Icon, title, text }) => (
              <li
                key={title.en}
                className="rounded-2xl border border-brand-purple/10 bg-brand-cream p-5 sm:p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-purple text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-brand-ink">
                  {title[lang]}
                </h3>
                <p className="mt-2 text-sm leading-7 text-brand-ink/80 sm:text-base sm:leading-8">
                  {text[lang]}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex gap-3 rounded-2xl bg-brand-purple-tint p-4 text-sm leading-7 text-brand-ink/85 sm:p-5 sm:text-base sm:leading-8">
            <Info
              className="mt-1.5 h-5 w-5 shrink-0 text-brand-purple"
              aria-hidden="true"
            />
            <span>
              {t(
                "كتابة الكتاب وإنشاء ملف Word يتمّان داخل Claude، وليس على هذا الموقع. الإضافات متاحة على كل خطط Claude، بما فيها الخطة المجانية (بحدود استخدام أقل)، وتحتاج تفعيل خيار إنشاء الملفات كما في الخطوة 2 أدناه.",
                "Writing the letter and creating the Word file happen inside Claude, not on this website. Skills are available on all Claude plans, including the free plan (with lower usage limits), and need file creation turned on, as in step 2 below.",
              )}
            </span>
          </p>

          {/* Verified against the skill: export.py only uses python-docx, Pillow
              and the standard library, and SKILL.md sends nothing anywhere. */}
          <aside
            aria-labelledby="privacy-heading"
            className="mt-4 flex gap-4 rounded-2xl border border-brand-purple/15 bg-white p-4 shadow-soft sm:p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-purple text-white">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h3
                id="privacy-heading"
                className="font-display text-lg font-bold text-brand-ink"
              >
                {t("كتبك سرّية وتبقى لك", "Your letters stay private")}
              </h3>
              <p className="mt-1 text-sm leading-7 text-brand-ink/80 sm:text-base sm:leading-8">
                {t(
                  "تعمل الإضافة داخل حسابك في Claude فقط، ولا ترسل أي شيء إلى مُعِدّها أو إلى هذا الموقع. لذلك لا يستطيع مُعِدّ الإضافة، الاطّلاع على كتبك ولا على المعلومات التي تكتبها ولا على صور الإمضاءات والأختام التي ترفعها.",
                  "The skill runs only inside your own Claude account and sends nothing to its creator or to this website. So the skill's creator, can't see your letters, the details you type, or the signature and stamp images you upload.",
                )}
              </p>
              <p className="mt-2 text-sm leading-7 text-brand-ink/70">
                {t(
                  "تخضع محادثاتك مع Claude",
                  "Your chats with Claude are covered by",
                )}{" "}
                <a
                  href="https://www.anthropic.com/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-purple underline underline-offset-4 hover:text-brand-purple-dark"
                >
                  {t(
                    "لسياسة الخصوصية لدى Anthropic",
                    "Anthropic's privacy policy",
                  )}
                </a>
                {t(
                  "، كأي محادثة أخرى في Claude.",
                  ", like any other Claude conversation.",
                )}
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* What it can prepare */}
      <section className="section-y bg-brand-cream">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <SectionHeading
            title={t("ماذا يمكنك إعدادُه؟", "What can you prepare?")}
          />
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {documentTypes.map(({ Icon, title, text }) => (
              <li
                key={title.en}
                className="rounded-2xl border border-brand-purple/10 bg-white p-4 text-center shadow-soft sm:p-5"
              >
                <Icon
                  className="mx-auto h-7 w-7 text-brand-purple"
                  aria-hidden="true"
                />
                <h3 className="mt-3 font-display text-base font-bold text-brand-ink sm:text-lg">
                  {title[lang]}
                </h3>
                <p className="mt-1 text-xs leading-6 text-brand-ink/70 sm:text-sm">
                  {text[lang]}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-center text-sm font-semibold text-brand-ink/75 sm:text-base">
            {t(
              "وتدعم الإضافة أيضًا أي كتاب رسمي آخر بالموضوع الذي تحدّده.",
              "The skill also handles any other official letter, on whatever subject you set.",
            )}
          </p>

          <h3 className="mt-14 font-display text-2xl font-bold text-brand-ink sm:text-3xl">
            {t("ماذا تفعل الإضافة من أجلك؟", "What does the skill do for you?")}
          </h3>
          <ul className="mt-6 grid gap-4">
            <Feature
              Icon={MessagesSquare}
              title={t(
                "تفهم لهجتك وتكتب بالفصحى",
                "Write casually, get formal Arabic",
              )}
            >
              <p>
                {t(
                  "تفهم اللهجة اللبنانية وتصوغ الكتاب بالعربية الفصحى الرسمية، وتسألك عن المعلومات الناقصة قبل تصدير أي مراسلة رسمية.",
                  "It understands Lebanese Arabic and writes the letter in formal Modern Standard Arabic, asking you for any missing information before it exports an official letter.",
                )}
              </p>
              <p>
                {t(
                  "ويمكنك أن تكتب طلبك بالإنجليزية أيضًا: يجيبك Claude بلغتك، ويبقى الكتاب بالعربية الفصحى.",
                  "You can also write your request in English: Claude replies in your language, and the letter itself stays in formal Arabic.",
                )}
              </p>
            </Feature>

            <Feature
              Icon={FileText}
              title={t("تختار الترويسة المناسبة", "Picks the right letterhead")}
            >
              <ol className="grid gap-2">
                {letterheadOrder.map((text, index) => (
                  <li key={text.en} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold text-brand-purple-dark"
                    >
                      {index + 1}
                    </span>
                    <span>{text[lang]}</span>
                  </li>
                ))}
              </ol>
              <p>
                {t(
                  "تستعمل الفرقة أو الطليعة ترويسة فوجها الأم، مع الحفاظ على صفة المرسِل الفعلي في الكتاب.",
                  "A unit or patrol uses its parent troop's letterhead, and the letter keeps the actual sender's capacity.",
                )}
              </p>
            </Feature>

            <Feature
              Icon={Languages}
              title={t(
                "ترويسة بالعربية والإنجليزية",
                "Letterhead in Arabic and English",
              )}
            >
              <p>
                {t(
                  "في النموذج العام ونموذج المحضر، تذكر أسماء الجهة المُصدِرة بالعربية، ويضع Claude مقابل كل اسم بالإنجليزية على الجهة المقابلة من الترويسة وبالترتيب نفسه: المفوضية، ثم الفوج، ثم الوحدة الأصغر عند وجودها.",
                  "In the general and minutes templates, you give the issuer's names in Arabic, and Claude puts each name's English counterpart on the opposite side of the letterhead, in the same order: legation, then troop, then the smaller unit if there is one.",
                )}
              </p>
              {/* Physical sides as printed: Arabic on the right, English on the left. */}
              <figure>
                <div
                  dir="ltr"
                  className="grid grid-cols-2 items-center gap-3 rounded-xl border border-brand-purple/15 bg-white p-3 text-xs leading-5 sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:p-4 sm:text-sm sm:leading-6"
                >
                  <ul lang="en" className="grid gap-1 text-left">
                    {bilingualHeader.map(({ en: name }, index) => (
                      <li
                        key={name}
                        className={
                          index === 0
                            ? "font-bold text-brand-ink"
                            : "text-brand-purple"
                        }
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                  <span
                    aria-hidden="true"
                    className="hidden h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-brand-purple/30 text-xs text-brand-ink/60 sm:flex"
                  >
                    {t("الشعار", "Logo")}
                  </span>
                  <ul lang="ar" dir="rtl" className="grid gap-1 text-right">
                    {bilingualHeader.map(({ ar: name }, index) => (
                      <li
                        key={name}
                        className={
                          index === 0
                            ? "font-bold text-brand-ink"
                            : "text-brand-purple"
                        }
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
                <figcaption className="mt-2 text-xs text-brand-ink/70">
                  {t(
                    "مثال على ترويسة النموذج العام. السطر الأول مطبوع في القالب، ويملأ Claude بقية الأسطر.",
                    "Example of the general template's letterhead. The first line is printed in the template; Claude fills in the rest.",
                  )}
                </figcaption>
              </figure>
              <p>
                {t(
                  "لا يسألك Claude عن التهجئة الإنجليزية ولا يؤخّر التصدير بسببها: يقترح تهجئة مقروءة للأسماء ويترجم المسمّيات، ثم ينبّهك بعد التصدير إلى أنها مقترحة ويمكنك تعديلها. أما ترويسات الأفواج المسجّلة فتبقى كما هي.",
                  "Claude doesn't ask you for English spellings or hold up the export for them: it proposes readable spellings for the names and translates the level titles, then tells you after the export that they're suggestions you can change. Registered troop letterheads stay as they are.",
                )}
              </p>
              <p className="rounded-xl bg-brand-purple-tint px-3 py-2">
                {t(
                  <>
                    <strong className="font-bold text-brand-purple">
                      لديك تسمية رسمية؟
                    </strong>{" "}
                    اكتبها في طلبك، مثلًا: «التسمية الإنجليزية للفوج{" "}
                    <span dir="ltr">Ali Bin Abi Taleb Troop</span>»، فيستعملها
                    Claude كما هي.
                  </>,
                  <>
                    <strong className="font-bold text-brand-purple">
                      Have an official name?
                    </strong>{" "}
                    Put it in your request, for example: “The troop&apos;s
                    English name is Ali Bin Abi Taleb Troop”, and Claude uses it
                    as is.
                  </>,
                )}
              </p>
            </Feature>

            <Feature
              Icon={CalendarDays}
              title={t("التاريخان والترقيم", "Dates and numbering")}
            >
              <p>
                {t(
                  "يتضمن الكتاب التاريخين الميلادي والهجري، والموضوع والمرجع، ورقم المستند بالتسمية الصحيحة:",
                  "Every letter carries both the Gregorian and Hijri dates, the subject and reference, and the document number under the right label:",
                )}
              </p>
              <ul className="flex flex-wrap gap-2">
                {numberLabels.map(({ term, label, use }) => (
                  <li
                    key={term}
                    className="rounded-xl bg-brand-purple-tint px-3 py-1.5 text-sm leading-6"
                  >
                    <strong className="font-bold text-brand-purple">
                      {label[lang]}
                    </strong>
                    {en && (
                      <>
                        {" "}
                        (<bdi lang="ar">{term}</bdi>)
                      </>
                    )}
                    <span className="text-brand-ink/70"> {use[lang]}</span>
                  </li>
                ))}
              </ul>
            </Feature>

            <Feature
              Icon={Stamp}
              title={t(
                "الإمضاءات والختم (اختياري)",
                "Signatures and stamp (optional)",
              )}
            >
              <p>
                {t(
                  "يمكنك إرفاق صورة الإمضاء وصورة الختم. عند وجود موقّعَين يكون أمين السر على اليمين، والمرسِل على اليسار، والختم في الوسط.",
                  "You can attach a signature image and a stamp image. With two signatories, the secretary goes on the right, the sender on the left, and the stamp in the middle.",
                )}
              </p>
              {/* Physical positions as printed on the page, independent of RTL. */}
              <figure>
                <div
                  dir="ltr"
                  className="grid max-w-sm grid-cols-3 gap-2 text-center text-xs font-bold sm:text-sm"
                >
                  <span className="rounded-xl border border-dashed border-brand-purple/30 bg-white px-2 py-3 text-brand-ink">
                    {t("المرسِل", "Sender")}
                  </span>
                  <span className="flex items-center justify-center rounded-full border-2 border-brand-purple/40 px-2 py-3 text-brand-purple">
                    {t("الختم", "Stamp")}
                  </span>
                  <span className="rounded-xl border border-dashed border-brand-purple/30 bg-white px-2 py-3 text-brand-ink">
                    {t("أمين السر", "Secretary")}
                  </span>
                </div>
                <figcaption className="mt-2 text-xs text-brand-ink/70">
                  {t(
                    "مواضع التوقيع أسفل الكتاب.",
                    "Where the signatures go at the bottom of the letter.",
                  )}
                </figcaption>
              </figure>
            </Feature>

            <Feature
              Icon={FileDown}
              title={t("ملف Word قابل للتعديل", "An editable Word file")}
            >
              {t(
                <>
                  <p>
                    تحصل على ملف Word تستطيع تعديله. يُقدَّم PDF فقط إذا أمكن
                    تصدير ملف <span dir="ltr">.docx</span> النهائي نفسه بخاصية
                    التصدير الأصلية في Microsoft Word.
                  </p>
                  <p>
                    وإلا افتح ملف Word الذي نزّلته في Microsoft Word واختر{" "}
                    <UiPath items={["File", "Save As", "PDF"]} />.
                  </p>
                </>,
                <>
                  <p>
                    You get a Word file you can edit. A PDF is included only if
                    the same final .docx can be exported with Microsoft
                    Word&apos;s own PDF export.
                  </p>
                  <p>
                    Otherwise, open the downloaded Word file in Microsoft Word
                    and choose{" "}
                    <UiPath items={["File", "Save As", "PDF"]} lang="en" />.
                  </p>
                </>,
              )}
            </Feature>
          </ul>
        </div>
      </section>

      {/* Setup */}
      <section id="setup" className="section-y bg-white">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <SectionHeading
            title={t("كيف تثبّت الإضافة؟", "How do I install the skill?")}
            subtitle={t(
              "خطوات تقوم بها مرة واحدة فقط على حسابك.",
              "You only do these steps once for your account.",
            )}
            align="center"
          />
          <div className="mt-10">
            <SetupTabs
              lang={lang}
              computer={<ComputerSteps lang={lang} />}
              mobile={<MobileSteps lang={lang} />}
            />
          </div>
        </div>
      </section>

      {/* First letter */}
      <section className="section-y bg-brand-cream">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <SectionHeading
            title={t("جرّب أول كتاب", "Try your first letter")}
            subtitle={t(
              "بعد تفعيل الإضافة، انسخ هذا المثال والصقه في محادثة جديدة داخل Claude.",
              "Once the skill is on, copy this example and paste it into a new chat in Claude.",
            )}
          />
          <figure className="mt-8 rounded-2xl border border-brand-purple/10 bg-white p-5 shadow-soft sm:p-6">
            <figcaption className="text-xs font-bold text-brand-purple">
              {t("مثال جاهز للنسخ", "Ready-to-copy example")}
            </figcaption>
            <blockquote
              id="example-prompt"
              className="mt-3 rounded-xl border-s-4 border-brand-yellow bg-brand-purple-tint/60 p-4 text-base leading-8 text-brand-ink"
            >
              {EXAMPLE_PROMPT[lang]}
            </blockquote>
            <div className="mt-4">
              <CopyExampleButton
                text={EXAMPLE_PROMPT[lang]}
                targetId="example-prompt"
                lang={lang}
              />
            </div>
            <p className="mt-4 text-sm leading-7 text-brand-ink/70">
              {t(
                "لأن الطلب «تجريبي»، يضع Claude بيانات تجريبية واضحة ويعلّم الملف على أنه تجربة.",
                "Because the request says “test”, Claude fills in clearly fake details and marks the file as a test. It replies in English, while the letter itself is written in Arabic.",
              )}
            </p>
          </figure>

          <h3 className="mt-12 font-display text-xl font-bold text-brand-ink sm:text-2xl">
            {t("كيف تجري المحادثة؟", "How the conversation goes")}
          </h3>
          <ol className="mt-5 grid gap-6 sm:grid-cols-4 sm:gap-5">
            {flow.map((step, index) => (
              <li
                key={step.en}
                className="relative flex items-center gap-3 rounded-2xl border border-brand-purple/10 bg-white p-4 shadow-soft sm:flex-col sm:p-5 sm:text-center"
              >
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-purple font-display text-sm font-bold text-white"
                >
                  {index + 1}
                </span>
                <span className="text-sm font-bold leading-6 text-brand-ink sm:text-base">
                  {step[lang]}
                </span>
                {index < flow.length - 1 && (
                  <>
                    <ChevronDown
                      aria-hidden="true"
                      className="absolute -bottom-6 left-1/2 h-6 w-6 -translate-x-1/2 text-brand-yellow-dark sm:hidden"
                    />
                    <NextStep
                      aria-hidden="true"
                      className="absolute -end-5 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-brand-yellow-dark sm:block"
                    />
                  </>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Before sending */}
      <section className="section-y bg-white">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <SectionHeading
            title={t("قبل إرسال أي كتاب", "Before you send any letter")}
          />
          <div className="mt-8 rounded-2xl border border-brand-purple/10 bg-brand-cream p-5 sm:p-6">
            <p className="font-bold text-brand-ink">
              {t("تأكّد من:", "Check:")}
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {checklist.map((item) => (
                <li
                  key={item.en}
                  className="flex items-center gap-2.5 text-sm text-brand-ink/85 sm:text-base"
                >
                  <SquareCheckBig
                    className="h-5 w-5 shrink-0 text-brand-turquoise-dark"
                    aria-hidden="true"
                  />
                  {item[lang]}
                </li>
              ))}
            </ul>
            <ul className="mt-5 grid gap-2 border-t border-brand-purple/10 pt-5 text-sm leading-7 text-brand-ink/85 sm:text-base sm:leading-8">
              <li className="flex gap-2.5">
                <Stamp
                  className="mt-1.5 h-5 w-5 shrink-0 text-brand-purple"
                  aria-hidden="true"
                />
                {t(
                  "ارفع صور الإمضاء والختم فقط إذا كنت مخوّلًا باستعمالها في هذا الكتاب.",
                  "Only upload signature and stamp images if you're authorized to use them on this letter.",
                )}
              </li>
              <li className="flex gap-2.5">
                <FileText
                  className="mt-1.5 h-5 w-5 shrink-0 text-brand-purple"
                  aria-hidden="true"
                />
                {t(
                  "راجع ملف Word النهائي قبل إرساله.",
                  "Review the final Word file before you send it.",
                )}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Guide and help */}
      <section className="relative overflow-hidden bg-brand-purple py-16 sm:py-20">
        <div
          className="texture-canvas absolute inset-0 opacity-30"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <SectionHeading
            title={t("الدليل والمساعدة", "Guide and help")}
            align="center"
            onDark
          />
          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
            {t(
              "للإبلاغ عن مشكلة أو إرسال اقتراح، تواصلوا مع القائد يوسف مريم على الرقم",
              "To report a problem or send a suggestion, contact Scout Leader Youssef Mariam at",
            )}{" "}
            <span dir="ltr" className="inline-block font-bold text-white">
              {SUPPORT_PHONE_DISPLAY}
            </span>
            .
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/70">
            {t(
              "لا نرى كتبك، فإذا احتجت مساعدة في كتاب معيّن، أرسل فقط ما ترتاح لمشاركته، أو احذف المعلومات الحسّاسة أولًا.",
              "We can't see your letters, so if you need help with a specific one, send only what you're comfortable sharing, or remove sensitive details first.",
            )}
          </p>
          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <a
              href={SUPPORT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              <FaWhatsapp className="h-[18px] w-[18px]" aria-hidden="true" />
              {t("تواصل عبر واتساب", "Contact us on WhatsApp")}
            </a>
            {GUIDE_PATH && (
              <a href={GUIDE_PATH} download className="btn-outline-light">
                <FileDown className="h-4 w-4" aria-hidden="true" />
                {t("نزّل الدليل المصوّر", "Download the illustrated guide")}
              </a>
            )}
            <a href={SKILL_ZIP_PATH} download className="btn-outline-light">
              <Download className="h-4 w-4" aria-hidden="true" />
              {t("نزّل الإضافة", "Download the skill")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
