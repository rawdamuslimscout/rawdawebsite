"use server";

import { revalidatePath } from "next/cache";

import { getSessionAdminId } from "@/lib/session";

import {
  coerceFormData,
  generateSlug,
  getDelegate,
  getResourceConfig,
  type FieldConfig,
  type CoercedValue,
} from "@/lib/admin-resources";

import { uploadToStorage } from "@/lib/supabase-storage";
import { friendlyMessage } from "@/lib/errors";
import { validateResourceWrite } from "@/lib/resource-hooks";
import { rateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { safeHref } from "@/lib/safe-url";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const NOT_LOGGED_IN = "انتهت جلسة الدخول. حدّث الصفحة وسجّل الدخول من جديد.";

function revalidateEverywhere(resource: string) {
  revalidatePath(`/admin/${resource}`);
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/library");
  revalidatePath("/join");
  revalidatePath("/faq");
  revalidatePath("/structure");
  revalidatePath("/sitemap.xml");
}

const isFileField = (field: FieldConfig) =>
  field.type === "file" || field.type === "file-multiple";

function parseUrlList(raw: unknown): string[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(String(raw));

    return Array.isArray(parsed)
      ? parsed.filter(
          (url): url is string =>
            typeof url === "string" && safeHref(url) !== "",
        )
      : [];
  } catch {
    return [];
  }
}

/**
 * Uploads one file and returns its public URL.
 * Each file is uploaded separately to keep requests small.
 */
export async function uploadFile(formData: FormData): Promise<UploadResult> {
  try {
    const adminId = await getSessionAdminId();

    if (!adminId) {
      return { ok: false, error: NOT_LOGGED_IN };
    }

    const resource = String(formData.get("_resource") || "");

    if (!getResourceConfig(resource)) {
      return { ok: false, error: "القسم غير موجود" };
    }

    const limited = await rateLimit(`upload:${adminId}`, 60, 10 * 60);

    if (!limited.allowed) {
      return {
        ok: false,
        error: "رفعت ملفات كثيرة في وقت قصير. انتظر بضع دقائق ثم أعد المحاولة.",
      };
    }

    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "لم يتم اختيار ملف" };
    }

    const url = await uploadToStorage(file, resource);

    if (!url) {
      return { ok: false, error: "تعذّر رفع الملف" };
    }

    await audit({
      action: "upload",
      adminId,
      resource,
    });

    return { ok: true, url };
  } catch (err) {
    console.error("uploadFile failed", err);

    return {
      ok: false,
      error: friendlyMessage(err, "تعذّر رفع الملف. حاول مجددًا."),
    };
  }
}

/**
 * Creates a new resource item or updates an existing one.
 */
