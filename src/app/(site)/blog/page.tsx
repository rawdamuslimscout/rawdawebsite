import { permanentRedirect } from "next/navigation";

// The articles are listed in the combined news feed (/news), so the old
// separate listing permanently redirects there (308). Article pages keep
// their URLs: /blog/<slug> is unchanged.
export const dynamic = "force-static";

export default function BlogIndexRedirect() {
  permanentRedirect("/news");
}
