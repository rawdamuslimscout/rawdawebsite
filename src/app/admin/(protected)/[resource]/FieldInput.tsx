"use client";

import { useEffect, useState } from "react";
import { ChevronDown, FileText, ImagePlus } from "lucide-react";
import type { FieldConfig } from "@/lib/admin-resources";
import { iconMap } from "@/lib/icons";

export const inputClass =
  "w-full rounded-xl border border-brand-purple/15 bg-white px-3.5 py-2.5 text-base text-brand-ink outline-none transition-colors placeholder:text-brand-ink/30 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10 sm:text-sm";

/** Fields that are genuinely optional (files, the auto-managed order field, or fields marked optional). */
function isOptional(field: FieldConfig): boolean {
  if (field.optional) return true;
  if (field.type === "file" || field.type === "file-multiple") return true;
  return field.name === "order";
}

function FilePicker({
  field,
  isCreate,
}: {
  field: FieldConfig;
  isCreate: boolean;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const isImage = field.accept === "image/*";
  const multiple = field.type === "file-multiple";

  useEffect(() => {
    if (!isImage) return;
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files, isImage]);

  return (
    <div>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-brand-purple/25 bg-brand-purple-tint/30 px-4 py-3 transition-colors hover:border-brand-purple/50 hover:bg-brand-purple-tint/50">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-purple shadow-sm">
          {isImage ? (
            <ImagePlus className="h-5 w-5" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
        </span>
        <span className="min-w-0 text-sm">
          <span className="block font-semibold text-brand-purple">
            {files.length > 0
              ? multiple
                ? `تم اختيار ${files.length} ملفات — اضغط للتغيير`
                : "تم اختيار الملف — اضغط للتغيير"
              : isImage
                ? multiple
                  ? "اضغط لاختيار صورة أو أكثر"
                  : "اضغط لاختيار صورة"
                : "اضغط لاختيار ملف"}
          </span>
          <span className="block truncate text-xs text-brand-ink/50">
            {files.length > 0
              ? files.map((f) => f.name).join("، ")
              : isImage
                ? "من الاستوديو أو الكاميرا"
                : "PDF أو Word"}
          </span>
        </span>
        <input
          name={field.name}
          type="file"
          multiple={multiple}
          accept={field.accept}
          required={isCreate && !!field.requiredOnCreate}
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="sr-only"
        />
      </label>

      {previews.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {previews.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              className="h-16 w-16 rounded-lg border border-brand-purple/10 object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FieldInput({
  field,
  defaultValue,
  isCreate,
  relationOptions,
}: {
  field: FieldConfig;
  defaultValue?: string | number;
  isCreate: boolean;
  relationOptions?: { value: string; label: string }[];
}) {
  const required = !isOptional(field);
  const [selected, setSelected] = useState<string>(
    defaultValue !== undefined && defaultValue !== null
      ? String(defaultValue)
      : (field.options?.[0]?.value ?? ""),
  );

  if (field.type === "textarea") {
    return (
      <textarea
        name={field.name}
        defaultValue={defaultValue as string}
        rows={field.name === "content" ? 10 : 4}
        required={required}
        placeholder={field.placeholder}
        className={`${inputClass} resize-y leading-7`}
      />
    );
  }

  if (field.type === "file" || field.type === "file-multiple") {
    return <FilePicker field={field} isCreate={isCreate} />;
  }

  if (field.type === "relation") {
    const options = relationOptions ?? [];
    return (
      <div className="relative">
        <select
          name={field.name}
          defaultValue={defaultValue ? String(defaultValue) : ""}
          required={required}
          className={`${inputClass} appearance-none pl-10`}
        >
          <option value="" disabled>
            {options.length ? "اختر من القائمة…" : "لا توجد خيارات بعد"}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/40" />
      </div>
    );
  }

  if (field.type === "select") {
    const Icon = field.name === "icon" ? iconMap[selected] : undefined;
    return (
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-purple-tint text-brand-purple">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
        <div className="relative min-w-0 flex-1">
          <select
            name={field.name}
            defaultValue={defaultValue as string}
            onChange={(e) => setSelected(e.target.value)}
            required={required}
            className={`${inputClass} appearance-none pl-10`}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/40" />
        </div>
      </div>
    );
  }

  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      inputMode={field.type === "number" ? "numeric" : undefined}
      name={field.name}
      defaultValue={defaultValue as string | number}
      required={required}
      placeholder={field.placeholder}
      className={inputClass}
    />
  );
}
