"use client";

import { useState } from "react";

/**
 * Tap counter for sending salawat. Animations are plain CSS keyframes
 * (globals.css, "Salawat counter") so framer-motion stays off the homepage's
 * critical path; keyed spans replay them on every tap, and they're switched
 * off under prefers-reduced-motion.
 */
export default function SalawatButton({ className = "" }: { className?: string }) {
  const [count, setCount] = useState(0);

  return (
    <>
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        className={`${className} relative transition-transform active:scale-[0.97]`}
      >
        <span>صلِّ على النبي ﷺ</span>
        <span className="sr-only"> (عدّاد)</span>

        {/* Count badge: the number rolls up on each tap, with a ring pulse and a floating +1 */}
        <span aria-hidden="true" className="relative shrink-0">
          {count > 0 && (
            <span
              key={`ring-${count}`}
              className="salawat-ring pointer-events-none absolute inset-0 rounded-full border-2 border-brand-yellow motion-reduce:hidden"
            />
          )}

          <span
            className={`
              relative grid h-7 min-w-7 place-items-center overflow-hidden
              rounded-full px-2 text-xs font-bold tabular-nums
              transition-colors duration-300
              ${count > 0 ? "bg-brand-yellow text-brand-purple-dark" : "bg-white/15 text-white"}
            `}
          >
            <span key={count} className={`block leading-none ${count > 0 ? "salawat-roll" : ""}`}>
              {count}
            </span>
          </span>

          {count > 0 && (
            <span
              key={`plus-${count}`}
              className="
                salawat-plus pointer-events-none absolute -top-2 left-1/2
                text-sm font-bold text-brand-yellow
                drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]
                motion-reduce:hidden
              "
            >
              +1
            </span>
          )}
        </span>
      </button>

      <span aria-live="polite" className="sr-only">
        {count > 0 ? `عدد الصلوات على النبي: ${count}` : ""}
      </span>
    </>
  );
}
