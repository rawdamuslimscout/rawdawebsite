"use server";

import { revalidatePath } from "next/cache";
import { getSessionAdminId } from "@/lib/session";
import {
  coerceFormData,
  generateSlug,
  getDelegate,
  getResourceConfig,
  type FieldConfig,
} from "@/lib/admin-resources";
import { uploadToStorage } from "@/lib/supabase-storage";
import { friendlyMessage } from "@/lib/errors";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const NOT_LOGGED_IN = "انتهت جلسة الدخول. حدّث الصفحة وسجّل الدخول من جديد.";

function revalidateEverywhere(resource: string) {
  revalidatePath(`/admin/${resource}`);
  revalidatePath("/"); // homepage sections read most resources
  revalidatePath("/blog");
  revalidatePath("/library");
  revalidatePath("/join");
}

const isFileField = (f: FieldConfig) =>
  f.type === "file" || f.type === "file-multiple";

function parseUrlList(raw: unknown): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed)
      ? parsed.filter((u): u is string => typeof u === "string")
      : [];
  } catch {
    return [];
  }
}

/**
 * Uploads ONE file and returns its public URL. The admin screen calls this once
 * per file (after shrinking images in the browser) so every request stays small
 * and a failure affects only that file, with a clear message.
 */
export async function uploadFile(formData: FormData): Promise<UploadResult> {
  try {
    const adminId = await getSessionAdminId();
    if (!adminId) return { ok: false, error: NOT_LOGGED_IN };

    const resource = String(formData.get("_resource") || "");
    if (!getResourceConfig(resource))
      return { ok: false, error: "القسم غير موجود" };

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0)
      return { ok: false, error: "لم يتم اختيار ملف" };

    const url = await uploadToStorage(file, resource);
    if (!url) return { ok: false, error: "تعذّر رفع الملف" };
    return { ok: true, url };
  } catch (err) {
    console.error("uploadFile failed", err);
    return {
      ok: false,
      error: friendlyMessage(err, "تعذّر رفع الملف. حاول مجددًا."),
    };
  }
}

export async function saveItem(formData: FormData): Promise<ActionResult> {
  const resource = String(formData.get("_resource") || "");
  try {
    const adminId = await getSessionAdminId();
    if (!adminId) return { ok: false, error: NOT_LOGGED_IN };

    const id = String(formData.get("_id") || "");
    const config = getResourceConfig(resource);
    const delegate = getDelegate(resource);
    if (!config || !delegate) return { ok: false, error: "القسم غير موجود" };

    const data: Record<string, string | number> = coerceFormData(
      config,
      formData,
    );

    // Technical identifiers (slugs) are generated, never typed by the admin.
    // They are only created for NEW items so existing links keep working.
    if (!id) {
      for (const field of config.fields) {
        if (field.type === "slug")
          data[field.name] = generateSlug(field.slugPrefix || "item");
      }
    }

    // Files: the browser uploads each one first (see uploadFile) and sends the
    // resulting URLs here. Raw File objects are still accepted as a fallback.
    for (const field of config.fields) {
      if (!isFileField(field) || !field.uploadTo) continue;

      const uploaded: string[] = parseUrlList(
        formData.get(`_uploaded:${field.uploadTo}`),
      );
      for (const value of formData.getAll(field.name)) {
        if (value instanceof File && value.size > 0) {
          const url = await uploadToStorage(value, resource);
          if (url) uploaded.push(url);
        }
      }
      if (uploaded.length === 0) continue;

      if (field.type === "file-multiple") {
        const existing = id
          ? await delegate.findUnique({
              where: { id },
              select: { [field.uploadTo]: true },
            })
          : null;
        const oldUrls = parseUrlList(existing?.[field.uploadTo]);
        data[field.uploadTo] = JSON.stringify([...oldUrls, ...uploaded]);
      } else {
        data[field.uploadTo] = uploaded[0];
        // Library items: file type follows the uploaded file automatically.
        if (
          field.uploadTo === "fileUrl" &&
          config.fields.some((f) => f.name === "fileType")
        ) {
          data.fileType = /\.pdf(\?|$)/i.test(uploaded[0]) ? "PDF" : "DOCX";
        }
      }
    }

    // New items default to the end of the list so the admin never has to
    // guess an "order" number.
    const hasOrderField = config.fields.some(
      (f) => f.name === "order" && f.type === "number",
    );
    if (!id && hasOrderField && !Number(data.order)) {
      const last = await delegate.findFirst({ orderBy: { order: "desc" } });
      data.order = last ? Number(last.order) + 1 : 1;
    }

    if (id) {
      await delegate.update({ where: { id }, data });
    } else {
      await delegate.create({ data });
    }

    revalidateEverywhere(resource);
    return { ok: true };
  } catch (err) {
    console.error(`saveItem(${resource}) failed`, err);
    return {
      ok: false,
      error: friendlyMessage(err, "تعذّر حفظ التغييرات. حاول مجددًا."),
    };
  }
}

