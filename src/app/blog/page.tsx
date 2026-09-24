import PageHeader from "@/components/ui/PageHeader";
import BlogCard from "@/components/ui/BlogCard";
import { getBlogPosts } from "@/lib/data";

export const metadata = {
  title: "المدونة | فوج روضة الفيحاء",
  description: "مقالات ومنشورات فوج روضة الفيحاء حول الكشافة والقيادة والقيم.",
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
            <p className="text-center text-brand-ink/60">لا توجد مقالات بعد.</p>
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
