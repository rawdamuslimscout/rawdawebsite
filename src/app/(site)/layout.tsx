import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/layout/BackToTop";
import SkipLink from "@/components/layout/SkipLink";
import { getSiteSettings } from "@/lib/data";

// Public-site chrome. Admin routes live outside this group so they don't get
// the public header/footer or a nested <main>.
export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const siteInfo = await getSiteSettings();
  return (
    <>
      <SkipLink />
      <Navbar siteName={siteInfo.name} />
      <main id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
