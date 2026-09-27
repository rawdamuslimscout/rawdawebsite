"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  X,
  Loader2,
} from "lucide-react";
import type { ResourceConfig } from "@/lib/admin-resources";
import { saveItem, deleteItem, reorderItem, removeUploadedFile } from "./actions";
import FieldInput from "./FieldInput";
import { useToast } from "../ToastProvider";

function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(url);
}

function parseUrls(raw: unknown): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed)
      ? parsed.filter((u): u is string => typeof u === "string")
      : [];
  } catch {
    return [];
  }
}

export default function ResourceManager({
  config,
  rows,
  hasOrder,
}: {
  config: ResourceConfig;
  rows: Record<string, unknown>[];
  hasOrder: boolean;
}) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(rows.length === 0);
  const [isPending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const createFormRef = useRef<HTMLFormElement>(null);

  const nextOrder = useMemo(() => {
    if (!hasOrder) return undefined;
    if (rows.length === 0) return 1;
    const max = Math.max(...rows.map((r) => Number(r.order) || 0));
    return max + 1;
  }, [rows, hasOrder]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(q);
      }),
    );
  }, [rows, query]);

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPendingKey("create");
    startTransition(async () => {
      const result = await saveItem(formData);
      setPendingKey(null);
      if (result.ok) {
        showSuccess("تمت إضافة العنصر بنجاح");
        createFormRef.current?.reset();
        setCreateOpen(false);
        router.refresh();
      } else {
        showError(result.error);
      }
    });
  }

  function handleUpdate(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPendingKey(`update-${id}`);
    startTransition(async () => {
      const result = await saveItem(formData);
      setPendingKey(null);
      if (result.ok) {
        showSuccess("تم حفظ التعديلات");
        router.refresh();
      } else {
        showError(result.error);
      }
    });
  }

  function handleDelete(id: string, label: string) {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف "${label}"؟ لا يمكن التراجع عن هذا الإجراء.`,
    );
    if (!confirmed) return;
    setPendingKey(`delete-${id}`);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("_resource", config.key);
      formData.set("_id", id);
      const result = await deleteItem(formData);
      setPendingKey(null);
      if (result.ok) {
        showSuccess("تم حذف العنصر");
        router.refresh();
      } else {
        showError(result.error);
      }
    });
  }

  function handleReorder(id: string, direction: "up" | "down") {
    setPendingKey(`reorder-${id}`);
    startTransition(async () => {
      const result = await reorderItem(config.key, id, direction);
      setPendingKey(null);
      if (!result.ok) showError(result.error);
      router.refresh();
    });
  }

  function handleRemoveFile(id: string, fieldKey: string, url: string) {
    const confirmed = window.confirm("هل تريد حذف هذا الملف من العنصر؟");
    if (!confirmed) return;
    setPendingKey(`file-${id}-${url}`);
    startTransition(async () => {
      const result = await removeUploadedFile(config.key, id, fieldKey, url);
      setPendingKey(null);
      if (result.ok) {
        showSuccess("تم حذف الملف");
        router.refresh();
      } else {
        showError(result.error);
      }
    });
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/35" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث..."
            className="w-full rounded-full border border-brand-purple/15 bg-white py-2 pl-3 pr-9 text-sm outline-none transition-colors focus:border-brand-purple"
          />
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-xs text-brand-ink/45">
            {query ? `${filteredRows.length} من ${rows.length} عنصر` : `${rows.length} عنصر`}
          </span>
          <button
            type="button"
            onClick={() => setCreateOpen((v) => !v)}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-purple px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-purple-dark"
          >
            <Plus className={`h-3.5 w-3.5 transition-transform ${createOpen ? "rotate-45" : ""}`} />
            {createOpen ? "إخفاء النموذج" : "إضافة عنصر جديد"}
          </button>
        </div>
      </div>

      {createOpen && (
        <section className="mt-4 rounded-2xl border border-brand-purple/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-brand-ink">
            إضافة عنصر جديد
          </h2>
          <form
            ref={createFormRef}
            onSubmit={handleCreate}
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <input type="hidden" name="_resource" value={config.key} />
            {config.fields.map((field) => (
              <div
                key={field.name}
                className={field.type === "textarea" ? "sm:col-span-2" : ""}
              >
                <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
                  {field.label}
                </label>
                <FieldInput
                  field={field}
                  defaultValue={field.name === "order" ? nextOrder : undefined}
                />
                {field.help && (
                  <p className="mt-1 text-xs text-brand-ink/45">{field.help}</p>
                )}
              </div>
            ))}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={pendingKey === "create"}
                className="flex items-center gap-2 rounded-full bg-brand-purple px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingKey === "create" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                إضافة
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mt-6 space-y-3">
        {rows.length === 0 && (
          <p className="text-sm text-brand-ink/50">لا توجد عناصر بعد.</p>
        )}
        {rows.length > 0 && filteredRows.length === 0 && (
          <p className="text-sm text-brand-ink/50">لا توجد نتائج مطابقة لبحثك.</p>
        )}
        {filteredRows.map((row) => {
          const id = String(row.id);
          const fullIndex = rows.findIndex((r) => String(r.id) === id);
          const rowLabel = String(row[config.titleField] ?? row.id);

          return (
            <details
              key={id}
              className="group rounded-2xl border border-brand-purple/10 bg-white shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
                <span className="min-w-0 truncate font-medium text-brand-ink">
                  {rowLabel}
                </span>
                <span className="flex shrink-0 items-center gap-0.5">
                  {hasOrder && (
                    <>
                      <button
                        type="button"
                        title="نقل لأعلى"
                        disabled={fullIndex === 0 || isPending}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleReorder(id, "up");
                        }}
                        className="rounded-lg p-1.5 text-brand-ink/40 transition-colors hover:bg-brand-purple-tint hover:text-brand-purple disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="نقل لأسفل"
                        disabled={fullIndex === rows.length - 1 || isPending}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleReorder(id, "down");
                        }}
                        className="rounded-lg p-1.5 text-brand-ink/40 transition-colors hover:bg-brand-purple-tint hover:text-brand-purple disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    title="حذف"
                    disabled={isPending}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(id, rowLabel);
                    }}
                    className="rounded-lg p-1.5 text-brand-ink/40 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {pendingKey === `delete-${id}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                  <span className="mr-1 text-xs text-brand-ink/40 group-open:hidden">
                    تعديل ↓
                  </span>
                </span>
              </summary>

              <div className="border-t border-brand-purple/10 p-5">
                <form
                  onSubmit={(e) => handleUpdate(e, id)}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <input type="hidden" name="_resource" value={config.key} />
                  <input type="hidden" name="_id" value={id} />
                  {config.fields.map((field) => {
                    const uploadKey = field.uploadTo || field.name;
                    const existingRaw = row[uploadKey];
                    return (
                      <div
                        key={field.name}
                        className={
                          field.type === "textarea" ? "sm:col-span-2" : ""
                        }
                      >
                        <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
                          {field.label}
                        </label>
                        <FieldInput
                          field={field}
                          defaultValue={row[field.name] as string | number}
                        />

                        {field.type === "file" &&
                        typeof existingRaw === "string" &&
                        existingRaw ? (
                          <div className="mt-2 flex items-center gap-2">
                            {isImageUrl(existingRaw) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={existingRaw}
                                alt=""
                                className="h-14 w-14 rounded-lg border border-brand-purple/10 object-cover"
                              />
                            ) : null}
                            <a
                              href={existingRaw}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-brand-purple underline"
                            >
                              <ExternalLink className="h-3 w-3" /> فتح الملف الحالي
                            </a>
                          </div>
                        ) : null}

                        {field.type === "file-multiple" ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {parseUrls(existingRaw).map((url) => (
                              <div key={url} className="relative">
                                {isImageUrl(url) ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={url}
                                    alt=""
                                    className="h-16 w-16 rounded-lg border border-brand-purple/10 object-cover"
                                  />
                                ) : (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex h-16 w-16 items-center justify-center rounded-lg border border-brand-purple/10 bg-brand-purple-tint/40 text-[10px] font-medium text-brand-purple"
                                  >
                                    ملف
                                  </a>
                                )}
                                <button
                                  type="button"
                                  title="حذف هذا الملف"
                                  onClick={() => handleRemoveFile(id, uploadKey, url)}
                                  disabled={isPending}
                                  className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow-sm disabled:cursor-not-allowed"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {field.help && (
                          <p className="mt-1 text-xs text-brand-ink/45">
                            {field.help}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  <div className="flex gap-3 sm:col-span-2">
                    <button
                      type="submit"
                      disabled={pendingKey === `update-${id}`}
                      className="flex items-center gap-2 rounded-full bg-brand-purple px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingKey === `update-${id}` && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      حفظ التعديلات
                    </button>
                  </div>
                </form>
              </div>
            </details>
          );
        })}
      </section>
    </div>
  );
}
