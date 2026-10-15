import type { Metadata, Viewport } from "next";
import { El_Messiri, Cairo } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/data";
import JsonLd from "@/components/ui/JsonLd";
import {
  SITE_URL,
  SITE_NAME,
  ORG_NAME,
  SITE_EMAIL,
  SITE_LOGO_PATH,
  absoluteUrl,
  SITE_DEFAULT_TITLE,
} from "@/lib/site";
import { OG_IMAGE } from "@/lib/seo";
import { siteInfo as staticSiteInfo } from "@/data/content";
import { FACEBOOK_URL } from "@/lib/contact";

type JsonLdSettings = { name: string; instagramUrl: string; contactPhone: string };

/**
 * Settings are only used for JSON-LD here. getSiteSettings() throws on a DB
 * outage; the root layout must never fail because of it (it wraps admin and
 * error pages too), so fall back to static values.
 */
async function getJsonLdSettings(): Promise<JsonLdSettings> {
  try {
    const s = await getSiteSettings();
    return { name: s.name, instagramUrl: s.instagramUrl, contactPhone: s.contactPhone };
  } catch (error) {
    console.error("[layout] getSiteSettings failed; using static JSON-LD values.", error);
    return {
      name: staticSiteInfo.name,
      instagramUrl: staticSiteInfo.instagramUrl,
      contactPhone: "",
    };
  }
}

const elMessiri = El_Messiri({
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const DEFAULT_TITLE = SITE_DEFAULT_TITLE;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s",
  },
  // No root `alternates.canonical`: it would leak a homepage canonical into
  // every page that doesn't set its own (404, admin). Pages set theirs via
  // pageMetadata(). No site-wide `robots` either: pages are indexable by
  // default, and leaving it out lets 404s and admin pages emit a single noindex.
  description:
    "الموقع الرسمي لفوج روضة الفيحاء، جمعية الكشاف المسلم في لبنان – مفوضية الشمال، طرابلس. نُنمّي الإنسان، ونبني القائد، ونصنع الذكريات.",
  openGraph: {
    title: DEFAULT_TITLE,
    description:
      "الموقع الرسمي لفوج روضة الفيحاء: مخيمات ورحلات وأنشطة كشفية وتربوية في طرابلس، لبنان.",
    locale: "ar_LB",
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    images: [OG_IMAGE.url],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#2C1750",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const siteInfo = await getJsonLdSettings();
  const telephone = siteInfo.contactPhone.trim();
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${elMessiri.variable} ${cairo.variable}`}
    >
      <body className="font-sans antialiased bg-brand-cream text-brand-ink">
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: siteInfo.name || SITE_NAME,
              url: SITE_URL,
              logo: absoluteUrl(SITE_LOGO_PATH),
              email: SITE_EMAIL,
              ...(telephone ? { telephone } : {}),
              address: {
                "@type": "PostalAddress",
                addressLocality: "طرابلس",
                addressCountry: "LB",
              },
              areaServed: "طرابلس، لبنان",
              parentOrganization: { "@type": "Organization", name: ORG_NAME },
              sameAs: [siteInfo.instagramUrl, FACEBOOK_URL].filter(Boolean),
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: siteInfo.name || SITE_NAME,
              inLanguage: "ar",
              publisher: { "@id": `${SITE_URL}/#organization` },
            },
          ]}
        />
        {/* Public chrome lives in (site)/layout.tsx; admin has its own shell. */}
        {children}
      </body>
    </html>
  );
}
