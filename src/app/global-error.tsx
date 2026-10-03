"use client";

/**
 * Last line of defence: used only if the root layout itself fails. It must
 * render its own <html>/<body>, and uses inline styles so it works even when
 * the site's CSS could not load.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fffcf5",
          color: "#211433",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 24, margin: "0 0 12px" }}>
            الموقع غير متاح مؤقتًا
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.9, margin: "0 0 20px", opacity: 0.75 }}>
            حدثت مشكلة أثناء تحميل الصفحة. يرجى المحاولة بعد قليل.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#56358b",
              color: "#fff",
              border: 0,
              borderRadius: 999,
              padding: "10px 28px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
