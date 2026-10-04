import { NextRequest, NextResponse } from "next/server";
import { coerceValues, getDelegate, getResourceConfig } from "@/lib/admin-resources";
import { requireAdmin, unauthorized } from "@/lib/api-auth";
import { validateResourceWrite } from "@/lib/resource-hooks";
import { getClientIp, isSameOrigin, readJson } from "@/lib/request";
import { audit } from "@/lib/audit";

const noStore = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStore });
const ID = /^[a-z0-9_-]{8,40}$/i;

export async function PUT(
  req: NextRequest,
  { params }: { params: { resource: string; id: string } }
) {
  if (!isSameOrigin(req)) return json({ error: "طلب غير مسموح" }, 403);
  const adminId = await requireAdmin();
  if (!adminId) return unauthorized();

  const config = getResourceConfig(params.resource);
  const delegate = getDelegate(params.resource);
  if (!config || !delegate) return json({ error: "المورد غير موجود" }, 404);
  if (!ID.test(params.id)) return json({ error: "معرّف غير صالح" }, 400);

  const body = await readJson(req, 100_000);
  if (!body) return json({ error: "بيانات غير صالحة" }, 400);

  try {
    const data = coerceValues(config, (name) => body[name]);
    const invalid = await validateResourceWrite(params.resource, params.id, data);
    if (invalid) return json({ error: invalid }, 400);
    const updated = await delegate.update({ where: { id: params.id }, data });
    await audit({ action: "update", adminId, resource: params.resource, targetId: params.id, ip: getClientIp(req) });
    return json({ data: updated });
  } catch (err) {
    console.error(`PUT /api/admin/${params.resource} failed`, err instanceof Error ? err.message : err);
    return json({ error: err instanceof Error && /[\u0600-\u06FF]/.test(err.message) ? err.message : "تعذّر تعديل العنصر" }, 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { resource: string; id: string } }
) {
  if (!isSameOrigin(req)) return json({ error: "طلب غير مسموح" }, 403);
  const adminId = await requireAdmin();
  if (!adminId) return unauthorized();

  const delegate = getDelegate(params.resource);
  if (!delegate) return json({ error: "المورد غير موجود" }, 404);
  if (!ID.test(params.id)) return json({ error: "معرّف غير صالح" }, 400);

  try {
    await delegate.delete({ where: { id: params.id } });
    await audit({ action: "delete", adminId, resource: params.resource, targetId: params.id, ip: getClientIp(req) });
    return json({ ok: true });
  } catch (err) {
    console.error(`DELETE /api/admin/${params.resource} failed`, err instanceof Error ? err.message : err);
    return json({ error: "تعذّر حذف العنصر" }, 400);
  }
}
