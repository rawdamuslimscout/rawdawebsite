import { NextRequest, NextResponse } from "next/server";
import { getDelegate, getResourceConfig } from "@/lib/admin-resources";

export async function GET(
  _req: NextRequest,
  { params }: { params: { resource: string } }
) {
  const config = getResourceConfig(params.resource);
  const delegate = getDelegate(params.resource);

  if (!config || !delegate) {
    return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
  }

  try {
    const rows = await delegate.findMany({ orderBy: config.orderBy });
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error(`GET /api/${params.resource} failed`, err);
    return NextResponse.json(
      { error: "تعذّر الاتصال بقاعدة البيانات. تحقق من DATABASE_URL." },
      { status: 503 }
    );
  }
}
