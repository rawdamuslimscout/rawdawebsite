import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center px-5 py-20">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-bold text-brand-ink sm:text-3xl">
          الصفحة غير موجودة
        </h1>
        <p className="mt-3 text-base leading-8 text-brand-ink/65">
          ربما تم نقل هذه الصفحة أو أن الرابط غير صحيح.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-brand-purple px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark"
        >
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    </section>
  );
}
