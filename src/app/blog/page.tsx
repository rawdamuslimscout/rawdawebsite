import { BookOpen } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import BlogCard from "@/components/ui/BlogCard";
import { getBlogPosts } from "@/lib/data";

export const revalidate = 3600;

export const metadata = {
  title: "المدونة | فوج روضة الفيحاء",
  description: "مقالات ومنشورات فوج روضة الفيحاء حول الكشافة والقيادة والقيم.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "المدونة | فوج روضة الفيحاء",
    url: "/blog",
    locale: "ar_LB",
    type: "website",
  },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <PageHeader
        title="المدونة"
        subtitle="مقالات من قيادة الفوج حول الكشافة، القيادة، والخدمة."
      />
      <section className="bg-brand-cream py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {posts.length === 0 ? (
            <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-brand-purple/15 bg-white/60 px-6 py-14 text-center">
              <BookOpen
                className="h-10 w-10 text-brand-purple/30"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="mt-4 text-base font-semibold text-brand-ink/70">
                لا توجد مقالات بعد.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
