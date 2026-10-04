import type { Metadata } from "next";
import { El_Messiri, Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/data";
import JsonLd from "@/components/ui/JsonLd";
import { SITE_URL, SITE_NAME, ORG_NAME } from "@/lib/site";

const elMessiri = El_Messiri({
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "فوج روضة الفيحاء | الكشاف المسلم في لبنان",
    template: "%s",
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  description:
    "الموقع الرسمي لفوج روضة الفيحاء، جمعية الكشاف المسلم في لبنان - مفوضية الشمال. نُنمّي الإنسان، ونبني القائد، ونصنع الذكريات.",
  openGraph: {
    title: "فوج روضة الفيحاء | الكشاف المسلم في لبنان",
    description:
      "الموقع الرسمي لفوج روضة الفيحاء — مخيمات، رحلات، أنشطة كشفية وتربوية في طرابلس، لبنان.",
    locale: "ar_LB",
    type: "website",
    url: "/",
    siteName: "فوج روضة الفيحاء",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const siteInfo = await getSiteSettings();
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
              parentOrganization: { "@type": "Organization", name: ORG_NAME },
              ...(siteInfo.instagramUrl ? { sameAs: [siteInfo.instagramUrl] } : {}),
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
        <Navbar siteName={siteInfo.name} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
