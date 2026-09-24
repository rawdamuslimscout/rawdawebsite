import { NextRequest, NextResponse } from "next/server";
import { getDelegate, getResourceConfig } from "@/lib/admin-resources";
import { requireAdmin, unauthorized } from "@/lib/api-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { resource: string } }
) {
  if (!(await requireAdmin())) return unauthorized();

  const config = getResourceConfig(params.resource);
  const delegate = getDelegate(params.resource);
  if (!config || !delegate) {
    return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
  }

  const rows = await delegate.findMany({ orderBy: config.orderBy });
  return NextResponse.json({ data: rows });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { resource: string } }
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
    const created = await delegate.create({ data });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error(`POST /api/admin/${params.resource} failed`, err);
    return NextResponse.json({ error: "تعذّر إنشاء العنصر" }, { status: 400 });
  }
}
