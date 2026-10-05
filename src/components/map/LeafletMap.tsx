"use client";

/**
 * The only file that touches Leaflet. It is loaded lazily (next/dynamic, ssr:false)
 * once the map section nears the viewport, so Leaflet never enters the main bundle.
 */
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type * as LeafletNS from "leaflet";
import { Maximize2, Minus, Plus } from "lucide-react";
import type { MapPlace } from "@/data/map";
import { CATEGORY_META, formatNumber } from "./categories";
import { PIN_ICONS } from "./pinIcons";
import MapSkeleton from "./MapSkeleton";

type L = typeof LeafletNS;

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';

export default function LeafletMap({
  places,
  selectedId,
  onSelect,
  onFailed,
}: {
  places: MapPlace[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onFailed: () => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const LRef = useRef<L | null>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const clusterRef = useRef<LeafletNS.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, LeafletNS.Marker>>(new Map());
  const placesRef = useRef<Map<string, MapPlace>>(new Map());
  const activeRef = useRef<string | null>(null);
  const onSelectRef = useRef(onSelect);
  const onFailedRef = useRef(onFailed);
  const reducedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [tilesFailed, setTilesFailed] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onFailedRef.current = onFailed;
  });

  const pinIcon = useCallback((place: MapPlace, active: boolean) => {
    const L = LRef.current!;
    return L.divIcon({
      className: "scout-pin-wrap",
      html: `<span class="scout-pin${active ? " is-active" : ""}">${PIN_ICONS[place.category] ?? ""}</span>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  }, []);

  // ---- create the map once ----
  useEffect(() => {
    let disposed = false;
    let map: LeafletNS.Map | null = null;

    (async () => {
      try {
        const leaflet = (await import("leaflet")).default;
        // leaflet.markercluster extends the global L object
        (window as unknown as { L: L }).L = leaflet;
        await import("leaflet.markercluster");
        if (disposed || !elRef.current) return;

        const L = leaflet as L;
        LRef.current = L;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        reducedRef.current = reduced;

        map = L.map(elRef.current, {
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false, // enabled only while the map has focus, so the page can still scroll
          minZoom: 3,
          maxZoom: 18,
          zoomAnimation: !reduced,
          fadeAnimation: !reduced,
          markerZoomAnimation: !reduced,
        });
        map.setView([33.9, 35.9], 8); // neutral starting view; replaced by fitBounds below

        L.control.attribution({ prefix: false }).addTo(map);
        let loaded = 0;
        let errors = 0;
        L.tileLayer(TILE_URL, { maxZoom: 19, attribution: ATTRIBUTION })
          .on("tileload", () => {
            loaded += 1;
          })
          .on("tileerror", () => {
            errors += 1;
            if (loaded === 0 && errors >= 4) setTilesFailed(true);
          })
          .addTo(map);

        const cluster = L.markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 48,
          spiderfyOnMaxZoom: true,
          animate: !reduced,
          iconCreateFunction: (c) =>
            L.divIcon({
              className: "scout-pin-wrap",
              html: `<span class="scout-cluster" aria-hidden="true">${formatNumber(c.getChildCount())}</span>`,
              iconSize: [44, 44],
              iconAnchor: [22, 22],
            }),
        });
        map.addLayer(cluster);

        map.on("focus", () => map?.scrollWheelZoom.enable());
        map.on("blur", () => map?.scrollWheelZoom.disable());
        map.on("mouseout", () => map?.scrollWheelZoom.disable());
        map.on("click", () => map?.scrollWheelZoom.enable());

        mapRef.current = map;
        clusterRef.current = cluster;
        setReady(true);
      } catch (err) {
        console.error("[map] failed to start", err);
        if (!disposed) onFailedRef.current();
      }
    })();

    return () => {
      disposed = true;
      map?.remove();
      mapRef.current = null;
      clusterRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // ---- (re)build markers when the filtered places change ----
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const cluster = clusterRef.current;
    if (!ready || !L || !map || !cluster) return;

    cluster.clearLayers();
    markersRef.current.clear();
    placesRef.current.clear();

    const markers: LeafletNS.Marker[] = [];
    for (const place of places) {
      const marker = L.marker([place.latitude, place.longitude], {
        icon: pinIcon(place, place.id === activeRef.current),
        title: `${place.title} — ${place.locationName}`,
        keyboard: true,
        riseOnHover: true,
      });
      marker.on("add", () => {
        marker
          .getElement()
          ?.setAttribute(
            "aria-label",
            `${CATEGORY_META[place.category].label}: ${place.title}، ${place.locationName}`,
          );
      });
      marker.on("click", () => onSelectRef.current(place.id));
      markersRef.current.set(place.id, marker);
      placesRef.current.set(place.id, place);
      markers.push(marker);
    }
    cluster.addLayers(markers);

    if (places.length === 1) {
      map.setView([places[0].latitude, places[0].longitude], 12, { animate: false });
    } else if (places.length > 1) {
      map.fitBounds(L.latLngBounds(places.map((p) => [p.latitude, p.longitude] as [number, number])), {
        padding: [48, 48],
        maxZoom: 12,
        animate: !reducedRef.current,
      });
    }
  }, [places, ready, pinIcon]);

  // ---- highlight + reveal the selected place ----
  useEffect(() => {
    const map = mapRef.current;
    const cluster = clusterRef.current;
    if (!ready || !map || !cluster) return;

    const prevId = activeRef.current;
    activeRef.current = selectedId;
    if (prevId && prevId !== selectedId) {
      const prev = markersRef.current.get(prevId);
      const prevPlace = placesRef.current.get(prevId);
      if (prev && prevPlace) prev.setIcon(pinIcon(prevPlace, false));
    }
    if (!selectedId) return;
    const marker = markersRef.current.get(selectedId);
    const place = placesRef.current.get(selectedId);
    if (!marker || !place) return;
    marker.setIcon(pinIcon(place, true));
    marker.setZIndexOffset(1000);

    const target = () => {
      const zoom = Math.max(map.getZoom(), 11);
      if (reducedRef.current) map.setView(marker.getLatLng(), zoom, { animate: false });
      else map.flyTo(marker.getLatLng(), zoom, { duration: 0.8 });
    };
    // if the pin sits inside a cluster, zoom until it is visible
    cluster.zoomToShowLayer(marker, target);
  }, [selectedId, ready, pinIcon]);

  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();
  const showAll = () => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || places.length === 0) return;
    map.fitBounds(L.latLngBounds(places.map((p) => [p.latitude, p.longitude] as [number, number])), {
      padding: [48, 48],
      maxZoom: 12,
    });
  };

  const btn =
    "flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-purple shadow-soft transition-colors hover:bg-brand-purple-tint active:scale-95";

  return (
    <div className="scout-map absolute inset-0 isolate">
      {/* dir="ltr" keeps Leaflet's panes and attribution positioned correctly inside the RTL page */}
      <div
        ref={elRef}
        dir="ltr"
        role="region"
        aria-label="خريطة تفاعلية لأماكن أنشطة الفوج. استخدم مفاتيح الأسهم للتحريك، وزرّي + و − للتكبير والتصغير."
        className="h-full w-full"
      />

      {!ready && <MapSkeleton />}

      {ready && (
        <div className="absolute left-3 top-3 z-[500] flex flex-col gap-2">
          <button type="button" onClick={zoomIn} className={btn} aria-label="تكبير الخريطة">
            <Plus className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={zoomOut} className={btn} aria-label="تصغير الخريطة">
            <Minus className="h-5 w-5" aria-hidden="true" />
          </button>
          {places.length > 1 && (
            <button type="button" onClick={showAll} className={btn} aria-label="عرض كل الأماكن">
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {tilesFailed && (
        <p
          role="alert"
          className="absolute inset-x-3 bottom-8 z-[500] rounded-xl bg-white/95 p-3 text-center text-sm leading-6 text-brand-ink/75 shadow-soft"
        >
          تعذّر تحميل صور الخريطة، ربما بسبب ضعف الاتصال. ما زالت قائمة الأماكن تعمل كاملة.
        </p>
      )}
    </div>
  );
}
