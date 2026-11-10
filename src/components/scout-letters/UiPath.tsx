import { Fragment } from "react";
import type { Lang } from "@/data/scoutLetters";

// Claude's interface is in English. These keep each label and file name
// left-to-right inside Arabic sentences so they never render garbled.

export function UiLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      dir="ltr"
      className="inline-block whitespace-nowrap rounded-md bg-brand-purple-tint px-1.5 py-0.5 text-[0.9em] font-bold leading-snug text-brand-purple"
    >
      {children}
    </span>
  );
}

/**
 * A menu path in the page's reading order: in Arabic the first step sits on
 * the right (Customize ← Skills), in English on the left (Customize → Skills).
 */
export function UiPath({ items, lang = "ar" }: { items: string[]; lang?: Lang }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1 align-middle">
      {items.map((item, index) => (
        <Fragment key={item}>
          {index > 0 && (
            <span aria-hidden="true" className="font-bold text-brand-ink/60">
              {lang === "en" ? "→" : "←"}
            </span>
          )}
          <UiLabel>{item}</UiLabel>
        </Fragment>
      ))}
    </span>
  );
}

export function FileName({ children }: { children: React.ReactNode }) {
  return (
    <span dir="ltr" className="break-all font-semibold text-brand-ink">
      {children}
    </span>
  );
}
