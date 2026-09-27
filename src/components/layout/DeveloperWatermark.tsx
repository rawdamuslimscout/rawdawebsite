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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <div
        className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-white/55 sm:justify-start sm:text-sm"
        dir="rtl"
      >
        <span>تم تطوير هذا الموقع بواسطة</span>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="group inline-flex items-center gap-1.5 font-semibold text-white/85 transition-colors hover:text-brand-yellow"
          aria-expanded={open}
          aria-label="عرض روابط المطور"
        >
          <span>Youssef Mariam</span>
          <ChevronUp
            className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 z-50 mb-3 w-[min(17rem,calc(100vw-2.5rem))] -translate-x-1/2 rounded-2xl border border-white/15 bg-[#211b2d] p-3 text-left shadow-2xl sm:left-0 sm:translate-x-0"
            dir="ltr"
          >
            <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <p className="text-xs font-bold text-white">Youssef Mariam</p>
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
                  className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.04] p-2 transition-colors hover:border-brand-yellow/30 hover:bg-white/[0.08]"
                >
                  <span className="flex items-center gap-2.5 text-xs font-medium text-white/80 group-hover:text-white">
                    <Icon className={`h-4 w-4 ${tone}`} />
                    {label}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-white/40 group-hover:text-brand-yellow" />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
