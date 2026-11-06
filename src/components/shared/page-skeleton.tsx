import { messages } from "@/messages/en";
import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <main className="shell app-loading" aria-label={messages.app.loading} aria-busy="true">
      <Skeleton className="skeleton skeleton-title" />
      <div className="app-loading-grid" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="app-loading-card" key={index}>
            <Skeleton className="skeleton skeleton-image" />
            <div className="skeleton-lines">
              <Skeleton className="skeleton skeleton-title" />
              <Skeleton className="skeleton skeleton-line" />
              <Skeleton className="skeleton skeleton-line skeleton-short" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
