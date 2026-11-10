import { Plus, Upload } from "lucide-react";
import { SKILL_NAME, translator, type Lang } from "@/data/scoutLetters";

// A drawn (not screenshotted) sketch of Claude's Skills screen, so no real
// account details ever end up on the site. Numbers match the setup steps.

function StepBadge({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span
      className={`absolute flex h-5 w-5 items-center justify-center rounded-full bg-brand-yellow text-[10px] font-bold text-brand-purple-dark ring-2 ring-white ${className}`}
    >
      {n}
    </span>
  );
}

function SkillsPanel() {
  return (
    <div className="min-w-0 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-brand-ink">Skills</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-ink text-white ring-2 ring-brand-yellow ring-offset-2">
          <Plus className="h-4 w-4" />
        </span>
      </div>

      <div className="relative ms-auto mt-2 w-40 rounded-xl border border-brand-purple/10 bg-white p-1.5 text-[11px] shadow-lift">
        <div className="flex items-center gap-1.5 rounded-lg bg-brand-purple-tint px-2 py-1.5 font-bold text-brand-purple">
          <Upload className="h-3.5 w-3.5" />
          Upload a skill
        </div>
        <StepBadge n={3} className="-left-2.5 -top-2.5" />
      </div>

      <div className="relative mt-3 flex items-center justify-between gap-3 rounded-xl border border-brand-purple/10 px-3 py-2.5">
        <div className="min-w-0">
          <div className="text-xs font-bold text-brand-ink">{SKILL_NAME}</div>
          <div className="truncate text-[10px] text-brand-ink/60">
            Draft formal Arabic scout letters…
          </div>
        </div>
        <span className="relative flex h-5 w-9 shrink-0 items-center rounded-full bg-brand-turquoise-dark px-0.5">
          <span className="ms-auto h-4 w-4 rounded-full bg-white" />
        </span>
        <StepBadge n={4} className="-right-2 -top-2.5" />
      </div>
    </div>
  );
}

export default function SkillsIllustration({
  variant,
  lang = "ar",
}: {
  variant: "desktop" | "mobile";
  lang?: Lang;
}) {
  const t = translator(lang);
  const mobile = variant === "mobile";
  return (
    <figure className="mt-8">
      <div
        role="img"
        aria-label={t(
          `رسم توضيحي لصفحة Skills في Claude${
            mobile ? " على claude.ai في متصفح الموبايل" : ""
          }: زر + ثم Upload a skill، وبعد الرفع زر تشغيل بجانب ${SKILL_NAME}.`,
          `Drawing of the Skills page in Claude${
            mobile ? " on claude.ai in a phone browser" : ""
          }: the + button, then Upload a skill, and after uploading, a toggle next to ${SKILL_NAME}.`,
        )}
      >
        <div aria-hidden="true" dir="ltr">
          {variant === "desktop" ? (
            <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-brand-purple/10 bg-white shadow-soft">
              <div className="flex items-center gap-1.5 border-b border-brand-purple/10 bg-brand-cream px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-ink/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-brand-ink/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-brand-ink/15" />
                <span className="mx-auto rounded-full bg-white px-3 py-0.5 text-[10px] text-brand-ink/60 ring-1 ring-brand-purple/10">
                  claude.ai
                </span>
              </div>
              <div className="grid grid-cols-[6.5rem_minmax(0,1fr)]">
                <div className="space-y-1 border-e border-brand-purple/10 bg-brand-cream/60 p-2 text-[11px]">
                  <div className="px-2 py-1.5 text-brand-ink/60">Chats</div>
                  <div className="px-2 py-1.5 text-brand-ink/60">Projects</div>
                  <div className="rounded-md bg-brand-purple-tint px-2 py-1.5 font-bold text-brand-purple ring-2 ring-brand-yellow">
                    Customize
                  </div>
                </div>
                <SkillsPanel />
              </div>
            </div>
          ) : (
            <div className="mx-auto w-64 overflow-hidden rounded-[2rem] border-[6px] border-brand-ink bg-white shadow-lift">
              <div className="flex justify-center py-1.5">
                <span className="h-1.5 w-14 rounded-full bg-brand-ink/80" />
              </div>
              {/* Browser address bar: uploads work on the web, not in the app. */}
              <div className="px-3 pb-2">
                <div className="rounded-full bg-brand-cream px-3 py-1 text-center text-[10px] text-brand-ink/60 ring-1 ring-brand-purple/10">
                  claude.ai
                </div>
              </div>
              <div className="border-b border-brand-purple/10 px-3 pb-2 text-[11px] font-semibold text-brand-purple">
                ‹ Customize
              </div>
              <SkillsPanel />
              <div className="h-6" />
            </div>
          )}
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs leading-6 text-brand-ink/70">
        {t(
          "رسم توضيحي وليس لقطة شاشة. قد تختلف الأسماء وأماكن الأزرار قليلًا في Claude.",
          "A drawing, not a screenshot. Names and button positions in Claude may differ slightly.",
        )}
      </figcaption>
    </figure>
  );
}
