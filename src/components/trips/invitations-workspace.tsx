"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePendingInvitations } from "@/hooks/use-invitations";
import { useRespondToTripInvitation } from "@/hooks/use-trips";
import { ApiError } from "@/lib/api/client";
import { formatDate, formatDateRange } from "@/lib/format";
import { messages } from "@/messages/en";
import { useToast } from "@/providers/toast-provider";

const PAGE_LIMIT = 50;

function InvitationsSkeleton() {
  return (
    <div className="invitation-card-list" aria-busy="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div className="invitation-card invitation-card-skeleton" key={index}>
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line skeleton-short" />
        </div>
      ))}
    </div>
  );
}

export function InvitationsWorkspace() {
  const [page, setPage] = useState(1);
  const invitationsQuery = usePendingInvitations(true, page, PAGE_LIMIT);
  const respondMutation = useRespondToTripInvitation();
  const router = useRouter();
  const { showToast } = useToast();

  async function respond(tripId: string, action: "accept" | "decline") {
    try {
      await respondMutation.mutateAsync({ tripId, action });
      if (action === "accept") router.push(`/trips/${encodeURIComponent(tripId)}`);
    } catch (error) {
      const fallback = action === "accept"
        ? messages.tripsPage.invitations.acceptFailed
        : messages.tripsPage.invitations.declineFailed;
      showToast(error instanceof ApiError ? error.message : fallback);
    }
  }

  if (invitationsQuery.isPending) {
    return (
      <main className="trip-shell">
        <header className="trip-page-heading trip-detail-heading">
          <h1>{messages.tripsPage.invitations.title}</h1>
        </header>
        <InvitationsSkeleton />
      </main>
    );
  }

  if (invitationsQuery.isError) {
    return (
      <main className="trip-shell">
        <section className="trip-state trip-error-state">
          <h1>{messages.tripsPage.invitations.title}</h1>
          <p role="alert">
            {invitationsQuery.error instanceof ApiError
              ? invitationsQuery.error.message
              : messages.tripsPage.invitations.loadError}
          </p>
          <button
            className="button button-primary"
            type="button"
            onClick={() => void invitationsQuery.refetch()}
          >
            {messages.tripsPage.invitations.retry}
          </button>
        </section>
      </main>
    );
  }

  const invitations = invitationsQuery.data.data;
  const totalPages = invitationsQuery.data.meta?.totalPages ?? 1;

  return (
    <main className="trip-shell">
      <header className="trip-page-heading trip-detail-heading">
        <h1>{messages.tripsPage.invitations.title}</h1>
      </header>
      {invitations.length === 0 ? (
        <section className="trip-state trip-empty-state">
          <h2>{messages.tripsPage.invitations.empty}</h2>
        </section>
      ) : (
        <div className="invitation-card-list">
          {invitations.map((invitation) => (
            <article className="invitation-card" key={invitation.tripId}>
              <div className="invitation-card-content">
                <h2>{invitation.title}</h2>
                {invitation.destination && (
                  <p className="invitation-card-destination">{invitation.destination}</p>
                )}
                <p>{formatDateRange(invitation.startDate, invitation.endDate)}</p>
                <p>{messages.tripsPage.invitations.invitedBy(invitation.owner)}</p>
                <time dateTime={invitation.invitedAt}>
                  {messages.tripsPage.invitations.invitedAt(formatDate(invitation.invitedAt))}
                </time>
              </div>
              <div className="invitation-card-actions">
                <button
                  className="button button-primary"
                  type="button"
                  disabled={respondMutation.isPending}
                  onClick={() => void respond(invitation.tripId, "accept")}
                >
                  {respondMutation.isPending && respondMutation.variables?.action === "accept"
                    ? messages.tripsPage.invitations.accepting
                    : messages.tripsPage.invitations.accept}
                </button>
                <button
                  className="button button-outline"
                  type="button"
                  disabled={respondMutation.isPending}
                  onClick={() => void respond(invitation.tripId, "decline")}
                >
                  {respondMutation.isPending && respondMutation.variables?.action === "decline"
                    ? messages.tripsPage.invitations.declining
                    : messages.tripsPage.invitations.decline}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <nav className="trip-pagination" aria-label={messages.tripsPage.invitations.pagination}>
          <button
            className="button button-outline"
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            {messages.tripsPage.invitations.previousPage}
          </button>
          <span>{messages.tripsPage.invitations.page(page)}</span>
          <button
            className="button button-outline"
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            {messages.tripsPage.invitations.nextPage}
          </button>
        </nav>
      )}
    </main>
  );
}
