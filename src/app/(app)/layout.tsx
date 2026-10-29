import type { ReactNode } from "react";
import { Footer, Navbar, QuickContact } from "@/components/home/homepage";

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
