"use client";

import { useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

const spring = { type: "spring", stiffness: 520, damping: 30 } as const;

export default function SalawatButton({ className = "" }: { className?: string }) {
  const [count, setCount] = useState(0);

  return (
    <MotionConfig reducedMotion="user">
      <motion.button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        whileTap={{ scale: 0.97 }}
        className={`${className} relative gap-3 pe-2 ps-7`}
      >
        <span>ابدأ بالصلاة على النبي ﷺ</span>

        {/* Count badge: the number rolls up on each tap, with a ring pulse and a floating +1 */}
        <span aria-hidden="true" className="relative shrink-0">
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                key={`ring-${count}`}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-purple-dark"
              />
            )}
          </AnimatePresence>

          <motion.span
            layout
            transition={spring}
            className={`
              relative grid h-9 min-w-9 place-items-center overflow-hidden
              rounded-full px-2.5 text-sm font-bold tabular-nums
              transition-colors duration-300
              ${count > 0 ? "bg-brand-purple-dark text-brand-yellow" : "bg-brand-purple-dark/15 text-brand-purple-dark/70"}
            `}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={count}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-110%", opacity: 0 }}
                transition={spring}
                className="block leading-none"
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </motion.span>

          <AnimatePresence>
            {count > 0 && (
              <motion.span
                key={`plus-${count}`}
                initial={{ x: "-50%", y: 0, opacity: 1 }}
                animate={{ x: "-50%", y: -34, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="
                  pointer-events-none absolute -top-2 left-1/2
                  text-sm font-bold text-brand-yellow
                  drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]
                "
              >
                +1
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </motion.button>

      <span aria-live="polite" className="sr-only">
        {count > 0 ? `عدد الصلوات على النبي: ${count}` : ""}
      </span>
    </MotionConfig>
  );
}
