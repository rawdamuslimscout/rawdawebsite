import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_API_RESOURCES, getDelegate, getResourceConfig } from "@/lib/admin-resources";

// Public read-only API. Only an explicit allowlist of already-public content is
// served; FAQ drafts, organizational people and every other table are never reachable here.
export async function GET(
  _req: NextRequest,
  { params }: { params: { resource: string } }
) {
  if (!PUBLIC_API_RESOURCES.has(params.resource)) {
    return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
  }
  const config = getResourceConfig(params.resource);
  const delegate = getDelegate(params.resource);
  if (!config || !delegate) {
    return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
  }

  try {
    const rows = await delegate.findMany({ orderBy: config.orderBy });
    return NextResponse.json({ data: rows }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (err) {
    console.error(`GET /api/${params.resource} failed`, err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "تعذّر تحميل البيانات حاليًا" }, { status: 503 });
  }
}
