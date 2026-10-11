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
 * Screen readers always get the final value (the ticking digits are hidden
 * from them), and the box reserves the final width so nothing reflows.
 */
export default function CountUp({ value }: { value: string }) {
  const match = value.match(/^(.*?)([0-9٠-٩]+)([\s\S]*)$/);
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

    // Already on screen at hydration: count from 0 right away instead of
    // showing the final number, dropping to 0, then waiting for the observer.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setShown(0);
      run();
      return () => cancelFrame(raf);
    }

    setShown(0);
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
      cancelFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!match || Number.isNaN(target)) return <span>{value}</span>;

  const prefix = match[1].trim();
  const suffix = match[3].trim();
  const text = arabic ? toArabic(shown) : String(shown);

  return (
    <span ref={ref} className="inline-flex">
      <span className="sr-only">{value}</span>
      <span
        dir="ltr"
        aria-hidden="true"
        className="inline-flex items-baseline tabular-nums"
      >
        {prefix && <span className="text-brand-yellow">{prefix}</span>}
        {/* Hug the "+" sign: digits like "1" are narrower than 1ch, so the
            spare reserved width must sit on the outer side, not inside "+ 100" */}
        <span
          className={`inline-block ${prefix && !suffix ? "text-start" : "text-end"}`}
          style={{ minWidth: `${match[2].length}ch` }}
        >
          {text}
        </span>
        {suffix && <span className="text-brand-yellow">{suffix}</span>}
      </span>
    </span>
  );
}

function cancelFrame(id: number) {
  if (id) cancelAnimationFrame(id);
}
