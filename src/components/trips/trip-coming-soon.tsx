import Link from "next/link";
import { messages } from "@/messages/en";

export function TripRouteFallback() {
  return (
    <main className="trip-shell">
      <p className="trip-loading" aria-busy="true">{messages.common.loading}</p>
    </main>
  );
}

export function TripComingSoon({ tripId }: { tripId?: string }) {
  const overviewHref = tripId ? `/trips/${encodeURIComponent(tripId)}` : "/trips";
  return (
    <main className="trip-shell">
      <section className="trip-state trip-coming-soon-state">
        <p className="eyebrow">{messages.tripsPage.comingNext}</p>
        <h1>{messages.tripsPage.comingNext}</h1>
        <p>{messages.tripsPage.comingNextDescription}</p>
        <Link className="button button-outline" href={overviewHref}>
          {messages.tripsPage.returnToOverview}
        </Link>
      </section>
    </main>
  );
}

export async function TripComingSoonRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  return <TripComingSoon tripId={tripId} />;
}
