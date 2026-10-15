import Link from "next/link";
import { Instagram, MapPin, Phone, Mail } from "lucide-react";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa";

import Logo from "@/components/ui/Logo";
import { navLinks } from "@/data/content";
import { getSiteSettings } from "@/lib/data";
import { CONTACT_EMAIL as email, FACEBOOK_URL, getContactLinks } from "@/lib/contact";
import DeveloperWatermark from "./DeveloperWatermark";

export default async function Footer() {
  const siteInfo = await getSiteSettings();

  const location = siteInfo.contactLocation?.trim() || "طرابلس، لبنان";
  const { phone, whatsappHref, telHref } = getContactLinks(siteInfo.contactPhone);

  return (
    <footer id="contact" className="bg-brand-purple-dark text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:py-14">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          {/* Brand */}
          <div className="md:col-span-2 lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <Logo size={40} dark alt="" />

              <span className="font-display text-base font-semibold sm:text-lg">
                {siteInfo.name}
              </span>
            </div>

            <p className="mt-3 max-w-md text-sm leading-7 text-white/65 sm:mt-4">
              {siteInfo.parent}. نعمل على بناء جيل من القادة عبر الكشافة والقيم
              والخدمة.
            </p>

            {/* Socials */}
            <div className="mt-4 flex items-center gap-2.5 sm:mt-6 sm:gap-3">
              <a
                href={siteInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="تابعنا على إنستغرام"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.07] text-white/70 transition-all duration-200 hover:bg-brand-yellow hover:text-brand-purple-dark"
              >
                <Instagram className="h-[18px] w-[18px]" aria-hidden />
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="تابعنا على فيسبوك"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.07] text-white/70 transition-all duration-200 hover:bg-brand-yellow hover:text-brand-purple-dark"
              >
                <FaFacebookF className="h-[17px] w-[17px]" aria-hidden />
              </a>
            </div>
          </div>

          {/* Contact first: it's what most visitors look for down here. */}
          <div className="lg:col-span-4">
            <h2 className="font-display text-sm font-semibold text-brand-yellow">
              تواصل معنا
            </h2>

            <ul className="mt-2 grid gap-x-4 gap-y-0.5 text-sm text-white/65 sm:mt-5 sm:grid-cols-2 sm:gap-y-3 md:grid-cols-1">
              {/* Location */}
              <li className="flex min-h-[40px] items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                  <MapPin className="h-4 w-4 text-brand-turquoise" aria-hidden />
                </span>

                <span>{location}</span>
              </li>

              {/* Phone */}
              <li>
                <a
                  href={telHref}
                  className="group flex min-h-[40px] items-center gap-2.5"
                  aria-label={`اتصل بنا على ${phone}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                    <Phone className="h-4 w-4 text-brand-turquoise transition-colors group-hover:text-brand-yellow" aria-hidden />
                  </span>

                  <span dir="ltr" className="transition-colors group-hover:text-white">
                    {phone}
                  </span>
                </a>
              </li>

              {/* Email */}
              <li>
                <a
                  href={`mailto:${email}`}
                  className="group flex min-h-[40px] min-w-0 items-center gap-2.5"
                  aria-label={`راسلنا عبر ${email}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                    <Mail className="h-4 w-4 text-brand-turquoise transition-colors group-hover:text-brand-yellow" aria-hidden />
                  </span>

                  <span
                    className="min-w-0 break-all transition-colors group-hover:text-white"
                    dir="ltr"
                  >
                    {email}
                  </span>
                </a>
              </li>

              {/* WhatsApp */}
              <li>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-[40px] items-center gap-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                    <FaWhatsapp className="h-[17px] w-[17px] text-emerald-400 transition-colors group-hover:text-emerald-300" aria-hidden />
                  </span>

                  <span className="transition-colors group-hover:text-white">
                    تواصل معنا عبر واتساب
                  </span>
                </a>
              </li>
            </ul>
          </div>
          {/* Navigation */}
          <div className="lg:col-span-3">
            <h2 className="font-display text-sm font-semibold text-brand-yellow">
              التصفح
            </h2>

            <ul className="mt-2 grid grid-cols-3 gap-x-4 text-sm text-white/65 sm:mt-5 lg:grid-cols-2">
              {[...navLinks, { href: "/join", label: "انضم إلينا" }].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-[40px] items-center transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.08] pt-4 text-xs text-white/65 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:pt-6">
          <p className="text-center sm:text-right">
            © {new Date().getFullYear()} {siteInfo.name} — جميع الحقوق محفوظة.
          </p>

          <DeveloperWatermark />
        </div>
      </div>
    </footer>
  );
}
