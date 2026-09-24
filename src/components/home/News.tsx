import SectionHeading from "@/components/ui/SectionHeading";
import NewsCard from "@/components/ui/NewsCard";
import { getNews } from "@/lib/data";

export default async function News() {
  const news = await getNews();
  return (
    <section id="news" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          title="آخر أخبار الفوج"
          subtitle="محتوى نموذجي مستوحى من نشاطات الفوج، قابل للاستبدال بالمحتوى الفعلي."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
