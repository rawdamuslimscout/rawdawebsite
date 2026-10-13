import Link from "next/link";
import { ArrowLeft, BookOpen, Handshake } from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/ui/Reveal";
import About from "@/components/home/About";
import Values from "@/components/home/Values";
import Achievements from "@/components/home/Achievements";
import CTA from "@/components/home/CTA";
import Activities from "@/components/about/Activities";
import Camps from "@/components/about/Camps";
import OrgChain from "@/components/about/OrgChain";
import ScoutMap from "@/components/home/ScoutMap";
import { blogHref, latinDigits } from "@/components/news/format";
import { getBlogPosts, getSiteSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

/** Blog articles featured on this page; each is linked only if it is published. */
const FEATURED_POSTS = [
  { slug: "nashaat-al-haraka-al-kashfiya", label: "من تاريخ الجمعية", Icon: BookOpen },
  { slug: "sharakat-madrasat-rawdat-al-fayhaa", label: "الفوج والمدرسة", Icon: Handshake },
];

export const metadata = pageMetadata({
  title: "من نحن",
  description:
    "فوج روضة الفيحاء أحد أفواج جمعية الكشاف المسلم في لبنان ضمن مفوضية الشمال في طرابلس: من نحن، وأنشطتنا، وقيمنا، ومحطات من مسيرة الفوج.",
  path: "/about",
});

export default async function AboutPage() {
  const [siteInfo, posts] = await Promise.all([
    getSiteSettings(),
    getBlogPosts(),
  ]);
  const featured = FEATURED_POSTS.flatMap((f) => {
    const post = posts.find((p) => p.slug === f.slug);
    return post ? [{ ...f, post }] : [];
  });

  return (
    <>
      <PageHeader title="من نحن" subtitle={siteInfo.tagline} path="/about" />

      <About variant="page" />

      <OrgChain troopName={siteInfo.name} />

      {featured.length > 0 && (
        <section aria-label="مقالات عن الفوج والجمعية" className="bg-white pb-16 sm:pb-20">
          <ul className="container-x flex flex-col gap-4">
            {featured.map(({ slug, label, Icon, post }, i) => (
              <Reveal as="li" key={slug} delay={i * 90}>
                <article className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-brand-purple/10 bg-brand-cream p-6 shadow-sm transition duration-300 focus-within:ring-2 focus-within:ring-brand-yellow hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:p-8">
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-purple text-brand-yellow"
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-brand-purple">{label}</p>
                    <h2 className="mt-1.5 font-display text-xl font-bold leading-snug text-brand-ink sm:text-2xl">
                      <Link
                        href={blogHref(post.slug)}
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-brand-ink/70 sm:text-base">
                      {latinDigits(post.excerpt)}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-brand-purple"
                  >
                    اقرأ المقال
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  </span>
                </article>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* Our story first, then what we do, our values, and where we've been. */}
      <Achievements />
      <Activities />
      <Values />
      <Camps />
      <ScoutMap />
      <CTA />
    </>
  );
}
