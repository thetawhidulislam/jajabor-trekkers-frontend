import type { Metadata } from "next";
import Link from "next/link";
import { messages } from "@/messages/en";

export const metadata: Metadata = {
  title: messages.home.pages.safety.title,
  description: messages.home.pages.safety.description,
};

export default function SafetyPage() {
  return (
    <main className="public-info-page shell">
      <header className="public-info-heading">
        <p className="eyebrow">{messages.home.pages.safety.title}</p>
        <h1>{messages.home.pages.safety.title}</h1>
        <p>{messages.home.pages.safety.body}</p>
      </header>
      <Link className="text-link" href="/destinations">
        {messages.home.pages.safety.back}
      </Link>
    </main>
  );
}
