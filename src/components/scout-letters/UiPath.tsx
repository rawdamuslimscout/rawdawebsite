import { Fragment } from "react";

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
 * A menu path in Arabic reading order (Customize ← Skills): the first step
 * sits on the right, like the rest of the sentence.
 */
export function UiPath({ items }: { items: string[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1 align-middle">
      {items.map((item, index) => (
        <Fragment key={item}>
          {index > 0 && (
            <span aria-hidden="true" className="font-bold text-brand-ink/60">
              ←
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
