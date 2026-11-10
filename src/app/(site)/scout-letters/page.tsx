import type { Metadata } from "next";
import ScoutLettersPage from "@/components/scout-letters/ScoutLettersPage";
import { PAGE_TITLE } from "@/data/scoutLetters";
import { SITE_NAME } from "@/lib/site";

// Unlisted community page: reachable by its URL only, no sitemap or share
// metadata on purpose. Keeps the footer's settings fresh like other pages.
// The English version is at /scout-letters/en.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${PAGE_TITLE.ar} | ${SITE_NAME}`,
};

export default function Page() {
  return <ScoutLettersPage lang="ar" />;
}
