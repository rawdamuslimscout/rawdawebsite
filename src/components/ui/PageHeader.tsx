export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-brand-purple-dark pt-32 pb-16 sm:pt-40 sm:pb-20">
      <div className="texture-canvas absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <h1 className="font-display text-3xl font-bold text-white sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
