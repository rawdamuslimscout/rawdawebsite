// Content for /scout-letters, the page that introduces and distributes the
// «scout-letters» Claude Skill. Letters are drafted inside Claude, not here.
// The page exists in Arabic (/scout-letters) and English (/scout-letters/en).
//
// To ship a new version: put the new ZIP in public/scout-letters/ and update
// SKILL_VERSION and SKILL_ZIP_SIZE below.

export type Lang = "ar" | "en";

/** Where each language version of the page lives. */
export const PAGE_PATHS: Record<Lang, string> = {
  ar: "/scout-letters",
  en: "/scout-letters/en",
};

export const PAGE_TITLE: Record<Lang, string> = {
  ar: "مساعد المراسلات الكشفية",
  en: "Scout Letters Assistant",
};

/** Returns t(ar, en), which picks the copy for `lang`. */
export function translator(lang: Lang) {
  return <T>(ar: T, en: T): T => (lang === "en" ? en : ar);
}

export const SKILL_NAME = "scout-letters";
export const SKILL_VERSION = 31;
export const SKILL_ZIP_FILE = `${SKILL_NAME}-v${SKILL_VERSION}.zip`;
export const SKILL_ZIP_PATH = `/scout-letters/${SKILL_ZIP_FILE}`;
/** Shown next to the download button. */
export const SKILL_ZIP_SIZE = "1.5 MB";

/**
 * Illustrated guide (PDF in public/scout-letters/). Leave null until the guide
 * describes the current ZIP version; the on-page steps serve as the guide.
 */
export const GUIDE_PATH: string | null = null;

export const SUPPORT_PHONE_DISPLAY = "70 860 161";
export const SUPPORT_WHATSAPP_URL = "https://wa.me/96170860161";

/**
 * The letter itself is always in formal Arabic; Claude chats in the user's
 * language. The English prompt keeps the Arabic titles so Claude uses the
 * exact official ones.
 */
export const EXAMPLE_PROMPT: Record<Lang, string> = {
  ar: "استعمل scout-letters. بدي طلب موافقة تجريبي باسم فوج روضة الفيحاء، مفوضية الشمال، لإقامة لقاء تدريبي. المرجع قائد التدريب، والكتاب موجّه إلى عميد الفوج. رقم الصادر 12/2026. اسألني عن التفاصيل الناقصة، وكمّل بلا صور إمضاءات أو ختم.",
  en: "Use scout-letters. I need a test approval request from Rawda Al-Fayhaa Troop (فوج روضة الفيحاء), North Legation (مفوضية الشمال), to hold a training meeting. The reference is the training leader (قائد التدريب), and the letter is addressed to the troop head (عميد الفوج). Outgoing number 12/2026. Ask me about any missing details, and continue without signature or stamp images.",
};
