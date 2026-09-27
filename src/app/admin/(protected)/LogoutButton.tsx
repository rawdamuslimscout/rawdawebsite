"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { useToast } from "./ToastProvider";

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { showError } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("تعذّر تسجيل الخروج");
      router.push("/admin/login");
      router.refresh();
    } catch {
      showError("تعذّر تسجيل الخروج. تحقق من اتصالك وحاول مجددًا.");
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        aria-label="تسجيل الخروج"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-ink/70 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-ink/70 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      تسجيل الخروج
    </button>
  );
}
