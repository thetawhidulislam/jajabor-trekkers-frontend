import { Suspense } from "react";
import { TripEdit } from "@/components/trips/trip-detail";
import { messages } from "@/messages/en";

async function EditTripContent({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  return <TripEdit tripId={tripId} />;
}

export default function EditTripPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  return (
    <Suspense fallback={<p className="trip-loading">{messages.common.loading}</p>}>
      <EditTripContent params={params} />
    </Suspense>
  );
}
