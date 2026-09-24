import { NextRequest, NextResponse } from "next/server";
import { getDelegate, getResourceConfig } from "@/lib/admin-resources";
import { requireAdmin, unauthorized } from "@/lib/api-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { resource: string; id: string } }
) {
  if (!(await requireAdmin())) return unauthorized();

  const config = getResourceConfig(params.resource);
  const delegate = getDelegate(params.resource);
  if (!config || !delegate) {
    return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, string | number> = {};
  for (const field of config.fields) {
    if (body[field.name] === undefined) continue;
    data[field.name] = field.type === "number" ? Number(body[field.name]) || 0 : String(body[field.name]);
  }

  try {
    const updated = await delegate.update({ where: { id: params.id }, data });
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error(`PUT /api/admin/${params.resource}/${params.id} failed`, err);
    return NextResponse.json({ error: "تعذّر تعديل العنصر" }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { resource: string; id: string } }
) {
  if (!(await requireAdmin())) return unauthorized();

  const delegate = getDelegate(params.resource);
  if (!delegate) {
    return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
  }

  try {
    await delegate.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`DELETE /api/admin/${params.resource}/${params.id} failed`, err);
    return NextResponse.json({ error: "تعذّر حذف العنصر" }, { status: 400 });
  }
}
