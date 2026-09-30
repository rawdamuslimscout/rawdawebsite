type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  align?: "start" | "center";
  onDark?: boolean;
  className?: string;
};

export default function SectionHeading({
  title,
  subtitle,
  eyebrow,
  align = "start",
  onDark = false,
  className = "",
}: SectionHeadingProps) {
  const center = align === "center";
  return (
    <div
      className={`max-w-2xl ${center ? "mx-auto text-center" : "text-start"} ${className}`}
    >
      {eyebrow && (
        <p
          className={`mb-4 flex items-center gap-3 text-sm font-bold ${
            center ? "justify-center" : ""
          } ${onDark ? "text-brand-yellow" : "text-brand-purple"}`}
        >
          <span className="h-px w-6 bg-brand-yellow" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-display text-3xl font-bold leading-[1.3] sm:text-4xl lg:text-5xl ${
          onDark ? "text-white" : "text-brand-ink"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-base leading-8 sm:text-lg ${
            onDark ? "text-white/75" : "text-brand-ink/70"
          }`}
        >
          {subtitle}
        </p>
      )}
      <span
        aria-hidden="true"
        className={`mt-6 block h-1 w-14 rounded-full bg-brand-yellow ${
          center ? "mx-auto" : ""
        }`}
      />
    </div>
  );
}
