"use client";

import { useEffect } from "react";
import ErrorContent from "@/components/layout/ErrorContent";

/**
 * Public-page error boundary. Lives inside the (site) layout so visitors keep
 * the header and footer; the layout already provides <main>.
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

  return <ErrorContent reset={reset} />;
}
