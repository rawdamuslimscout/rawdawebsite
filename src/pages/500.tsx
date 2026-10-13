import Head from "next/head";

/**
 * Static, branded 500 page. The App Router's error boundaries (app/error.tsx,
 * (site)/error.tsx) handle errors inside a rendered page, but when an
 * on-demand page can't be generated at all (for example a new news item
 * requested while the database is unreachable), Next answers with this
 * Pages Router error page instead. Without it, visitors get Next's built-in
 * English "500: Internal Server Error".
 *
 * Inline styles only: the site's Tailwind CSS is loaded by the App Router
 * layout, which doesn't wrap this page. No data, no client JavaScript needed.
 */

const purple = "#4B2A82";
const ink = "#211433";

export default function ServerErrorPage() {
  return (
    <>
      <Head>
        <title>تعذّر عرض الصفحة | فوج روضة الفيحاء</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div
        lang="ar"
        dir="rtl"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FBF9F5",
          color: ink,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif",
          textAlign: "center",
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        <main style={{ maxWidth: 440 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static page, local asset */}
          <img src="/images/logo.png" alt="فوج روضة الفيحاء" width={72} height={72} style={{ display: "block", margin: "0 auto 20px", borderRadius: "50%" }} />
          <h1 style={{ fontSize: 24, lineHeight: 1.5, margin: "0 0 12px" }}>
            تعذّر عرض هذه الصفحة الآن
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.9, margin: "0 0 24px", color: "rgba(33,20,51,0.75)" }}>
            نواجه مشكلة مؤقتة في الاتصال بخدماتنا. أعيدوا المحاولة بعد قليل، أو
            تصفّحوا بقية صفحات الموقع.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {/* href="" reloads the current address, no JavaScript needed. */}
            <a
              href=""
              style={{ background: purple, color: "#fff", borderRadius: 999, padding: "12px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none", minHeight: 44, boxSizing: "border-box" }}
            >
              إعادة المحاولة
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full reload is intentional after an error */}
            <a
              href="/"
              style={{ border: `1px solid ${purple}40`, color: purple, borderRadius: 999, padding: "12px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none", minHeight: 44, boxSizing: "border-box" }}
            >
              الصفحة الرئيسية
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
