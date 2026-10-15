import { HelpCircle, Instagram, Mail, MapPin, Phone, UserPlus } from "lucide-react";
import Link from "next/link";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa";
import ContactForm from "@/components/contact/ContactForm";
import PageHeader from "@/components/ui/PageHeader";
import { CONTACT_EMAIL, FACEBOOK_URL, getContactLinks } from "@/lib/contact";
import { getSiteSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "تواصل معنا",
  description:
    "تواصلوا مع فوج روضة الفيحاء في طرابلس عبر واتساب أو الهاتف أو البريد الإلكتروني، أو أرسلوا لنا رسالة مباشرة.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const { phone, whatsappHref, telHref } = getContactLinks(settings.contactPhone);
  const location = settings.contactLocation?.trim() || "طرابلس، لبنان";

  const channels: {
    icon: React.ReactNode;
    label: string;
    value: string;
    href?: string;
    external?: boolean;
    ltr?: boolean;
  }[] = [
    {
      icon: <FaWhatsapp className="h-5 w-5" aria-hidden="true" />,
      label: "واتساب",
      value: "أسرع طريقة للرد",
      href: whatsappHref,
      external: true,
    },
    {
      icon: <Phone className="h-5 w-5" aria-hidden="true" />,
      label: "الهاتف",
      value: phone,
      href: telHref,
      ltr: true,
    },
    {
      icon: <Mail className="h-5 w-5" aria-hidden="true" />,
      label: "البريد الإلكتروني",
      value: CONTACT_EMAIL,
      href: `mailto:${CONTACT_EMAIL}`,
      ltr: true,
    },
    {
      icon: <Instagram className="h-5 w-5" aria-hidden="true" />,
      label: "إنستغرام",
      value: settings.instagram,
      href: settings.instagramUrl,
      external: true,
      ltr: true,
    },
    {
      icon: <FaFacebookF className="h-5 w-5" aria-hidden="true" />,
      label: "فيسبوك",
      value: "fawjrawda",
      href: FACEBOOK_URL,
      external: true,
      ltr: true,
    },
    {
      icon: <MapPin className="h-5 w-5" aria-hidden="true" />,
      label: "العنوان",
      value: location,
    },
  ];

  return (
    <>
      <PageHeader
        title="تواصل معنا"
        subtitle="يسعدنا الإجابة عن أسئلتكم واستقبال اقتراحاتكم. اختاروا الطريقة الأنسب لكم."
        path="/contact"
      />

      <section className="bg-brand-cream py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_1.3fr] lg:gap-10">
          {/* Direct channels */}
          <div>
            <h2 className="font-display text-xl font-bold text-brand-ink sm:text-2xl">
              طرق التواصل
            </h2>
            <ul className="mt-5 grid gap-3">
              {channels.map(({ icon, label, value, href, external, ltr }) => {
                const body = (
                  <>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-purple-tint text-brand-purple">
                      {icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-brand-ink/60">{label}</span>
                      <span
                        dir={ltr ? "ltr" : undefined}
                        className="block break-all font-display text-base font-semibold text-brand-ink"
                      >
                        {value}
                      </span>
                    </span>
                  </>
                );
                const cardClass =
                  "flex items-center gap-4 rounded-2xl border border-brand-purple/10 bg-white p-4 shadow-sm";
                return (
                  <li key={label}>
                    {href ? (
                      <a
                        href={href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className={`${cardClass} transition-colors hover:border-brand-purple/30`}
                      >
                        {body}
                      </a>
                    ) : (
                      <div className={cardClass}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Message form */}
          <div className="rounded-2xl border border-brand-purple/10 bg-white p-6 shadow-soft sm:p-8">
            <h2 className="font-display text-xl font-bold text-brand-ink sm:text-2xl">
              أرسلوا لنا رسالة
            </h2>
            <p className="mt-2 text-sm leading-7 text-brand-ink/70">
              اكتبوا رسالتكم وسنرد عليكم في أقرب وقت.
            </p>
            <div className="mt-6">
              <ContactForm whatsappHref={whatsappHref} />
            </div>
          </div>
        </div>
      </section>

      {/* Related pages */}
      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto grid max-w-3xl gap-3 px-5 sm:grid-cols-2 sm:px-8">
          <Link
            href="/join"
            className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-brand-purple/10 bg-brand-cream px-5 py-4 text-sm font-bold text-brand-purple transition-colors hover:border-brand-purple/30"
          >
            <UserPlus className="h-5 w-5 shrink-0" aria-hidden="true" />
            معلومات الانتساب والمواعيد
          </Link>
          <Link
            href="/faq"
            className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-brand-purple/10 bg-brand-cream px-5 py-4 text-sm font-bold text-brand-purple transition-colors hover:border-brand-purple/30"
          >
            <HelpCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            الأسئلة الشائعة
          </Link>
        </div>
      </section>
    </>
  );
}
