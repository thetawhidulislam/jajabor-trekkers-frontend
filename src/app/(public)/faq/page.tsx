import type { Metadata } from "next";
import { messages } from "@/messages/en";

const faq = messages.home.pages.faq.questions;
const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

export const metadata: Metadata = {
  title: messages.home.pages.faq.title,
  description: messages.home.pages.faq.description,
};

export default function FaqPage() {
  return (
    <main className="public-info-page shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <header className="public-info-heading">
        <p className="eyebrow">{messages.home.pages.faq.intro}</p>
        <h1>{messages.home.pages.faq.title}</h1>
      </header>
      <section className="faq-list" aria-label={messages.home.pages.faq.title}>
        {faq.map(({ question, answer }) => (
          <details className="faq-item" key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
    </main>
  );
}
