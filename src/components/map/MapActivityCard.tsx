"use client";

import { forwardRef } from "react";
import { ArrowRight, CalendarDays, ExternalLink, Map as MapIcon, MapPin, Users } from "lucide-react";
import type { MapPlace } from "@/data/map";
import { CATEGORY_META, participantsLabel } from "./categories";
import SafeImage from "@/components/ui/SafeImage";

/** Shows only what is stored for the place — a missing field is simply not rendered. */
const MapActivityCard = forwardRef<
  HTMLHeadingElement,
  {
    place: MapPlace;
    onBack: () => void;
    onOpenDetails: () => void;
    /** Phones/tablets only: the map sits above the card, out of view. */
    onShowOnMap?: () => void;
  }
>(function MapActivityCard({ place, onBack, onOpenDetails, onShowOnMap }, headingRef) {
  const { Icon, label } = CATEGORY_META[place.category];
  const directions = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;

  return (
    <article className="animate-hub-in overflow-hidden rounded-2xl border border-brand-purple/10 bg-white shadow-soft">
      {/* A photo that fails to load is dropped; the place's details stay. */}
      <SafeImage
        src={place.imageUrl}
        variant="thumb"
        alt={`صورة من ${place.title}`}
        loading="lazy"
        decoding="async"
        className="aspect-[16/10] w-full object-cover"
        fallback={null}
      />

      <div className="p-5 sm:p-6">
        <button
          type="button"
          onClick={onBack}
          className="-ms-2 mb-4 inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-2 text-sm font-bold text-brand-purple hover:underline"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          كل الأماكن
        </button>

        <p className="flex items-center gap-2 text-sm font-bold text-brand-purple">
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </p>

        <h3
          ref={headingRef}
          tabIndex={-1}
          className="mt-2 font-display text-2xl font-bold leading-[1.4] text-brand-ink outline-none"
        >
          {place.title}
        </h3>

        <ul className="mt-4 space-y-2 text-[15px] leading-7 text-brand-ink/75">
          <li className="flex items-start gap-2.5">
            <MapPin className="mt-1.5 h-4 w-4 shrink-0 text-brand-purple" aria-hidden="true" />
            <span>
              <span className="sr-only">المكان: </span>
              {place.locationName}
            </span>
          </li>
          {place.dateText && (
            <li className="flex items-start gap-2.5">
              <CalendarDays className="mt-1.5 h-4 w-4 shrink-0 text-brand-purple" aria-hidden="true" />
              <span>
                <span className="sr-only">التاريخ: </span>
                {place.dateText}
              </span>
            </li>
          )}
          {place.participants !== null && (
            <li className="flex items-start gap-2.5">
              <Users className="mt-1.5 h-4 w-4 shrink-0 text-brand-purple" aria-hidden="true" />
              <span>{participantsLabel(place.participants)}</span>
            </li>
          )}
        </ul>

        {place.description && (
          <p className="mt-4 text-[15px] leading-8 text-brand-ink/70">{place.description}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {place.news && (
            <button type="button" onClick={onOpenDetails} className="btn-purple">
              عرض التفاصيل
            </button>
          )}
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="btn border border-brand-purple/20 text-brand-purple hover:bg-brand-purple-tint"
          >
            فتح الموقع في الخرائط
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">(يفتح في نافذة جديدة)</span>
          </a>
          {onShowOnMap && (
            <button
              type="button"
              onClick={onShowOnMap}
              className="btn border border-brand-purple/20 text-brand-purple hover:bg-brand-purple-tint lg:hidden"
            >
              <MapIcon className="h-4 w-4" aria-hidden="true" />
              عرض على الخريطة
            </button>
          )}
        </div>
      </div>
    </article>
  );
});

export default MapActivityCard;
