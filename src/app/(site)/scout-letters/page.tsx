import type { Metadata } from "next";
import {
  ArrowDown,
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  Download,
  FileCheck2,
  FileDown,
  FileText,
  Info,
  Languages,
  Megaphone,
  NotebookPen,
  Puzzle,
  SquareCheckBig,
  Stamp,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import PageHeader from "@/components/ui/PageHeader";
import SectionHeading from "@/components/ui/SectionHeading";
import CopyExampleButton from "@/components/scout-letters/CopyExampleButton";
import SetupTabs from "@/components/scout-letters/SetupTabs";
import { ComputerSteps, MobileSteps } from "@/components/scout-letters/SetupSteps";
import { UiLabel, UiPath } from "@/components/scout-letters/UiPath";
import {
  EXAMPLE_PROMPT,
  GUIDE_PATH,
  SKILL_VERSION,
  SKILL_ZIP_PATH,
  SKILL_ZIP_SIZE,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_WHATSAPP_URL,
} from "@/data/scoutLetters";
import { SITE_NAME } from "@/lib/site";

// Unlisted community page: reachable by its URL only, no sitemap or share
// metadata on purpose. Keeps the footer's settings fresh like other pages.
export const revalidate = 3600;

const TITLE = "مساعد المراسلات الكشفية";

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
};

const intro = [
  {
    Icon: Bot,
    title: "Claude",
    text: "مساعد ذكاء اصطناعي من شركة Anthropic. تكتب له كما تكتب في محادثة عادية، فيفهم طلبك ويجيبك.",
  },
  {
    Icon: Puzzle,
    title: "الإضافة (Skill)",
    text: "ملف صغير يعطي Claude تعليمات وقوالب لمهمة محددة. هذه الإضافة مخصّصة للمراسلات الكشفية.",
  },
  {
    Icon: Upload,
    title: "كيف تصل إليها؟",
    text: "تنزّل ملف ZIP من موقع الفوج، وترفعه مرة واحدة إلى حسابك في Claude، ثم تكتب طلبك داخل Claude.",
  },
];

const documentTypes = [
  { Icon: FileCheck2, title: "طلب موافقة", text: "لنشاط أو مخيم أو رحلة." },
  { Icon: FileText, title: "تقرير", text: "الأنشطة والنتائج والتوصيات." },
  { Icon: Megaphone, title: "تعميم", text: "التعليمات والمواعيد للمعنيين." },
  { Icon: NotebookPen, title: "محضر جلسة", text: "الحضور والقرارات والتكليفات." },
];

const numberLabels = [
  { label: "رقم الصادر", use: "للكتب والطلبات والتقارير" },
  { label: "تعميم رقم", use: "للتعاميم" },
  { label: "محضر رقم", use: "للمحاضر" },
];

const flow = ["اكتب الطلب", "جاوب عن التفاصيل الناقصة", "راجع الكتاب", "نزّل Word"];

const checklist = [
  "الترويسة والجهة المُصدِرة",
  "اسم المرسَل إليه وصفته",
  "رقم المستند",
  "التاريخان الميلادي والهجري",
  "الإمضاءات",
];

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
        <h4 className="font-display text-lg font-bold text-brand-ink">{title}</h4>
        <div className="mt-2 space-y-3 text-sm leading-7 text-brand-ink/80 sm:text-base sm:leading-8">
          {children}
        </div>
      </div>
    </li>
  );
}

