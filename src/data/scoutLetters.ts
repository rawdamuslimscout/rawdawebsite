// Content for /scout-letters, the page that introduces and distributes the
// «scout-letters» Claude Skill. Letters are drafted inside Claude, not here.
//
// To ship a new version: put the new ZIP in public/scout-letters/ and update
// SKILL_VERSION and SKILL_ZIP_SIZE below.

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

export const EXAMPLE_PROMPT =
  "استعمل scout-letters. بدي طلب موافقة تجريبي باسم فوج روضة الفيحاء، مفوضية الشمال، لإقامة لقاء تدريبي. المرجع قائد التدريب، والكتاب موجّه إلى عميد الفوج. رقم الصادر 12/2026. اسألني عن التفاصيل الناقصة، وكمّل بلا صور إمضاءات أو ختم.";
