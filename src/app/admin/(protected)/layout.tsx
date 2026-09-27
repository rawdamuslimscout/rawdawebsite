import { redirect } from "next/navigation";
import { getSessionAdminId } from "@/lib/session";
import { resourceRegistry } from "@/lib/admin-resources";
import ToastProvider from "./ToastProvider";
import AdminNav from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminId = await getSessionAdminId();
  if (!adminId) {
    redirect("/admin/login");
  }

  const resources = Object.values(resourceRegistry).map((r) => ({
    key: r.key,
    label: r.label,
  }));

  return (
    <ToastProvider>
      <div className="min-h-screen bg-brand-cream" dir="rtl">
        <div className="flex min-h-screen flex-col md:flex-row">
          <AdminNav resources={resources} />
          <main className="flex-1 p-5 sm:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
