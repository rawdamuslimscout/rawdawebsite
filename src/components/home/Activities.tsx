import SectionHeading from "@/components/ui/SectionHeading";
import ActivityCard from "@/components/ui/ActivityCard";
import { activities } from "@/data/content";

export default function Activities() {
  return (
    <section id="activities" className="relative overflow-hidden bg-brand-purple py-24">
      <div className="texture-canvas absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          title="الأنشطة"
          subtitle="من المخيمات إلى الخدمة المجتمعية، عالم كامل من التجارب الكشفية."
          onDark
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </section>
  );
}