export default function ScoutLettersPage() {
  return (
    <>
      <PageHeader title={TITLE} subtitle="صف ما تريد بكلماتك، وجهّز كتابك الكشفي بصيغة Word.">
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
          أداة تعمل داخل Claude وتساعد القادة على إعداد طلبات الموافقة والتقارير
          والتعاميم ومحاضر الجلسات والمراسلات الرسمية، باستخدام القالب المناسب.
        </p>
        <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <a href={SKILL_ZIP_PATH} download className="btn-gold">
            <Download className="h-[18px] w-[18px]" aria-hidden="true" />
            نزّل الإضافة
          </a>
          <a href="#setup" className="btn-outline-light">
            كيف أستخدمها؟
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <p className="mt-4 text-xs text-white/65">
          ملف ZIP · الإصدار {SKILL_VERSION} · <span dir="ltr">{SKILL_ZIP_SIZE}</span>
        </p>
      </PageHeader>

      {/* What Claude and the Skill are */}
      <section className="section-y bg-white">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <SectionHeading
            title="ما هو Claude وما هي الإضافة؟"
            subtitle="لا تحتاج أي خبرة تقنية لاستعمالها."
          />
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {intro.map(({ Icon, title, text }) => (
              <li
                key={title}
                className="rounded-2xl border border-brand-purple/10 bg-brand-cream p-5 sm:p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-purple text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-brand-ink">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-brand-ink/80 sm:text-base sm:leading-8">
                  {text}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex gap-3 rounded-2xl bg-brand-purple-tint p-4 text-sm leading-7 text-brand-ink/85 sm:p-5 sm:text-base sm:leading-8">
            <Info className="mt-1.5 h-5 w-5 shrink-0 text-brand-purple" aria-hidden="true" />
            <span>
              كتابة الكتاب وإنشاء ملف Word يتمّان داخل Claude، وليس على هذا الموقع.
              الإضافات متاحة على كل خطط Claude، بما فيها الخطة المجانية (بحدود استخدام
              أقل)، وتحتاج تفعيل خيار إنشاء الملفات كما في الخطوة 2 أدناه.
            </span>
          </p>
        </div>
      </section>

      {/* What it can prepare */}
      <section className="section-y bg-brand-cream">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <SectionHeading title="ماذا يمكنك إعدادُه؟" />
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {documentTypes.map(({ Icon, title, text }) => (
              <li
                key={title}
                className="rounded-2xl border border-brand-purple/10 bg-white p-4 text-center shadow-soft sm:p-5"
              >
                <Icon className="mx-auto h-7 w-7 text-brand-purple" aria-hidden="true" />
                <h3 className="mt-3 font-display text-base font-bold text-brand-ink sm:text-lg">
                  {title}
                </h3>
                <p className="mt-1 text-xs leading-6 text-brand-ink/70 sm:text-sm">{text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-center text-sm font-semibold text-brand-ink/75 sm:text-base">
            وتدعم الإضافة أيضًا أي كتاب رسمي آخر بالموضوع الذي تحدّده.
          </p>

          <h3 className="mt-14 font-display text-2xl font-bold text-brand-ink sm:text-3xl">
            ماذا تفعل الإضافة من أجلك؟
          </h3>
          <ul className="mt-6 grid gap-4">
            <Feature Icon={Languages} title="تفهم لهجتك وتكتب بالفصحى">
              <p>
                تفهم اللهجة اللبنانية وتصوغ الكتاب بالعربية الفصحى الرسمية، وتسألك عن
                المعلومات الناقصة قبل تصدير أي مراسلة رسمية.
              </p>
            </Feature>

            <Feature Icon={FileText} title="تختار الترويسة المناسبة">
              <ol className="grid gap-2">
                {[
                  "ترويسة الفوج المسجّلة، إذا كانت متوفرة.",
                  "وإلا ترويسة مفوضية الشمال، للجهات التابعة لها التي ليس لفوجها ترويسة مسجّلة.",
                  "وإلا النموذج العام ثنائي اللغة.",
                ].map((text, index) => (
                  <li key={text} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold text-brand-purple-dark"
                    >
                      {index + 1}
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
              <p>
                تستعمل الفرقة أو الطليعة ترويسة فوجها الأم، مع الحفاظ على صفة المرسِل
                الفعلي في الكتاب. ويمكن أن يضم النموذج العام المفوضية والفوج والوحدات
                الأصغر بالعربية والإنجليزية، ويقترح Claude التهجئة الإنجليزية إذا لم
                تتوفر تسمية رسمية.
              </p>
            </Feature>

            <Feature Icon={CalendarDays} title="التاريخان والترقيم">
              <p>
                يتضمن الكتاب التاريخين الميلادي والهجري، والموضوع والمرجع، ورقم المستند
                بالتسمية الصحيحة:
              </p>
              <ul className="flex flex-wrap gap-2">
                {numberLabels.map(({ label, use }) => (
                  <li
                    key={label}
                    className="rounded-xl bg-brand-purple-tint px-3 py-1.5 text-sm leading-6"
                  >
                    <strong className="font-bold text-brand-purple">{label}</strong>
                    <span className="text-brand-ink/70"> {use}</span>
                  </li>
                ))}
              </ul>
            </Feature>

            <Feature Icon={Stamp} title="الإمضاءات والختم (اختياري)">
              <p>
                يمكنك إرفاق صورة الإمضاء وصورة الختم. عند وجود موقّعَين يكون أمين السر
                على اليمين، والمرسِل على اليسار، والختم في الوسط.
              </p>
              {/* Physical positions as printed on the page, independent of RTL. */}
              <figure>
                <div
                  dir="ltr"
                  className="grid max-w-sm grid-cols-3 gap-2 text-center text-xs font-bold sm:text-sm"
                >
                  <span className="rounded-xl border border-dashed border-brand-purple/30 bg-white px-2 py-3 text-brand-ink">
                    المرسِل
                  </span>
                  <span className="flex items-center justify-center rounded-full border-2 border-brand-purple/40 px-2 py-3 text-brand-purple">
                    الختم
                  </span>
                  <span className="rounded-xl border border-dashed border-brand-purple/30 bg-white px-2 py-3 text-brand-ink">
                    أمين السر
                  </span>
                </div>
                <figcaption className="mt-2 text-xs text-brand-ink/70">
                  مواضع التوقيع أسفل الكتاب.
                </figcaption>
              </figure>
            </Feature>

            <Feature Icon={FileDown} title="ملف Word قابل للتعديل">
              <p>
                تحصل على ملف Word تستطيع تعديله. يُقدَّم PDF فقط إذا أمكن تصدير ملف{" "}
                <span dir="ltr">.docx</span> النهائي نفسه بخاصية التصدير الأصلية في
                Microsoft Word.
              </p>
              <p>
                وإلا افتح ملف Word الذي نزّلته في Microsoft Word واختر{" "}
                <UiPath items={["File", "Save As", "PDF"]} />.
              </p>
            </Feature>
          </ul>
        </div>
      </section>

      {/* Setup */}
      <section id="setup" className="section-y bg-white">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <SectionHeading
            title="كيف تثبّت الإضافة؟"
            subtitle="خطوات تقوم بها مرة واحدة فقط على حسابك."
            align="center"
          />
          <div className="mt-10">
            <SetupTabs computer={<ComputerSteps />} mobile={<MobileSteps />} />
          </div>
        </div>
      </section>

      {/* First letter */}
      <section className="section-y bg-brand-cream">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <SectionHeading
            title="جرّب أول كتاب"
            subtitle="بعد تفعيل الإضافة، انسخ هذا المثال والصقه في محادثة جديدة داخل Claude."
          />
          <figure className="mt-8 rounded-2xl border border-brand-purple/10 bg-white p-5 shadow-soft sm:p-6">
            <figcaption className="text-xs font-bold text-brand-purple">مثال جاهز للنسخ</figcaption>
            <blockquote
              id="example-prompt"
              className="mt-3 rounded-xl border-s-4 border-brand-yellow bg-brand-purple-tint/60 p-4 text-base leading-8 text-brand-ink"
            >
              {EXAMPLE_PROMPT}
            </blockquote>
            <div className="mt-4">
              <CopyExampleButton text={EXAMPLE_PROMPT} targetId="example-prompt" />
            </div>
            <p className="mt-4 text-sm leading-7 text-brand-ink/70">
              لأن الطلب «تجريبي»، يضع Claude بيانات تجريبية واضحة ويعلّم الملف على أنه
              تجربة.
            </p>
          </figure>

          <h3 className="mt-12 font-display text-xl font-bold text-brand-ink sm:text-2xl">
            كيف تجري المحادثة؟
          </h3>
          <ol className="mt-5 grid gap-6 sm:grid-cols-4 sm:gap-5">
            {flow.map((step, index) => (
              <li
                key={step}
                className="relative flex items-center gap-3 rounded-2xl border border-brand-purple/10 bg-white p-4 shadow-soft sm:flex-col sm:p-5 sm:text-center"
              >
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-purple font-display text-sm font-bold text-white"
                >
                  {index + 1}
                </span>
                <span className="text-sm font-bold leading-6 text-brand-ink sm:text-base">
                  {step}
                </span>
                {index < flow.length - 1 && (
                  <>
                    <ChevronDown
                      aria-hidden="true"
                      className="absolute -bottom-6 left-1/2 h-6 w-6 -translate-x-1/2 text-brand-yellow-dark sm:hidden"
                    />
                    <ChevronLeft
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
          <SectionHeading title="قبل إرسال أي كتاب" />
          <div className="mt-8 rounded-2xl border border-brand-purple/10 bg-brand-cream p-5 sm:p-6">
            <p className="font-bold text-brand-ink">تأكّد من:</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {checklist.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-brand-ink/85 sm:text-base">
                  <SquareCheckBig className="h-5 w-5 shrink-0 text-brand-turquoise-dark" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <ul className="mt-5 grid gap-2 border-t border-brand-purple/10 pt-5 text-sm leading-7 text-brand-ink/85 sm:text-base sm:leading-8">
              <li className="flex gap-2.5">
                <Stamp className="mt-1.5 h-5 w-5 shrink-0 text-brand-purple" aria-hidden="true" />
                ارفع صور الإمضاء والختم فقط إذا كنت مخوّلًا باستعمالها في هذا الكتاب.
              </li>
              <li className="flex gap-2.5">
                <FileText className="mt-1.5 h-5 w-5 shrink-0 text-brand-purple" aria-hidden="true" />
                راجع ملف Word النهائي قبل إرساله.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Guide and help */}
      <section className="relative overflow-hidden bg-brand-purple py-16 sm:py-20">
        <div className="texture-canvas absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <SectionHeading title="الدليل والمساعدة" align="center" onDark />
          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
            للإبلاغ عن مشكلة أو إرسال اقتراح، تواصلوا مع القائد يوسف مريم على الرقم{" "}
            <span dir="ltr" className="inline-block font-bold text-white">
              {SUPPORT_PHONE_DISPLAY}
            </span>
            .
          </p>
          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <a
              href={SUPPORT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              <FaWhatsapp className="h-[18px] w-[18px]" aria-hidden="true" />
              تواصل عبر واتساب
            </a>
            {GUIDE_PATH && (
              <a href={GUIDE_PATH} download className="btn-outline-light">
                <FileDown className="h-4 w-4" aria-hidden="true" />
                نزّل الدليل المصوّر
              </a>
            )}
            <a href={SKILL_ZIP_PATH} download className="btn-outline-light">
              <Download className="h-4 w-4" aria-hidden="true" />
              نزّل الإضافة
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
