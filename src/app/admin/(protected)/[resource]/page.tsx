import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  getDelegate,
  getResourceConfig,
  resourceHasOrderField,
} from "@/lib/admin-resources";
import ResourceManager from "./ResourceManager";

export const dynamic = "force-dynamic";

export default async function ResourceAdminPage({
  params,
}: {
  params: { resource: string };
}) {
  const config = getResourceConfig(params.resource);
  const delegate = getDelegate(params.resource);
  if (!config || !delegate) notFound();

  // A database hiccup must show a clear message here — never a crash.
  let rows: Record<string, unknown>[] = [];
  let dbError: string | null = null;
  try {
    rows = await delegate.findMany({ orderBy: config.orderBy });
  } catch (err) {
    console.error(`[admin] loading ${config.key} failed`, err);
    dbError =
      "تعذّر تحميل هذا القسم الآن بسبب مشكلة في الاتصال بقاعدة البيانات. حدّث الصفحة بعد قليل، وإن استمرت المشكلة تواصل مع المطوّر.";
  }

  // Fields that point at another section (e.g. a leader's stage) are shown as
  // a normal drop-down list of names — never as a technical id.
  const relations: Record<string, { value: string; label: string }[]> = {};
  if (!dbError) {
    for (const field of config.fields) {
      if (field.type !== "relation" || !field.relation) continue;
      const relConfig = getResourceConfig(field.relation);
      const relDelegate = getDelegate(field.relation);
      if (!relConfig || !relDelegate) continue;
      try {
        const relRows: Record<string, unknown>[] = await relDelegate.findMany({
          orderBy: relConfig.orderBy,
        });
        relations[field.name] = relRows.map((r) => ({
          value: String(r.id),
          label: String(r[relConfig.titleField] ?? r.id),
        }));
      } catch (err) {
        console.error(`[admin] loading options for ${field.name} failed`, err);
        relations[field.name] = [];
      }
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-brand-ink">
            {config.label}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-brand-ink/60">
            <span className="font-semibold text-brand-ink/75">أين يظهر في الموقع؟ </span>
            {config.description}
          </p>
        </div>
        <Link
          href={config.siteHref}
          target="_blank"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-brand-purple/20 bg-white px-4 py-2 text-xs font-bold text-brand-purple transition-colors hover:bg-brand-purple-tint"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          شاهد في الموقع
        </Link>
      </div>

      {dbError ? (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700">
          {dbError}
        </p>
      ) : (
        <div className="mt-6">
          <ResourceManager
            config={config}
            rows={rows}
            hasOrder={resourceHasOrderField(config)}
            relations={relations}
          />
        </div>
      )}
    </div>
  );
}
