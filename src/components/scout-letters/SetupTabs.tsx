"use client";

import { useEffect, useRef, useState } from "react";
import { Laptop, Smartphone, TriangleAlert, type LucideIcon } from "lucide-react";
import { UiLabel } from "./UiPath";

type TabId = "computer" | "mobile";

const TABS: { id: TabId; label: string; Icon: LucideIcon }[] = [
  { id: "computer", label: "الكمبيوتر", Icon: Laptop },
  { id: "mobile", label: "الموبايل", Icon: Smartphone },
];

/**
 * Accessible tabs (WAI-ARIA tabs pattern) for the setup steps. Both panels are
 * server-rendered; only the active one is visible. Phones and tablets open on
 * the mobile steps.
 */
export default function SetupTabs({
  computer,
  mobile,
}: {
  computer: React.ReactNode;
  mobile: React.ReactNode;
}) {
  const [active, setActive] = useState<TabId>("computer");
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    computer: null,
    mobile: null,
  });

  useEffect(() => {
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      setActive("mobile");
    }
  }, []);

  const select = (id: TabId, focus = false) => {
    setActive(id);
    if (focus) tabRefs.current[id]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const index = TABS.findIndex((tab) => tab.id === active);
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    let next: number | null = null;
    if (event.key === "ArrowLeft") next = rtl ? index + 1 : index - 1;
    else if (event.key === "ArrowRight") next = rtl ? index - 1 : index + 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    if (next === null) return;
    event.preventDefault();
    select(TABS[(next + TABS.length) % TABS.length].id, true);
  };

  const panels: Record<TabId, React.ReactNode> = { computer, mobile };

  return (
    <div>
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="اختر جهازك"
          className="inline-flex gap-1 rounded-full bg-white p-1 shadow-soft ring-1 ring-brand-purple/10"
        >
          {TABS.map(({ id, label, Icon }) => {
            const selected = active === id;
            return (
              <button
                key={id}
                ref={(el) => {
                  tabRefs.current[id] = el;
                }}
                type="button"
                role="tab"
                id={`setup-tab-${id}`}
                aria-controls={`setup-panel-${id}`}
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(id)}
                onKeyDown={onKeyDown}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-sm font-bold transition-colors sm:px-7 ${
                  selected
                    ? "bg-brand-purple text-white shadow-sm"
                    : "text-brand-ink/70 hover:bg-brand-purple-tint hover:text-brand-ink"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {TABS.map(({ id }) => (
        <div
          key={id}
          role="tabpanel"
          id={`setup-panel-${id}`}
          aria-labelledby={`setup-tab-${id}`}
          hidden={active !== id}
          tabIndex={0}
          className="mt-8 rounded-2xl"
        >
          {panels[id]}

          {id === "mobile" && (
            <aside
              aria-labelledby="mobile-fallback-heading"
              className="mt-8 rounded-2xl border border-brand-yellow/50 bg-brand-yellow/10 p-5 sm:p-6"
            >
              <h3
                id="mobile-fallback-heading"
                className="flex items-start gap-2 font-display text-lg font-bold text-brand-ink"
              >
                <TriangleAlert
                  className="mt-1 h-5 w-5 shrink-0 text-brand-yellow-dark"
                  aria-hidden="true"
                />
                <span>
                  لم يظهر لك خيار <UiLabel>Upload a skill</UiLabel>؟
                </span>
              </h3>
              <p className="mt-2 text-sm leading-7 text-brand-ink/80 sm:text-base sm:leading-8">
                تأكّد أنك تستعمل claude.ai في المتصفح وليس تطبيق Claude، لأن التطبيق لا
                يتيح رفع الإضافات. وإذا لم يظهر الخيار، ارفع الملف مرة واحدة من كمبيوتر
                باتباع خطوات «الكمبيوتر». الإضافة تبقى مرتبطة بحسابك، فتستطيع بعدها
                استعمالها على موبايلك بالحساب نفسه.
              </p>
              <button
                type="button"
                onClick={() => select("computer", true)}
                className="btn-purple mt-4 w-full sm:w-auto"
              >
                <Laptop className="h-4 w-4" aria-hidden="true" />
                اعرض خطوات الكمبيوتر
              </button>
            </aside>
          )}
        </div>
      ))}
    </div>
  );
}
