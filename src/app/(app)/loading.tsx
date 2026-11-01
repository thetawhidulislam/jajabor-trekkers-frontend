import { messages } from "@/messages/en";

export default function Loading() {
  return (
    <main className="shell app-loading" aria-label={messages.app.loading} aria-busy="true">
      <div className="skeleton skeleton-title" aria-hidden="true" />
      <div className="app-loading-grid" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="app-loading-card" key={index}>
            <div className="skeleton skeleton-image" />
            <div className="skeleton-lines">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line skeleton-short" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
