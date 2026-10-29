import { Suspense } from "react";
import { TripComingSoonRoute, TripRouteFallback } from "@/components/trips/trip-coming-soon";

export default function ItineraryPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  return (
    <Suspense fallback={<TripRouteFallback />}>
      <TripComingSoonRoute params={params} />
    </Suspense>
  );
}
