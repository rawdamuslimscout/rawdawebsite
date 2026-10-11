"use client";

// src/components/ui/StageDetailModal.tsx
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, ExternalLink, ArrowLeft } from "lucide-react";
import { iconMap } from "@/lib/icons";
import { badgeIconMap } from "@/lib/badgeIcons";
import { stageBadges } from "@/data/stageBadges";
import { stageCurriculum } from "@/data/stageCurriculum";
import type { ScoutStage } from "@/data/content";
import { thumbUrl } from "@/lib/image-url";

type Tab = "overview" | "goals" | "badges" | "leaders";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const bodyRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const reduceMotion = useReducedMotion();
  const uid = useId();
  const Icon = iconMap[stage.icon];
  const details = stageDetails[stage.id] || { label: "رحلة كشفية", points: [] };
  const badgeData = stageBadges[stage.id];
  const curriculum = stageCurriculum[stage.id];
  const titleId = `stage-modal-title-${stage.id}`;
  const descId = `stage-modal-desc-${stage.id}`;
  const tabId = (id: Tab) => `${uid}-tab-${id}`;
  const panelId = (id: Tab) => `${uid}-panel-${id}`;

  // Reset to the overview tab each time a different stage is opened.
  useEffect(() => {
    if (open) setTab("overview");
  }, [open, stage.id]);

  // Each tab starts at the top of the scrollable body.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  // Escape to close, keep Tab focus inside the dialog, and keep the page
  // from scrolling (or shifting by the scrollbar width) behind it.
  // onClose is read through a ref so a new callback identity from the
  // parent never re-runs this effect (which would pull focus back).
  useEffect(() => {
    if (!open) return;
    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      const dialog = dialogRef.current;
      if (e.key !== "Tab" || !dialog) return;
      const nodes = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((n) => n.getClientRects().length > 0);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      const outside = !dialog.contains(active);
      if (e.shiftKey && (active === first || active === dialog || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "نظرة عامة" },
    ...(curriculum ? [{ id: "goals" as Tab, label: "الأهداف والمناهج" }] : []),
    ...(badgeData
      ? [{ id: "badges" as Tab, label: "الأوسمة", count: badgeData.totalCount }]
      : []),
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

  const selectTab = (id: Tab, focus = false) => {
    setTab(id);
    const el = tabRefs.current[id];
    if (focus) el?.focus();
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  // Roving focus for the tab list. Arrow keys follow the reading direction
  // (RTL: ArrowLeft moves to the next tab); Home/End jump to the ends.
  const onTabKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    const index = tabs.findIndex((t) => t.id === tab);
    let next = -1;
    if (e.key === "ArrowLeft") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowRight")
      next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    selectTab(tabs[next].id, true);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-brand-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(e) => e.stopPropagation()}
        initial={reduceMotion ? false : { opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex max-h-[92dvh] min-h-0 w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_30px_60px_-15px_rgba(43,23,80,0.35)] outline-none sm:max-w-2xl sm:rounded-3xl"
      >
        {/* Header */}
        <div className="relative shrink-0 bg-gradient-to-l from-brand-purple to-brand-purple-dark px-4 pb-0 pt-5 text-white sm:px-7 sm:pt-6">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute end-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25 sm:end-4 sm:top-4"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-3 pe-12 sm:gap-4">
            <div
              aria-hidden="true"
              className="badge-shield flex h-12 w-12 shrink-0 items-center justify-center bg-white/15 sm:h-14 sm:w-14"
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2
                id={titleId}
                className="font-display text-lg font-bold leading-tight sm:text-xl"
              >
                {stage.title}
              </h2>
              <p id={descId} className="text-sm text-white/80">
                {stage.ageRange}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div
            role="tablist"
            aria-label={`أقسام ${stage.title}`}
            className="no-scrollbar -mx-4 mt-5 flex gap-1 overflow-x-auto border-b border-white/15 px-4 sm:-mx-7 sm:px-7"
          >
            {tabs.map((t) => {
              const selected = tab === t.id;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[t.id] = el;
                  }}
                  id={tabId(t.id)}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={panelId(t.id)}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectTab(t.id)}
                  onKeyDown={onTabKeyDown}
                  className={`relative min-h-11 shrink-0 whitespace-nowrap px-3 pb-3 pt-1 text-sm font-bold transition-colors focus-visible:outline-offset-[-2px] ${
                    selected ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {t.label}
                  {typeof t.count === "number" && (
                    <span className="ms-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                      {t.count}
                    </span>
                  )}
                  {selected && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-yellow"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div
          ref={bodyRef}
          role="tabpanel"
          id={panelId(tab)}
          aria-labelledby={tabId(tab)}
          tabIndex={0}
          className="min-h-0 overflow-y-auto overscroll-contain px-4 py-5 outline-none [padding-bottom:calc(1.25rem+env(safe-area-inset-bottom))] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/30 sm:px-7 sm:py-6"
        >
          {tab === "overview" && (
            <div>
              <p className="text-sm font-bold text-brand-turquoise-dark">
                {details.label}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-brand-ink/70">
                {stage.description}
              </p>
              {details.points.length > 0 && (
                <>
                  <h3 className="mt-6 font-display text-sm font-bold text-brand-ink">
                    محاور المرحلة
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {details.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-2.5 text-sm leading-relaxed text-brand-ink/70"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-yellow"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {stage.fileUrl && (
                <a
                  href={stage.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-brand-purple underline underline-offset-4"
                >
                  تحميل دليل المرحلة
                  <span className="sr-only"> (يفتح في نافذة جديدة)</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          )}

          {tab === "goals" && curriculum && (
            <div>
              <h3 className="font-display text-sm font-bold text-brand-ink">
                الأهداف التربوية للحلقة
              </h3>
              <ol className="mt-3 space-y-2.5">
                {curriculum.goals.map((goal, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-sm leading-relaxed text-brand-ink/70"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-purple-tint font-display text-[11px] font-bold text-brand-purple"
                    >
                      {i + 1}
                    </span>
                    {goal}
                  </li>
                ))}
              </ol>

              <h3 className="mt-7 font-display text-sm font-bold text-brand-ink">
                مسار الدرجات
              </h3>
              <ol className="mt-3 flex flex-wrap items-center gap-2">
                {curriculum.degrees.map((degree, i) => (
                  <li key={degree.name} className="flex items-center gap-2">
                    <div className="rounded-xl border border-brand-purple/15 bg-brand-cream/60 px-3 py-2">
                      <p className="text-xs font-bold text-brand-ink">
                        {degree.name}
                      </p>
                      {degree.duration && (
                        <p className="text-[11px] text-brand-ink/60">
                          {degree.duration}
                        </p>
                      )}
                    </div>
                    {i < curriculum.degrees.length - 1 && (
                      <ArrowLeft
                        className="h-3.5 w-3.5 shrink-0 text-brand-ink/40"
                        aria-hidden="true"
                      />
                    )}
                  </li>
                ))}
              </ol>

              {curriculum.specialDegrees && (
                <>
                  <h3 className="mt-6 font-display text-sm font-bold text-brand-ink">
                    درجات كشفية خاصة
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-brand-ink/60">
                    تُنال بعد استكمال الأوسمة المطلوبة، بمعزل عن الدرجات الزمنية
                    أعلاه.
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {curriculum.specialDegrees.map((d) => (
                      <li
                        key={d.name}
                        className="rounded-full bg-brand-purple/10 px-3 py-1.5 text-xs font-bold text-brand-purple"
                      >
                        {d.name}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {tab === "badges" && badgeData && (
            <div>
              <p className="text-sm leading-relaxed text-brand-ink/70">
                نماذج من أوسمة هذه المرحلة — منتسبونا يعملون على أكثر من{" "}
                <span className="font-bold text-brand-ink">
                  {badgeData.totalCount}
                </span>{" "}
                وسام كفاية وهواية.
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {badgeData.items.map((badge) => {
                  const BadgeIcon = badgeIconMap[badge.icon];
                  return (
                    <li
                      key={badge.id}
                      className="flex gap-3 rounded-2xl border border-brand-purple/10 bg-brand-cream/60 p-3.5"
                    >
                      <div
                        aria-hidden="true"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-purple text-white"
                      >
                        {BadgeIcon && (
                          <BadgeIcon className="h-4 w-4" strokeWidth={2} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-brand-ink">
                          {badge.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-brand-ink/70">
                          {badge.summary}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {tab === "leaders" && (
            <ul className="space-y-4">
              {stage.leaders.map((leader) => (
                <li key={leader.id} className="flex gap-3">
                  {leader.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbUrl(leader.photoUrl)}
                      alt=""
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                      className="h-12 w-12 shrink-0 rounded-full bg-brand-purple-tint object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-purple-tint font-display text-lg font-bold text-brand-purple"
                    >
                      {leader.name.trim().charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-brand-ink">
                      {leader.name}
                    </p>
                    <p className="text-xs text-brand-turquoise-dark">
                      {leader.rank} · {leader.role}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-brand-ink/70">
                      {leader.bio}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
