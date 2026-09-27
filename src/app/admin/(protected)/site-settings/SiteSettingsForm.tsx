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
};

const inputClass =
  "w-full rounded-lg border border-brand-purple/15 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10";

export default function SiteSettingsForm({ settings }: { settings: Settings }) {
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
        <input name="name" defaultValue={settings.name} required className={inputClass} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
          الشعار (tagline)
        </label>
        <input name="tagline" defaultValue={settings.tagline} className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
          الجهة الأم (الجمعية / المفوضية)
        </label>
        <input name="parentOrg" defaultValue={settings.parentOrg} className={inputClass} />
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
