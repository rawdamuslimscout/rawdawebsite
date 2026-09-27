"use server";

import { revalidatePath } from "next/cache";
import { getSessionAdminId } from "@/lib/session";
import {
  coerceFormData,
  getDelegate,
  getResourceConfig,
} from "@/lib/admin-resources";
import { uploadToStorage } from "@/lib/supabase-storage";

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateEverywhere(resource: string) {
  revalidatePath(`/admin/${resource}`);
  revalidatePath("/"); // homepage sections read most resources
  revalidatePath("/blog");
  revalidatePath("/library");
  revalidatePath("/join");
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export async function saveItem(formData: FormData): Promise<ActionResult> {
  const resource = String(formData.get("_resource") || "");
  try {
    const adminId = await getSessionAdminId();
    if (!adminId) return { ok: false, error: "يلزم تسجيل الدخول" };

    const id = String(formData.get("_id") || "");
    const config = getResourceConfig(resource);
    const delegate = getDelegate(resource);
    if (!config || !delegate) return { ok: false, error: "المورد غير موجود" };

    const data = coerceFormData(config, formData);
    for (const field of config.fields) {
      if (
        (field.type !== "file" && field.type !== "file-multiple") ||
        !field.uploadTo
      )
        continue;
      const values =
        field.type === "file-multiple"
          ? formData.getAll(field.name)
          : [formData.get(field.name)];
      const uploaded: string[] = [];
      for (const value of values) {
        if (value instanceof File && value.size > 0) {
          const url = await uploadToStorage(value, resource);
          if (url) uploaded.push(url);
        }
      }
      if (field.type === "file-multiple") {
        if (uploaded.length === 0) continue;
        const existing = id
          ? await delegate.findUnique({
              where: { id },
              select: { [field.uploadTo]: true },
            })
          : null;
        let oldUrls: string[] = [];
        try {
          const parsed = existing?.[field.uploadTo]
            ? JSON.parse(String(existing[field.uploadTo]))
            : [];
          oldUrls = Array.isArray(parsed)
            ? parsed.filter((url): url is string => typeof url === "string")
            : [];
        } catch {}
        data[field.uploadTo] = JSON.stringify([...oldUrls, ...uploaded]);
      } else if (uploaded[0]) {
        data[field.uploadTo] = uploaded[0];
      }
    }

    // New items with a manual "order" field default to the end of the
    // list when the field was left untouched, so users aren't forced
    // to guess a number just to add something.
    if (!id && "order" in data && Number(data.order) === 0) {
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
      error: errorMessage(err, "تعذّر حفظ العنصر. حاول مجددًا."),
    };
  }
}

export async function deleteItem(formData: FormData): Promise<ActionResult> {
  const resource = String(formData.get("_resource") || "");
  try {
    const adminId = await getSessionAdminId();
    if (!adminId) return { ok: false, error: "يلزم تسجيل الدخول" };

    const id = String(formData.get("_id") || "");
    const delegate = getDelegate(resource);
    if (!delegate) return { ok: false, error: "المورد غير موجود" };

    await delegate.delete({ where: { id } });

    revalidateEverywhere(resource);
    return { ok: true };
  } catch (err) {
    console.error(`deleteItem(${resource}) failed`, err);
    return {
      ok: false,
      error: errorMessage(err, "تعذّر حذف العنصر. حاول مجددًا."),
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
    if (!adminId) return { ok: false, error: "يلزم تسجيل الدخول" };

    const config = getResourceConfig(resource);
    const delegate = getDelegate(resource);
    if (!config || !delegate) return { ok: false, error: "المورد غير موجود" };

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

    revalidateEverywhere(resource);
    return { ok: true };
  } catch (err) {
    console.error(`reorderItem(${resource}) failed`, err);
    return {
      ok: false,
      error: errorMessage(err, "تعذّر تغيير الترتيب. حاول مجددًا."),
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
    if (!adminId) return { ok: false, error: "يلزم تسجيل الدخول" };

    const delegate = getDelegate(resource);
    if (!delegate) return { ok: false, error: "المورد غير موجود" };

    const existing = await delegate.findUnique({
      where: { id },
      select: { [fieldKey]: true },
    });
    let urls: string[] = [];
    try {
      const parsed = existing?.[fieldKey]
        ? JSON.parse(String(existing[fieldKey]))
        : [];
      urls = Array.isArray(parsed)
        ? parsed.filter((u): u is string => typeof u === "string")
        : [];
    } catch {}

    urls = urls.filter((u) => u !== url);
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
      error: errorMessage(err, "تعذّر حذف الملف. حاول مجددًا."),
    };
  }
}
