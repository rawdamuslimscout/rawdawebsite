import { NextResponse } from "next/server";
import { getSessionAdminId } from "@/lib/session";

/** Returns the admin id if the request carries a valid session, else null. */
export async function requireAdmin(): Promise<string | null> {
  return getSessionAdminId();
}

export function unauthorized() {
  return NextResponse.json({ error: "يلزم تسجيل الدخول" }, { status: 401 });
}
