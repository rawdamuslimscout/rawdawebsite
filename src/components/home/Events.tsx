import SectionHeading from "@/components/ui/SectionHeading";
import EventCard from "@/components/ui/EventCard";
import { getEvents } from "@/lib/data";

export default async function Events() {
  const events = await getEvents();

  // Don't render anything if there are no events
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand-cream py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading title="المناسبات القادمة" />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
