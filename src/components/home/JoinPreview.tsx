import Link from "next/link";
import { ArrowLeft, Calendar, Clock, HelpCircle, MapPin, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { getContactLinks } from "@/lib/contact";
import { getJoinSchedule, getSiteSettings } from "@/lib/data";
import { summarizeSchedule } from "@/lib/schedule";

const WHATSAPP_GREETING = "مرحبًا، أودّ الاستفسار عن الانتساب إلى فوج روضة الفيحاء.";

/**
 * Homepage "how to join": the practical facts a parent looks for (when and
 * where the troop meets) and the next step. Everything shown comes from the
 * admin-managed join schedule and site settings; details live on /join.
 */
export default async function JoinPreview() {
  const [schedule, settings] = await Promise.all([getJoinSchedule(), getSiteSettings()]);
  const meeting = summarizeSchedule(schedule);
  const { phone, whatsappHref, telHref } = getContactLinks(settings.contactPhone);
  const whatsappJoinHref = `${whatsappHref}?text=${encodeURIComponent(WHATSAPP_GREETING)}`;

  const facts = meeting.uniform
    ? [
        { icon: Calendar, label: "يوم الاجتماع الأسبوعي", value: meeting.day },
        { icon: Clock, label: "الوقت", value: meeting.time },
        { icon: MapPin, label: "المكان", value: meeting.location },
      ]
    : [];

  return (
    <section id="join" className="section-y bg-brand-cream">
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <Reveal className="lg:col-span-6">
            <SectionHeading title="الانضمام إلى الفوج" subtitle={settings.joinIntro} />
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={whatsappJoinHref} target="_blank" rel="noopener noreferrer" className="btn-purple">
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
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-sm font-bold">
              <li>
                <Link href="/join" className="inline-flex min-h-11 items-center gap-1.5 text-brand-purple hover:text-brand-purple-dark">
                  خطوات الانتساب والاشتراكات
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link href="/faq" className="inline-flex min-h-11 items-center gap-1.5 text-brand-purple hover:text-brand-purple-dark">
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </Reveal>

          <Reveal className="lg:col-span-6" delay={80}>
            <div className="rounded-2xl border border-brand-purple/10 bg-white p-6 shadow-sm sm:p-7">
              {facts.length > 0 ? (
                <dl className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
                  {facts.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="relative ps-11">
                      <dt className="text-xs font-semibold text-brand-ink/70">{label}</dt>
                      <dd className="mt-0.5 font-display text-base font-semibold leading-7 text-brand-ink">
                        <span
                          aria-hidden="true"
                          className="absolute start-0 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple-tint text-brand-purple"
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : schedule.length > 0 ? (
                <ul className="space-y-3 text-sm text-brand-ink/80">
                  {schedule.map((s) => (
                    <li key={s.id} className="leading-6">
                      <span className="font-semibold text-brand-ink">{s.stage}</span>
                      {[s.day, s.time, s.location].filter(Boolean).length > 0 && (
                        <span> — {[s.day, s.time, s.location].filter(Boolean).join(" · ")}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-7 text-brand-ink/70">
                  سنعلن المواعيد قريبًا، وحتى ذلك الحين تواصلوا معنا لمعرفة الموعد المناسب.
                </p>
              )}
              {facts.length > 0 && (
                <p className="mt-5 border-t border-brand-purple/10 pt-4 text-sm leading-7 text-brand-ink/70">
                  الموعد نفسه لجميع الوحدات.{" "}
                  <Link href="/join#schedule" className="font-semibold text-brand-purple underline-offset-4 hover:underline">
                    الوحدات ومواعيدها
                  </Link>
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
