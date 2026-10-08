import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import Logo from "@/components/ui/Logo";
import { navLinks } from "@/data/content";
import { getSiteSettings } from "@/lib/data";
import DeveloperWatermark from "./DeveloperWatermark";

/**
 * Builds a wa.me number from whatever the admin typed.
 * Lebanese local numbers get +961.
 */
function toWhatsAppNumber(phone: string): string {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);

  if (digits.length > 0 && digits.length <= 8) {
    digits = `961${digits}`;
  }

  return digits;
}

export default async function Footer() {
  const siteInfo = await getSiteSettings();

  const location = siteInfo.contactLocation?.trim() || "طرابلس، لبنان";
  const phone = siteInfo.contactPhone?.trim() || "+961 81 348 184";
  const whatsapp = toWhatsAppNumber(phone);
  const email = "info@rawdamuslimscout.org";

  return (
    <footer id="contact" className="bg-brand-purple-dark text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:py-14">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          {/* Brand */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <Logo size={40} dark />

              <span className="font-display text-base font-semibold sm:text-lg">
                {siteInfo.name}
              </span>
            </div>

            <p className="mt-3 max-w-md text-[12px] leading-6 text-white/55 sm:mt-4 sm:text-sm sm:leading-7">
              {siteInfo.parent}. نعمل على بناء جيل من القادة عبر الكشافة والقيم
              والخدمة.
            </p>

            {/* Socials */}
            <div className="mt-4 flex items-center gap-2.5 sm:mt-6 sm:gap-3">
              <a
                href={siteInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.07] text-white/70 transition-all duration-200 hover:bg-brand-yellow hover:text-brand-purple-dark sm:h-10 sm:w-10"
              >
                <Instagram className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.07] text-white/70 transition-all duration-200 hover:bg-brand-yellow hover:text-brand-purple-dark sm:h-10 sm:w-10"
              >
                <Facebook className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-3">
            <h4 className="font-display text-[13px] font-semibold text-brand-yellow sm:text-sm">
              التصفح
            </h4>

            <ul className="mt-3 grid grid-cols-3 lg:grid-cols-2 gap-x-5 gap-y-2 text-[12px] text-white/55 sm:mt-5 sm:gap-y-3 sm:text-sm">
              {[
                ...navLinks,
                { href: "/structure", label: "الهيكل التنظيمي" },
                { href: "/faq", label: "الأسئلة الشائعة" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-block transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4 ">
            <h4 className="font-display text-[13px] font-semibold text-brand-yellow sm:text-sm">
              تواصل معنا
            </h4>

            <ul className="mt-3 grid grid-cols-2 lg:grid-cols-1 space-y-2.5 text-[12px] text-white/55 sm:mt-5 sm:space-y-4 sm:text-sm">
              {/* Location */}
              <li className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] sm:h-8 sm:w-8">
                  <MapPin className="h-3.5 w-3.5 text-brand-turquoise sm:h-4 sm:w-4" />
                </span>

                <span>{location}</span>
              </li>

              {/* Phone */}
              <li className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] sm:h-8 sm:w-8">
                  <Phone className="h-3.5 w-3.5 text-brand-turquoise sm:h-4 sm:w-4" />
                </span>

                <span dir="ltr">{phone}</span>
              </li>

              {/* Email */}
              <li>
                <a
                  href={`mailto:${email}`}
                  className="group flex min-w-0 items-center gap-2.5"
                  aria-label={`راسلنا عبر ${email}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] sm:h-8 sm:w-8">
                    <Mail className="h-3.5 w-3.5 text-brand-turquoise transition-colors group-hover:text-brand-yellow sm:h-4 sm:w-4" />
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
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] sm:h-8 sm:w-8">
                    <FaWhatsapp className="h-4 w-4 text-emerald-400 transition-colors group-hover:text-emerald-300 sm:h-[17px] sm:w-[17px]" />
                  </span>

                  <span className="transition-colors group-hover:text-white">
                    تواصل معنا عبر واتساب
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col gap-3 border-t border-white/[0.08] pt-4 text-[10px] text-white/40 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:pt-6 sm:text-xs">
          <p className="text-center sm:text-right">
            © {new Date().getFullYear()} {siteInfo.name} — جميع الحقوق محفوظة.
          </p>

          <DeveloperWatermark />
        </div>
      </div>
    </footer>
  );
}
