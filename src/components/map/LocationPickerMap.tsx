"use client";

/** Admin-only Leaflet map: click (or drag the pin) to choose a location. Loaded lazily by LocationPicker. */
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type * as LeafletNS from "leaflet";

export type PickerTarget = { lat: number; lng: number; zoom: number; key: number };

export default function LocationPickerMap({
  position,
  target,
  onPick,
}: {
  position: { lat: number; lng: number } | null;
  target: PickerTarget | null;
  onPick: (lat: number, lng: number) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const markerRef = useRef<LeafletNS.Marker | null>(null);
  const LRef = useRef<typeof LeafletNS | null>(null);
  const onPickRef = useRef(onPick);
  const posRef = useRef(position);
  useEffect(() => {
    onPickRef.current = onPick;
    posRef.current = position;
  });

  const place = (lat: number, lng: number) => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    if (!markerRef.current) {
      const marker = L.marker([lat, lng], {
        draggable: true,
        keyboard: true,
        title: "موقع المكان — اسحبه لتعديل الموقع",
        icon: L.divIcon({
          className: "scout-pin-wrap",
          html: '<span class="scout-pin is-active"></span>',
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        }),
      }).addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        onPickRef.current(p.lat, p.lng);
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  useEffect(() => {
    let disposed = false;
    (async () => {
      const L = (await import("leaflet")).default as typeof LeafletNS;
      if (disposed || !elRef.current) return;
      LRef.current = L;
      const start = posRef.current;
      // Neutral starting view over Lebanon — this is only where the map opens, never saved.
      const map = L.map(elRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(
        start ? [start.lat, start.lng] : [33.85, 35.86],
        start ? 13 : 8,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);
      map.on("click", (e: LeafletNS.LeafletMouseEvent) => {
        map.scrollWheelZoom.enable();
        onPickRef.current(e.latlng.lat, e.latlng.lng);
      });
      mapRef.current = map;
      if (start) place(start.lat, start.lng);
    })();
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (position) place(position.lat, position.lng);
    else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [position]);

  useEffect(() => {
    if (target && mapRef.current) mapRef.current.setView([target.lat, target.lng], target.zoom);
  }, [target]);

  return <div ref={elRef} dir="ltr" className="scout-map h-64 w-full rounded-xl sm:h-72" />;
}
