type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  align?: "start" | "center";
  onDark?: boolean;
};

export default function SectionHeading({
  title,
  subtitle,
  align = "start",
  onDark = false,
}: SectionHeadingProps) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : "text-right"}`}>
      <h2
        className={`font-display text-3xl sm:text-4xl md:text-[2.75rem] font-bold leading-tight ${
          onDark ? "text-white" : "text-brand-ink"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 text-base sm:text-lg leading-relaxed ${
            onDark ? "text-white/75" : "text-brand-ink/65"
          }`}
        >
          {subtitle}
        </p>
      )}
      <span
        className={`mt-5 block h-1 w-16 rounded-full ${
          align === "center" ? "mx-auto" : ""
        } bg-brand-turquoise`}
      />
    </div>
  );
}
