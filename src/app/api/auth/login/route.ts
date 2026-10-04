import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DUMMY_HASH, hashPassword, needsRehash, verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";
import { getClientIp, isSameOrigin, readJson } from "@/lib/request";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const noStore = { "Cache-Control": "no-store" };
const fail = (error: string, status: number, extra: Record<string, string> = {}) =>
  NextResponse.json({ error }, { status, headers: { ...noStore, ...extra } });

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return fail("طلب غير مسموح.", 403);

  const ip = getClientIp(req);
  const body = await readJson(req, 2_000);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password || username.length > 64 || password.length > 256) {
    return fail("الرجاء إدخال اسم المستخدم وكلمة المرور", 400);
  }

  // Temporary (self-expiring) limits: per IP and per account.
  const ipKey = `login:ip:${ip}`;
  const userKey = `login:user:${username.toLowerCase()}`;
  const [byIp, byUser] = await Promise.all([
    rateLimit(ipKey, 20, 15 * 60),
    rateLimit(userKey, 8, 15 * 60),
  ]);
  if (!byIp.allowed || !byUser.allowed) {
    const wait = Math.max(byIp.retryAfterSeconds, byUser.retryAfterSeconds);
    await audit({ action: "login.blocked", ip, meta: { reason: "rate_limit" } });
    return fail(
      `محاولات كثيرة. انتظر ${Math.ceil(wait / 60)} دقيقة ثم حاول مجددًا.`,
      429,
      { "Retry-After": String(wait) },
    );
  }

  let admin: { id: string; passwordHash: string; sessionVersion: number } | null;
  try {
    admin = await prisma.admin.findUnique({
      where: { username },
      select: { id: true, passwordHash: true, sessionVersion: true },
    });
  } catch (err) {
    console.error("[login] database error", err instanceof Error ? err.message : err);
    return fail("تعذّر الاتصال بالخدمة حاليًا. حاول بعد قليل.", 503);
  }

  // Always run one hash comparison so response time doesn't reveal valid usernames.
  const ok = await verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !ok) {
    await audit({ action: "login.failed", ip });
    return fail("بيانات الدخول غير صحيحة", 401);
  }

  if (needsRehash(admin.passwordHash)) {
    try {
      await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash: await hashPassword(password) } });
    } catch {}
  }

  await resetRateLimit(userKey);
  await setSessionCookie(admin.id, admin.sessionVersion);
  await audit({ action: "login.success", adminId: admin.id, ip });
  return NextResponse.json({ ok: true }, { headers: noStore });
}
