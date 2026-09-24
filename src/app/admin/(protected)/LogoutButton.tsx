"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-ink/70 transition-colors hover:bg-red-50 hover:text-red-600"
    >
      <LogOut className="h-4 w-4" />
      تسجيل الخروج
    </button>
  );
}
