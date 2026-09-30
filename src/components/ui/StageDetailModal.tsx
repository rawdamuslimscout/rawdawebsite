"use client";

// src/components/ui/StageDetailModal.tsx
import { useEffect, useRef, useState } from "react";
import { X, ExternalLink, ArrowLeft } from "lucide-react";
import { iconMap } from "@/lib/icons";
import { badgeIconMap } from "@/lib/badgeIcons";
import { stageBadges } from "@/data/stageBadges";
import { stageCurriculum } from "@/data/stageCurriculum";
import type { ScoutStage } from "@/data/content";

type Tab = "overview" | "goals" | "badges" | "leaders";

const stageDetails: Record<string, { label: string; points: string[] }> = {
  "ashbal-zahrat": {
    label: "اكتشاف وتعلّم",
    points: [
      "القيم والنظافة والاعتماد على النفس",
      "اللعب والعمل ضمن السداسي",
      "الحكاية والمهارات الكشفية الأولى",
    ],
  },
  "kashafa-morshedat": {
    label: "مهارة وانتماء",
    points: [
      "الحياة في الخلاء والتخييم",
      "القيادة والإسعافات الأولية",
      "خدمة المجتمع والعمل ضمن الطليعة",
    ],
  },
  "jawwala-dalilat": {
    label: "مبادرة وخدمة",
    points: [
      "تخطيط المشاريع وتحمل المسؤولية",
      "تنمية المهارات القيادية والمهنية",
      "خدمة الوطن والمجتمع",
    ],
  },
};

