import {
  ArrowLeft,
  Calendar,
  CalendarCheck,
  Clock,
  HelpCircle,
  MapPin,
  MessageCircle,
  Phone,
  Tent,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import PageHeader from "@/components/ui/PageHeader";
import { getContactLinks } from "@/lib/contact";
import { getJoinPricing, getJoinSchedule, getSiteSettings } from "@/lib/data";

export const revalidate = 3600;

export const metadata = {
  title: "انضم إلينا | فوج روضة الفيحاء",
  description:
    "معلومات الانتساب إلى فوج روضة الفيحاء: الأسعار، مواعيد الاجتماعات الأسبوعية، والمكان.",
  alternates: { canonical: "/join" },
  openGraph: {
    title: "انضم إلينا | فوج روضة الفيحاء",
    url: "/join",
    locale: "ar_LB",
    type: "website",
  },
};

const WHATSAPP_GREETING =
  "مرحبًا، أودّ الاستفسار عن الانتساب إلى فوج روضة الفيحاء.";

export default async function JoinPage() {
  const [pricing, schedule, settings] = await Promise.all([
    getJoinPricing(),
    getJoinSchedule(),
    getSiteSettings(),
  ]);

  const joinIntro = settings.joinIntro;
  const { phone, whatsappHref, telHref } = getContactLinks(
    settings.contactPhone,
  );
  const whatsappJoinHref = `${whatsappHref}?text=${encodeURIComponent(WHATSAPP_GREETING)}`;

  const steps = [
    {
      icon: MessageCircle,
      title: "تواصلوا معنا",
      text: "راسلونا عبر واتساب أو اتصلوا بنا لطرح أسئلتكم ومعرفة التفاصيل.",
    },
    {
      icon: CalendarCheck,
      title: "اختاروا المرحلة المناسبة",
      text: "تعرّفوا على المرحلة الكشفية المناسبة لعمر المنتسب وموعد اجتماعها الأسبوعي.",
      href: schedule.length > 0 ? "#schedule" : undefined,
      cta: "عرض المواعيد",
    },
    {
      icon: Tent,
      title: "ابدأوا الرحلة",
      text: "احضروا الاجتماع الأسبوعي وأكملوا خطوات الانتساب مع قادة الفوج.",
    },
  ];

  return (
    <>
      <PageHeader title="انضم إلينا" subtitle={joinIntro} />

      {/* Who can join + the primary next step, right away */}
      <section className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="rounded-2xl border border-brand-purple/10 bg-brand-cream px-6 py-6 text-center sm:px-8 sm:py-8">
            <h2 className="font-display text-xl font-bold text-brand-ink sm:text-2xl">
              من يمكنه الانضمام؟
            </h2>

            <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-brand-ink/65 sm:text-base">
              نستقبل تلامذة مدرسة روضة الفيحاء، إضافةً إلى أصدقاء وأقارب
              الكشفيين الراغبين في الانضمام إلى الفوج والمشاركة في أنشطته
              وبرامجه.
            </p>

            <div className="mx-auto mt-6 flex max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:justify-center">
              <a
                href={whatsappJoinHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-purple"
              >
                <FaWhatsapp className="h-[18px] w-[18px]" aria-hidden="true" />
                ابدأ الانتساب عبر واتساب
              </a>
              <a
                href={telHref}
                className="btn border border-brand-purple/20 bg-white text-brand-purple hover:border-brand-purple/40 hover:bg-brand-purple-tint"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                اتصل بنا
                <span dir="ltr" className="font-semibold text-brand-ink/60">
                  {phone}
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How to join */}
      <section aria-labelledby="steps-h" className="bg-white pb-14 sm:pb-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <h2
            id="steps-h"
            className="text-center font-display text-2xl font-bold text-brand-ink sm:text-3xl"
          >
            كيف تنضم؟
          </h2>

          <ol className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-6">
            {steps.map(({ icon: Icon, title, text, href, cta }, i) => (
              <li
                key={title}
                className="relative flex gap-4 rounded-2xl border border-brand-purple/10 bg-white p-5 shadow-soft sm:flex-col sm:p-6"
              >
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-purple-tint text-brand-purple">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span
                    aria-hidden="true"
                    className="absolute -end-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-yellow font-display text-xs font-bold text-brand-purple-dark"
                  >
                    {i + 1}
                  </span>
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-bold text-brand-ink sm:text-lg">
                    <span className="sr-only">الخطوة {i + 1}: </span>
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-7 text-brand-ink/65">
                    {text}
                  </p>
                  {href && (
                    <a
                      href={href}
                      className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-brand-purple hover:text-brand-purple-dark"
                    >
                      {cta}
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        aria-labelledby="pricing-h"
        className="bg-white pb-16 sm:pb-20"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2
            id="pricing-h"
            className="text-center font-display text-2xl font-bold text-brand-ink sm:text-3xl"
          >
            الاشتراكات
          </h2>

          {pricing.length === 0 ? (
            <p className="mx-auto mt-8 max-w-xl rounded-2xl bg-brand-cream p-6 text-center text-sm leading-7 text-brand-ink/70 ring-1 ring-brand-purple/10">
              تفاصيل الاشتراكات متوفرة عند التواصل معنا.
            </p>
          ) : (
            <ul
              className={`mx-auto mt-10 grid gap-4 sm:gap-6 ${
                pricing.length === 1
                  ? "max-w-md"
                  : "max-w-4xl sm:grid-cols-2"
              }`}
            >
              {pricing.map((tier) => (
                <li
                  key={tier.id}
                  className="flex flex-col rounded-2xl border border-brand-purple/10 bg-brand-cream p-6 text-center shadow-sm"
                >
                  <h3 className="font-display text-lg font-semibold text-brand-ink">
                    {tier.title}
                  </h3>

                  <p className="mt-4 font-display text-3xl font-bold text-brand-purple">
                    {tier.price}
                  </p>

                  {tier.period && (
                    <p className="mt-1 text-xs font-medium text-brand-turquoise-dark">
                      {tier.period}
                    </p>
                  )}

                  {tier.description && (
                    <p className="mt-4 text-sm leading-relaxed text-brand-ink/65">
                      {tier.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Weekly schedule */}
      <section
        id="schedule"
        aria-labelledby="schedule-h"
        className="bg-brand-purple-tint py-16 sm:py-20"
      >
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <h2
            id="schedule-h"
            className="text-center font-display text-2xl font-bold text-brand-ink sm:text-3xl"
          >
            مواعيد الاجتماعات الأسبوعية
          </h2>

          {schedule.length === 0 ? (
            <p className="mx-auto mt-8 max-w-xl rounded-2xl bg-white p-6 text-center text-sm leading-7 text-brand-ink/70 ring-1 ring-brand-purple/10">
              سيتم الإعلان عن المواعيد قريبًا. تواصلوا معنا لمعرفة الموعد
              المناسب.
            </p>
          ) : (
            <ul className="mt-10 space-y-4">
              {schedule.map((s) => (
                <li
                  key={s.id}
                  className="grid gap-4 rounded-2xl border border-brand-purple/10 bg-white p-5 shadow-sm sm:grid-cols-[1.3fr_1fr_1fr_1fr] sm:items-center"
                >
                  <div className="border-b border-brand-purple/10 pb-3 sm:border-0 sm:pb-0">
                    <h3 className="font-display text-base font-semibold text-brand-ink">
                      {s.stage}
                    </h3>
                    {s.ageRange && (
                      <p className="text-xs text-brand-turquoise-dark">
                        {s.ageRange}
                      </p>
                    )}
                  </div>

                  {/* Labelled facts: on phones they read as a compact list, on larger screens as table columns. */}
                  <dl className="contents">
                    {[
                      { icon: Calendar, label: "اليوم", value: s.day },
                      { icon: Clock, label: "الوقت", value: s.time },
                      { icon: MapPin, label: "المكان", value: s.location },
                    ].map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="flex items-start gap-2.5 text-sm text-brand-ink/75"
                      >
                        <Icon
                          className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <dt className="text-[11px] font-semibold text-brand-ink/45 sm:sr-only">
                            {label}
                          </dt>
                          <dd className="leading-6">{value || "—"}</dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-purple py-14 text-center sm:py-16">
        <div className="mx-auto max-w-xl px-5 sm:px-8">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            للاستفسار والانتساب
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
            تواصلوا معنا لمعرفة التفاصيل وخطوات الانتساب إلى الفوج.
          </p>

          <div className="mx-auto mt-7 flex max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <a
              href={whatsappJoinHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              <FaWhatsapp className="h-[18px] w-[18px]" aria-hidden="true" />
              تواصلوا معنا عبر واتساب
            </a>
            <a href={telHref} className="btn-outline-light">
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span dir="ltr">{phone}</span>
            </a>
          </div>

          <a
            href="/faq"
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            لديك سؤال؟ اطّلع على الأسئلة الشائعة
          </a>
        </div>
      </section>
    </>
  );
}
