import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  getDelegate,
  getResourceConfig,
  resourceHasOrderField,
  type ResourceConfig,
} from "@/lib/admin-resources";
import { requireAdminPage } from "@/lib/session";
import ResourceManager, { type ChildSection, type Option } from "./ResourceManager";

export const dynamic = "force-dynamic";

/**
 * Fields that point at another section (e.g. a leader's unit) are shown as
 * a normal drop-down list of names — never as a technical id.
 */
async function loadRelations(
  config: ResourceConfig,
): Promise<Record<string, Option[]>> {
  const relations: Record<string, Option[]> = {};
  for (const field of config.fields) {
    if (field.type !== "relation" || !field.relation) continue;
    const relConfig = getResourceConfig(field.relation);
    const relDelegate = getDelegate(field.relation);
    if (!relConfig || !relDelegate) continue;
    try {
      const relRows: Record<string, unknown>[] = await relDelegate.findMany({
        where: relConfig.scope,
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
  return relations;
}

/** Rows of each child section (e.g. a unit's leaders), grouped by parent id. */
async function loadChildren(config: ResourceConfig): Promise<ChildSection[]> {
  const sections: ChildSection[] = [];
  for (const child of config.children ?? []) {
    const childConfig = getResourceConfig(child.resource);
    const childDelegate = getDelegate(child.resource);
    if (!childConfig || !childDelegate) continue;
    const rows: Record<string, unknown>[] = await childDelegate.findMany({
      where: childConfig.scope,
      orderBy: childConfig.orderBy,
    });
    const rowsByParent: Record<string, Record<string, unknown>[]> = {};
    for (const row of rows) {
      const parentId = String(row[child.foreignKey] ?? "");
      (rowsByParent[parentId] ??= []).push(row);
    }
    sections.push({
      config: childConfig,
      label: child.label,
      foreignKey: child.foreignKey,
      rowsByParent,
      hasOrder: resourceHasOrderField(childConfig),
      relations: await loadRelations(childConfig),
    });
  }
  return sections;
}

export default async function ResourceAdminPage({
  params: paramsPromise,
}: {
  params: Promise<{ resource: string }>;
}) {
  await requireAdminPage();
  const params = await paramsPromise;
  const config = getResourceConfig(params.resource);
  const delegate = getDelegate(params.resource);
  if (!config || !delegate) notFound();

  // A database hiccup must show a clear message here — never a crash.
  let rows: Record<string, unknown>[] = [];
  let relations: Record<string, Option[]> = {};
  let children: ChildSection[] = [];
  let dbError: string | null = null;
  try {
    rows = await delegate.findMany({
      where: config.scope,
      orderBy: config.orderBy,
    });
    children = await loadChildren(config);
    relations = await loadRelations(config);
  } catch (err) {
    console.error(`[admin] loading ${config.key} failed`, err);
    dbError =
      "تعذّر تحميل هذا القسم الآن بسبب مشكلة في الاتصال بقاعدة البيانات. حدّث الصفحة بعد قليل، وإن استمرت المشكلة تواصل مع المطوّر.";
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
            childSections={children}
          />
        </div>
      )}
    </div>
  );
}
