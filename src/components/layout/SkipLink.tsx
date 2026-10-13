/**
 * Keyboard "skip to content" link. Rendered by each layout that owns a
 * <main id="main-content">, so the target always exists on the page.
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-yellow focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-brand-purple-dark focus:shadow-lift"
    >
      تخطَّ إلى المحتوى
    </a>
  );
}
