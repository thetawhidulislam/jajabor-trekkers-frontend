import { Suspense } from "react";
import { PackingWorkspace } from "@/components/trips/packing-workspace";
import { TripRouteFallback } from "@/components/trips/trip-coming-soon";

async function PackingContent({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  return <PackingWorkspace tripId={tripId} />;
}

export default function PackingPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  return (
    <Suspense fallback={<TripRouteFallback />}>
      <PackingContent params={params} />
    </Suspense>
  );
}
