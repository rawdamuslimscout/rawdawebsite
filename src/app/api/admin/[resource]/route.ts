import { NextRequest, NextResponse } from "next/server";
import { coerceValues, getDelegate, getResourceConfig } from "@/lib/admin-resources";
import { requireAdmin, unauthorized } from "@/lib/api-auth";
import { validateResourceWrite } from "@/lib/resource-hooks";
import { getClientIp, isSameOrigin, readJson } from "@/lib/request";
import { audit } from "@/lib/audit";

const noStore = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStore });

export async function GET(
  _req: NextRequest,
  { params }: { params: { resource: string } }
) {
  if (!(await requireAdmin())) return unauthorized();

  const config = getResourceConfig(params.resource);
  const delegate = getDelegate(params.resource);
  if (!config || !delegate) return json({ error: "المورد غير موجود" }, 404);

  try {
    const rows = await delegate.findMany({ orderBy: config.orderBy });
    return json({ data: rows });
  } catch (err) {
    console.error(`GET /api/admin/${params.resource} failed`, err instanceof Error ? err.message : err);
    return json({ error: "تعذّر تحميل البيانات" }, 503);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { resource: string } }
) {
  if (!isSameOrigin(req)) return json({ error: "طلب غير مسموح" }, 403);
  const adminId = await requireAdmin();
  if (!adminId) return unauthorized();

  const config = getResourceConfig(params.resource);
  const delegate = getDelegate(params.resource);
  if (!config || !delegate) return json({ error: "المورد غير موجود" }, 404);

  const body = await readJson(req, 100_000);
  if (!body) return json({ error: "بيانات غير صالحة" }, 400);

  try {
    const data = coerceValues(config, (name) => body[name]);
    const invalid = await validateResourceWrite(params.resource, "", data);
    if (invalid) return json({ error: invalid }, 400);
    const created = await delegate.create({ data });
    await audit({ action: "create", adminId, resource: params.resource, targetId: String(created.id), ip: getClientIp(req) });
    return json({ data: created }, 201);
  } catch (err) {
    console.error(`POST /api/admin/${params.resource} failed`, err instanceof Error ? err.message : err);
    return json({ error: err instanceof Error && /[\u0600-\u06FF]/.test(err.message) ? err.message : "تعذّر إنشاء العنصر" }, 400);
  }
}
