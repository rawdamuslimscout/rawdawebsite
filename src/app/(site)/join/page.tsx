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
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import PageHeader from "@/components/ui/PageHeader";
import { getContactLinks } from "@/lib/contact";
import { getJoinPricing, getJoinSchedule, getSiteSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { summarizeSchedule } from "@/lib/schedule";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "انضم إلينا",
  description:
    "معلومات الانتساب إلى فوج روضة الفيحاء في طرابلس: خطوات الانتساب، والاشتراكات، ومواعيد الاجتماعات الأسبوعية ومكانها.",
  path: "/join",
});

const WHATSAPP_GREETING =
  "مرحبًا، أودّ الاستفسار عن الانتساب إلى فوج روضة الفيحاء.";

export default async function JoinPage() {
  const [pricing, schedule, settings] = await Promise.all([
    getJoinPricing(),
    getJoinSchedule(),
    getSiteSettings(),
  ]);

  const joinIntro = settings.joinIntro;
  // When every unit meets at the same day, time and place, say it once.
  const meeting = summarizeSchedule(schedule);
  const { phone, whatsappHref, telHref } = getContactLinks(
    settings.contactPhone,
  );
  const whatsappJoinHref = `${whatsappHref}?text=${encodeURIComponent(WHATSAPP_GREETING)}`;

  // When every stage meets at the same place, name it in the steps too.
  const locations = new Set(
    schedule.map((s) => s.location.trim()).filter(Boolean),
  );
  const meetingPlace =
    locations.size === 1 && schedule.every((s) => s.location.trim())
      ? [...locations][0]
      : "";

  const steps: {
    icon: typeof MessageCircle;
    title: string;
    text: string;
    note?: string;
    href?: string;
    external?: boolean;
    cta?: string;
  }[] = [
    {
      icon: MessageCircle,
      title: "تواصلوا معنا",
      text: "راسلونا عبر واتساب أو اتصلوا بنا لطرح أسئلتكم ومعرفة التفاصيل.",
      href: whatsappJoinHref,
      external: true,
      cta: "راسلونا عبر واتساب",
    },
    {
      icon: CalendarCheck,
      title: "اختاروا المرحلة المناسبة",
      text: "تعرّفوا على المرحلة الكشفية المناسبة لعمر المنتسب، وعلى موعد اجتماعها الأسبوعي.",
      href: schedule.length > 0 ? "#schedule" : undefined,
      cta: "عرض المواعيد",
    },
    {
      icon: Tent,
      title: "ابدأوا الرحلة",
      text: "احضروا الاجتماع الأسبوعي، وأكملوا خطوات الانتساب مع قادة الفوج.",
      note: meetingPlace ? `مكان الاجتماع: ${meetingPlace}` : undefined,
    },
  ];

  return (
    <>
      <PageHeader title="انضم إلينا" subtitle={joinIntro} path="/join" />

      {/* Who can join + the primary next step, right away */}
      <section className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="rounded-2xl border border-brand-purple/10 bg-brand-cream px-6 py-6 text-center sm:px-8 sm:py-8">
            <h2 className="font-display text-xl font-bold text-brand-ink sm:text-2xl">
              من يمكنه الانضمام؟
            </h2>

            <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-brand-ink/65 sm:text-base">
              نستقبل تلامذة مدرسة روضة الفيحاء، إضافةً إلى أصدقاء الكشفيين
              وأقاربهم الراغبين في الانضمام إلى الفوج والمشاركة في أنشطته
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
                ابدأوا الانتساب عبر واتساب
              </a>
              <a
                href={telHref}
                className="btn border border-brand-purple/20 bg-white text-brand-purple hover:border-brand-purple/40 hover:bg-brand-purple-tint"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                اتصلوا بنا
                <span dir="ltr" className="font-semibold text-brand-ink/70">
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
            خطوات الانتساب
          </h2>

          <ol className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-6">
            {steps.map(({ icon: Icon, title, text, note, href, external, cta }, i) => (
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
                  <p className="mt-1.5 text-sm leading-7 text-brand-ink/70">
                    {text}
                  </p>
                  {note && (
                    <p className="mt-2 flex items-start gap-1.5 text-sm font-semibold text-brand-ink/80">
                      <MapPin
                        className="mt-1 h-4 w-4 shrink-0 text-brand-purple"
                        aria-hidden="true"
                      />
                      {note}
                    </p>
                  )}
                  {href && (
                    <a
                      href={href}
                      {...(external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
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
              نزوّدكم بتفاصيل الاشتراكات عند التواصل معنا.
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
              سنعلن المواعيد قريبًا، وحتى ذلك الحين تواصلوا معنا لمعرفة
              الموعد المناسب.
            </p>
          ) : meeting.uniform ? (
            <>
              <dl className="mx-auto mt-8 grid max-w-3xl gap-4 rounded-2xl border border-brand-purple/10 bg-white p-5 shadow-sm sm:grid-cols-3 sm:p-6">
                {[
                  { icon: Calendar, label: "اليوم", value: meeting.day },
                  { icon: Clock, label: "الوقت", value: meeting.time },
                  { icon: MapPin, label: "المكان", value: meeting.location },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="relative min-w-0 ps-7">
                    <dt className="text-xs font-semibold text-brand-ink/70">{label}</dt>
                    <dd className="mt-0.5 font-display text-base font-semibold leading-7 text-brand-ink">
                      <Icon className="absolute start-0 top-1 h-5 w-5 text-brand-purple" aria-hidden="true" />
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <h3 className="mt-8 text-center font-display text-lg font-bold text-brand-ink">
                الوحدات التي تجتمع في هذا الموعد
              </h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {schedule.map((s) => (
                  <li key={s.id} className="rounded-2xl border border-brand-purple/10 bg-white px-5 py-4 shadow-sm">
                    <p className="font-display text-base font-semibold leading-7 text-brand-ink">{s.stage}</p>
                    {s.ageRange && <p className="text-xs text-brand-turquoise-dark">{s.ageRange}</p>}
                  </li>
                ))}
              </ul>
            </>
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
                      // Valid <dl> grouping: each <div> holds only its <dt> and <dd>.
                      // The icon lives in the <dd> (the <dt> is visually hidden on
                      // larger screens) and is positioned against the group.
                      <div
                        key={label}
                        className="relative min-w-0 ps-[1.625rem] text-sm text-brand-ink/75"
                      >
                        <dt className="text-[11px] font-semibold text-brand-ink/70 sm:sr-only">
                          {label}
                        </dt>
                        <dd className="leading-6">
                          <Icon
                            className="absolute start-0 top-0.5 h-4 w-4 text-brand-purple"
                            aria-hidden="true"
                          />
                          {value || "—"}
                        </dd>
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

          <Link
            href="/faq"
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-white/85 underline-offset-4 hover:text-white hover:underline"
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            لديكم أسئلة أخرى؟ اطّلعوا على الأسئلة الشائعة
          </Link>
        </div>
      </section>
    </>
  );
}
