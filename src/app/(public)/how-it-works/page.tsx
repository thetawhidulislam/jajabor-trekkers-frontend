import type { Metadata } from "next";
import Link from "next/link";
import { Backpack, Compass, MapPin, UsersRound, Wallet } from "lucide-react";
import { messages } from "@/messages/en";

const icons = [MapPin, Compass, UsersRound, Backpack, Wallet];

export const metadata: Metadata = {
  title: messages.home.pages.howItWorks.title,
  description: messages.home.pages.howItWorks.description,
};

export default function HowItWorksPage() {
  return (
    <main className="public-info-page shell">
      <header className="public-info-heading">
        <p className="eyebrow">{messages.app.name}</p>
        <h1>{messages.home.pages.howItWorks.title}</h1>
        <p>{messages.home.pages.howItWorks.intro}</p>
      </header>
      <ol className="how-steps">
        {messages.home.pages.howItWorks.steps.map((step, index) => {
          const Icon = icons[index];
          return (
            <li className="how-step-card" key={step.title}>
              <span className="how-step-number">{String(index + 1).padStart(2, "0")}</span>
              <Icon size={28} aria-hidden="true" />
              <h2>{step.title}</h2>
              <p>{step.description}</p>
            </li>
          );
        })}
      </ol>
      <div className="public-info-cta">
        <Link className="button button-primary" href="/signup">
          {messages.home.pages.howItWorks.cta}
        </Link>
      </div>
    </main>
  );
}
