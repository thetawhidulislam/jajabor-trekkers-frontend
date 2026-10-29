"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDeleteTrip, useTrip, useUpdateTripStatus } from "@/hooks/use-trips";
import { ApiError } from "@/lib/api/client";
import type { TripStatus } from "@/lib/api/trips";
import { formatDateRange, formatMoney } from "@/lib/format";
import { messages } from "@/messages/en";
import { TripStatusBadge } from "@/components/trips/trip-status-badge";
import { TripForm } from "@/components/trips/trip-form";

type TripSection = "overview" | "itinerary" | "packing" | "expenses" | "members";
type ActionableTripStatus = keyof typeof messages.tripsPage.statusActions;
const statusActions: Partial<Record<TripStatus, ActionableTripStatus[]>> = {
  PLANNING: ["UPCOMING", "CANCELLED"],
  UPCOMING: ["ONGOING", "CANCELLED"],
  ONGOING: ["COMPLETED", "CANCELLED"],
};

function TripDetailSkeleton() {
  return (
    <div className="trip-shell trip-detail-skeleton" aria-busy="true">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" />
      <div className="trip-card-grid">
        <div className="trip-card trip-card-skeleton"><div className="trip-card-image skeleton" /></div>
        <div className="trip-card trip-card-skeleton"><div className="trip-card-image skeleton" /></div>
      </div>
    </div>
  );
}

function TripNotFound() {
  return (
    <main className="trip-shell">
      <section className="trip-state trip-not-found" role="alert">
        <h1>{messages.tripsPage.notFoundTitle}</h1>
        <p>{messages.tripsPage.notFoundDescription}</p>
        <Link className="button button-primary" href="/trips">{messages.tripsPage.backToTrips}</Link>
      </section>
    </main>
  );
}

function TripTabs({ tripId, current }: { tripId: string; current: TripSection }) {
  const tabs: { key: TripSection; label: string; href: string }[] = [
    { key: "overview", label: messages.tripsPage.overviewTab, href: `/trips/${encodeURIComponent(tripId)}` },
    { key: "itinerary", label: messages.tripsPage.itineraryTab, href: `/trips/${encodeURIComponent(tripId)}/itinerary` },
    { key: "packing", label: messages.tripsPage.packingTab, href: `/trips/${encodeURIComponent(tripId)}/packing` },
    { key: "expenses", label: messages.tripsPage.expensesTab, href: `/trips/${encodeURIComponent(tripId)}/expenses` },
    { key: "members", label: messages.tripsPage.membersTab, href: `/trips/${encodeURIComponent(tripId)}/members` },
  ];

  return (
    <nav className="trip-tabs" aria-label={messages.tripsPage.tabsLabel}>
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === current ? "page" : undefined}
          className={tab.key === current ? "is-current" : undefined}
        >
          {tab.label}
          {tab.key !== "overview" && <span className="trip-coming-badge">{messages.tripsPage.comingNext}</span>}
        </Link>
      ))}
    </nav>
  );
}