export async function deleteItem(formData: FormData): Promise<ActionResult> {
  const resource = String(formData.get("_resource") || "");
  try {
    const adminId = await getSessionAdminId();
    if (!adminId) return { ok: false, error: NOT_LOGGED_IN };

    const id = String(formData.get("_id") || "");
    const delegate = getDelegate(resource);
    if (!delegate) return { ok: false, error: "القسم غير موجود" };

    await delegate.delete({ where: { id } });

    revalidateEverywhere(resource);
    return { ok: true };
  } catch (err) {
    console.error(`deleteItem(${resource}) failed`, err);
    return {
      ok: false,
      error: friendlyMessage(err, "تعذّر حذف العنصر. حاول مجددًا."),
    };
  }
}

/**
 * Swaps the "order" value of one item with its immediate neighbor, so the
 * admin can nudge an item up/down the list without retyping every number.
 */
export async function reorderItem(
  resource: string,
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  try {
    const adminId = await getSessionAdminId();
    if (!adminId) return { ok: false, error: NOT_LOGGED_IN };

    const config = getResourceConfig(resource);
    const delegate = getDelegate(resource);
    if (!config || !delegate) return { ok: false, error: "القسم غير موجود" };

    const rows: { id: string; order: number }[] = await delegate.findMany({
      orderBy: { order: "asc" },
      select: { id: true, order: true },
    });
    const index = rows.findIndex((r) => String(r.id) === id);
    if (index === -1) return { ok: false, error: "العنصر غير موجود" };

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= rows.length) return { ok: true };

    const current = rows[index];
    const neighbor = rows[swapIndex];

    // If two items share the same number, swapping would change nothing —
    // renumber the whole list first so moving always works.
    if (current.order === neighbor.order) {
      const reordered = [...rows];
      [reordered[index], reordered[swapIndex]] = [
        reordered[swapIndex],
        reordered[index],
      ];
      await Promise.all(
        reordered.map((r, i) =>
          delegate.update({ where: { id: r.id }, data: { order: i + 1 } }),
        ),
      );
    } else {
      await Promise.all([
        delegate.update({
          where: { id: current.id },
          data: { order: neighbor.order },
        }),
        delegate.update({
          where: { id: neighbor.id },
          data: { order: current.order },
        }),
      ]);
    }

    revalidateEverywhere(resource);
    return { ok: true };
  } catch (err) {
    console.error(`reorderItem(${resource}) failed`, err);
    return {
      ok: false,
      error: friendlyMessage(err, "تعذّر تغيير الترتيب. حاول مجددًا."),
    };
  }
}

/** Removes a single uploaded file's URL from a file-multiple field's JSON array. */
export async function removeUploadedFile(
  resource: string,
  id: string,
  fieldKey: string,
  url: string,
): Promise<ActionResult> {
  try {
    const adminId = await getSessionAdminId();
    if (!adminId) return { ok: false, error: NOT_LOGGED_IN };

    const config = getResourceConfig(resource);
    const delegate = getDelegate(resource);
    if (!config || !delegate) return { ok: false, error: "القسم غير موجود" };
    // Only allow touching fields that really are upload fields of this section.
    if (!config.fields.some((f) => f.uploadTo === fieldKey))
      return { ok: false, error: "الحقل غير صالح" };

    const existing = await delegate.findUnique({
      where: { id },
      select: { [fieldKey]: true },
    });
    const urls = parseUrlList(existing?.[fieldKey]).filter((u) => u !== url);
    await delegate.update({
      where: { id },
      data: { [fieldKey]: JSON.stringify(urls) },
    });

    revalidateEverywhere(resource);
    return { ok: true };
  } catch (err) {
    console.error(`removeUploadedFile(${resource}) failed`, err);
    return {
      ok: false,
      error: friendlyMessage(err, "تعذّر حذف الملف. حاول مجددًا."),
    };
  }
}
