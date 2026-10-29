import { Suspense } from "react";
import { TripForm } from "@/components/trips/trip-form";
import { messages } from "@/messages/en";

export default function NewTripPage() {
  return (
    <main className="trip-shell trip-edit-page">
      <Suspense fallback={<p className="trip-loading">{messages.common.loading}</p>}>
        <TripForm />
      </Suspense>
    </main>
  );
}
