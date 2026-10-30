import type { ReactNode } from "react";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import "@/components/admin/admin.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<main className="admin-loading"><div className="admin-skeleton" /></main>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
