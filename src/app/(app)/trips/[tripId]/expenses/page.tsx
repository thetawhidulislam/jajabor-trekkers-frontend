import { Suspense } from "react";
import { ExpensesWorkspace } from "@/components/expenses/expenses-workspace";
import { TripRouteFallback } from "@/components/trips/trip-coming-soon";

async function ExpensesPageContent({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  return <ExpensesWorkspace tripId={tripId} />;
}

export default function ExpensesPage({ params }: { params: Promise<{ tripId: string }> }) {
  return (
    <Suspense fallback={<TripRouteFallback />}>
      <ExpensesPageContent params={params} />
    </Suspense>
  );
}
