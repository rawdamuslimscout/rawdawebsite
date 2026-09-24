import { Calendar, Clock, MapPin, Users } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { getJoinPricing, getJoinSchedule, getSiteSettings } from "@/lib/data";

export const metadata = {
  title: "انضم إلينا | فوج روضة الفيحاء",
  description: "معلومات الانتساب إلى فوج روضة الفيحاء: الأسعار، مواعيد الاجتماعات الأسبوعية، والمكان.",
};

export default async function JoinPage() {
  const [pricing, schedule, settings] = await Promise.all([
    getJoinPricing(),
    getJoinSchedule(),
    getSiteSettings(),
  ]);

  const joinIntro = settings.joinIntro;

  return (
    <>
      <PageHeader title="انضم إلينا" subtitle={joinIntro} />

      {/* Pricing */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="text-center font-display text-2xl font-bold text-brand-ink sm:text-3xl">
            الاشتراكات
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-brand-ink/60">
            أرقام قابلة للتحديث من لوحة التحكم — تأكدوا من آخر الأسعار قبل الدفع.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pricing.map((tier) => (
              <div
                key={tier.id}
                className="rounded-2xl border border-brand-purple/10 bg-brand-cream p-6 text-center shadow-sm"
              >
                <h3 className="font-display text-lg font-semibold text-brand-ink">
                  {tier.title}
                </h3>
                <p className="mt-4 font-display text-3xl font-bold text-brand-purple">
                  {tier.price}
                </p>
                <p className="text-xs font-medium text-brand-turquoise-dark">{tier.period}</p>
                <p className="mt-4 text-sm leading-relaxed text-brand-ink/65">
                  {tier.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly schedule */}
      <section className="bg-brand-purple-tint py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <h2 className="text-center font-display text-2xl font-bold text-brand-ink sm:text-3xl">
            مواعيد الاجتماعات الأسبوعية
          </h2>

          <div className="mt-10 space-y-4">
            {schedule.map((s) => (
              <div
                key={s.id}
                className="grid gap-3 rounded-2xl border border-brand-purple/10 bg-white p-5 shadow-sm sm:grid-cols-[1.3fr_1fr_1fr_1fr_0.7fr] sm:items-center"
              >
                <div>
                  <p className="font-display text-base font-semibold text-brand-ink">
                    {s.stage}
                  </p>
                  <p className="text-xs text-brand-turquoise-dark">{s.ageRange}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-brand-ink/70">
                  <Calendar className="h-4 w-4 shrink-0 text-brand-purple" />
                  {s.day}
                </div>
                <div className="flex items-center gap-2 text-sm text-brand-ink/70">
                  <Clock className="h-4 w-4 shrink-0 text-brand-purple" />
                  {s.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-brand-ink/70">
                  <MapPin className="h-4 w-4 shrink-0 text-brand-purple" />
                  {s.location}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-brand-ink/70">
                  <Users className="h-4 w-4 shrink-0 text-brand-purple" />
                  {s.leaders} {s.leaders === 1 ? "قائد" : "قادة"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-purple py-16 text-center sm:py-20">
        <div className="mx-auto max-w-xl px-5 sm:px-8">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            جاهزون للانضمام؟
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
            تواصلوا معنا لمعرفة الخطوات القادمة وتسجيل ابنكم أو ابنتكم في الفوج.
          </p>
          <a
            href="/#contact"
            className="mt-7 inline-block rounded-full bg-brand-yellow px-8 py-3.5 text-sm font-bold text-brand-purple-dark transition-colors hover:bg-white"
          >
            تواصل معنا
          </a>
        </div>
      </section>
    </>
  );
}
