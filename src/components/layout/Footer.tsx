import {
  Instagram,
  Facebook,
  MapPin,
  Phone,
  MessageCircle,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { navLinks, siteInfo as staticSiteInfo } from "@/data/content";
import { getSiteSettings } from "@/lib/data";
import DeveloperWatermark from "./DeveloperWatermark";

export default async function Footer() {
  const siteInfo = await getSiteSettings();
  return (
    <footer id="contact" className="bg-brand-purple-dark text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <Logo size={46} dark />
              <span className="font-display text-lg font-semibold">
                {siteInfo.name}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              {siteInfo.parent}. نعمل على بناء جيل من القادة عبر الكشافة والقيم
              والخدمة.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-brand-yellow">
              التصفح
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-brand-yellow">
              تواصل معنا
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-brand-turquoise" />
                طرابلس، لبنان
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-brand-turquoise" />
                <span dir="ltr">+961 81 348 184</span>
              </li>
              <li>
                <a
                  href="https://wa.me/96181348184"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white/75 transition-colors hover:text-brand-yellow"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-400" />
                  تواصل معنا عبر واتساب
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-brand-yellow">
              تابعونا
            </h4>
            <div className="mt-4 flex gap-3">
              <a
                href={siteInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-brand-yellow hover:text-brand-purple-dark"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-brand-yellow hover:text-brand-purple-dark"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
            <p className="mt-4 text-sm text-white/60" dir="ltr">
              {staticSiteInfo.instagram}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-white/10 pt-6 text-center text-xs text-white/50 sm:flex-row sm:text-right">
          <p>
            © {new Date().getFullYear()} {siteInfo.name} — جميع الحقوق محفوظة.
          </p>
          <DeveloperWatermark />
        </div>
      </div>
    </footer>
  );
}
