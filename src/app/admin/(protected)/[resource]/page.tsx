import { notFound } from "next/navigation";
import {
  getDelegate,
  getResourceConfig,
  resourceHasOrderField,
} from "@/lib/admin-resources";
import ResourceManager from "./ResourceManager";

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
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-brand-ink">
          {config.label}
        </h1>
      </div>

      {dbError ? (
        <p className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {dbError}
        </p>
      ) : (
        <div className="mt-6">
          <ResourceManager
            config={config}
            rows={rows}
            hasOrder={resourceHasOrderField(config)}
          />
        </div>
      )}
    </div>
  );
}
