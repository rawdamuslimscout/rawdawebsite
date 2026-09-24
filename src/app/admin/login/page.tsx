"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-brand-cream px-5">
      <div className="w-full max-w-sm rounded-2xl border border-brand-purple/10 bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-purple-tint text-brand-purple">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-center font-display text-xl font-bold text-brand-ink">
          لوحة تحكم فوج روضة الفيحاء
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border border-brand-purple/15 px-3 py-2.5 text-sm outline-none focus:border-brand-purple"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-ink/75">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-brand-purple/15 px-3 py-2.5 text-sm outline-none focus:border-brand-purple"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-purple px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark disabled:opacity-60"
          >
            {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
