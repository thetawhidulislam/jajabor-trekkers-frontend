"use client";

import Link from "next/link";
import { useTrips } from "@/hooks/use-trips";
import { usePendingInvitations } from "@/hooks/use-invitations";
import { formatDate, formatDateRange } from "@/lib/format";
import { messages } from "@/messages/en";

function localDateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function TripSummary() {
  const planningQuery = useTrips({ status: "PLANNING", page: 1, limit: 1 });
  const upcomingQuery = useTrips({
    status: "UPCOMING",
    page: 1,
    limit: 50,
    sort: "startDate_asc",
  });
  const ongoingQuery = useTrips({ status: "ONGOING", page: 1, limit: 1 });
  const invitationsQuery = usePendingInvitations();
  const queries = [planningQuery, upcomingQuery, ongoingQuery, invitationsQuery];
  const hasError = queries.some((query) => query.isError);
  const nextTrip = upcomingQuery.data?.data.find(
    (trip) => trip.startDate && trip.startDate.slice(0, 10) >= localDateKey(),
  );
  const activeCount =
    planningQuery.data?.meta &&
    upcomingQuery.data?.meta &&
    ongoingQuery.data?.meta
      ? planningQuery.data.meta.total +
        upcomingQuery.data.meta.total +
        ongoingQuery.data.meta.total
      : null;
  const invitationCount = invitationsQuery.data?.meta?.total;

  function retry() {
    void Promise.all(queries.map((query) => query.refetch()));
  }

  return (
    <section className="trip-home-summary" aria-labelledby="trip-summary-title">
      <h2 id="trip-summary-title" className="sr-only">
        {messages.tripsPage.summary.quickActions}
      </h2>
      {hasError && (
        <div className="trip-summary-error" role="alert">
          <span>{messages.tripsPage.summary.summaryError}</span>
          <button className="button button-outline" type="button" onClick={retry}>
            {messages.tripsPage.retry}
          </button>
        </div>
      )}
      <div className="trip-summary-cards">
        {nextTrip?.startDate && (
          <Link className="trip-home-summary-card" href={`/trips/${encodeURIComponent(nextTrip.id)}`}>
            <span>{messages.tripsPage.summary.upcomingTitle}</span>
            <strong>{nextTrip.title}</strong>
            <small>
              {nextTrip.endDate
                ? formatDateRange(nextTrip.startDate, nextTrip.endDate)
                : formatDate(nextTrip.startDate)}
            </small>
          </Link>
        )}
        {typeof invitationCount === "number" && invitationCount > 0 && (
          <Link className="trip-home-summary-card" href="/invitations">
            <span>{messages.tripsPage.summary.invitationsTitle}</span>
            <strong>{invitationCount.toLocaleString("en-BD")}</strong>
          </Link>
        )}
        {activeCount !== null && activeCount > 0 && (
          <article className="trip-home-summary-card">
            <span>{messages.tripsPage.summary.activeTitle}</span>
            <strong>{activeCount.toLocaleString("en-BD")}</strong>
          </article>
        )}
        <Link className="trip-home-action" href="/trips/new">
          {messages.tripsPage.planTrip}
        </Link>
        <Link className="trip-home-action trip-home-action-secondary" href="/destinations">
          {messages.tripsPage.summary.browseDestinations}
        </Link>
      </div>
    </section>
  );
}
