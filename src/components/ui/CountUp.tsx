"use client";

import { useEffect, useRef, useState } from "react";

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function toLatin(s: string) {
  return s.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}
function toArabic(n: number) {
  return String(n).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
}

/**
 * Animated impact number. Keeps the original numeral system (Latin or
 * Arabic-Indic) and any prefix/suffix such as "+". Server output is the
 * final value, so there is no hydration mismatch and no-JS is correct.
 */
export default function CountUp({ value }: { value: string }) {
  const match = value.match(/^(.*?)([0-9٠-٩]+)(.*)$/s);
  const target = match ? parseInt(toLatin(match[2]), 10) : NaN;
  const arabic = match ? /[٠-٩]/.test(match[2]) : false;
  const [shown, setShown] = useState<number>(target);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!match || Number.isNaN(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    setShown(0);
    const run = () => {
      const start = performance.now();
      const duration = 1400;
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setShown(Math.round(target * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAffix(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!match || Number.isNaN(target)) return <span>{value}</span>;

  const prefix = match[1].trim();
  const suffix = match[3].trim();
  const text = arabic ? toArabic(shown) : String(shown);

  return (
    <span
      ref={ref}
      dir="ltr"
      className="inline-flex items-baseline tabular-nums"
      aria-label={value}
    >
      {prefix && <span className="text-brand-yellow">{prefix}</span>}
      <span aria-hidden="true">{text}</span>
      {suffix && <span className="text-brand-yellow">{suffix}</span>}
    </span>
  );
}

function cancelAffix(id: number) {
  if (id) cancelAnimationFrame(id);
}
