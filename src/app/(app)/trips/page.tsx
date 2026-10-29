import { Suspense } from "react";
import Link from "next/link";
import { TripsList } from "@/components/trips/trips-list";
import { messages } from "@/messages/en";

function TripsPageFallback() {
  return (
    <main className="trip-shell">
      <header className="trip-page-heading">
        <p className="eyebrow">{messages.tripsPage.description}</p>
        <h1>{messages.tripsPage.title}</h1>
      </header>
      <div className="trip-card-grid" aria-busy="true" aria-label={messages.tripsPage.loading}>
        {Array.from({ length: 3 }, (_, index) => (
          <div className="trip-card trip-card-skeleton" key={index}>
            <div className="trip-card-image skeleton" />
          </div>
        ))}
      </div>
    </main>
  );
}

export default function MyTripsPage() {
  return (
    <main className="trip-shell trip-list-page">
      <header className="trip-page-heading trip-list-heading">
        <div>
          <p className="eyebrow">{messages.tripsPage.description}</p>
          <h1>{messages.tripsPage.title}</h1>
        </div>
        <Link className="button button-primary" href="/trips/new">{messages.tripsPage.planTrip}</Link>
      </header>
      <Suspense fallback={<TripsPageFallback />}>
        <TripsList />
      </Suspense>
    </main>
  );
}
