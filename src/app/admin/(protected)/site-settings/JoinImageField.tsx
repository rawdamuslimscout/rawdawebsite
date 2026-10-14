"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Monitor, Smartphone, Trash2, Undo2 } from "lucide-react";

import SafeImage from "@/components/ui/SafeImage";

/**
 * Background photo of the homepage "انضمّوا إلينا" band, with a live preview
 * of how it is cropped on a phone and on a desktop. The chosen file is only
 * uploaded when the settings form is saved (see SiteSettingsForm).
 */
export default function JoinImageField({
  savedUrl,
  file,
  onFileChange,
}: {
  savedUrl: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [removed, setRemoved] = useState(false);
  const [localUrl, setLocalUrl] = useState<string | null>(null);

  // Preview the picked file straight from the device, before any upload.
  useEffect(() => {
    if (!file) {
      setLocalUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const current = removed ? "" : savedUrl;
  const previewSrc = localUrl ?? (current || null);

  function pick(next: File | null) {
    onFileChange(next);
    if (next) setRemoved(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <fieldset className="sm:col-span-2" aria-describedby={`${inputId}-help`}>
      <legend className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
        صورة قسم «انضمّوا إلينا»
      </legend>
      <p id={`${inputId}-help`} className="mb-3 text-xs leading-5 text-brand-ink/70">
        تظهر خلف قسم الانضمام في الصفحة الرئيسية، مع طبقة داكنة ليبقى النص واضحًا. اختر صورة
        عريضة يكون أهمّ ما فيها في الوسط، لأن الهاتف يعرض الجزء الأوسط منها فقط. اتركها فارغة
        لاستخدام صورة من المعرض تلقائيًا.
      </p>

      {/* What the form saves: the stored URL, "" after removal; a new file replaces it on save. */}
      <input type="hidden" name="joinImageUrl" value={current} />

      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor={inputId}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-brand-purple/20 bg-white px-5 text-sm font-bold text-brand-purple hover:bg-brand-purple-tint/40 focus-within:ring-2 focus-within:ring-brand-purple/30"
        >
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          {previewSrc ? "اختيار صورة أخرى" : "اختيار صورة"}
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => pick(e.target.files?.[0] ?? null)}
          />
        </label>

        {file && (
          <button
            type="button"
            onClick={() => pick(null)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-brand-ink/70 hover:bg-brand-purple-tint/40"
          >
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            إلغاء الاختيار
          </button>
        )}

        {!file && current && (
          <button
            type="button"
            onClick={() => setRemoved(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            إزالة الصورة
          </button>
        )}

        {!file && removed && savedUrl && (
          <button
            type="button"
            onClick={() => setRemoved(false)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-brand-ink/70 hover:bg-brand-purple-tint/40"
          >
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            تراجع
          </button>
        )}
      </div>

      {file && (
        <p className="mt-2 text-xs font-semibold text-brand-purple">
          صورة جديدة لم تُحفظ بعد. اضغط «حفظ الإعدادات» لرفعها.
        </p>
      )}
      {!file && removed && savedUrl && (
        <p className="mt-2 text-xs font-semibold text-red-700">
          ستُزال الصورة عند الحفظ، وتُستخدم صورة من المعرض بدلًا منها.
        </p>
      )}

      {previewSrc ? (
        <div className="mt-4 flex flex-col gap-5 rounded-xl bg-brand-purple-tint/30 p-4 lg:flex-row lg:items-end">
          <PreviewFrame label="على الهاتف" icon={<Smartphone className="h-4 w-4" aria-hidden="true" />} className="w-40 shrink-0" aspect="aspect-[390/560]">
            <PreviewImage src={previewSrc} local={Boolean(localUrl)} />
            <PreviewContent compact />
          </PreviewFrame>
          <PreviewFrame label="على الكمبيوتر" icon={<Monitor className="h-4 w-4" aria-hidden="true" />} className="min-w-0 flex-1" aspect="aspect-[1440/600]">
            <PreviewImage src={previewSrc} local={Boolean(localUrl)} />
            <PreviewContent />
          </PreviewFrame>
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-brand-purple-tint/30 p-3 text-sm text-brand-ink/60">
          لا توجد صورة مختارة، فتُستخدم صورة من معرض الصور.
        </p>
      )}
    </fieldset>
  );
}

function PreviewFrame({
  label,
  icon,
  className,
  aspect,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  className: string;
  aspect: string;
  children: React.ReactNode;
}) {
  return (
    <figure className={className}>
      <figcaption className="mb-2 flex items-center gap-1.5 text-xs font-bold text-brand-ink/70">
        {icon}
        {label}
      </figcaption>
      <div
        aria-hidden="true"
        className={`relative isolate overflow-hidden rounded-lg bg-brand-purple-dark shadow-sm ring-4 ring-brand-ink/80 ${aspect}`}
      >
        {children}
      </div>
    </figure>
  );
}

function PreviewImage({ src, local }: { src: string; local: boolean }) {
  // A just-picked file is a blob: URL, which the image optimizer can't fetch.
  return local ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
  ) : (
    <SafeImage src={src} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
  );
}

/** A scaled-down copy of the band's text, so the admin sees it over the photo. */
function PreviewContent({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <div className="absolute inset-0 -z-10 bg-brand-ink/65" />
      <div className="flex h-full flex-col items-center justify-center px-3 text-center">
        <p className={`font-display font-bold text-white ${compact ? "text-base" : "text-xl sm:text-3xl"}`}>
          انضمّوا إلينا
        </p>
        <p className={`mt-1 font-semibold text-brand-yellow ${compact ? "text-[8px]" : "text-[10px] sm:text-xs"}`}>
          موعد الاجتماع الأسبوعي
        </p>
        <span
          className={`mt-2 rounded-full bg-brand-yellow font-bold text-brand-purple-dark ${
            compact ? "px-3 py-1 text-[7px]" : "px-4 py-1.5 text-[9px] sm:text-[11px]"
          }`}
        >
          ابدأوا الانتساب عبر واتساب
        </span>
      </div>
    </>
  );
}
