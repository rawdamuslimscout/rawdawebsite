"use client";

import { useLinkStatus } from "next/link";

/**
 * Subtle "loading" cue inside a <Link> while its page is being fetched
 * (Next's useLinkStatus): pages are static and usually prefetched, so this
 * only shows on slow connections. Visual only; it reserves no space.
 * `variant="bar"` sits under a link that is `relative` (desktop menu);
 * `variant="dot"` sits at the end of a full-width row (mobile menu).
 */
export default function LinkPending({ variant = "bar" }: { variant?: "bar" | "dot" }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return variant === "bar" ? (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-0.5 animate-pulse rounded-full bg-brand-yellow"
    />
  ) : (
    <span aria-hidden="true" className="ms-auto h-2 w-2 shrink-0 animate-pulse rounded-full bg-brand-yellow" />
  );
}
