"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Floating "back to top" button that appears after the first screenful. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 1.2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    document.getElementById("main-content")?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={scrollTop}
      aria-label="العودة إلى أعلى الصفحة"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`fixed bottom-5 end-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-purple-dark text-white shadow-lift ring-1 ring-white/15 transition-all duration-300 hover:bg-brand-yellow hover:text-brand-purple-dark sm:bottom-6 sm:end-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <ArrowUp size={20} aria-hidden />
    </button>
  );
}
