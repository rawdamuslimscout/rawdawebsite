import type { Metadata } from "next";
import { SITE_DEFAULT_TITLE, SITE_NAME } from "@/lib/site";

// Next merges `openGraph`/`twitter` shallowly: a page that sets its own
// `openGraph` drops the root layout's siteName, locale and images. Every page
// builds its metadata through this helper so those shared fields survive.

export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: SITE_NAME,
};

type PageMetadataInput = {
  /** Page title without the site suffix; omit for the homepage. */
  title?: string;
  description: string;
  /** Path for the canonical URL and og:url, e.g. "/join". */
  path: string;
  type?: "website" | "article";
  /** Article-only fields (ISO strings). */
  publishedTime?: string;
  modifiedTime?: string;
  /** Absolute or root-relative image URLs; falls back to the site share image. */
  images?: string[];
};

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  modifiedTime,
  images,
}: PageMetadataInput): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : undefined;
  // Next replaces openGraph/twitter wholesale, so they always need a title.
  const shareTitle = fullTitle ?? SITE_DEFAULT_TITLE;
  const ogImages = images?.length
    ? images.map((url) => ({ url, alt: title ?? SITE_NAME }))
    : [OG_IMAGE];

  return {
    ...(fullTitle ? { title: fullTitle } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      title: shareTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "ar_LB",
      type,
      images: ogImages,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      ...(type === "article" && modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: ogImages.map((image) => image.url),
    },
  };
}
