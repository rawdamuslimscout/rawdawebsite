import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getBlogPost, getBlogPosts } from "@/lib/data";
import JsonLd from "@/components/ui/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} | فوج روضة الفيحاء`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${encodeURIComponent(post.slug)}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${encodeURIComponent(post.slug)}`,
      type: "article" as const,
      locale: "ar_LB",
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          inLanguage: "ar",
          author: { "@type": "Person", name: post.author },
          publisher: { "@id": `${SITE_URL}/#organization` },
          mainEntityOfPage: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
        }}
      />
      <section className="relative overflow-hidden bg-brand-purple-dark pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="texture-canvas absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-brand-yellow">
            <BookOpen className="h-3.5 w-3.5" />
            {post.category}
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold text-white sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-white/60">
            {post.date} · {post.author}
          </p>
        </div>
      </section>

      <article className="bg-brand-cream py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <div className="space-y-5 text-base leading-loose text-brand-ink/80 sm:text-lg">
            {post.content.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <Link
            href="/blog"
            className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple transition-colors hover:text-brand-purple-dark"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى المدونة
          </Link>
        </div>
      </article>
    </>
  );
}
