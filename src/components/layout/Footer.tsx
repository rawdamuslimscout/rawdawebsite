import { Instagram, Facebook, MapPin, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import Logo from "@/components/ui/Logo";
import { navLinks, siteInfo as staticSiteInfo } from "@/data/content";
import { getSiteSettings } from "@/lib/data";
import DeveloperWatermark from "./DeveloperWatermark";

export default async function Footer() {
  const siteInfo = await getSiteSettings();

  return (
    <footer id="contact" className="bg-brand-purple-dark text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-16">
        {/* Main Grid */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          {/* Brand */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <Logo size={48} dark />

              <span className="font-display text-lg font-semibold">
                {siteInfo.name}
              </span>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
              {siteInfo.parent}. نعمل على بناء جيل من القادة عبر الكشافة والقيم
              والخدمة.
            </p>

            {/* Socials */}
            <div className="mt-7 flex items-center gap-3">
              <a
                href={siteInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.07] text-white/75 transition-all duration-200 hover:bg-brand-yellow hover:text-brand-purple-dark"
              >
                <Instagram className="h-[18px] w-[18px]" />
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.07] text-white/75 transition-all duration-200 hover:bg-brand-yellow hover:text-brand-purple-dark"
              >
                <Facebook className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-3">
            <h4 className="font-display text-sm font-semibold text-brand-yellow">
              التصفح
            </h4>

            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-white/60">
              {navLinks.map((link) => (
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
          <div className="lg:col-span-4">
            <h4 className="font-display text-sm font-semibold text-brand-yellow">
              تواصل معنا
            </h4>

            <ul className="mt-5 space-y-4 text-sm text-white/60">
              {/* Location */}
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                  <MapPin className="h-4 w-4 text-brand-turquoise" />
                </span>

                <span>طرابلس، لبنان</span>
              </li>

              {/* Phone */}
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                  <Phone className="h-4 w-4 text-brand-turquoise" />
                </span>

                <span dir="ltr">+961 81 348 184</span>
              </li>

              {/* WhatsApp */}
              <li>
                <a
                  href="https://wa.me/96181348184"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                    <FaWhatsapp className="h-[17px] w-[17px] text-emerald-400 transition-colors group-hover:text-emerald-300" />
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
        <div className="mt-14 flex flex-col gap-5 border-t border-white/[0.08] pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center sm:text-right">
            © {new Date().getFullYear()} {siteInfo.name} — جميع الحقوق محفوظة.
          </p>

          <DeveloperWatermark />
        </div>
      </div>
    </footer>
  );
}
