import { Suspense } from "react";
import { ItineraryWorkspace } from "@/components/trips/itinerary-workspace";
import { TripRouteFallback } from "@/components/trips/trip-coming-soon";

async function ItineraryContent({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  return <ItineraryWorkspace tripId={tripId} />;
}

export default function ItineraryPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  return (
    <Suspense fallback={<TripRouteFallback />}>
      <ItineraryContent params={params} />
    </Suspense>
  );
}
