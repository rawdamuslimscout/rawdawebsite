import Image from "next/image";

export default function Logo({
  size = 44,
  dark = false,
  responsive = false,
  variant = "default",
  alt = "شعار فوج روضة الفيحاء",
}: {
  size?: number;
  dark?: boolean;
  responsive?: boolean;
  variant?: "default" | "plain";
  /** Pass "" when the site name is already shown next to the logo. */
  alt?: string;
}) {
  const isPlain = variant === "plain";

  return (
    <div
      className={`relative shrink-0 ${
        isPlain ? "" : "rounded-full bg-white p-1.5 shadow-sm"
      } ${responsive ? "h-full w-full" : ""}`}
      style={responsive ? undefined : { width: size, height: size }}
    >
      <div className="relative h-full w-full">
        <Image
          src="/images/logo.png"
          alt={alt}
          fill
          sizes={responsive ? "100vw" : `${size}px`}
          className="object-contain"
        />
      </div>
    </div>
  );
}
