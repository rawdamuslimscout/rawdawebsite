import type { Metadata } from "next";
import ScoutLettersPage from "@/components/scout-letters/ScoutLettersPage";
import { PAGE_TITLE } from "@/data/scoutLetters";
import { SITE_NAME_LATIN } from "@/lib/site";

// English version of /scout-letters. Unlisted like the Arabic page: no
// sitemap or share metadata on purpose.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${PAGE_TITLE.en} | ${SITE_NAME_LATIN}`,
};

export default function Page() {
  return <ScoutLettersPage lang="en" />;
}
