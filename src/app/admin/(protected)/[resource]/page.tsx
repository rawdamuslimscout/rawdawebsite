import { notFound } from "next/navigation";
import { getDelegate, getResourceConfig, type FieldConfig } from "@/lib/admin-resources";
import { saveItem, deleteItem } from "./actions";

function FieldInput({
  field,
  defaultValue,
}: {
  field: FieldConfig;
  defaultValue?: string | number;
}) {
  const baseClass =
    "w-full rounded-lg border border-brand-purple/15 px-3 py-2 text-sm outline-none focus:border-brand-purple";

  if (field.type === "textarea") {
    return (
      <textarea
        name={field.name}
        defaultValue={defaultValue as string}
        rows={field.name === "content" ? 8 : 3}
        className={baseClass}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select name={field.name} defaultValue={defaultValue as string} className={baseClass}>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      name={field.name}
      defaultValue={defaultValue as string | number}
      className={baseClass}
    />
  );
}

export default async function ResourceAdminPage({
  params,
}: {
  params: { resource: string };
}) {
  const config = getResourceConfig(params.resource);
  const delegate = getDelegate(params.resource);
  if (!config || !delegate) notFound();

  // Guard against a stray connection error breaking the whole page —
  // show a clear message instead of a crash if Supabase isn't
  // connected yet.
  let rows: Record<string, unknown>[] = [];
  let dbError: string | null = null;
  try {
    rows = await delegate.findMany({ orderBy: config.orderBy });
  } catch {
    dbError =
      "تعذّر الاتصال بقاعدة البيانات. تحقق من DATABASE_URL و DIRECT_URL في ملف .env، وتأكد من تشغيل prisma migrate.";
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-ink">{config.label}</h1>

      {dbError ? (
        <p className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{dbError}</p>
      ) : (
        <>
          <section className="mt-8 rounded-2xl border border-brand-purple/10 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-brand-ink">إضافة عنصر جديد</h2>
            <form action={saveItem} className="mt-4 grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="_resource" value={config.key} />
              {config.fields.map((field) => (
                <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                  <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
                    {field.label}
                  </label>
                  <FieldInput field={field} />
                  {field.help && <p className="mt-1 text-xs text-brand-ink/45">{field.help}</p>}
                </div>
              ))}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-full bg-brand-purple px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark"
                >
                  إضافة
                </button>
              </div>
            </form>
          </section>

          <section className="mt-8 space-y-3">
            {rows.length === 0 && (
              <p className="text-sm text-brand-ink/50">لا توجد عناصر بعد.</p>
            )}
            {rows.map((row) => (
              <details
                key={String(row.id)}
                className="group rounded-2xl border border-brand-purple/10 bg-white shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
                  <span className="font-medium text-brand-ink">
                    {String(row[config.titleField] ?? row.id)}
                  </span>
                  <span className="text-xs text-brand-ink/40 group-open:hidden">تعديل ↓</span>
                </summary>

                <div className="border-t border-brand-purple/10 p-5">
                  <form action={saveItem} className="grid gap-4 sm:grid-cols-2">
                    <input type="hidden" name="_resource" value={config.key} />
                    <input type="hidden" name="_id" value={String(row.id)} />
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
                          defaultValue={row[field.name] as string | number}
                        />
                        {field.help && (
                          <p className="mt-1 text-xs text-brand-ink/45">{field.help}</p>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-3 sm:col-span-2">
                      <button
                        type="submit"
                        className="rounded-full bg-brand-purple px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark"
                      >
                        حفظ التعديلات
                      </button>
                    </div>
                  </form>

                  <form action={deleteItem} className="mt-3">
                    <input type="hidden" name="_resource" value={config.key} />
                    <input type="hidden" name="_id" value={String(row.id)} />
                    <button
                      type="submit"
                      className="rounded-full border border-red-200 px-5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      حذف هذا العنصر
                    </button>
                  </form>
                </div>
              </details>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
