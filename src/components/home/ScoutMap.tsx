import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import JsonLd from "@/components/ui/JsonLd";
import ScoutMapClient from "@/components/map/ScoutMapClient";
import { getMapPlaces } from "@/lib/data-map";

const TITLE = "أماكن من رحلتنا الكشفية";

/**
 * Server component: reads the places from the database and hands plain data to the
 * client map. The place list inside ScoutMapClient is rendered in the server HTML,
 * so the content stays crawlable even before (or without) the map script.
 */
export default async function ScoutMap() {
  const { places, failed } = await getMapPlaces();

  return (
    <section id="map" aria-label={TITLE} className="section-y relative bg-brand-purple-tint/50">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            title={TITLE}
            subtitle="المخيمات والرحلات والدورات والأنشطة التي أقمناها، على الخريطة."
          />
        </Reveal>

        {failed ? (
          <p
            role="status"
            className="mt-8 rounded-2xl border border-brand-purple/10 bg-white p-6 text-center text-base leading-8 text-brand-ink/70"
          >
            تعذّر تحميل أماكن الأنشطة الآن. حدّث الصفحة بعد قليل.
          </p>
        ) : places.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-brand-purple/25 bg-white/70 p-8 text-center font-display text-lg leading-8 text-brand-ink/70">
            سنضيف قريبًا مواقع أنشطتنا ومخيماتنا على الخريطة.
          </p>
        ) : (
          <>
            <JsonLd
              data={{
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: TITLE,
                itemListElement: places.map((p, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  item: {
                    "@type": "Place",
                    name: p.locationName,
                    description: p.description ? `${p.title} — ${p.description}` : p.title,
                    geo: {
                      "@type": "GeoCoordinates",
                      latitude: p.latitude,
                      longitude: p.longitude,
                    },
                  },
                })),
              }}
            />
            <ScoutMapClient places={places} />
          </>
        )}
      </div>
    </section>
  );
}
