"use client";

import { useMemo, useRef, useState } from "react";
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
  Pencil,
  Info,
} from "lucide-react";
import type { FieldConfig, ResourceConfig } from "@/lib/admin-resources";
import { friendlyMessage } from "@/lib/errors";
import { prepareFile } from "@/lib/client-files";
import {
  saveItem,
  deleteItem,
  reorderItem,
  removeUploadedFile,
  uploadFile,
  type ActionResult,
} from "./actions";
import FieldInput from "./FieldInput";
import { useToast } from "../ToastProvider";

type Option = { value: string; label: string };

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

const isFileField = (f: FieldConfig) =>
  f.type === "file" || f.type === "file-multiple";

/** Fields the admin never edits by hand: order (arrows are used), technical ids, hidden ones. */
const isShownInForm = (f: FieldConfig) =>
  f.type !== "slug" && f.name !== "order" && !f.hidden;

export default function ResourceManager({
  config,
  rows,
  hasOrder,
  relations,
}: {
  config: ResourceConfig;
  rows: Record<string, unknown>[];
  hasOrder: boolean;
  relations: Record<string, Option[]>;
}) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(rows.length === 0);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  // Bumped after each successful save so file pickers are cleared (and a file is never uploaded twice).
  const [versions, setVersions] = useState<Record<string, number>>({});
  const createFormRef = useRef<HTMLFormElement>(null);
  const isBusy = busyKey !== null;

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

  /**
   * Every action goes through here. Nothing that fails — a dropped connection,
   * an expired login, a huge file, a database hiccup — is allowed to escape as
   * an unhandled error (which is what used to blank the whole page with
   * "Application error: a client-side exception has occurred").
   */
  async function perform(
    key: string,
    work: () => Promise<ActionResult>,
    opts: { success?: string; after?: () => void; refreshAlways?: boolean } = {},
  ) {
    if (busyKey) return;
    setBusyKey(key);
    try {
      const result = await work();
      if (result.ok) {
        if (opts.success) showSuccess(opts.success);
        opts.after?.();
        router.refresh();
      } else {
        showError(result.error);
        if (opts.refreshAlways) router.refresh();
      }
    } catch (err) {
      console.error(`[admin:${config.key}] ${key} failed`, err);
      showError(
        friendlyMessage(
          err,
          "حدث خطأ غير متوقع ولم يتم الحفظ. تأكد من اتصالك بالإنترنت وأعد المحاولة.",
        ),
      );
    } finally {
      setBusyKey(null);
      setProgress(null);
    }
  }

  /** Reads the form, uploads each chosen file one by one, and returns the data ready to save. */
  async function buildFormData(form: HTMLFormElement): Promise<FormData> {
    const fd = new FormData(form);
    const jobs = config.fields
      .filter((f) => isFileField(f) && f.uploadTo)
      .map((field) => ({
        field,
        files: fd
          .getAll(field.name)
          .filter((v): v is File => v instanceof File && v.size > 0),
      }));
    const total = jobs.reduce((n, j) => n + j.files.length, 0);
    let done = 0;

    for (const { field, files } of jobs) {
      fd.delete(field.name);
      const urls: string[] = [];
      for (const original of files) {
        done += 1;
        setProgress(
          total > 1
            ? `جارٍ تجهيز ورفع الملف ${done} من ${total}…`
            : "جارٍ تجهيز ورفع الملف…",
        );
        const prepared = await prepareFile(original, field.accept);
        const upload = new FormData();
        upload.set("_resource", config.key);
        upload.set("file", prepared);
        const result = await uploadFile(upload);
        if (!result.ok) throw new Error(result.error);
        urls.push(result.url);
      }
      if (urls.length)
        fd.set(`_uploaded:${field.uploadTo}`, JSON.stringify(urls));
    }
    setProgress("جارٍ الحفظ…");
    return fd;
  }

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    void perform(
      "create",
      async () => saveItem(await buildFormData(form)),
      {
        success: "تمت الإضافة بنجاح ✓",
        after: () => {
          form.reset();
          setCreateOpen(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      },
    );
  }

  function handleUpdate(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const form = e.currentTarget;
    void perform(
      `update-${id}`,
      async () => saveItem(await buildFormData(form)),
      {
        success: "تم حفظ التعديلات ✓",
        after: () => setVersions((v) => ({ ...v, [id]: (v[id] ?? 0) + 1 })),
      },
    );
  }

  function handleDelete(id: string, label: string) {
    const confirmed = window.confirm(
      `هل تريد حذف «${label}» نهائيًا؟ لا يمكن التراجع عن الحذف.`,
    );
    if (!confirmed) return;
    void perform(
      `delete-${id}`,
      async () => {
        const formData = new FormData();
        formData.set("_resource", config.key);
        formData.set("_id", id);
        return deleteItem(formData);
      },
      { success: "تم الحذف" },
    );
  }

  function handleReorder(id: string, direction: "up" | "down") {
    void perform(`reorder-${id}`, () => reorderItem(config.key, id, direction), {
      refreshAlways: true,
    });
  }

  function handleRemoveFile(id: string, fieldKey: string, url: string) {
    const confirmed = window.confirm("هل تريد إزالة هذه الصورة؟");
    if (!confirmed) return;
    void perform(
      `file-${id}-${url}`,
      () => removeUploadedFile(config.key, id, fieldKey, url),
      { success: "تمت إزالة الصورة" },
    );
  }

  function thumbOf(row: Record<string, unknown>): string | null {
    const candidates = [config.thumbField, "imageUrl"].filter(Boolean) as string[];
    for (const key of candidates) {
      const raw = row[key];
      if (!raw) continue;
      const value = String(raw);
      const url = value.startsWith("[") ? parseUrls(value)[0] : value;
      if (url && isImageUrl(url)) return url;
    }
    return null;
  }

  function subtitleOf(row: Record<string, unknown>): string {
    const name = config.subtitleField;
    if (!name) return "";
    const raw = row[name];
    if (raw === null || raw === undefined || raw === "") return "";
    const field = config.fields.find((f) => f.name === name);
    if (field?.type === "select")
      return field.options?.find((o) => o.value === String(raw))?.label ?? String(raw);
    if (field?.type === "relation")
      return relations[name]?.find((o) => o.value === String(raw))?.label ?? "";
    return String(raw);
  }

  function renderField(
    field: FieldConfig,
    row: Record<string, unknown> | null,
    version: number,
  ) {
    const isCreate = row === null;
    const uploadKey = field.uploadTo || field.name;
    const existingRaw = row ? row[uploadKey] : undefined;
    const required =
      !field.optional && !isFileField(field) && field.name !== "order";
    const id = row ? String(row.id) : "";

    return (
      <div
        key={field.name}
        className={field.type === "textarea" || field.type === "location" ? "sm:col-span-2" : ""}
      >
        <label className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          {field.label}
          {required && (
            <span className="mr-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <FieldInput
          key={isFileField(field) ? `${field.name}-${version}` : field.name}
          field={field}
          isCreate={isCreate}
          defaultValue={row ? (row[field.name] as string | number) : undefined}
          relationOptions={relations[field.name]}
          rowValues={row ?? undefined}
        />

        {!isCreate &&
        field.type === "file" &&
        typeof existingRaw === "string" &&
        existingRaw ? (
          <div className="mt-2 flex items-center gap-3 rounded-xl bg-brand-purple-tint/40 p-2">
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
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-purple underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {isImageUrl(existingRaw) ? "فتح الصورة الحالية" : "فتح الملف الحالي"}
            </a>
          </div>
        ) : null}

        {!isCreate && field.type === "file-multiple" ? (
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
                    className="flex h-16 w-16 items-center justify-center rounded-lg border border-brand-purple/10 bg-brand-purple-tint/40 text-[11px] font-medium text-brand-purple"
                  >
                    ملف
                  </a>
                )}
                <button
                  type="button"
                  title="إزالة هذه الصورة"
                  aria-label="إزالة هذه الصورة"
                  onClick={() => handleRemoveFile(id, uploadKey, url)}
                  disabled={isBusy}
                  className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {field.help && (
          <p className="mt-1.5 text-xs leading-5 text-brand-ink/50">{field.help}</p>
        )}
      </div>
    );
  }

  function renderSaveBar(busy: boolean, label: string) {
    return (
      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-3 border-t border-brand-purple/10 bg-white/95 px-5 py-3 backdrop-blur sm:static sm:col-span-2 sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <button
          type="submit"
          disabled={isBusy}
          className="flex min-h-11 items-center gap-2 rounded-full bg-brand-purple px-7 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "جارٍ الحفظ…" : label}
        </button>
        {busy && progress && (
          <span className="text-sm text-brand-ink/60" role="status">
            {progress}
          </span>
        )}
      </div>
    );
  }

  const addLabel = `إضافة ${config.singular}`;

  return (
    <div>
      {config.autoSortNote && (
        <p className="mb-4 flex items-start gap-2 rounded-xl bg-brand-purple-tint/60 p-3 text-sm leading-6 text-brand-ink/70">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple" />
          {config.autoSortNote}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/35" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في هذا القسم…"
            className="w-full rounded-full border border-brand-purple/15 bg-white py-2.5 pl-3 pr-10 text-base outline-none transition-colors focus:border-brand-purple sm:text-sm"
          />
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-xs text-brand-ink/50">
            {query ? `${filteredRows.length} من ${rows.length}` : `${rows.length} عنصر`}
          </span>
          <button
            type="button"
            onClick={() => setCreateOpen((v) => !v)}
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand-purple px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark"
          >
            <Plus
              className={`h-4 w-4 transition-transform ${createOpen ? "rotate-45" : ""}`}
            />
            {createOpen ? "إغلاق النموذج" : addLabel}
          </button>
        </div>
      </div>

      {createOpen && (
        <section className="mt-4 rounded-2xl border border-brand-purple/15 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-lg font-semibold text-brand-ink">
            {addLabel}
          </h2>
          <p className="mt-1 text-xs text-brand-ink/50">
            الحقول التي عليها <span className="text-red-500">*</span> مطلوبة.
          </p>
          <form
            ref={createFormRef}
            onSubmit={handleCreate}
            className="mt-4 grid gap-5 sm:grid-cols-2"
          >
            <input type="hidden" name="_resource" value={config.key} />
            {config.fields
              .filter(isShownInForm)
              .map((field) => renderField(field, null, 0))}
            {renderSaveBar(busyKey === "create", "إضافة")}
          </form>
        </section>
      )}

      <section className="mt-6 space-y-3">
        {rows.length === 0 && !createOpen && (
          <p className="rounded-2xl border border-dashed border-brand-purple/20 bg-white/60 p-6 text-center text-sm text-brand-ink/55">
            لا توجد عناصر في هذا القسم بعد. اضغط «{addLabel}» للبدء.
          </p>
        )}
        {rows.length > 0 && filteredRows.length === 0 && (
          <p className="text-sm text-brand-ink/50">لا توجد نتائج مطابقة لبحثك.</p>
        )}
        {filteredRows.map((row) => {
          const id = String(row.id);
          const fullIndex = rows.findIndex((r) => String(r.id) === id);
          const rowLabel = String(row[config.titleField] ?? row.id);
          const subtitle = subtitleOf(row);
          const thumb = thumbOf(row);
          const version = versions[id] ?? 0;

          return (
            <details
              key={id}
              className="group rounded-2xl border border-brand-purple/10 bg-white shadow-sm open:border-brand-purple/25"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 sm:px-5">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg border border-brand-purple/10 object-cover"
                  />
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-brand-ink">
                    {rowLabel}
                  </span>
                  {subtitle && (
                    <span className="block truncate text-xs text-brand-ink/50">
                      {subtitle}
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-0.5">
                  {hasOrder && (
                    <>
                      <button
                        type="button"
                        title="نقل لأعلى"
                        aria-label="نقل لأعلى"
                        disabled={fullIndex === 0 || isBusy}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleReorder(id, "up");
                        }}
                        className="rounded-lg p-2 text-brand-ink/45 transition-colors hover:bg-brand-purple-tint hover:text-brand-purple disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="نقل لأسفل"
                        aria-label="نقل لأسفل"
                        disabled={fullIndex === rows.length - 1 || isBusy}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleReorder(id, "down");
                        }}
                        className="rounded-lg p-2 text-brand-ink/45 transition-colors hover:bg-brand-purple-tint hover:text-brand-purple disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    title="حذف"
                    aria-label={`حذف ${rowLabel}`}
                    disabled={isBusy}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(id, rowLabel);
                    }}
                    className="rounded-lg p-2 text-brand-ink/45 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {busyKey === `delete-${id}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                  <span className="mr-1 flex items-center gap-1 rounded-full bg-brand-purple-tint px-3 py-1.5 text-xs font-bold text-brand-purple group-open:hidden">
                    <Pencil className="h-3 w-3" />
                    تعديل
                  </span>
                  <span className="mr-1 hidden items-center gap-1 rounded-full border border-brand-purple/20 px-3 py-1.5 text-xs font-bold text-brand-purple group-open:flex">
                    إغلاق
                  </span>
                </span>
              </summary>

              <div className="border-t border-brand-purple/10 p-5">
                <form
                  onSubmit={(e) => handleUpdate(e, id)}
                  className="grid gap-5 sm:grid-cols-2"
                >
                  <input type="hidden" name="_resource" value={config.key} />
                  <input type="hidden" name="_id" value={id} />
                  {config.fields
                    .filter(isShownInForm)
                    .map((field) => renderField(field, row, version))}
                  {renderSaveBar(busyKey === `update-${id}`, "حفظ التعديلات")}
                </form>
              </div>
            </details>
          );
        })}
      </section>
    </div>
  );
}
