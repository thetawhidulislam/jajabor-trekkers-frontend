import { messages } from "@/messages/en";
import type { TripStatus } from "@/lib/api/trips";

export function TripStatusBadge({ status }: { status: TripStatus }) {
  return (
    <span className="trip-status-badge" data-status={status}>
      <span className="trip-status-dot" aria-hidden="true" />
      {messages.tripsPage.status[status]}
    </span>
  );
}
