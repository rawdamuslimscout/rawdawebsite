import { redirect } from "next/navigation";
import { getSessionAdminId } from "@/lib/session";
import { resourceGroups, resourceRegistry } from "@/lib/admin-resources";
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
    group: r.group,
  }));
  const groups = Object.entries(resourceGroups).map(([key, label]) => ({
    key,
    label,
  }));

  return (
    <ToastProvider>
      <div
        dir="rtl"
        className="min-h-screen w-full overflow-x-hidden bg-brand-cream"
      >
        <div className="flex min-h-screen w-full flex-col md:flex-row">
          <AdminNav resources={resources} groups={groups} />

          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
