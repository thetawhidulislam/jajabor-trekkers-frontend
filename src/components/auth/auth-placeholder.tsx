import { messages } from "@/messages/en";

export function AuthPlaceholder({ title }: { title: string }) {
  return (
    <section className="auth-card" aria-labelledby="auth-placeholder-title">
      <header className="auth-heading">
        <p className="auth-eyebrow">{messages.auth.eyebrow}</p>
        <h1 id="auth-placeholder-title">{title}</h1>
      </header>
      <p className="auth-placeholder-copy">{messages.auth.placeholderPage}</p>
    </section>
  );
}
