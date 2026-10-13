"use client";

/**
 * The only file that touches Leaflet.
 * It is loaded lazily (next/dynamic, ssr:false)
 * once the map section nears the viewport.
 */

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as LeafletNS from "leaflet";
import { Maximize2, Minus, Plus, RotateCw } from "lucide-react";

import type { MapPlace } from "@/data/map";
import { CATEGORY_META, formatNumber, placesCountLabel } from "./categories";
import MapSkeleton from "./MapSkeleton";

type L = typeof LeafletNS;

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';

/* -------------------------------------------------------------------------- */
/*                                   LOGO                                     */
/* -------------------------------------------------------------------------- */

// Served through the Next image optimizer (96 is a default allowed width,
// enough for the 42px pin at 2x) instead of the 218 KB source PNG.
const SCOUT_LOGO = "/_next/image?url=%2Fimages%2Flogo.png&w=96&q=75";

/**
 * Focus ring + hover lift for pins and clusters. globals.css removes the outline
 * on `.leaflet-marker-icon:focus`, so the ring is drawn on the inner element
 * (the marker element itself carries the `group` class).
 */
const PIN_INTERACTION =
  "transition-transform duration-200 group-hover:scale-110 group-focus-visible:outline group-focus-visible:outline-[3px] group-focus-visible:outline-offset-2 group-focus-visible:outline-[#4b2a82] motion-reduce:transition-none";

