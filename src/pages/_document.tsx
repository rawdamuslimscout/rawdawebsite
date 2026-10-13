import { Head, Html, Main, NextScript } from "next/document";

// Only used by the Pages Router error page (pages/500.tsx); the site itself is
// rendered by the App Router (app/layout.tsx), which sets the same lang/dir.
export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <body style={{ margin: 0 }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
