"use client";

import { Share2, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SharePdfButtonProps = {
  url: string;
  title: string;
  /**
   * Try to share the file itself (PDF/DOCX) on devices that support it.
   * Set to false to share a page link only (e.g. a blog article).
   */
  shareFile?: boolean;
  /** Visible label; defaults to "مشاركة". */
  label?: string;
  /** Accessible name; defaults to "مشاركة الملف". */
  ariaLabel?: string;
  /** Text passed to the native share sheet with the link. */
  shareText?: string;
  className?: string;
};

export default function SharePdfButton({
  url,
  title,
  shareFile = true,
  label = "مشاركة",
  ariaLabel = "مشاركة الملف",
  shareText,
  className,
}: SharePdfButtonProps) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const getFullUrl = () => {
    return new URL(url, window.location.origin).href;
  };

  const share = async () => {
    const fullUrl = getFullUrl();

    // Try sharing the actual file, but only on devices that can share files —
    // otherwise the whole file would be downloaded just to be thrown away.
    if (shareFile) {
      const isDocx = /\.docx(\?|$)/i.test(fullUrl);
      const type = isDocx
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/pdf";
      const fileName = `${title}.${isDocx ? "docx" : "pdf"}`;
      const canShareFiles =
        !!navigator.share &&
        !!navigator.canShare?.({ files: [new File([""], fileName, { type })] });

      if (canShareFiles) {
        try {
          const response = await fetch(fullUrl);

          if (!response.ok) throw new Error("Could not fetch file");

          const blob = await response.blob();
          const file = new File([blob], fileName, { type });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title,
              text: title,
              files: [file],
            });
            return;
          }
        } catch (error) {
          // The visitor closed the share sheet: don't open a second one.
          if (error instanceof Error && error.name === "AbortError") return;
          // Otherwise fall back to sharing the link
          console.log("File sharing unavailable:", error);
        }
      }
    }

    // Share the link if supported
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText ?? `شارك هذا الملف: ${title}`,
          url: fullUrl,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      }
    }

    // Final fallback: copy the link
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("انسخ الرابط:", fullUrl);
    }
  };

  const handleShare = async () => {
    // Fetching the file for the share sheet can take a moment: block double taps.
    if (busy) return;
    setBusy(true);
    try {
      await share();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={ariaLabel}
      aria-busy={busy || undefined}
      title={copied ? "تم نسخ الرابط" : ariaLabel}
      className={
        className ??
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-brand-purple/15 px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-purple-tint disabled:opacity-60"
      }
    >
      {copied ? (
        <>
          <Check
            size={16}
            aria-hidden="true"
            className="text-brand-turquoise-dark"
          />
          تم نسخ الرابط
        </>
      ) : (
        <>
          <Share2 size={16} aria-hidden="true" />
          {label}
        </>
      )}
      {/* Announce the copy confirmation to screen readers. */}
      <span className="sr-only" aria-live="polite">
        {copied ? "تم نسخ الرابط إلى الحافظة" : ""}
      </span>
    </button>
  );
}
