import { prisma } from "@/lib/prisma";
import type { CoercedValue } from "@/lib/admin-resources";

/** Depth of each node kind; a child must sit deeper than its parent. "other" is unconstrained. */
const LEVEL: Record<string, number> = {
  association: 0,
  governorate: 1,
  troop: 2,
  dean: 3,
  council: 3,
  unit: 3,
};

/**
 * Business-rule validation that runs on the server before ANY create/update
 * (server actions and JSON API alike). Returns an Arabic message or null.
 */
export async function validateResourceWrite(
  resource: string,
  id: string,
  data: Record<string, CoercedValue>,
): Promise<string | null> {
  if (resource === "org-nodes" || resource === "troop-units") return validateNode(id, data);
  if (resource === "org-assignments") return validateAssignment(data, false);
  if (resource === "unit-leaders") return validateAssignment(data, true);
  if (resource === "places") return validateExists("newsItem", data.newsId, "الخبر المختار غير موجود.");
  if (resource === "org-qualifications") return validateExists("orgPerson", data.personId, "الشخص المختار غير موجود.");
  if (resource === "events") return validateEventDates(id, data);
  return null;
}

async function validateEventDates(id: string, data: Record<string, CoercedValue>): Promise<string | null> {
  let { startDate, endDate } = data;
  // Partial updates (JSON API) may send only one of the two: compare with the saved value.
  if (id && (startDate === undefined || endDate === undefined)) {
    const saved = await prisma.eventItem.findUnique({ where: { id }, select: { startDate: true, endDate: true } });
    if (startDate === undefined) startDate = saved?.startDate ?? null;
    if (endDate === undefined) endDate = saved?.endDate ?? null;
  }
  if (startDate instanceof Date && endDate instanceof Date && endDate.getTime() < startDate.getTime())
    return "تاريخ النهاية يجب ألا يسبق تاريخ البداية.";
  return null;
}

async function validateExists(model: "orgPerson" | "orgNode" | "newsItem", value: CoercedValue | undefined, message: string) {
  if (typeof value !== "string") return null;
  const found = await (prisma[model] as any).findUnique({ where: { id: value }, select: { id: true } });
  return found ? null : message;
}

async function validateNode(id: string, data: Record<string, CoercedValue>): Promise<string | null> {
  const kind = String(data.kind ?? "");
  const parentId = typeof data.parentId === "string" ? data.parentId : null;

  if (kind === "association" && parentId) return "الجمعية هي أعلى مستوى ولا تتبع لأي مستوى.";
  if (kind !== "association" && !parentId) return "اختر المستوى الذي يتبع له هذا العنصر.";
  if (!parentId) return null;
  if (id && parentId === id) return "لا يمكن أن يتبع المستوى نفسه.";

  const parent = await prisma.orgNode.findUnique({ where: { id: parentId }, select: { id: true, kind: true } });
  if (!parent) return "المستوى الأعلى المختار غير موجود.";

  // Circular hierarchy: walk up from the proposed parent; we must never meet this node.
  if (id) {
    let cursor: string | null = parent.id;
    for (let depth = 0; cursor && depth < 50; depth++) {
      if (cursor === id) return "لا يمكن نقل المستوى تحت أحد المستويات التابعة له (يسبّب حلقة مغلقة).";
      const row: { parentId: string | null } | null = await prisma.orgNode.findUnique({
        where: { id: cursor },
        select: { parentId: true },
      });
      cursor = row?.parentId ?? null;
    }
  }

  const childLevel = LEVEL[kind];
  const parentLevel = LEVEL[parent.kind];
  if (childLevel !== undefined && parentLevel !== undefined && childLevel <= parentLevel)
    return "هذا النوع لا يمكن أن يتبع المستوى المختار (مثال: الوحدة تتبع الفوج، والفوج يتبع المفوضية).";

  if (typeof data.stageId === "string") {
    const stage = await prisma.scoutStage.findUnique({ where: { id: data.stageId }, select: { id: true } });
    if (!stage) return "المرحلة الكشفية المختارة غير موجودة.";
  }
  return null;
}

/** Unit leaders are edited only on the units page, every other position only on the positions page. */
async function validateAssignment(data: Record<string, CoercedValue>, unit: boolean): Promise<string | null> {
  const invalid = await validateExists("orgPerson", data.personId, "الشخص المختار غير موجود.");
  if (invalid || typeof data.nodeId !== "string") return invalid;
  const node = await prisma.orgNode.findUnique({ where: { id: data.nodeId }, select: { kind: true } });
  if (!node) return "المستوى المختار غير موجود.";
  if (unit && node.kind !== "unit") return "اختر وحدة من وحدات الفوج.";
  if (!unit && node.kind === "unit") return "قادة الوحدات يُضافون من صفحة «الوحدات».";
  return null;
}
