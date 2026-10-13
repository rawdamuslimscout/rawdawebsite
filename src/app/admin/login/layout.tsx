import type { Metadata } from "next";
import SkipLink from "@/components/layout/SkipLink";

// The login page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "تسجيل الدخول",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipLink />
      <main id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </main>
    </>
  );
}
