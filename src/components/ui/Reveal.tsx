"use client";

import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";
import { flushSync } from "react-dom";

type RevealProps = {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>;

/**
 * Scroll reveal. Content is fully visible on the server / without JS.
 * After hydration, elements that are still below the fold are hidden and
 * eased in once when they enter the viewport. Honors reduced motion.
 */
export default function Reveal({
  as: Tag = "div",
  delay = 0,
  className = "",
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<"ssr" | "hidden" | "in">("ssr");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("in");
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      setState("in");
      return;
    }

    setState("hidden");
    const reveal = () => {
      setState("in");
      io.disconnect();
      window.removeEventListener("beforeprint", revealForPrint);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    // Printing (or "save as PDF") never scrolls, so show everything first,
    // synchronously and without the fade, before the print snapshot.
    const revealForPrint = () => {
      el.style.transition = "none";
      flushSync(reveal);
    };
    window.addEventListener("beforeprint", revealForPrint);
    return () => {
      io.disconnect();
      window.removeEventListener("beforeprint", revealForPrint);
    };
  }, []);

  const cls =
    state === "hidden" ? "reveal" : state === "in" ? "reveal is-in" : "";

  return (
    <Tag
      ref={ref}
      className={`${className} ${cls}`.trim()}
      style={delay ? { "--reveal-delay": `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
