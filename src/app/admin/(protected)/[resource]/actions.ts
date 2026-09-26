"use server";

import { revalidatePath } from "next/cache";
import { getSessionAdminId } from "@/lib/session";
import {
  coerceFormData,
  getDelegate,
  getResourceConfig,
} from "@/lib/admin-resources";
import { uploadToStorage } from "@/lib/supabase-storage";

export async function saveItem(formData: FormData) {
  const adminId = await getSessionAdminId();
  if (!adminId) throw new Error("يلزم تسجيل الدخول");

  const resource = String(formData.get("_resource") || "");
  const id = String(formData.get("_id") || "");
  const config = getResourceConfig(resource);
  const delegate = getDelegate(resource);
  if (!config || !delegate) throw new Error("المورد غير موجود");

  const data = coerceFormData(config, formData);
  for (const field of config.fields) {
    if (field.type !== "file" || !field.uploadTo) continue;
    const value = formData.get(field.name);
    if (value instanceof File && value.size > 0) {
      data[field.uploadTo] = (await uploadToStorage(value, resource)) || "";
    }
  }

  if (id) {
    await delegate.update({ where: { id }, data });
  } else {
    await delegate.create({ data });
  }

  revalidatePath(`/admin/${resource}`);
  revalidatePath("/"); // homepage sections read most resources
  revalidatePath("/blog");
  revalidatePath("/library");
  revalidatePath("/join");
}

export async function deleteItem(formData: FormData) {
  const adminId = await getSessionAdminId();
  if (!adminId) throw new Error("يلزم تسجيل الدخول");

  const resource = String(formData.get("_resource") || "");
  const id = String(formData.get("_id") || "");
  const delegate = getDelegate(resource);
  if (!delegate) throw new Error("المورد غير موجود");

  await delegate.delete({ where: { id } });

  revalidatePath(`/admin/${resource}`);
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/library");
  revalidatePath("/join");
}
