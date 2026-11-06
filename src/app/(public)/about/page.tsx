import type { Metadata } from "next";
import { messages } from "@/messages/en";

export const metadata: Metadata = {
  title: messages.home.pages.about.title,
  description: messages.home.pages.about.description,
};

export default function AboutPage() {
  const { about } = messages.home.pages;
  return (
    <main className="public-info-page shell">
      <header className="public-info-heading">
        <p className="eyebrow">{messages.app.tagline}</p>
        <h1>{about.title}</h1>
        <p>{about.mission}</p>
      </header>
      <section className="coming-soon-panel">
        <h2>{about.storyComingSoon}</h2>
        {about.story.trim() && <p>{about.story}</p>}
      </section>
    </main>
  );
}
