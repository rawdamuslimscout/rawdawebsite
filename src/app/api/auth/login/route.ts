import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json().catch(() => ({}));

  if (!username || !password) {
    return NextResponse.json({ error: "الرجاء إدخال اسم المستخدم وكلمة المرور" }, { status: 400 });
  }

  let admin;
  try {
    admin = await prisma.admin.findUnique({ where: { username } });
  } catch {
    return NextResponse.json(
      { error: "تعذّر الاتصال بقاعدة البيانات. تحقق من DATABASE_URL." },
      { status: 503 }
    );
  }

  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  }

  await setSessionCookie(admin.id);
  return NextResponse.json({ ok: true });
}
