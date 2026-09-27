"use client";

import { ChevronDown } from "lucide-react";
import type { FieldConfig } from "@/lib/admin-resources";

const baseInputClass =
  "w-full rounded-lg border border-brand-purple/15 bg-white px-3 py-2 text-sm text-brand-ink outline-none transition-colors focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10";

/** Fields that are genuinely optional (files, the auto-managed order field, or help text that says so). */
function isOptional(field: FieldConfig): boolean {
  if (field.type === "file" || field.type === "file-multiple") return true;
  if (field.name === "order") return true;
  if (!field.help) return false;
  return field.help.includes("اختياري") || field.help.includes("يمكن تركه فارغ");
}

export default function FieldInput({
  field,
  defaultValue,
}: {
  field: FieldConfig;
  defaultValue?: string | number;
}) {
  const required = !isOptional(field);

  if (field.type === "textarea") {
    return (
      <textarea
        name={field.name}
        defaultValue={defaultValue as string}
        rows={field.name === "content" ? 8 : 3}
        required={required}
        className={`${baseInputClass} resize-y`}
      />
    );
  }

  if (field.type === "file" || field.type === "file-multiple") {
    return (
      <input
        name={field.name}
        type="file"
        multiple={field.type === "file-multiple"}
        accept={field.accept}
        className={`${baseInputClass} cursor-pointer file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-brand-purple-tint file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-purple`}
      />
    );
  }

  if (field.type === "select") {
    return (
      <div className="relative">
        <select
          name={field.name}
          defaultValue={defaultValue as string}
          required={required}
          className={`${baseInputClass} appearance-none pl-9`}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/40" />
      </div>
    );
  }

  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      name={field.name}
      defaultValue={defaultValue as string | number}
      required={required}
      className={baseInputClass}
    />
  );
}
