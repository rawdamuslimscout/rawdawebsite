import { Download, Info } from "lucide-react";
import { SKILL_NAME, SKILL_ZIP_FILE, SKILL_ZIP_PATH } from "@/data/scoutLetters";
import SkillsIllustration from "./SkillsIllustration";
import { FileName, UiLabel, UiPath } from "./UiPath";

// Setup steps verified against Anthropic's help center (Nov 2026):
// "Using Skills in Claude" and "Create and edit files with Claude".
// Phones: the help center doesn't cover mobile. Uploading a skill works on
// claude.ai in the phone's browser, not in the Claude app (confirmed by the
// site owner, Nov 2026); once uploaded, the skill is usable from the app too.

type Step = { title: string; body: React.ReactNode };

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid gap-4">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="flex gap-4 rounded-2xl border border-brand-purple/10 bg-white p-5 shadow-soft sm:p-6"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-purple font-display text-base font-bold text-white"
          >
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-bold text-brand-ink">
              <span className="sr-only">الخطوة {index + 1}: </span>
              {step.title}
            </h3>
            <div className="mt-2 space-y-3 text-sm leading-7 text-brand-ink/80 sm:text-base sm:leading-8">
              {step.body}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function DownloadButton() {
  return (
    <a href={SKILL_ZIP_PATH} download className="btn-purple w-full sm:w-auto">
      <Download className="h-4 w-4" aria-hidden="true" />
      نزّل الإضافة
    </a>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex gap-2 rounded-xl bg-brand-purple-tint/60 p-3 text-sm leading-7 text-brand-ink/80">
      <Info className="mt-1 h-4 w-4 shrink-0 text-brand-purple" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

function ClaudeLink() {
  return (
    <a
      href="https://claude.ai"
      target="_blank"
      rel="noopener noreferrer"
      dir="ltr"
      className="font-bold text-brand-purple underline underline-offset-4 hover:text-brand-purple-dark"
    >
      claude.ai
    </a>
  );
}

const enableFiles = (
  <>
    افتح <UiPath items={["Settings", "Capabilities"]} /> وشغّل{" "}
    <UiLabel>Code execution and file creation</UiLabel>، ويظهر في الواجهة الأحدث
    باسم <UiLabel>Create and edit files</UiLabel>. من دونه لا يستطيع Claude إنشاء
    ملف Word.
  </>
);

const openSkills = (
  <p>
    اذهب إلى <UiPath items={["Customize", "Skills"]} />، اضغط زر <UiLabel>+</UiLabel>،
    ثم <UiLabel>Create skill</UiLabel>، ثم <UiLabel>Upload a skill</UiLabel>.
  </p>
);

export function ComputerSteps() {
  return (
    <>
      <StepList
        steps={[
          {
            title: "نزّل الملف واتركه مضغوطًا",
            body: (
              <>
                <p>
                  اضغط «نزّل الإضافة» فيُحفظ الملف <FileName>{SKILL_ZIP_FILE}</FileName> في
                  مجلد التنزيلات. لا تفكّ ضغطه، لأن Claude يحتاج ملف ZIP كما هو.
                </p>
                <DownloadButton />
                <Note>
                  على Mac: إذا فكّ Safari الضغط تلقائيًا وظهر مجلد{" "}
                  <FileName>{SKILL_NAME}</FileName>، اضغط عليه بالزر الأيمن واختر{" "}
                  <UiLabel>Compress</UiLabel>، ثم ارفع ملف ZIP الناتج.
                </Note>
              </>
            ),
          },
          {
            title: "افتح Claude وسجّل دخولك",
            body: (
              <>
                <p>
                  ادخل إلى <ClaudeLink /> من المتصفح أو افتح تطبيق Claude على الكمبيوتر،
                  وسجّل الدخول. لا تملك حسابًا؟ يمكنك إنشاء حساب مجاني.
                </p>
                <p>ثم {enableFiles}</p>
                <Note>
                  في حسابات Team أو Enterprise، قد يتولّى مسؤول الحساب هذا التفعيل.
                </Note>
              </>
            ),
          },
          { title: "افتح صفحة الإضافات", body: openSkills },
          {
            title: "ارفع الملف وشغّل الإضافة",
            body: (
              <p>
                اختر <FileName>{SKILL_ZIP_FILE}</FileName>، وتأكّد أن زر التشغيل بجانب{" "}
                <UiLabel>{SKILL_NAME}</UiLabel> مفعّل، ثم ابدأ محادثة جديدة.
              </p>
            ),
          },
        ]}
      />
      <SkillsIllustration variant="desktop" />
    </>
  );
}

export function MobileSteps() {
  return (
    <>
      <p className="mb-4 flex gap-3 rounded-2xl border border-brand-purple/15 bg-brand-purple-tint p-4 text-sm leading-7 text-brand-ink sm:text-base sm:leading-8">
        <Info className="mt-1.5 h-5 w-5 shrink-0 text-brand-purple" aria-hidden="true" />
        <span>
          <strong className="font-bold">على الموبايل، ارفع الإضافة من المتصفح وليس من تطبيق Claude.</strong>{" "}
          استعمل <ClaudeLink /> في Safari أو Chrome. بعد رفعها مرة واحدة، تستطيع
          استعمالها من التطبيق أو المتصفح بالحساب نفسه.
        </span>
      </p>
      <StepList
        steps={[
          {
            title: "نزّل الملف واتركه مضغوطًا",
            body: (
              <>
                <p>
                  اضغط «نزّل الإضافة». على iPhone يُحفظ الملف في تطبيق «الملفات»
                  (Files)، وعلى Android في «التنزيلات». لا تفتحه بعد التنزيل، لأن فتحه
                  على iPhone يفكّ ضغطه.
                </p>
                <DownloadButton />
              </>
            ),
          },
          {
            title: "افتح claude.ai في المتصفح وسجّل دخولك",
            body: (
              <>
                <p>
                  افتح <ClaudeLink /> في Safari أو Chrome، وليس في تطبيق Claude، وسجّل
                  الدخول. ثم اضغط على اسمك أو الأحرف الأولى منه في القائمة الجانبية،
                  ثم {enableFiles}
                </p>
                <Note>
                  إذا فُتح تطبيق Claude بدل المتصفح، اكتب claude.ai بنفسك في شريط
                  العنوان.
                </Note>
              </>
            ),
          },
          { title: "افتح صفحة الإضافات", body: openSkills },
          {
            title: "ارفع الملف وشغّل الإضافة",
            body: (
              <p>
                اختر <FileName>{SKILL_ZIP_FILE}</FileName> من «الملفات» أو «التنزيلات»،
                وشغّل <UiLabel>{SKILL_NAME}</UiLabel>. بعدها ابدأ محادثة جديدة من
                المتصفح أو من تطبيق Claude.
              </p>
            ),
          },
        ]}
      />
      <SkillsIllustration variant="mobile" />
    </>
  );
}
