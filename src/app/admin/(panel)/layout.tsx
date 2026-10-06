import type { Metadata } from "next";
import { requireOwner } from "@/lib/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { Toaster } from "@/components/admin/toast";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, supabase } = await requireOwner();
  const { count } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("read", false);
  return (
    <Toaster>
      <AdminShell email={user.email ?? ""} unread={count ?? 0}>
        {children}
      </AdminShell>
    </Toaster>
  );
}
