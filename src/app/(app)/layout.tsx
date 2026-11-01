import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Footer, Navbar, QuickContact } from "@/components/home/homepage";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <QuickContact />
    </>
  );
}
