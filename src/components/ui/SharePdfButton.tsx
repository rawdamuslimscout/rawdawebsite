"use client";

import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";

type SharePdfButtonProps = {
  url: string;
  title: string;
};

export default function SharePdfButton({ url, title }: SharePdfButtonProps) {
  const [copied, setCopied] = useState(false);

  const getFullUrl = () => {
    return new URL(url, window.location.origin).href;
  };

  const handleShare = async () => {
    const fullUrl = getFullUrl();

    // Try sharing the actual PDF file on supported devices
    try {
      const response = await fetch(fullUrl);

      if (!response.ok) throw new Error("Could not fetch PDF");

      const blob = await response.blob();
      const file = new File([blob], `${title}.pdf`, {
        type: "application/pdf",
      });

      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        await navigator.share({
          title,
          text: title,
          files: [file],
        });
        return;
      }
    } catch (error) {
      // Fall back to sharing the link
      console.log("File sharing unavailable:", error);
    }

    // Share the link if supported
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `شارك هذا الملف: ${title}`,
          url: fullUrl,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      }
    }

    // Final fallback: copy the link
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("انسخ رابط الملف:", fullUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="مشاركة الملف"
      title={copied ? "تم نسخ الرابط" : "مشاركة الملف"}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-purple/15 px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-purple-tint"
    >
      {copied ? (
        <>
          <Check size={16} />
          تم نسخ الرابط
        </>
      ) : (
        <>
          <Share2 size={16} />
          مشاركة
        </>
      )}
    </button>
  );
}
