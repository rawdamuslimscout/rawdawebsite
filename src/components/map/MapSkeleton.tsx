/** Placeholder shown while the map script loads (and before the section scrolls into view). */
export default function MapSkeleton({ label = "جارٍ تحميل الخريطة…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-purple-tint/70"
    >
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple/20 border-t-brand-purple"
      />
      <span className="text-sm font-semibold text-brand-ink/60">{label}</span>
    </div>
  );
}
