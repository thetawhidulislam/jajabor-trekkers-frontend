import { Suspense } from "react";
import { TripDetail } from "@/components/trips/trip-detail";
import { TripRouteFallback } from "@/components/trips/trip-coming-soon";

async function TripOverviewContent({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  return <TripDetail tripId={tripId} />;
}

export default function TripOverviewPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  return (
    <Suspense fallback={<TripRouteFallback />}>
      <TripOverviewContent params={params} />
    </Suspense>
  );
}