type GestureHint = "wheel" | "touch" | null;

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

  const [hint, setHint] = useState<GestureHint>(null);

  const [modKey, setModKey] = useState("Ctrl");

  const hintTimerRef = useRef<number | undefined>(undefined);

  const tileLayerRef = useRef<LeafletNS.TileLayer | null>(null);

  const tileStatsRef = useRef({ loaded: 0, errors: 0 });

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setModKey("⌘");
  }, []);

  /* ------------------------------------------------------------------------ */
  /* CALLBACK REFS                                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    onSelectRef.current = onSelect;
    onFailedRef.current = onFailed;
  });

  /* ------------------------------------------------------------------------ */
  /* SCOUT LOGO MARKER                                                       */
  /* ------------------------------------------------------------------------ */
  const pinIcon = useCallback((place: MapPlace, active: boolean) => {
    const L = LRef.current!;

    const size = active ? 52 : 42;
    const logoSize = active ? 42 : 34;

    return L.divIcon({
      className: "scout-pin-wrap group",

      html: `
        <div
          class="${PIN_INTERACTION}"
          style="
            width:${size}px;
            height:${size}px;
            display:flex;
            align-items:center;
            justify-content:center;
            border-radius:9999px;
            background:#ffffff;
            border:${active ? "3px" : "2px"} solid #ffffff;
            box-shadow:
              0 4px 12px rgba(30, 20, 60, 0.24),
              0 1px 4px rgba(30, 20, 60, 0.12);
            overflow:hidden;
            box-sizing:border-box;
            ${
              active
                ? "box-shadow:0 0 0 4px rgba(91,57,150,.18), 0 6px 18px rgba(30,20,60,.28);"
                : ""
            }
          "
        >
          <img
            src="${SCOUT_LOGO}"
            alt=""
            draggable="false"
            style="
              display:block;
              width:${logoSize}px;
              height:${logoSize}px;
              max-width:${logoSize}px;
              max-height:${logoSize}px;
              min-width:0;
              min-height:0;
              object-fit:contain;
              object-position:center;
              margin:0;
              padding:0;
              border:0;
              outline:0;
              box-sizing:border-box;
            "
          />
        </div>
      `,

      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -(size / 2)],
    });
  }, []);

  /* ------------------------------------------------------------------------ */
  /* CREATE MAP ONCE                                                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let disposed = false;
    // Copied for the cleanup (the lint rule warns about reading refs there).
    const markers = markersRef.current;
    const places = placesRef.current;

    let map: LeafletNS.Map | null = null;

    (async () => {
      try {
        const leaflet = (await import("leaflet")).default;

        // leaflet.markercluster extends the global L object
        (
          window as unknown as {
            L: L;
          }
        ).L = leaflet;

        await import("leaflet.markercluster");

        if (disposed || !elRef.current) return;

        const L = leaflet as L;

        LRef.current = L;

        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        reducedRef.current = reduced;

        const coarse = window.matchMedia("(pointer: coarse)").matches;

        map = L.map(elRef.current, {
          zoomControl: false,
          attributionControl: false,

          // Enabled only while the map is focused.
          scrollWheelZoom: false,

          // Touch screens: one finger scrolls the page, two fingers move and
          // zoom the map (Leaflet's pinch also pans). Stops the embedded map
          // from trapping page scroll on phones.
          dragging: !coarse,

          minZoom: 3,
          maxZoom: 18,

          zoomAnimation: !reduced,
          fadeAnimation: !reduced,
          markerZoomAnimation: !reduced,
        });

        map.setView([33.9, 35.9], 8);

        /* ---------------------------------------------------------------- */
        /* ATTRIBUTION                                                       */
        /* ---------------------------------------------------------------- */

        L.control
          .attribution({
            prefix: false,
          })
          .addTo(map);

        /* ---------------------------------------------------------------- */
        /* TILES                                                             */
        /* ---------------------------------------------------------------- */

        const stats = tileStatsRef.current;

        tileLayerRef.current = L.tileLayer(TILE_URL, {
          maxZoom: 19,
          attribution: ATTRIBUTION,
        })
          .on("tileload", () => {
            stats.loaded += 1;
          })
          .on("tileerror", () => {
            stats.errors += 1;

            if (stats.loaded === 0 && stats.errors >= 4) {
              setTilesFailed(true);
            }
          })
          .addTo(map);

        /* ---------------------------------------------------------------- */
        /* MARKER CLUSTER                                                   */
        /* ---------------------------------------------------------------- */

        const cluster = L.markerClusterGroup({
          showCoverageOnHover: false,

          maxClusterRadius: 48,

          spiderfyOnMaxZoom: true,

          animate: !reduced,

          iconCreateFunction: (c) =>
            L.divIcon({
              className: "scout-pin-wrap group",

              // Clusters are focusable buttons (keyboard: true), so they need
              // a spoken name; the bare digit is hidden from screen readers.
              html: `
                <span class="scout-cluster ${PIN_INTERACTION}">
                  <span aria-hidden="true">${formatNumber(c.getChildCount())}</span>
                  <span class="sr-only">${placesCountLabel(c.getChildCount())}، اضغط للتكبير</span>
                </span>
              `,

              iconSize: [46, 46],

              iconAnchor: [23, 23],
            }),
        });

        map.addLayer(cluster);

        /* ---------------------------------------------------------------- */
        /* MAP INTERACTION                                                  */
        /* ---------------------------------------------------------------- */

        map.on("focus", () => {
          map?.scrollWheelZoom.enable();
        });

        map.on("blur", () => {
          map?.scrollWheelZoom.disable();
        });

        map.on("mouseout", () => {
          map?.scrollWheelZoom.disable();
        });

        map.on("click", () => {
          map?.scrollWheelZoom.enable();
        });

        /* ---------------------------------------------------------------- */
        /* GESTURE HINTS                                                    */
        /* ---------------------------------------------------------------- */

        const container = map.getContainer();

        const showHint = (kind: Exclude<GestureHint, null>) => {
          setHint(kind);

          window.clearTimeout(hintTimerRef.current);

          hintTimerRef.current = window.setTimeout(() => setHint(null), 1800);
        };

        // Plain wheel keeps scrolling the page (with a hint); Ctrl/⌘ + wheel
        // switches wheel-zoom on, exactly like clicking the map does.
        container.addEventListener(
          "wheel",
          (event) => {
            if (!map || map.scrollWheelZoom.enabled()) return;

            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();

              map.scrollWheelZoom.enable();

              setHint(null);

              return;
            }

            showHint("wheel");
          },
          { passive: false },
        );

        if (coarse) {
          container.addEventListener(
            "touchmove",
            (event) => {
              if (event.touches.length === 1) showHint("touch");
            },
            { passive: true },
          );
        }

        /* ---------------------------------------------------------------- */
        /* SAVE REFERENCES                                                  */
        /* ---------------------------------------------------------------- */

        mapRef.current = map;

        clusterRef.current = cluster;

        setReady(true);
      } catch (err) {
        console.error("[map] failed to start", err);

        if (!disposed) {
          onFailedRef.current();
        }
      }
    })();

    return () => {
      disposed = true;

      window.clearTimeout(hintTimerRef.current);

      map?.remove();

      tileLayerRef.current = null;

      mapRef.current = null;

      clusterRef.current = null;

      markers.clear();

      places.clear();
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* BUILD MARKERS                                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const L = LRef.current;

    const map = mapRef.current;

    const cluster = clusterRef.current;

    if (!ready || !L || !map || !cluster) {
      return;
    }

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

      marker.on("click", () => {
        onSelectRef.current(place.id);
      });

      markersRef.current.set(place.id, marker);

      placesRef.current.set(place.id, place);

      markers.push(marker);
    }

    cluster.addLayers(markers);

    /* -------------------------------------------------------------------- */
    /* FIT MAP                                                              */
    /* -------------------------------------------------------------------- */

    if (places.length === 1) {
      map.setView([places[0].latitude, places[0].longitude], 12, {
        animate: false,
      });
    } else if (places.length > 1) {
      map.fitBounds(
        L.latLngBounds(
          places.map((p) => [p.latitude, p.longitude] as [number, number]),
        ),
        {
          padding: [48, 48],

          maxZoom: 12,

          animate: !reducedRef.current,
        },
      );
    }
  }, [places, ready, pinIcon]);

  /* ------------------------------------------------------------------------ */
  /* HIGHLIGHT + REVEAL SELECTED PLACE                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const map = mapRef.current;

    const cluster = clusterRef.current;

    if (!ready || !map || !cluster) {
      return;
    }

    const prevId = activeRef.current;

    activeRef.current = selectedId;

    /* -------------------------------------------------------------------- */
    /* RESET PREVIOUS MARKER                                                */
    /* -------------------------------------------------------------------- */

    if (prevId && prevId !== selectedId) {
      const prev = markersRef.current.get(prevId);

      const prevPlace = placesRef.current.get(prevId);

      if (prev && prevPlace) {
        prev.setIcon(pinIcon(prevPlace, false));

        prev.setZIndexOffset(0);
      }
    }

    if (!selectedId) {
      return;
    }

    /* -------------------------------------------------------------------- */
    /* ACTIVE MARKER                                                        */
    /* -------------------------------------------------------------------- */

    const marker = markersRef.current.get(selectedId);

    const place = placesRef.current.get(selectedId);

    if (!marker || !place) {
      return;
    }

    marker.setIcon(pinIcon(place, true));

    marker.setZIndexOffset(1000);

    /* -------------------------------------------------------------------- */
    /* FLY TO SELECTED                                                      */
    /* -------------------------------------------------------------------- */

    const target = () => {
      const zoom = Math.max(map.getZoom(), 11);

      if (reducedRef.current) {
        map.setView(marker.getLatLng(), zoom, {
          animate: false,
        });
      } else {
        map.flyTo(marker.getLatLng(), zoom, {
          duration: 0.8,
        });
      }
    };

    // If the pin sits inside a cluster,
    // zoom until it becomes visible.
    cluster.zoomToShowLayer(marker, target);
  }, [selectedId, ready, pinIcon]);

  /* ------------------------------------------------------------------------ */
  /* MAP CONTROLS                                                            */
  /* ------------------------------------------------------------------------ */

  const zoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const zoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const showAll = () => {
    const L = LRef.current;

    const map = mapRef.current;

    if (!L || !map || places.length === 0) {
      return;
    }

    map.fitBounds(
      L.latLngBounds(
        places.map((p) => [p.latitude, p.longitude] as [number, number]),
      ),
      {
        padding: [48, 48],

        maxZoom: 12,

        animate: !reducedRef.current,
      },
    );
  };

  const retryTiles = () => {
    tileStatsRef.current.loaded = 0;

    tileStatsRef.current.errors = 0;

    setTilesFailed(false);

    tileLayerRef.current?.redraw();
  };

  /* ------------------------------------------------------------------------ */
  /* BUTTON STYLE                                                            */
  /* ------------------------------------------------------------------------ */

  const btn =
    "flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-purple shadow-soft transition-colors hover:bg-brand-purple-tint active:scale-95";

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="scout-map absolute inset-0 isolate">
      {/* dir="ltr" keeps Leaflet panes and attribution correct inside RTL page */}

      <div
        ref={elRef}
        dir="ltr"
        role="region"
        aria-label="خريطة تفاعلية لأماكن أنشطة الفوج. استخدم مفاتيح الأسهم للتحريك، وزرّي + و − للتكبير والتصغير."
        // inset focus ring: the rounded, overflow-hidden wrapper clips an outer one
        className="h-full w-full focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[-3px] focus-visible:outline-[#f0b429]"
      />

      {!ready && <MapSkeleton />}

      {/* ------------------------------------------------------------------ */}
      {/* MAP CONTROLS                                                       */}
      {/* ------------------------------------------------------------------ */}

      {ready && (
        <div className="absolute left-3 top-3 z-[800] flex flex-col gap-2">
          <button
            type="button"
            onClick={zoomIn}
            className={btn}
            aria-label="تكبير الخريطة"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={zoomOut}
            className={btn}
            aria-label="تصغير الخريطة"
          >
            <Minus className="h-5 w-5" aria-hidden="true" />
          </button>

          {places.length > 1 && (
            <button
              type="button"
              onClick={showAll}
              className={btn}
              aria-label="عرض كل الأماكن"
            >
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TILE ERROR                                                         */}
      {/* ------------------------------------------------------------------ */}

      {/* ------------------------------------------------------------------ */}
      {/* GESTURE HINT (visual only; keyboard and list users don't need it)  */}
      {/* ------------------------------------------------------------------ */}

      <div
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          inset-0
          z-[700]
          flex
          items-center
          justify-center
          bg-brand-ink/45
          p-6
          transition-opacity
          duration-300
          motion-reduce:transition-none
          ${hint ? "opacity-100" : "opacity-0"}
        `}
      >
        <p className="max-w-xs text-center text-base font-bold leading-7 text-white drop-shadow">
          {hint === "touch" ? (
            "استخدم إصبعين لتحريك الخريطة"
          ) : (
            <>
              اضغط على الخريطة أو استخدم{" "}
              <kbd
                dir="ltr"
                className="rounded-md bg-white/20 px-1.5 py-0.5 font-sans"
              >
                {modKey}
              </kbd>{" "}
              مع عجلة الفأرة للتكبير
            </>
          )}
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TILE ERROR                                                         */}
      {/* ------------------------------------------------------------------ */}

      {tilesFailed && (
        <div
          role="alert"
          className="
            absolute
            inset-x-3
            bottom-8
            z-[800]
            flex
            flex-col
            items-center
            gap-1
            rounded-xl
            bg-white/95
            p-3
            text-center
            text-sm
            leading-6
            text-brand-ink/75
            shadow-soft
          "
        >
          <p>
            تعذّر تحميل صور الخريطة، ربما بسبب ضعف الاتصال. ما زالت قائمة
            الأماكن تعمل كاملة.
          </p>

          <button
            type="button"
            onClick={retryTiles}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 font-bold text-brand-purple transition-colors hover:bg-brand-purple-tint"
          >
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            إعادة المحاولة
          </button>
        </div>
      )}
    </div>
  );
}
