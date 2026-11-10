import { Download, Info } from "lucide-react";
import {
  SKILL_NAME,
  SKILL_ZIP_FILE,
  SKILL_ZIP_PATH,
  translator,
  type Lang,
} from "@/data/scoutLetters";
import SkillsIllustration from "./SkillsIllustration";
import { FileName, UiLabel, UiPath } from "./UiPath";

// Setup steps verified against Anthropic's help center (Nov 2026):
// "Using Skills in Claude" and "Create and edit files with Claude".
// Phones: the help center doesn't cover mobile. Uploading a skill works on
// claude.ai in the phone's browser, not in the Claude app (confirmed by the
// site owner, Nov 2026); once uploaded, the skill is usable from the app too.

type Step = { title: string; body: React.ReactNode };

function StepList({ steps, lang }: { steps: Step[]; lang: Lang }) {
  const t = translator(lang);
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
              <span className="sr-only">
                {t("الخطوة", "Step")} {index + 1}:{" "}
              </span>
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

function DownloadButton({ lang }: { lang: Lang }) {
  return (
    <a href={SKILL_ZIP_PATH} download className="btn-purple w-full sm:w-auto">
      <Download className="h-4 w-4" aria-hidden="true" />
      {translator(lang)("نزّل الإضافة", "Download the skill")}
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

/** "…open Settings → Capabilities and turn on file creation." */
function EnableFiles({ lang }: { lang: Lang }) {
  const t = translator(lang);
  return t(
    <>
      افتح <UiPath items={["Settings", "Capabilities"]} /> وشغّل{" "}
      <UiLabel>Code execution and file creation</UiLabel>، ويظهر في الواجهة الأحدث
      باسم <UiLabel>Create and edit files</UiLabel>. من دونه لا يستطيع Claude إنشاء
      ملف Word.
    </>,
    <>
      open <UiPath items={["Settings", "Capabilities"]} lang="en" /> and turn on{" "}
      <UiLabel>Code execution and file creation</UiLabel>, called{" "}
      <UiLabel>Create and edit files</UiLabel> in the newer interface. Without it,
      Claude can&apos;t create a Word file.
    </>,
  );
}

function OpenSkills({ lang }: { lang: Lang }) {
  const t = translator(lang);
  return t(
    <p>
      اذهب إلى <UiPath items={["Customize", "Skills"]} />، اضغط زر <UiLabel>+</UiLabel>،
      ثم <UiLabel>Upload a skill</UiLabel>.
    </p>,
    <p>
      Go to <UiPath items={["Customize", "Skills"]} lang="en" />, press the{" "}
      <UiLabel>+</UiLabel> button, then <UiLabel>Upload a skill</UiLabel>.
    </p>,
  );
}

export function ComputerSteps({ lang = "ar" }: { lang?: Lang }) {
  const t = translator(lang);
  return (
    <>
      <StepList
        lang={lang}
        steps={[
          {
            title: t("نزّل الملف واتركه مضغوطًا", "Download the file and keep it zipped"),
            body: (
              <>
                {t(
                  <p>
                    اضغط «نزّل الإضافة» فيُحفظ الملف <FileName>{SKILL_ZIP_FILE}</FileName> في
                    مجلد التنزيلات. لا تفكّ ضغطه، لأن Claude يحتاج ملف ZIP كما هو.
                  </p>,
                  <p>
                    Click “Download the skill” and the file{" "}
                    <FileName>{SKILL_ZIP_FILE}</FileName> is saved to your Downloads
                    folder. Don&apos;t unzip it: Claude needs the ZIP file as it is.
                  </p>,
                )}
                <DownloadButton lang={lang} />
                <Note>
                  {t(
                    <>
                      على Mac: إذا فكّ Safari الضغط تلقائيًا وظهر مجلد{" "}
                      <FileName>{SKILL_NAME}</FileName>، اضغط عليه بالزر الأيمن واختر{" "}
                      <UiLabel>Compress</UiLabel>، ثم ارفع ملف ZIP الناتج.
                    </>,
                    <>
                      On a Mac: if Safari unzipped it automatically and a{" "}
                      <FileName>{SKILL_NAME}</FileName> folder appeared, right-click it
                      and choose <UiLabel>Compress</UiLabel>, then upload the resulting
                      ZIP file.
                    </>,
                  )}
                </Note>
              </>
            ),
          },
          {
            title: t("افتح Claude وسجّل دخولك", "Open Claude and sign in"),
            body: (
              <>
                {t(
                  <p>
                    ادخل إلى <ClaudeLink /> من المتصفح أو افتح تطبيق Claude على الكمبيوتر،
                    وسجّل الدخول. لا تملك حسابًا؟ يمكنك إنشاء حساب مجاني.
                  </p>,
                  <p>
                    Go to <ClaudeLink /> in your browser or open the Claude desktop app,
                    and sign in. No account? You can create one for free.
                  </p>,
                )}
                <p>
                  {t("ثم", "Then")} <EnableFiles lang={lang} />
                </p>
                <Note>
                  {t(
                    "في حسابات Team أو Enterprise، قد يتولّى مسؤول الحساب هذا التفعيل.",
                    "On Team or Enterprise accounts, your account admin may need to turn this on.",
                  )}
                </Note>
              </>
            ),
          },
          {
            title: t("افتح صفحة الإضافات", "Open the Skills page"),
            body: <OpenSkills lang={lang} />,
          },
          {
            title: t("ارفع الملف وشغّل الإضافة", "Upload the file and turn on the skill"),
            body: t(
              <p>
                اختر <FileName>{SKILL_ZIP_FILE}</FileName>، وتأكّد أن زر التشغيل بجانب{" "}
                <UiLabel>{SKILL_NAME}</UiLabel> مفعّل، ثم ابدأ محادثة جديدة.
              </p>,
              <p>
                Choose <FileName>{SKILL_ZIP_FILE}</FileName>, make sure the toggle next to{" "}
                <UiLabel>{SKILL_NAME}</UiLabel> is on, then start a new chat.
              </p>,
            ),
          },
        ]}
      />
      <SkillsIllustration variant="desktop" lang={lang} />
    </>
  );
}

export function MobileSteps({ lang = "ar" }: { lang?: Lang }) {
  const t = translator(lang);
  return (
    <>
      <p className="mb-4 flex gap-3 rounded-2xl border border-brand-purple/15 bg-brand-purple-tint p-4 text-sm leading-7 text-brand-ink sm:text-base sm:leading-8">
        <Info className="mt-1.5 h-5 w-5 shrink-0 text-brand-purple" aria-hidden="true" />
        {t(
          <span>
            <strong className="font-bold">على الموبايل، ارفع الإضافة من المتصفح وليس من تطبيق Claude.</strong>{" "}
            استعمل <ClaudeLink /> في Safari أو Chrome. بعد رفعها مرة واحدة، تستطيع
            استعمالها من التطبيق أو المتصفح بالحساب نفسه.
          </span>,
          <span>
            <strong className="font-bold">
              On a phone, upload the skill from the browser, not the Claude app.
            </strong>{" "}
            Use <ClaudeLink /> in Safari or Chrome. Once it&apos;s uploaded, you can use
            it from the app or the browser with the same account.
          </span>,
        )}
      </p>
      <StepList
        lang={lang}
        steps={[
          {
            title: t("نزّل الملف واتركه مضغوطًا", "Download the file and keep it zipped"),
            body: (
              <>
                {t(
                  <p>
                    اضغط «نزّل الإضافة». على iPhone يُحفظ الملف في تطبيق «الملفات»
                    (Files)، وعلى Android في «التنزيلات». لا تفتحه بعد التنزيل، لأن فتحه
                    على iPhone يفكّ ضغطه.
                  </p>,
                  <p>
                    Tap “Download the skill”. On iPhone the file is saved in the Files
                    app, and on Android in Downloads. Don&apos;t open it after
                    downloading: opening it on iPhone unzips it.
                  </p>,
                )}
                <DownloadButton lang={lang} />
              </>
            ),
          },
          {
            title: t(
              "افتح claude.ai في المتصفح وسجّل دخولك",
              "Open claude.ai in your browser and sign in",
            ),
            body: (
              <>
                {t(
                  <p>
                    افتح <ClaudeLink /> في Safari أو Chrome، وليس في تطبيق Claude، وسجّل
                    الدخول. ثم اضغط على اسمك أو الأحرف الأولى منه في القائمة الجانبية،
                    ثم <EnableFiles lang={lang} />
                  </p>,
                  <p>
                    Open <ClaudeLink /> in Safari or Chrome, not in the Claude app, and
                    sign in. Then tap your name or initials in the side menu, then{" "}
                    <EnableFiles lang={lang} />
                  </p>,
                )}
                <Note>
                  {t(
                    "إذا فُتح تطبيق Claude بدل المتصفح، اكتب claude.ai بنفسك في شريط العنوان.",
                    "If the Claude app opens instead of the browser, type claude.ai into the address bar yourself.",
                  )}
                </Note>
              </>
            ),
          },
          {
            title: t("افتح صفحة الإضافات", "Open the Skills page"),
            body: <OpenSkills lang={lang} />,
          },
          {
            title: t("ارفع الملف وشغّل الإضافة", "Upload the file and turn on the skill"),
            body: t(
              <p>
                اختر <FileName>{SKILL_ZIP_FILE}</FileName> من «الملفات» أو «التنزيلات»،
                وشغّل <UiLabel>{SKILL_NAME}</UiLabel>. بعدها ابدأ محادثة جديدة من
                المتصفح أو من تطبيق Claude.
              </p>,
              <p>
                Choose <FileName>{SKILL_ZIP_FILE}</FileName> from Files or Downloads, and
                turn on <UiLabel>{SKILL_NAME}</UiLabel>. Then start a new chat in the
                browser or the Claude app.
              </p>,
            ),
          },
        ]}
      />
      <SkillsIllustration variant="mobile" lang={lang} />
    </>
  );
}
