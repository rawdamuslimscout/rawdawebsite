"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "تعذّر تسجيل الدخول");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("حدث خطأ غير متوقع. تحقق من اتصالك بالإنترنت وحاول مجددًا.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-brand-cream px-5 py-10"
    >
      <div className="w-full max-w-sm rounded-2xl border border-brand-purple/10 bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-purple-tint text-brand-purple">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-center font-display text-xl font-bold text-brand-ink">
          لوحة تحكم فوج روضة الفيحاء
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
              disabled={loading}
              className="w-full rounded-lg border border-brand-purple/15 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-purple disabled:bg-brand-cream/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-lg border border-brand-purple/15 px-3 py-2.5 pl-10 text-sm outline-none transition-colors focus:border-brand-purple disabled:bg-brand-cream/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-brand-ink/40 hover:text-brand-ink/70"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-purple px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
