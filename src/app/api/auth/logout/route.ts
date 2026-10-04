import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getSessionAdminId, revokeAdminSessions } from "@/lib/session";
import { getClientIp, isSameOrigin } from "@/lib/request";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "طلب غير مسموح." }, { status: 403 });
  const adminId = await getSessionAdminId();
  if (adminId) {
    // Server-side invalidation: every older cookie for this account stops working.
    try { await revokeAdminSessions(adminId); } catch (e) { console.error("[logout] revoke failed", e); }
    await audit({ action: "logout", adminId, ip: getClientIp(req) });
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
