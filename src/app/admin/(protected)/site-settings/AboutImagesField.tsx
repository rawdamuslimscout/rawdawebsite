"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ImagePlus, Monitor, Smartphone, X } from "lucide-react";

import SafeImage from "@/components/ui/SafeImage";

type GalleryItem = { id: string; title: string; imageUrl: string };

/** A photo in the section, in the order the homepage shows them (uploads first). */
type Slot =
  | { kind: "saved"; key: string; url: string }
  | { kind: "new"; key: string; file: File; url: string }
  | { kind: "gallery"; key: string; item: GalleryItem };

/**
 * Photos of the "عن الفوج" section: upload new ones and/or pick from the
 * gallery, up to `max`, with a preview of the homepage band on a phone and a
 * desktop. New files are only uploaded when the settings form is saved (see
 * SiteSettingsForm); until then they are previewed straight from the device.
 */
export default function AboutImagesField({
  gallery,
  savedUrls,
  savedIds,
  max,
  files,
  onFilesChange,
}: {
  gallery: GalleryItem[];
  savedUrls: string[];
  savedIds: string[];
  max: number;
  files: File[];
  onFilesChange: (files: File[]) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [keptUrls, setKeptUrls] = useState(savedUrls);
  const [ids, setIds] = useState(() => savedIds.filter((id) => gallery.some((g) => g.id === id)));
  const [notice, setNotice] = useState<string | null>(null);

  const [localUrls, setLocalUrls] = useState<string[]>([]);

  // Preview picked files straight from the device, before any upload.
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setLocalUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const slots: Slot[] = [
    ...keptUrls.map((url): Slot => ({ kind: "saved", key: url, url })),
    ...files.map((file, i): Slot => ({ kind: "new", key: `new-${i}-${file.name}`, file, url: localUrls[i] ?? "" })),
    ...ids
      .map((id) => gallery.find((g) => g.id === id))
      .filter((item): item is GalleryItem => Boolean(item))
      .map((item): Slot => ({ kind: "gallery", key: item.id, item })),
  ];
  const free = max - slots.length;

  // The homepage tops a short selection up from the gallery; show that too.
  const fill = gallery.filter((g) => !ids.includes(g.id)).slice(0, Math.max(0, free));

  function addFiles(list: FileList | null) {
    const picked = Array.from(list ?? []);
    if (inputRef.current) inputRef.current.value = "";
    if (!picked.length) return;
    const room = max - slots.length;
    setNotice(picked.length > room ? `يمكن إضافة ${room} ${room === 1 ? "صورة" : "صور"} فقط، والحد الأقصى ${max}.` : null);
    if (room > 0) onFilesChange([...files, ...picked.slice(0, room)]);
  }

  function remove(slot: Slot) {
    setNotice(null);
    if (slot.kind === "saved") setKeptUrls((urls) => urls.filter((url) => url !== slot.url));
    if (slot.kind === "new") onFilesChange(files.filter((file) => file !== slot.file));
    if (slot.kind === "gallery") setIds((list) => list.filter((id) => id !== slot.item.id));
  }

  function toggle(id: string) {
    if (ids.includes(id)) {
      setIds((list) => list.filter((x) => x !== id));
      setNotice(null);
    } else if (free > 0) {
      setIds((list) => [...list, id]);
    } else {
      setNotice(`الحد الأقصى ${max} صور. أزل صورة أولًا.`);
    }
  }

  const previewItems = [
    ...slots.map((slot) => ({ key: slot.key, src: srcOf(slot), local: slot.kind === "new", auto: false })),
    ...fill.map((g) => ({ key: `fill-${g.id}`, src: g.imageUrl, local: false, auto: true })),
  ];

  return (
    <fieldset className="sm:col-span-2" aria-describedby={`${inputId}-help`}>
      <legend className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
        صور قسم «عن الفوج»
      </legend>
      <p id={`${inputId}-help`} className="mb-3 text-xs leading-5 text-brand-ink/70">
        حتى {max} صور تظهر تحت نص «عن الفوج» في الصفحة الرئيسية. ارفع صورًا جديدة أو اخترها من
        معرض الصور. إن اخترت أقل من {max}، تُكمَل تلقائيًا من المعرض.
      </p>

      {/* What the form saves; newly picked files are uploaded and added on save. */}
      <input type="hidden" name="aboutImageUrls" value={JSON.stringify(keptUrls)} />
      {ids.map((id) => (
        <input key={id} type="hidden" name="aboutImageIds" value={id} />
      ))}

      {/* Selected photos */}
      <div className="rounded-xl border border-brand-purple/10 p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-brand-ink/70">
            الصور المختارة: {slots.length} من {max}
          </p>
          <label
            htmlFor={inputId}
            aria-disabled={free <= 0}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-purple/20 bg-white px-5 text-sm font-bold text-brand-purple focus-within:ring-2 focus-within:ring-brand-purple/30 ${
              free > 0 ? "cursor-pointer hover:bg-brand-purple-tint/40" : "cursor-not-allowed opacity-50"
            }`}
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            رفع صور من الجهاز
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={free <= 0}
              className="sr-only"
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>
        </div>

        {slots.length > 0 ? (
          <ul className="grid grid-cols-3 gap-2 sm:max-w-md">
            {slots.map((slot) => (
              <li key={slot.key} className="relative aspect-square overflow-hidden rounded-lg bg-brand-purple-tint">
                <Thumb src={srcOf(slot)} local={slot.kind === "new"} />
                <span className="absolute inset-x-1 bottom-1 truncate rounded bg-brand-ink/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {slot.kind === "new" ? "جديدة، لم تُحفظ" : slot.kind === "saved" ? "مرفوعة" : "من المعرض"}
                </span>
                <button
                  type="button"
                  onClick={() => remove(slot)}
                  aria-label="إزالة الصورة"
                  className="absolute end-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-700 shadow hover:bg-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-brand-ink/60">لم تختر صورًا بعد، فتُستخدم أول صور المعرض.</p>
        )}

        {notice && (
          <p role="status" className="mt-2 text-xs font-semibold text-red-700">
            {notice}
          </p>
        )}
        {files.length > 0 && (
          <p className="mt-2 text-xs font-semibold text-brand-purple">
            الصور الجديدة تُرفع عند الضغط على «حفظ الإعدادات».
          </p>
        )}
      </div>

      {/* Preview of the homepage band */}
      {previewItems.length > 0 && (
        <div className="mt-4 flex flex-col gap-5 rounded-xl bg-brand-purple-tint/30 p-4 lg:flex-row lg:items-start">
          <figure className="w-40 shrink-0">
            <figcaption className="mb-2 flex items-center gap-1.5 text-xs font-bold text-brand-ink/70">
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              على الهاتف
            </figcaption>
            <div aria-hidden="true" className="grid grid-cols-2 gap-0.5 overflow-hidden rounded-lg bg-white ring-4 ring-brand-ink/80">
              {previewItems.slice(0, 3).map((p, i) => (
                <div key={p.key} className={`relative h-14 ${i === 0 && previewItems.length >= 3 ? "col-span-2" : ""}`}>
                  <Thumb src={p.src} local={p.local} faded={p.auto} />
                </div>
              ))}
            </div>
          </figure>
          <figure className="min-w-0 flex-1">
            <figcaption className="mb-2 flex items-center gap-1.5 text-xs font-bold text-brand-ink/70">
              <Monitor className="h-4 w-4" aria-hidden="true" />
              على الكمبيوتر
            </figcaption>
            <div aria-hidden="true" className="grid aspect-[1440/440] grid-cols-3 gap-0.5 overflow-hidden rounded-lg bg-white ring-4 ring-brand-ink/80">
              {previewItems.slice(0, 3).map((p) => (
                <div key={p.key} className="relative">
                  <Thumb src={p.src} local={p.local} faded={p.auto} />
                </div>
              ))}
            </div>
          </figure>
        </div>
      )}
      {fill.length > 0 && slots.length > 0 && (
        <p className="mt-2 text-xs text-brand-ink/60">الصور الباهتة في المعاينة تُضاف تلقائيًا من المعرض.</p>
      )}

      {/* Gallery picker */}
      {gallery.length > 0 && (
        <details className="mt-4 rounded-xl border border-brand-purple/10 p-3" open={savedIds.length > 0}>
          <summary className="min-h-11 cursor-pointer content-center text-sm font-bold text-brand-purple">
            اختيار من معرض الصور
          </summary>
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
            {gallery.map((item) => {
              const selected = ids.includes(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-pressed={selected}
                    title={item.title}
                    className={`relative block aspect-square w-full overflow-hidden rounded-lg ring-offset-2 ${
                      selected ? "ring-2 ring-brand-purple" : "opacity-90 hover:opacity-100"
                    }`}
                  >
                    <SafeImage src={item.imageUrl} variant="thumb" alt={item.title} className="h-full w-full object-cover" />
                    {selected && (
                      <span className="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-purple text-white">
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </fieldset>
  );
}

function srcOf(slot: Slot) {
  return slot.kind === "gallery" ? slot.item.imageUrl : slot.url;
}

function Thumb({ src, local, faded = false }: { src: string; local: boolean; faded?: boolean }) {
  const className = `absolute inset-0 h-full w-full object-cover ${faded ? "opacity-35 grayscale" : ""}`;
  // A just-picked file is a blob: URL, which the image optimizer can't fetch.
  return local ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className} />
  ) : (
    <SafeImage src={src} variant="thumb" alt="" className={className} />
  );
}
