import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { messages } from "@/messages/en";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">
      <aside className="auth-brand-panel" aria-label={messages.app.name}>
        <Link className="auth-brand" href="/" aria-label={messages.app.name}>
          <Image src="/brand-mark.svg" alt="" width={54} height={54} />
          <span>
            <strong>Jajabor</strong>
            <small>{messages.home.brandSuffix}</small>
          </span>
        </Link>
        <div className="auth-brand-copy">
          <p className="auth-brand-kicker">{messages.app.name}</p>
          <h1>{messages.auth.panelTitle}</h1>
          <p>{messages.auth.panelTagline}</p>
          <ul className="auth-benefits">
            {messages.auth.panelBenefits.map((benefit) => (
              <li key={benefit}><span aria-hidden="true"><Check size={15} /></span>{benefit}</li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="auth-content">
        <Link className="auth-mobile-brand" href="/" aria-label={messages.app.name}>
          <Image src="/brand-mark.svg" alt="" width={42} height={42} />
          <span>
            <strong>Jajabor</strong>
            <small>{messages.home.brandSuffix}</small>
          </span>
        </Link>
        {children}
      </main>
    </div>
  );
}
