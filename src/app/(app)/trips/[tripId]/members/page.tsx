import { Suspense } from "react";
import { TripRouteFallback } from "@/components/trips/trip-coming-soon";
import { TripMembersWorkspace } from "@/components/trips/trip-members-workspace";

async function TripMembersContent({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  return <TripMembersWorkspace tripId={tripId} />;
}

export default function MembersPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  return (
    <Suspense fallback={<TripRouteFallback />}>
      <TripMembersContent params={params} />
    </Suspense>
  );
}
