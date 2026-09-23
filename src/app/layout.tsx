import type { Metadata } from "next";
import { El_Messiri, Cairo } from "next/font/google";
import "./globals.css";

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
  metadataBase: new URL("https://rawda-fayhaa-scout.example"),
  title: "فوج روضة الفيحاء | الكشافة المسلم في لبنان",
  description:
    "الموقع الرسمي لفوج روضة الفيحاء، جمعية الكشاف المسلم في لبنان - مفوضية الشمال. نُنمّي الإنسان، ونبني القائد، ونصنع الذكريات.",
  openGraph: {
    title: "فوج روضة الفيحاء | الكشافة المسلم في لبنان",
    description:
      "الموقع الرسمي لفوج روضة الفيحاء — مخيمات، رحلات، أنشطة كشفية وتربوية في طرابلس، لبنان.",
    locale: "ar_LB",
    type: "website",
    siteName: "فوج روضة الفيحاء",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${elMessiri.variable} ${cairo.variable}`}>
      <body className="font-sans antialiased bg-brand-cream text-brand-ink">
        {children}
      </body>
    </html>
  );
}
