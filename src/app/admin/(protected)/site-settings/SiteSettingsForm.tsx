"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { saveSiteSettings } from "./actions";
import { useToast } from "../ToastProvider";
import { friendlyMessage } from "@/lib/errors";

type Settings = {
  name: string;
  tagline: string;
  parentOrg: string;
  instagramUrl: string;
  contactPhone: string;
  contactLocation: string;
  joinIntro: string;
  aboutImageIds: string[];
};

type GalleryItem = { id: string; title: string; imageUrl: string };

const inputClass =
  "w-full rounded-xl border border-brand-purple/15 bg-white px-3.5 py-2.5 text-base outline-none transition-colors placeholder:text-brand-ink/30 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10 sm:text-sm";

export default function SiteSettingsForm({
  settings,
  gallery,
}: {
  settings: Settings;
  gallery: GalleryItem[];
}) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isPending) return;
    const formData = new FormData(e.currentTarget);
    setIsPending(true);
    try {
      const result = await saveSiteSettings(formData);
      if (result.ok) {
        showSuccess("تم حفظ الإعدادات ✓");
        router.refresh();
      } else {
        showError(result.error);
      }
    } catch (err) {
      console.error("[admin:site-settings] save failed", err);
      showError(
        friendlyMessage(
          err,
          "حدث خطأ غير متوقع ولم يتم الحفظ. تأكد من اتصالك بالإنترنت وأعد المحاولة.",
        ),
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 grid gap-4 rounded-2xl border border-brand-purple/10 bg-white p-6 shadow-sm sm:grid-cols-2"
    >
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          اسم الفوج
        </label>
        <input
          name="name"
          defaultValue={settings.name}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          العبارة التعريفية
        </label>
        <input
          name="tagline"
          defaultValue={settings.tagline}
          placeholder="جملة قصيرة تعبّر عن الفوج"
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-brand-ink/50">
          تظهر في قسم «عن الفوج» عندما لا توجد صور.
        </p>
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          الجهة الأم (الجمعية / المفوضية)
        </label>
        <input
          name="parentOrg"
          defaultValue={settings.parentOrg}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          رابط حساب إنستغرام
        </label>
        <input
          type="url"
          name="instagramUrl"
          defaultValue={settings.instagramUrl}
          placeholder="https://instagram.com/..."
          dir="ltr"
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-brand-ink/50">
          يظهر كأيقونة في أسفل الموقع. انسخ الرابط كاملًا من المتصفح.
        </p>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          رقم الهاتف
        </label>
        <input
          type="tel"
          name="contactPhone"
          defaultValue={settings.contactPhone}
          placeholder="+961 81 348 184"
          dir="ltr"
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-brand-ink/50">
          يظهر في أسفل الموقع، ويُستخدم أيضًا لزر واتساب.
        </p>
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          العنوان
        </label>
        <input
          name="contactLocation"
          defaultValue={settings.contactLocation}
          placeholder="مثال: طرابلس، لبنان"
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-brand-ink/50">يظهر في أسفل الموقع.</p>
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          مقدمة صفحة «انضم إلينا»
        </label>
        <textarea
          name="joinIntro"
          defaultValue={settings.joinIntro}
          rows={3}
          className={`${inputClass} resize-y`}
        />
        <p className="mt-1.5 text-xs text-brand-ink/50">
          تظهر أعلى صفحة «انضم إلينا».
        </p>
      </div>
      <fieldset className="sm:col-span-2">
        <legend className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          صور قسم «عن الفوج»
        </legend>
        <p className="mb-3 text-xs text-brand-ink/45">
          اختر صورتين من معرض الصور لتظهرا بجانب نص «عن الفوج» في الصفحة الرئيسية. اتركهما دون اختيار لاستخدام أول صورتين تلقائيًا.
        </p>
        {gallery.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-brand-purple/10 p-2 has-[:checked]:border-brand-purple has-[:checked]:bg-brand-purple-tint/30"
              >
                <input
                  type="checkbox"
                  name="aboutImageIds"
                  value={item.id}
                  defaultChecked={settings.aboutImageIds.includes(item.id)}
                  className="h-4 w-4 accent-brand-purple"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-12 w-12 rounded-md object-cover"
                />
                <span className="min-w-0 truncate text-sm text-brand-ink">
                  {item.title}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-brand-purple-tint/30 p-3 text-sm text-brand-ink/60">
            أضف صورًا إلى معرض الصور أولًا.
          </p>
        )}
      </fieldset>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex min-h-11 items-center gap-2 rounded-full bg-brand-purple px-7 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "جارٍ الحفظ…" : "حفظ الإعدادات"}
        </button>
      </div>
    </form>
  );
}