export default function StageDetailModal({
  stage,
  open,
  onClose,
}: {
  stage: ScoutStage;
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const Icon = iconMap[stage.icon];
  const details = stageDetails[stage.id] || { label: "رحلة كشفية", points: [] };
  const badgeData = stageBadges[stage.id];
  const curriculum = stageCurriculum[stage.id];

  // Reset to the overview tab each time a different stage is opened.
  useEffect(() => {
    if (open) setTab("overview");
  }, [open, stage.id]);

  // Escape to close and keep the page from scrolling behind the dialog.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "نظرة عامة" },
    ...(curriculum ? [{ id: "goals" as Tab, label: "الأهداف والمناهج" }] : []),
    { id: "badges", label: "الأوسمة", count: badgeData?.totalCount },
    ...(stage.leaders.length > 0
      ? [
          {
            id: "leaders" as Tab,
            label: "قادة المرحلة",
            count: stage.leaders.length,
          },
        ]
      : []),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`stage-modal-title-${stage.id}`}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92dvh] min-h-0 w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_30px_60px_-15px_rgba(43,23,80,0.35)] outline-none animate-in slide-in-from-bottom duration-300 sm:max-w-2xl sm:rounded-3xl sm:duration-200"
      >
        {/* Header */}
        <div className="relative shrink-0 bg-gradient-to-l from-brand-purple to-brand-purple-dark px-4 pb-0 pt-5 text-white sm:px-7 sm:pt-6">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25 sm:left-4 sm:top-4"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 pl-12 sm:gap-4 sm:pl-0">
            <div className="badge-shield flex h-12 w-12 shrink-0 items-center justify-center bg-white/15 sm:h-14 sm:w-14">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3
                id={`stage-modal-title-${stage.id}`}
                className="font-display text-lg font-bold leading-tight sm:text-xl"
              >
                {stage.title}
              </h3>
              <p className="text-sm text-white/75">{stage.ageRange}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="no-scrollbar -mx-4 mt-5 flex gap-1 overflow-x-auto border-b border-white/15 px-4 sm:-mx-7 sm:px-7">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`relative min-h-11 shrink-0 whitespace-nowrap px-3 pb-3 text-sm font-bold transition-colors ${
                  tab === t.id
                    ? "text-white"
                    : "text-white/55 hover:text-white/80"
                }`}
              >
                {t.label}
                {typeof t.count === "number" && (
                  <span className="ms-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                    {t.count}
                  </span>
                )}
                {tab === t.id && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-yellow" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-5 [padding-bottom:calc(1.25rem+env(safe-area-inset-bottom))] sm:px-7 sm:py-6">
          {tab === "overview" && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-turquoise-dark">
                {details.label}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-brand-ink/70">
                {stage.description}
              </p>
              <h4 className="mt-6 font-display text-sm font-bold text-brand-ink">
                محاور المرحلة
              </h4>
              <ul className="mt-3 space-y-2.5">
                {details.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-2.5 text-sm leading-relaxed text-brand-ink/70"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-yellow" />
                    {point}
                  </li>
                ))}
              </ul>
              {stage.fileUrl && (
                <a
                  href={stage.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-purple underline underline-offset-4"
                >
                  تحميل دليل المرحلة
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}

          {tab === "goals" && curriculum && (
            <div>
              <h4 className="font-display text-sm font-bold text-brand-ink">
                الأهداف التربوية للحلقة
              </h4>
              <ul className="mt-3 space-y-2.5">
                {curriculum.goals.map((goal, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-sm leading-relaxed text-brand-ink/70"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-purple-tint font-display text-[11px] font-bold text-brand-purple">
                      {i + 1}
                    </span>
                    {goal}
                  </li>
                ))}
              </ul>

              <h4 className="mt-7 font-display text-sm font-bold text-brand-ink">
                مسار الدرجات
              </h4>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {curriculum.degrees.map((degree, i) => (
                  <div key={degree.name} className="flex items-center gap-2">
                    <div className="rounded-xl border border-brand-purple/15 bg-brand-cream/60 px-3 py-2">
                      <p className="text-xs font-bold text-brand-ink">
                        {degree.name}
                      </p>
                      {degree.duration && (
                        <p className="text-[10px] text-brand-ink/50">
                          {degree.duration}
                        </p>
                      )}
                    </div>
                    {i < curriculum.degrees.length - 1 && (
                      <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-brand-ink/25" />
                    )}
                  </div>
                ))}
              </div>

              {curriculum.specialDegrees && (
                <>
                  <h4 className="mt-6 font-display text-sm font-bold text-brand-ink">
                    درجات كشفية خاصة
                  </h4>
                  <p className="mt-1 text-xs text-brand-ink/50">
                    تُنال بعد استكمال الأوسمة المطلوبة، بمعزل عن الدرجات الزمنية
                    أعلاه.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {curriculum.specialDegrees.map((d) => (
                      <span
                        key={d.name}
                        className="rounded-full bg-brand-purple/10 px-3 py-1.5 text-xs font-bold text-brand-purple"
                      >
                        {d.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "badges" && badgeData && (
            <div>
              <p className="text-sm leading-relaxed text-brand-ink/60">
                نماذج من أوسمة هذه المرحلة — منتسبونا يعملون على أكثر من{" "}
                <span className="font-bold text-brand-ink">
                  {badgeData.totalCount}
                </span>{" "}
                وسام كفاية وهواية.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {badgeData.items.map((badge) => {
                  const BadgeIcon = badgeIconMap[badge.icon];
                  return (
                    <div
                      key={badge.id}
                      className="flex gap-3 rounded-2xl border border-brand-purple/10 bg-brand-cream/60 p-3.5"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-purple text-white">
                        {BadgeIcon && (
                          <BadgeIcon className="h-4 w-4" strokeWidth={2} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-brand-ink">
                          {badge.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-brand-ink/60">
                          {badge.summary}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "leaders" && (
            <div className="space-y-4">
              {stage.leaders.map((leader) => (
                <div key={leader.id} className="flex gap-3">
                  {leader.photoUrl ? (
                    <img
                      src={leader.photoUrl}
                      alt={leader.name}
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-full bg-brand-purple-tint" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-brand-ink">
                      {leader.name}
                    </p>
                    <p className="text-xs text-brand-turquoise-dark">
                      {leader.rank} · {leader.role}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-brand-ink/60">
                      {leader.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
