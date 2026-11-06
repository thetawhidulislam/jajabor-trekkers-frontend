import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/session";
import "@/components/admin/admin.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<main className="admin-loading"><div className="admin-skeleton" /></main>}>
      <RequireAdmin>{children}</RequireAdmin>
    </Suspense>
  );
}

async function RequireAdmin({ children }: { children: ReactNode }) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
