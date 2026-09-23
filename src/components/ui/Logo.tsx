import Image from "next/image";

export default function Logo({
  size = 44,
  dark = false,
}: {
  size?: number;
  dark?: boolean;
}) {
  return (
    <div
      className="relative shrink-0 rounded-full bg-white p-1.5 shadow-sm"
      style={{ width: size, height: size }}
    >
      <div className="relative h-full w-full">
        <Image
          src="/images/logo.png"
          alt="شعار فوج روضة الفيحاء"
          fill
          sizes={`${size}px`}
          className="object-contain"
        />
      </div>
    </div>
  );
}
