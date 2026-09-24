import SectionHeading from "@/components/ui/SectionHeading";
import { getValues } from "@/lib/data";

export default async function Values() {
  const values = await getValues();
  return (
    <section className="bg-brand-purple-tint py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading title="قيمنا" align="center" />

        <div className="mt-14 flex flex-wrap justify-center gap-5">
          {values.map((value) => (
            <div
              key={value.id}
              className="badge-shield flex h-28 w-28 flex-col items-center justify-center bg-white text-center shadow-sm ring-1 ring-brand-purple/10 transition-transform duration-300 hover:-translate-y-1 hover:ring-brand-yellow sm:h-32 sm:w-32"
            >
              <span className="font-display text-base font-semibold text-brand-purple sm:text-lg">
                {value.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
