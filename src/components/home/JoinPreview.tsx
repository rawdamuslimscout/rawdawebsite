import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import { getContactLinks } from "@/lib/contact";
import { getJoinSchedule, getSiteSettings } from "@/lib/data";
import { getHomePhotos } from "@/lib/home-photos";
import { summarizeSchedule } from "@/lib/schedule";

const WHATSAPP_GREETING = "مرحبًا، أودّ الاستفسار عن الانتساب إلى فوج روضة الفيحاء.";

/**
 * Homepage "how to join": a full-width photo with the meeting time and the
 * next step over it. Everything shown comes from the admin-managed join
 * schedule and site settings; details live on /join.
 */
export default async function JoinPreview() {
  const [schedule, settings, { joinImageUrl }] = await Promise.all([
    getJoinSchedule(),
    getSiteSettings(),
    getHomePhotos(),
  ]);
  const meeting = summarizeSchedule(schedule);
  const { phone, whatsappHref, telHref } = getContactLinks(settings.contactPhone);
  const whatsappJoinHref = `${whatsappHref}?text=${encodeURIComponent(WHATSAPP_GREETING)}`;

  return (
    <section
      id="join"
      aria-labelledby="join-title"
      className="relative isolate flex min-h-[520px] items-center overflow-hidden bg-brand-purple-dark py-20 sm:min-h-[600px]"
    >
      {joinImageUrl && (
        <SafeImage
          src={joinImageUrl}
          alt=""
          sizes="100vw"
          width={1920}
          height={1080}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
      )}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-brand-ink/65" />

      <Reveal className="container-x max-w-3xl text-center">
        <h2
          id="join-title"
          className="font-display text-4xl font-bold leading-[1.3] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-6xl"
        >
          انضمّوا إلينا
        </h2>
        {settings.joinIntro && (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
            {settings.joinIntro}
          </p>
        )}

        {meeting.uniform ? (
          <p className="mt-6 font-display text-lg font-semibold text-brand-yellow sm:text-xl">
            كل {meeting.day} · {meeting.time} · {meeting.location}
          </p>
        ) : (
          <Link
            href="/join#schedule"
            className="mt-6 inline-flex min-h-11 items-center font-display text-lg font-semibold text-brand-yellow underline-offset-4 hover:underline"
          >
            مواعيد الاجتماعات الأسبوعية
          </Link>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={whatsappJoinHref} target="_blank" rel="noopener noreferrer" className="btn-gold w-full text-base sm:w-auto">
            <FaWhatsapp className="h-[18px] w-[18px]" aria-hidden="true" />
            ابدأوا الانتساب عبر واتساب
          </a>
          <a href={telHref} className="btn-outline-light w-full backdrop-blur-sm sm:w-auto">
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span dir="ltr">{phone}</span>
          </a>
        </div>

        <Link
          href="/join"
          className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-white/85 hover:text-white"
        >
          خطوات الانتساب والاشتراكات
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Reveal>
    </section>
  );
}
