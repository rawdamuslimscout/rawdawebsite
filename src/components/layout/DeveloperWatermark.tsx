"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronUp,
  ExternalLink,
  Instagram,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const links = [
  {
    label: "Instagram Profile",
    href: "https://instagram.com/youssefmariam",
    icon: Instagram,
    tone: "text-pink-400",
  },
  {
    label: "LinkedIn Connect",
    href: "https://linkedin.com/in/youssefmariam",
    icon: Linkedin,
    tone: "text-blue-400",
  },
  {
    label: "Direct WhatsApp",
    href: "https://wa.me/96181348184",
    icon: MessageCircle,
    tone: "text-emerald-400",
  },
];

export default function DeveloperWatermark() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ left: 16, top: 100 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;

    const width = Math.min(272, viewportWidth - 32);
    const center = rect.left + rect.width / 2;

    const left = Math.max(
      16,
      Math.min(center - width / 2, viewportWidth - width - 16),
    );

    const estimatedHeight = 190;
    let top = rect.top - estimatedHeight - 12;

    if (top < 12) {
      top = rect.bottom + 12;
    }

    top = Math.max(12, Math.min(top, viewportHeight - estimatedHeight - 12));

    setPosition({ left, top });
  };

  const toggleMenu = () => {
    if (!open) {
      updatePosition();
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        !triggerRef.current?.contains(target) &&
        !dialogRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const handleReposition = () => updatePosition();

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open]);

  return (
    <>
      <div className="relative w-full">
        <div
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-white/55 sm:justify-start sm:text-sm"
          dir="ltr"
        >
          <button
            ref={triggerRef}
            type="button"
            onClick={toggleMenu}
            className="group inline-flex min-h-8 items-center gap-1.5 whitespace-nowrap font-semibold text-white/85 transition-colors hover:text-brand-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
            aria-expanded={open}
            aria-haspopup="true"
            aria-label="عرض روابط المطور"
          >
            <ChevronUp
              className={`h-3 w-3 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
            <span>يوسف مريم</span>
          </button>

          <span dir="rtl" className="whitespace-nowrap">
            تم تطوير هذا الموقع بواسطة
          </span>
        </div>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={dialogRef}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "fixed",
                  left: position.left,
                  top: position.top,
                  width: "min(17rem, calc(100vw - 2rem))",
                  zIndex: 9999,
                }}
                className="rounded-2xl border border-white/15 bg-[#211b2d] p-3 text-left shadow-2xl"
                dir="ltr"
              >
                <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                  <div>
                    <p className="text-xs font-bold text-white">
                      Youssef Mariam
                    </p>
                    <p className="text-[10px] text-white/50">
                      Full-Stack Developer
                    </p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>

                <div className="space-y-1.5">
                  {links.map(({ label, href, icon: Icon, tone }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="group flex min-h-10 items-center justify-between rounded-xl border border-white/5 bg-white/[0.04] p-2 transition-colors hover:border-brand-yellow/30 hover:bg-white/[0.08] active:bg-white/[0.1]"
                    >
                      <span className="flex items-center gap-2.5 text-xs font-medium text-white/80 group-hover:text-white">
                        <Icon className={`h-4 w-4 shrink-0 ${tone}`} />
                        {label}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-white/40 group-hover:text-brand-yellow" />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
