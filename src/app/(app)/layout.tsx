import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer, Navbar, QuickContact } from "@/components/home/homepage";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <Suspense fallback={<PageSkeleton />}>
        <RequireUser>{children}</RequireUser>
      </Suspense>
      <Footer />
      <QuickContact />
    </>
  );
}

async function RequireUser({ children }: { children: ReactNode }) {
  await requireUser();
  return children;
}
