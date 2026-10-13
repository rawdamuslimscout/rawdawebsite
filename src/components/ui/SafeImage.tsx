"use client";

/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ImgHTMLAttributes,
  type ReactNode,
} from "react";
import { ImageOff } from "lucide-react";

import {
  INITIAL_IMAGE_STATE,
  advanceImage,
  imageSources,
  watchImage,
  type ImageState,
  type ImageVariant,
} from "@/lib/image-url";

type SafeImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "alt" | "onError"
> & {
  /** The stored URL (original upload). Empty, invalid or unsafe URLs show the placeholder. */
  src: string | null | undefined;
  /** Required: "" for decorative images. Also names the placeholder. */
  alt: string;
  variant?: ImageVariant;
  /** Rendered instead of the default placeholder (e.g. initials, an icon, or null to hide). */
  fallback?: ReactNode;
  /** Classes for the default placeholder; defaults to `className`, so it keeps the image's box. */
  fallbackClassName?: string;
};

/**
 * <img> for uploaded images that never shows a broken-image icon. It tries
 * the sources from imageSources() in order (thumbnail and original, each as a
 * fallback for the other), then shows a branded placeholder. The decisions
 * live in lib/image-url.ts (advanceImage, watchImage), where they are tested;
 * this component only wires them to the element. Slow images keep loading
 * (the slot keeps its size meanwhile); nothing retries in a loop.
 */
export default function SafeImage({
  src,
  alt,
  variant = "responsive",
  fallback,
  fallbackClassName,
  className,
  sizes,
  ...rest
}: SafeImageProps) {
  const sources = imageSources(src, variant);
  const sourceKey = `${variant}|${src ?? ""}`;

  // Failures are tied to the URL they happened for, so a new `src` starts over.
  const [failure, setFailure] = useState<{ key: string; state: ImageState }>({
    key: sourceKey,
    state: INITIAL_IMAGE_STATE,
  });
  const state = failure.key === sourceKey ? failure.state : INITIAL_IMAGE_STATE;
  const current = sources[state.index];

  const fail = useCallback(
    (failedIndex: number, failedUrl: string) =>
      setFailure((prev) => {
        const from = prev.key === sourceKey ? prev.state : INITIAL_IMAGE_STATE;
        const next = advanceImage(imageSources(src, variant), from, failedIndex, failedUrl);
        return next === from && prev.key === sourceKey ? prev : { key: sourceKey, state: next };
      }),
    [sourceKey, src, variant],
  );

  // Native listener instead of React's onError: watchImage() also reports an
  // error that fired before hydration (when React wasn't listening yet).
  const ref = useRef<HTMLImageElement>(null);
  const index = state.index;
  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    return watchImage(img, (failedUrl) => fail(index, failedUrl));
  }, [index, sourceKey, fail]);

  const exhausted = sources.length > 0 && !current;
  useEffect(() => {
    // Visible in the browser console, to tell a missing file from a layout issue.
    if (exhausted) console.warn("[image] could not load, showing placeholder:", src);
  }, [exhausted, src]);

  if (!current) {
    if (fallback !== undefined) return <>{fallback}</>;
    return (
      <span
        {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
        className={`flex items-center justify-center bg-brand-purple-tint text-brand-purple/35 ${
          fallbackClassName ?? className ?? ""
        }`}
      >
        <ImageOff className="h-8 w-8 max-h-[40%] max-w-[40%]" strokeWidth={1.5} aria-hidden="true" />
      </span>
    );
  }

  // sizes/loading before srcSet/src: the browser must know them before it
  // picks a candidate. A new key per attempt gives each source a fresh element.
  return (
    <img
      key={state.index}
      ref={ref}
      alt={alt}
      sizes={current.srcSet ? sizes : undefined}
      {...rest}
      srcSet={current.srcSet}
      src={current.src}
      className={className}
    />
  );
}
