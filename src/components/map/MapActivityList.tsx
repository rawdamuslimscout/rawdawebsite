"use client";

import { MapPin } from "lucide-react";
import type { MapPlace } from "@/data/map";
import { CATEGORY_META } from "./categories";

/**
 * Text version of the map: every place as a list item. This is the accessible
 * alternative to the map and is rendered in the server HTML, so it is crawlable.
 */
export default function MapActivityList({
  places,
  selectedId,
  onSelect,
}: {
  places: MapPlace[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="divide-y divide-brand-purple/10">
      {places.map((place) => {
        const { Icon, label } = CATEGORY_META[place.category];
        const active = place.id === selectedId;
        return (
          <li key={place.id}>
            <button
              type="button"
              data-place-id={place.id}
              aria-current={active ? "true" : undefined}
              onClick={() => onSelect(place.id)}
              className={`group flex w-full items-start gap-3 px-1 py-3.5 text-start transition-colors sm:px-2 ${
                active ? "bg-brand-purple/[0.05]" : "hover:bg-brand-purple/[0.03]"
              }`}
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-purple/[0.08] text-brand-purple">
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                <span className="sr-only">{label}:</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold leading-7 text-brand-ink">{place.title}</span>
                <span className="flex items-center gap-1 text-sm leading-6 text-brand-ink/65">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0">{place.locationName}</span>
                  {place.dateText && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="min-w-0">{place.dateText}</span>
                    </>
                  )}
                </span>
                {place.description && (
                  <span className="mt-1 line-clamp-2 block text-sm leading-6 text-brand-ink/55">
                    {place.description}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