function TripMembers({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  return (
    <section className="trip-detail-section">
      <h2>{messages.tripsPage.membersHeading}</h2>
      <ul className="trip-member-list">
        {names.map((name, index) => {
          const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("");
          return (
            <li className="trip-member" key={`${name}-${index}`}>
              <span className="trip-member-avatar" aria-hidden="true">{initials}</span>
              <span>{name}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TripDetailContent({ tripId }: { tripId: string }) {
  const router = useRouter();
  const tripQuery = useTrip(tripId);
  const statusMutation = useUpdateTripStatus();
  const deleteMutation = useDeleteTrip();
  const [notice, setNotice] = useState<{ message: string; isError: boolean } | null>(null);

  if (tripQuery.isPending) return <TripDetailSkeleton />;
  if (tripQuery.isError) {
    if (tripQuery.error instanceof ApiError && tripQuery.error.isNotFound) return <TripNotFound />;
    return (
      <main className="trip-shell">
        <div className="trip-state trip-error-state" role="alert">
          <h1>{messages.tripsPage.errorTitle}</h1>
          <p>{tripQuery.error instanceof ApiError ? tripQuery.error.message : messages.common.genericError}</p>
          <button className="button button-primary" type="button" onClick={() => void tripQuery.refetch()}>
            {messages.tripsPage.retry}
          </button>
        </div>
      </main>
    );
  }

  const trip = tripQuery.data.data;
  const canManage = trip.myRole === "OWNER" && trip.status !== "COMPLETED" && trip.status !== "CANCELLED";
  const nextStatuses = statusActions[trip.status] ?? [];
  const dates = trip.startDate && trip.endDate
    ? formatDateRange(trip.startDate, trip.endDate)
    : messages.tripsPage.datesNotSet;

  async function changeStatus(status: TripStatus) {
    const label = messages.tripsPage.status[status];
    if (!window.confirm(messages.tripsPage.changeStatusConfirm(label))) return;
    setNotice(null);
    try {
      await statusMutation.mutateAsync({ id: trip.id, status });
      setNotice({ message: messages.tripsPage.statusUpdated, isError: false });
    } catch (error) {
      setNotice({
        message: error instanceof ApiError ? error.message : messages.common.genericError,
        isError: true,
      });
    }
  }

  async function removeTrip() {
    if (!window.confirm(messages.tripsPage.deleteConfirm)) return;
    setNotice(null);
    try {
      await deleteMutation.mutateAsync(trip.id);
      router.push("/trips");
    } catch (error) {
      setNotice({
        message: error instanceof ApiError ? error.message : messages.common.genericError,
        isError: true,
      });
    }
  }

  return (
    <main className="trip-shell trip-detail-page">
      <Link className="trip-back-link" href="/trips">{messages.tripsPage.backToTrips}</Link>
      <header className="trip-detail-heading">
        <div>
          <p className="eyebrow">{messages.tripsPage.overviewTitle}</p>
          <h1>{trip.title}</h1>
          <TripStatusBadge status={trip.status} />
        </div>
        {canManage && (
          <div className="trip-owner-actions">
            <Link className="button button-outline" href={`/trips/${encodeURIComponent(trip.id)}/edit`}>
              {messages.tripsPage.editTrip}
            </Link>
            <div className="trip-status-actions">
              {nextStatuses.map((status) => (
                <button
                  className={status === "CANCELLED" ? "button button-outline" : "button button-primary"}
                  type="button"
                  key={status}
                  disabled={statusMutation.isPending || deleteMutation.isPending}
                  onClick={() => void changeStatus(status)}
                >
                  {messages.tripsPage.statusActions[status]}
                </button>
              ))}
            </div>
            <button
              className="button button-danger"
              type="button"
              disabled={statusMutation.isPending || deleteMutation.isPending}
              onClick={() => void removeTrip()}
            >
              {messages.tripsPage.deleteTrip}
            </button>
          </div>
        )}
      </header>

      {notice && (
        <p className={notice.isError ? "trip-toast trip-toast-error" : "trip-toast"} role={notice.isError ? "alert" : "status"}>
          {notice.message}
        </p>
      )}

      <TripTabs tripId={trip.id} current="overview" />
      <div className="trip-overview-grid">
        <div className="trip-overview-main">
          <section className="trip-detail-section trip-detail-summary">
            <h2>{messages.tripsPage.overviewTitle}</h2>
            <dl className="trip-summary-grid">
              <div><dt>{messages.tripsPage.statusLabel}</dt><dd><TripStatusBadge status={trip.status} /></dd></div>
              <div><dt>{messages.tripForm.startDateLabel} – {messages.tripForm.endDateLabel}</dt><dd>{dates}</dd></div>
              <div><dt>{messages.tripsPage.budgetLabel}</dt><dd>{trip.budget === null ? messages.tripsPage.budgetNotSet : formatMoney(trip.budget)}</dd></div>
              <div><dt>{messages.tripsPage.ownerLabel}</dt><dd>{trip.owner.name}</dd></div>
              <div><dt>{messages.tripsPage.roleLabel}</dt><dd>{trip.myRole}</dd></div>
            </dl>
          </section>

          <section className="trip-detail-section">
            <h2>{messages.tripsPage.destinationLabel}</h2>
            {trip.destination ? (
              <Link className="trip-destination-summary" href={`/destinations/${encodeURIComponent(trip.destination.slug)}`}>
                <span className="trip-destination-image">
                  <Image
                    src={trip.destination.coverImage || "/destination-fallback.svg"}
                    alt={messages.tripsPage.destinationAlt(trip.destination.name)}
                    fill
                    sizes="(max-width: 700px) 100vw, 360px"
                  />
                </span>
                <span className="trip-destination-name">{trip.destination.name}</span>
              </Link>
            ) : <p>{messages.tripsPage.noDestination}</p>}
          </section>

          <TripMembers names={trip.members.map((member) => member.name)} />

          <section className="trip-detail-section">
            <h2>{messages.tripsPage.notesLabel}</h2>
            <p className="trip-notes">{trip.notes || messages.tripsPage.noNotes}</p>
          </section>
        </div>
        <aside className="trip-overview-aside">
          <p className="trip-member-count">
            <strong>{trip.memberCount}</strong>
            <span>{messages.tripsPage.membersLabel}</span>
          </p>
        </aside>
      </div>
    </main>
  );
}

export function TripDetail({ tripId }: { tripId: string }) {
  return <TripDetailContent tripId={tripId} />;
}

export function TripEdit({ tripId }: { tripId: string }) {
  const tripQuery = useTrip(tripId);
  if (tripQuery.isPending) return <TripDetailSkeleton />;
  if (tripQuery.isError) {
    if (tripQuery.error instanceof ApiError && tripQuery.error.isNotFound) return <TripNotFound />;
    return (
      <main className="trip-shell">
        <div className="trip-state trip-error-state" role="alert">
          <h1>{messages.tripsPage.errorTitle}</h1>
          <p>{tripQuery.error instanceof ApiError ? tripQuery.error.message : messages.common.genericError}</p>
          <button className="button button-primary" type="button" onClick={() => void tripQuery.refetch()}>
            {messages.tripsPage.retry}
          </button>
        </div>
      </main>
    );
  }

  const trip = tripQuery.data.data;
  const canEdit = trip.myRole === "OWNER" && trip.status !== "COMPLETED" && trip.status !== "CANCELLED";
  if (!canEdit) {
    return (
      <main className="trip-shell">
        <section className="trip-state">
          <h1>{messages.tripsPage.notFoundTitle}</h1>
          <p>{messages.tripsPage.notFoundDescription}</p>
          <Link className="button button-outline" href={`/trips/${encodeURIComponent(trip.id)}`}>
            {messages.tripsPage.returnToOverview}
          </Link>
        </section>
      </main>
    );
  }
  return <main className="trip-shell trip-edit-page"><TripForm trip={trip} /></main>;
}
