"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { saveSiteSettings, uploadSettingsImage } from "./actions";
import AboutImagesField from "./AboutImagesField";
import JoinImageField from "./JoinImageField";
import { parseStringArray } from "@/lib/json";
import { makeThumbnail, prepareFile } from "@/lib/client-files";
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
  aboutImageUrls: string[];
  joinImageUrl: string;
};

/** Resizes a picked photo in the browser and uploads it; returns its URL. */
async function uploadImage(file: File): Promise<string> {
  const prepared = await prepareFile(file, "image/*");
  const upload = new FormData();
  upload.set("file", prepared);
  const thumb = await makeThumbnail(prepared);
  if (thumb) upload.set("thumb", thumb);
  const result = await uploadSettingsImage(upload);
  if (!result.ok) throw new Error(result.error);
  return result.url;
}

type GalleryItem = { id: string; title: string; imageUrl: string };

const inputClass =
  "w-full rounded-xl border border-brand-purple/15 bg-white px-3.5 py-2.5 text-base outline-none transition-colors placeholder:text-brand-ink/60 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10 sm:text-sm";

export default function SiteSettingsForm({
  settings,
  gallery,
  aboutPhotoMax,
}: {
  settings: Settings;
  gallery: GalleryItem[];
  aboutPhotoMax: number;
}) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [joinFile, setJoinFile] = useState<File | null>(null);
  const [aboutFiles, setAboutFiles] = useState<File[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isPending) return;
    const formData = new FormData(e.currentTarget);
    setIsPending(true);
    try {
      // Newly picked photos are resized, uploaded, and their URLs saved with
      // the rest of the settings (uploaded "about" photos come first).
      if (aboutFiles.length) {
        const urls: string[] = [];
        for (const file of aboutFiles) urls.push(await uploadImage(file));
        const kept = parseStringArray(formData.get("aboutImageUrls"));
        formData.set("aboutImageUrls", JSON.stringify([...kept, ...urls]));
      }
      if (joinFile) formData.set("joinImageUrl", await uploadImage(joinFile));

      const result = await saveSiteSettings(formData);
      if (result.ok) {
        setJoinFile(null);
        setAboutFiles([]);
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
        <label htmlFor="settings-name" className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          اسم الفوج
        </label>
        <input
          id="settings-name"
          name="name"
          defaultValue={settings.name}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="settings-tagline" className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          العبارة التعريفية
        </label>
        <input
          id="settings-tagline"
          aria-describedby="settings-tagline-help"
          name="tagline"
          defaultValue={settings.tagline}
          placeholder="جملة قصيرة تعبّر عن الفوج"
          className={inputClass}
        />
        <p id="settings-tagline-help" className="mt-1.5 text-xs text-brand-ink/70">
          تظهر في قسم «عن الفوج» عندما لا توجد صور.
        </p>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="settings-parentOrg" className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          الجهة الأم (الجمعية / المفوضية)
        </label>
        <input
          id="settings-parentOrg"
          name="parentOrg"
          defaultValue={settings.parentOrg}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="settings-instagramUrl" className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          رابط حساب إنستغرام
        </label>
        <input
          type="url"
          id="settings-instagramUrl"
          aria-describedby="settings-instagramUrl-help"
          name="instagramUrl"
          defaultValue={settings.instagramUrl}
          placeholder="https://instagram.com/..."
          dir="ltr"
          className={inputClass}
        />
        <p id="settings-instagramUrl-help" className="mt-1.5 text-xs text-brand-ink/70">
          يظهر كأيقونة في أسفل الموقع. انسخ الرابط كاملًا من المتصفح.
        </p>
      </div>
      <div>
        <label htmlFor="settings-contactPhone" className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          رقم الهاتف
        </label>
        <input
          type="tel"
          id="settings-contactPhone"
          aria-describedby="settings-contactPhone-help"
          name="contactPhone"
          defaultValue={settings.contactPhone}
          placeholder="+961 81 348 184"
          dir="ltr"
          className={inputClass}
        />
        <p id="settings-contactPhone-help" className="mt-1.5 text-xs text-brand-ink/70">
          يظهر في أسفل الموقع، ويُستخدم أيضًا لزر واتساب.
        </p>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="settings-contactLocation" className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          العنوان
        </label>
        <input
          id="settings-contactLocation"
          aria-describedby="settings-contactLocation-help"
          name="contactLocation"
          defaultValue={settings.contactLocation}
          placeholder="مثال: طرابلس، لبنان"
          className={inputClass}
        />
        <p id="settings-contactLocation-help" className="mt-1.5 text-xs text-brand-ink/70">يظهر في أسفل الموقع.</p>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="settings-joinIntro" className="mb-1.5 block text-sm font-semibold text-brand-ink/80">
          مقدمة صفحة «انضم إلينا»
        </label>
        <textarea
          id="settings-joinIntro"
          aria-describedby="settings-joinIntro-help"
          name="joinIntro"
          defaultValue={settings.joinIntro}
          rows={3}
          className={`${inputClass} resize-y`}
        />
        <p id="settings-joinIntro-help" className="mt-1.5 text-xs text-brand-ink/70">
          تظهر أعلى صفحة «انضم إلينا».
        </p>
      </div>
      <AboutImagesField
        // Remount after a save so the field starts from what was stored.
        key={JSON.stringify([settings.aboutImageUrls, settings.aboutImageIds])}
        gallery={gallery}
        savedUrls={settings.aboutImageUrls}
        savedIds={settings.aboutImageIds}
        max={aboutPhotoMax}
        files={aboutFiles}
        onFilesChange={setAboutFiles}
      />
      <JoinImageField savedUrl={settings.joinImageUrl} file={joinFile} onFileChange={setJoinFile} />
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
