/**
 * Turns any thrown value (Prisma error, network failure, Next.js transport
 * error, our own Error) into a short Arabic sentence a non-technical admin can
 * understand. Technical details are never shown to the admin — they go to the
 * console / server logs instead.
 *
 * Safe to import from both server and client code.
 */

const ARABIC = /[\u0600-\u06FF]/;

export function friendlyMessage(err: unknown, fallback: string): string {
  const message = err instanceof Error ? err.message : String(err ?? "");
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code?: unknown }).code)
      : "";

  // Messages we wrote ourselves are already Arabic and already friendly.
  if (message && ARABIC.test(message) && message.length < 220) return message;

  // ---- Prisma ----
  if (code === "P2002")
    return "هذا العنصر موجود مسبقًا (الاسم أو المعرّف مكرّر). غيّر القيمة ثم أعد المحاولة.";
  if (code === "P2025") return "هذا العنصر لم يعد موجودًا (ربما حُذف). حدّث الصفحة.";
  if (code === "P2003")
    return "لا يمكن إتمام العملية لأن هذا العنصر مرتبط بعناصر أخرى (مثلًا: قادة مرتبطون بمرحلة). احذف العناصر المرتبطة أولًا.";
  if (
    ["P1001", "P1002", "P1008", "P1017", "P2024"].includes(code) ||
    /can'?t reach database|connection (pool|refused|terminated)|timed out fetching/i.test(
      message,
    )
  )
    return "تعذّر الاتصال بقاعدة البيانات حاليًا. انتظر قليلًا ثم أعد المحاولة.";

  // ---- Storage ----
  if (/storage is not configured/i.test(message))
    return "خدمة تخزين الصور والملفات غير مفعّلة. تواصل مع المطوّر.";

  // ---- Network / Next.js transport (client side) ----
  if (/body exceeded|payload too large|\b413\b|too large/i.test(message))
    return "حجم الملفات كبير جدًا. استخدم صورة أصغر أو ملفًا أخف ثم أعد المحاولة.";
  if (/failed to fetch|networkerror|load failed|network request failed|fetch failed/i.test(message))
    return "انقطع الاتصال بالإنترنت أثناء الحفظ. تأكد من اتصالك ثم أعد المحاولة.";
  if (/unexpected response was received/i.test(message))
    return "انتهت جلسة الدخول أو حدث خطأ في الاتصال. حدّث الصفحة وسجّل الدخول من جديد إن لزم.";
  if (/failed to find server action/i.test(message))
    return "تم تحديث الموقع للتو. حدّث الصفحة ثم أعد المحاولة.";

  return fallback;
}
