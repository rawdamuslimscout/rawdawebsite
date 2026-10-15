"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpLeft, Download, FileWarning, Loader2, X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

/** After this long without the viewer loading, show the fallback message. */
const LOAD_TIMEOUT_MS = 15000;

export type PdfPreview = {
  id: string;
  title: string;
  /** Microsoft's embed URL (validated by lib/onedrive). */
  embedUrl: string;
  /** Opens the file on OneDrive in a new tab. */
  openUrl: string;
  /** Direct download, only when one is available (uploaded copy). */
  downloadUrl?: string;
};

/**
 * In-page preview of a OneDrive-hosted PDF. The iframe is created only while
 * the modal is open, so the library page loads no viewer until a visitor asks
 * for one, and the file is fetched by the visitor's browser from Microsoft,
 * never through this site. Cross-origin frames can't report most failures
 * (expired or restricted links show Microsoft's own page), so the
 * "open in OneDrive" link is always visible.
 */
export default function PdfPreviewModal({
  preview,
  onClose,
}: {
  preview: PdfPreview | null;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "slow">(
    "loading",
  );
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Keep the latest `onClose` without re-running the open/close effect.
  const latest = useRef(onClose);
  latest.current = onClose;

  const isOpen = !!preview;

  useEffect(() => {
    if (!preview) return;
    setStatus("loading");
    const timer = setTimeout(
      () => setStatus((s) => (s === "loading" ? "slow" : s)),
      LOAD_TIMEOUT_MS,
    );
    return () => clearTimeout(timer);
  }, [preview?.id, preview?.embedUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        latest.current();
        return;
      }
      // Keep Tab inside the dialog.
      if (event.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const current = document.activeElement;
        if (!dialogRef.current.contains(current)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && current === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && current === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  if (!preview) return null;

  const titleId = `pdf-preview-title-${preview.id}`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-stretch justify-center bg-brand-purple-dark/70 backdrop-blur-sm sm:items-center sm:p-5"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        dir="rtl"
        className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[90vh] sm:max-w-5xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header: title + actions */}
        <div className="flex items-center gap-2 border-b border-brand-purple/[0.08] px-3 py-2.5 sm:px-5 sm:py-3">
          <h2
            id={titleId}
            className="min-w-0 flex-1 truncate font-display text-base font-bold text-brand-ink sm:text-lg"
          >
            {preview.title}
          </h2>

          <a
            href={preview.openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-brand-purple/15 px-3 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-purple-tint"
          >
            <span className="hidden sm:inline">فتح في OneDrive</span>
            <span className="sm:hidden">فتح</span>
            <span className="sr-only">(يفتح في نافذة جديدة)</span>
            <ArrowUpLeft className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
          </a>

          {preview.downloadUrl && (
            <a
              href={preview.downloadUrl}
              download
              aria-label={`تحميل ${preview.title}`}
              title="تحميل الملف"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-purple/15 text-brand-purple transition-colors hover:border-brand-purple/30 hover:bg-brand-purple-tint"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
            </a>
          )}

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="إغلاق المعاينة"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-brand-ink transition-colors hover:bg-brand-purple-tint"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Viewer */}
        <div className="relative flex-1 bg-brand-cream">
          <iframe
            key={preview.embedUrl}
            src={preview.embedUrl}
            title={`معاينة: ${preview.title}`}
            onLoad={() => setStatus("loaded")}
            // No top-level navigation, no access to this page.
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads allow-forms"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />

          {status !== "loaded" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-cream px-6 text-center"
              role="status"
            >
              {status === "loading" ? (
                <>
                  <Loader2
                    className="h-8 w-8 animate-spin text-brand-purple/60"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-semibold text-brand-ink/70">
                    جارٍ تحميل المعاينة…
                  </p>
                </>
              ) : (
                <>
                  <FileWarning
                    className="h-10 w-10 text-brand-purple/40"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <p className="text-base font-semibold text-brand-ink/75">
                    تعذّر عرض المعاينة هنا.
                  </p>
                  <a
                    href={preview.openUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-purple px-5 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark"
                  >
                    فتح الملف في OneDrive
                    <ArrowUpLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </>
              )}
            </div>
          )}
        </div>

        <p className="border-t border-brand-purple/[0.08] px-4 py-2 text-center text-xs text-brand-ink/60">
          لا تظهر المعاينة؟ استخدم «فتح في OneDrive».
        </p>
      </div>
    </div>
  );
}