export async function saveItem(formData: FormData): Promise<ActionResult> {
  const resource = String(formData.get("_resource") || "");

  try {
    const adminId = await getSessionAdminId();

    if (!adminId) {
      return { ok: false, error: NOT_LOGGED_IN };
    }

    const id = String(formData.get("_id") || "");
    const config = getResourceConfig(resource);
    const delegate = getDelegate(resource);

    if (!config || !delegate) {
      return { ok: false, error: "القسم غير موجود" };
    }

    const data: Record<string, CoercedValue> = coerceFormData(config, formData);

    // Generate technical slugs only for new items.
    // Existing slugs remain unchanged to preserve links.
    if (!id) {
      for (const field of config.fields) {
        if (field.type === "slug") {
          data[field.name] = generateSlug(field.slugPrefix || "item");
        }
      }
    }

    // Handle uploaded files and their resulting URLs.
    for (const field of config.fields) {
      if (!isFileField(field) || !field.uploadTo) {
        continue;
      }

      const uploaded: string[] = parseUrlList(
        formData.get(`_uploaded:${field.uploadTo}`),
      );

      for (const value of formData.getAll(field.name)) {
        if (value instanceof File && value.size > 0) {
          const url = await uploadToStorage(value, resource);

          if (url) {
            uploaded.push(url);
          }
        }
      }

      if (uploaded.length === 0) {
        continue;
      }

      if (field.type === "file-multiple") {
        const existing = id
          ? await delegate.findUnique({
              where: { id },
              select: { [field.uploadTo]: true },
            })
          : null;

        const oldUrls = parseUrlList(existing?.[field.uploadTo]);

        // Keep existing files and append newly uploaded files.
        data[field.uploadTo] = JSON.stringify([...oldUrls, ...uploaded]);
      } else {
        data[field.uploadTo] = uploaded[0];

        // Infer the library file type from its uploaded URL.
        if (
          field.uploadTo === "fileUrl" &&
          config.fields.some((item) => item.name === "fileType")
        ) {
          data.fileType = /\.pdf(\?|$)/i.test(uploaded[0]) ? "PDF" : "DOCX";
        }
      }
    }

    // Put new items at the end of the list by default.
    const hasOrderField = config.fields.some(
      (field) => field.name === "order" && field.type === "number",
    );

    if (!id && hasOrderField && !Number(data.order)) {
      const last = await delegate.findFirst({
        orderBy: { order: "desc" },
      });

      data.order = last ? Number(last.order) + 1 : 1;
    }

    // Validate both creates and updates before writing to the database.
    const invalid = await validateResourceWrite(resource, id, data);

    if (invalid) {
      return { ok: false, error: invalid };
    }

    let targetId = id;

    if (id) {
      // FIX: Existing items can now be updated.
      // The previous unconditional `if (id) return ...`
      // incorrectly rejected every update.
      const existing = await delegate.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!existing) {
        return {
          ok: false,
          error: "العنصر غير موجود أو تم حذفه.",
        };
      }

      await delegate.update({
        where: { id },
        data,
      });
    } else {
      const created = await delegate.create({
        data,
      });

      targetId = String(created.id);
    }

    await audit({
      action: id ? "update" : "create",
      adminId,
      resource,
      targetId,
    });

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

/**
 * Deletes an existing resource item.
 */
export async function deleteItem(formData: FormData): Promise<ActionResult> {
  const resource = String(formData.get("_resource") || "");

  try {
    const adminId = await getSessionAdminId();

    if (!adminId) {
      return { ok: false, error: NOT_LOGGED_IN };
    }

    const id = String(formData.get("_id") || "");
    const delegate = getDelegate(resource);

    if (!delegate) {
      return { ok: false, error: "القسم غير موجود" };
    }

    if (!id) {
      return {
        ok: false,
        error: "العنصر غير صالح.",
      };
    }

    await delegate.delete({
      where: { id },
    });

    await audit({
      action: "delete",
      adminId,
      resource,
      targetId: id,
    });

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
 * Swaps an item's order with its immediate neighbor.
 */
export async function reorderItem(
  resource: string,
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  try {
    const adminId = await getSessionAdminId();

    if (!adminId) {
      return { ok: false, error: NOT_LOGGED_IN };
    }

    const config = getResourceConfig(resource);
    const delegate = getDelegate(resource);

    if (!config || !delegate) {
      return { ok: false, error: "القسم غير موجود" };
    }

    if (direction !== "up" && direction !== "down") {
      return { ok: false, error: "طلب غير صالح" };
    }

    const rows: { id: string; order: number }[] = await delegate.findMany({
      orderBy: { order: "asc" },
      select: { id: true, order: true },
    });

    const index = rows.findIndex((row) => String(row.id) === id);

    if (index === -1) {
      return {
        ok: false,
        error: "العنصر غير موجود",
      };
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= rows.length) {
      return { ok: true };
    }

    const current = rows[index];
    const neighbor = rows[swapIndex];

    // If order values are duplicated, renumber the list
    // after swapping the two adjacent items.
    if (current.order === neighbor.order) {
      const reordered = [...rows];

      [reordered[index], reordered[swapIndex]] = [
        reordered[swapIndex],
        reordered[index],
      ];

      await Promise.all(
        reordered.map((row, i) =>
          delegate.update({
            where: { id: row.id },
            data: { order: i + 1 },
          }),
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

    await audit({
      action: "reorder",
      adminId,
      resource,
      targetId: id,
      meta: { direction },
    });

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

/**
 * Removes one uploaded file URL from a file-multiple field.
 */
export async function removeUploadedFile(
  resource: string,
  id: string,
  fieldKey: string,
  url: string,
): Promise<ActionResult> {
  try {
    const adminId = await getSessionAdminId();

    if (!adminId) {
      return { ok: false, error: NOT_LOGGED_IN };
    }

    const config = getResourceConfig(resource);
    const delegate = getDelegate(resource);

    if (!config || !delegate) {
      return { ok: false, error: "القسم غير موجود" };
    }

    // Only allow fields configured as upload destinations.
    if (!config.fields.some((field) => field.uploadTo === fieldKey)) {
      return {
        ok: false,
        error: "الحقل غير صالح",
      };
    }

    const existing = await delegate.findUnique({
      where: { id },
      select: { [fieldKey]: true },
    });

    if (!existing) {
      return {
        ok: false,
        error: "العنصر غير موجود أو تم حذفه.",
      };
    }

    const urls = parseUrlList(existing[fieldKey]).filter(
      (existingUrl) => existingUrl !== url,
    );

    await delegate.update({
      where: { id },
      data: {
        [fieldKey]: JSON.stringify(urls),
      },
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
