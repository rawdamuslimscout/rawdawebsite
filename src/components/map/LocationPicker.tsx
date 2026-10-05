"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import type { PickerTarget } from "./LocationPickerMap";

const PickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-xl bg-brand-purple-tint/60 text-sm text-brand-ink/55 sm:h-72">
      جارٍ تحميل الخريطة…
    </div>
  ),
});

// same look as the other admin inputs (kept local to avoid a circular import with FieldInput)
const inputClass =
  "w-full rounded-xl border border-brand-purple/15 bg-white px-3.5 py-2.5 text-base text-brand-ink outline-none transition-colors placeholder:text-brand-ink/30 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10 sm:text-sm";

type Result = { id: number; label: string; short: string; lat: number; lng: number };

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
function toNumber(text: string): number | null {
  const normalized = text
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))
    .replace(/[٫،,]/g, ".")
    .trim();
  if (!normalized) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}
const round = (n: number) => Math.round(n * 1e6) / 1e6;

export default function LocationPicker({
  required,
  defaultLat,
  defaultLng,
}: {
  required: boolean;
  defaultLat?: number | null;
  defaultLng?: number | null;
}) {
  const hasDefault = typeof defaultLat === "number" && typeof defaultLng === "number";
  const initialLat = hasDefault ? String(defaultLat) : "";
  const initialLng = hasDefault ? String(defaultLng) : "";

  const rootRef = useRef<HTMLDivElement>(null);
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [target, setTarget] = useState<PickerTarget | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");

  const latNum = toNumber(lat);
  const lngNum = toNumber(lng);
  const valid =
    latNum !== null && lngNum !== null && Math.abs(latNum) <= 90 && Math.abs(lngNum) <= 180;
  const position = valid ? { lat: latNum!, lng: lngNum! } : null;

  // the form's own «reset» (after a successful add) must clear this field too
  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;
    const onReset = () =>
      setTimeout(() => {
        setLat(initialLat);
        setLng(initialLng);
        setResults([]);
        setQuery("");
        setMessage("");
      }, 0);
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [initialLat, initialLng]);

  const pick = (a: number, b: number) => {
    setLat(String(round(a)));
    setLng(String(round(b)));
    setMessage("");
  };

  async function search() {
    const q = query.trim();
    if (q.length < 2) {
      setMessage("اكتب اسم المكان أولًا (حرفان على الأقل).");
      return;
    }
    setSearching(true);
    setMessage("");
    setResults([]);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=ar&q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as {
        place_id: number;
        display_name: string;
        name?: string;
        lat: string;
        lon: string;
      }[];
      const mapped = data
        .map((d) => ({
          id: d.place_id,
          label: d.display_name,
          short: d.name || d.display_name.split("،")[0].split(",")[0],
          lat: Number(d.lat),
          lng: Number(d.lon),
        }))
        .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));
      setResults(mapped);
      if (mapped.length === 0)
        setMessage("لم نجد هذا المكان. جرّب اسمًا آخر، أو اضغط على الخريطة لتحديده بنفسك.");
    } catch {
      setMessage("تعذّر البحث الآن. يمكنك الضغط على الخريطة لتحديد المكان بنفسك.");
    } finally {
      setSearching(false);
    }
  }

  function choose(r: Result) {
    pick(r.lat, r.lng);
    setTarget({ lat: r.lat, lng: r.lng, zoom: 13, key: Date.now() });
    setResults([]);
    // fill «اسم المكان» only if the admin has not typed it yet
    const nameInput = rootRef.current
      ?.closest("form")
      ?.querySelector<HTMLInputElement>('input[name="locationName"]');
    if (nameInput && !nameInput.value.trim()) nameInput.value = r.short;
  }

  return (
    <div ref={rootRef} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void search();
            }
          }}
          placeholder="ابحث عن مكان بالاسم (مثال: فنيدق)"
          aria-label="ابحث عن مكان بالاسم"
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => void search()}
          disabled={searching}
          className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-brand-purple px-4 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark disabled:opacity-60"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          بحث
        </button>
      </div>

      {message && (
        <p role="status" className="text-sm leading-6 text-brand-ink/70">
          {message}
        </p>
      )}

      {results.length > 0 && (
        <ul className="divide-y divide-brand-purple/10 overflow-hidden rounded-xl border border-brand-purple/15 bg-white">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => choose(r)}
                className="w-full px-3.5 py-3 text-start text-sm leading-6 text-brand-ink transition-colors hover:bg-brand-purple-tint/60"
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      <PickerMap position={position} target={target} onPick={pick} />

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-brand-ink/70">خط العرض</span>
          <input
            name="latitude"
            dir="ltr"
            inputMode="decimal"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            required={required}
            placeholder="34.4367"
            className={`${inputClass} text-left`}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-brand-ink/70">خط الطول</span>
          <input
            name="longitude"
            dir="ltr"
            inputMode="decimal"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            required={required}
            placeholder="35.8497"
            className={`${inputClass} text-left`}
          />
        </label>
      </div>

      {(lat || lng) && !valid && (
        <p role="alert" className="text-sm text-red-600">
          الأرقام غير صحيحة. خط العرض بين ‎-90 و 90، وخط الطول بين ‎-180 و 180.
        </p>
      )}
    </div>
  );
}
