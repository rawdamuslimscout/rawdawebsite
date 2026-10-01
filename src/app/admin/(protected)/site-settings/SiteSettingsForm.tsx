"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { saveSiteSettings } from "./actions";
import { useToast } from "../ToastProvider";

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
  "w-full rounded-lg border border-brand-purple/15 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10";

export default function SiteSettingsForm({
  settings,
  gallery,
}: {
  settings: Settings;
  gallery: GalleryItem[];
}) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveSiteSettings(formData);
      if (result.ok) {
        showSuccess("تم حفظ الإعدادات");
        router.refresh();
      } else {
        showError(result.error);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 grid gap-4 rounded-2xl border border-brand-purple/10 bg-white p-6 shadow-sm sm:grid-cols-2"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
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
        <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
          الشعار (tagline)
        </label>
        <input
          name="tagline"
          defaultValue={settings.tagline}
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
          الجهة الأم (الجمعية / المفوضية)
        </label>
        <input
          name="parentOrg"
          defaultValue={settings.parentOrg}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
          رابط Instagram
        </label>
        <input
          type="url"
          name="instagramUrl"
          defaultValue={settings.instagramUrl}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
          رقم الهاتف
        </label>
        <input
          type="tel"
          name="contactPhone"
          defaultValue={settings.contactPhone}
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
          الموقع / العنوان
        </label>
        <input
          name="contactLocation"
          defaultValue={settings.contactLocation}
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
          مقدمة صفحة «انضم إلينا»
        </label>
        <textarea
          name="joinIntro"
          defaultValue={settings.joinIntro}
          rows={3}
          className={`${inputClass} resize-y`}
        />
      </div>
      <fieldset className="sm:col-span-2">
        <legend className="mb-1.5 block text-sm font-medium text-brand-ink/75">
          صور قسم «عن الفوج»
        </legend>
        <p className="mb-3 text-xs text-brand-ink/45">
          اختر صورتين من معرض الصور. اتركهما دون اختيار لاستخدام أول صورتين
          تلقائيًا.
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
          className="flex items-center gap-2 rounded-full bg-brand-purple px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          حفظ الإعدادات
        </button>
      </div>
    </form>
  );
}
