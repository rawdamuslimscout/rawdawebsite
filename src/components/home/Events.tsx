import SectionHeading from "@/components/ui/SectionHeading";
import EventCard from "@/components/ui/EventCard";
import { events } from "@/data/content";

export default function Events() {
  return (
    <section className="bg-brand-cream py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          title="المناسبات القادمة"
          subtitle="بيانات نموذجية للعرض — سيتم تحديثها بمواعيد الفوج الرسمية."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
