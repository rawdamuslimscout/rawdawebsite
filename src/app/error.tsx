"use client";

import { useEffect } from "react";
import ErrorContent from "@/components/layout/ErrorContent";

/**
 * Catches any unexpected error while rendering a public page, so visitors see
 * a friendly message with a retry button instead of the browser's blank
 * "Application error: a client-side exception has occurred" screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site] page error", error);
  }, [error]);

  // Rendered outside the (site) layout (e.g. admin login), so it owns <main>.
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <ErrorContent reset={reset} />
    </main>
  );
}
