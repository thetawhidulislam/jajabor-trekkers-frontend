"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { TripListParams, TripSort, TripStatus } from "@/lib/api/trips";
import { useTrips } from "@/hooks/use-trips";
import { ApiError } from "@/lib/api/client";
import { formatDateRange, formatMoney } from "@/lib/format";
import { messages } from "@/messages/en";
import { TripStatusBadge } from "@/components/trips/trip-status-badge";

const statuses = ["PLANNING", "UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"] satisfies TripStatus[];
const sorts = ["startDate_asc", "startDate_desc", "newest"] satisfies TripSort[];

function readPage(value: string | null) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

function TripsListSkeleton() {
  return (
    <div className="trip-card-grid" aria-busy="true" aria-label={messages.tripsPage.loading}>
      {Array.from({ length: 3 }, (_, index) => (
        <div className="trip-card trip-card-skeleton" key={index}>
          <div className="trip-card-image skeleton" />
          <div className="trip-card-body">
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line skeleton-short" />
            <div className="skeleton skeleton-line" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TripPagination({
  params,
  page,
  totalPages,
}: {
  params: URLSearchParams;
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  if (totalPages <= 1) return null;

  function goToPage(nextPage: number) {
    const nextParams = new URLSearchParams(params);
    if (nextPage === 1) nextParams.delete("page");
    else nextParams.set("page", String(nextPage));
    const query = nextParams.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <nav className="trip-pagination" aria-label={messages.tripsPage.paginationLabel}>
      <button
        className="button button-outline"
        type="button"
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
      >
        {messages.tripsPage.previousPage}
      </button>
      <span>{messages.tripsPage.pageLabel(page)}</span>
      <button
        className="button button-outline"
        type="button"
        disabled={page >= totalPages}
        onClick={() => goToPage(page + 1)}
      >
        {messages.tripsPage.nextPage}
      </button>
    </nav>
  );
}

function TripsListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = readPage(searchParams.get("page"));
  const rawStatus = searchParams.get("status");
  const status = statuses.find((value) => value === rawStatus);
  const rawSort = searchParams.get("sort");
  const sort = sorts.find((value) => value === rawSort) ?? "startDate_asc";
  const paginationParams = new URLSearchParams();
  if (status) paginationParams.set("status", status);
  if (rawSort && sorts.some((value) => value === rawSort)) paginationParams.set("sort", sort);
  if (page > 1) paginationParams.set("page", String(page));
  const filters: TripListParams = { page, limit: 10, sort };
  if (status) filters.status = status;
  const tripsQuery = useTrips(filters);

  function updateFilter(key: "status" | "sort", value: string) {
    const nextStatus = key === "status" ? value : status;
    const nextSort = key === "sort" ? value : sort;
    const nextParams = new URLSearchParams();
    if (nextStatus) nextParams.set("status", nextStatus);
    if (nextSort && (key === "sort" || rawSort)) nextParams.set("sort", nextSort);
    const query = nextParams.toString();
    router.push(query ? `/trips?${query}` : "/trips", { scroll: false });
  }

  if (tripsQuery.isPending) return <TripsListSkeleton />;

  if (tripsQuery.isError) {
    return (
      <div className="trip-state trip-error-state" role="alert">
        <h2>{messages.tripsPage.errorTitle}</h2>
        <p>{tripsQuery.error instanceof ApiError ? tripsQuery.error.message : messages.common.genericError}</p>
        <button className="button button-primary" type="button" onClick={() => void tripsQuery.refetch()}>
          {messages.tripsPage.retry}
        </button>
      </div>
    );
  }

  const trips = tripsQuery.data.data;
  const meta = tripsQuery.data.meta;
  if (trips.length === 0) {
    return (
      <div className="trip-state trip-empty-state">
        <h2>{messages.tripsPage.emptyTitle}</h2>
        <p>{messages.tripsPage.emptyDescription}</p>
        <Link className="button button-primary" href="/trips/new">{messages.tripsPage.firstTrip}</Link>
      </div>
    );
  }

  return (
    <>
      <div className="trip-list-toolbar">
        <p className="trip-result-count">
          {messages.tripsPage.resultCount(meta?.total ?? trips.length)}
        </p>
        <div className="trip-filters" role="group" aria-label={messages.tripsPage.filtersLabel}>
          <label>
            <span>{messages.tripsPage.statusLabel}</span>
            <select value={status ?? ""} onChange={(event) => updateFilter("status", event.currentTarget.value)}>
              <option value="">{messages.tripsPage.allStatuses}</option>
              {statuses.map((value) => (
                <option key={value} value={value}>{messages.tripsPage.status[value]}</option>
              ))}
            </select>
          </label>
          <label>
            <span>{messages.tripsPage.sortLabel}</span>
            <select value={sort} onChange={(event) => updateFilter("sort", event.currentTarget.value)}>
              <option value="startDate_asc">{messages.tripsPage.sortStartAscending}</option>
              <option value="startDate_desc">{messages.tripsPage.sortStartDescending}</option>
              <option value="newest">{messages.tripsPage.sortNewest}</option>
            </select>
          </label>
        </div>
      </div>
      <div className="trip-card-grid">
        {trips.map((trip) => (
          <article className="trip-card" key={trip.id}>
            <Link className="trip-card-cover" href={`/trips/${encodeURIComponent(trip.id)}`}>
              <Image
                src={trip.destination?.coverImage || "/destination-fallback.svg"}
                alt={trip.destination
                  ? messages.tripsPage.destinationAlt(trip.destination.name)
                  : messages.tripsPage.destinationFallbackAlt}
                fill
                sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 380px"
              />
              <span className="trip-card-status"><TripStatusBadge status={trip.status} /></span>
            </Link>
            <div className="trip-card-body">
              <div className="trip-card-heading">
                <h2><Link href={`/trips/${encodeURIComponent(trip.id)}`}>{trip.title}</Link></h2>
                <p>{trip.destination?.name ?? messages.tripsPage.noDestination}</p>
              </div>
              <p className="trip-card-dates">
                {trip.startDate && trip.endDate
                  ? formatDateRange(trip.startDate, trip.endDate)
                  : messages.tripsPage.datesNotSet}
              </p>
              <dl className="trip-card-meta">
                <div>
                  <dt>{messages.tripsPage.budgetLabel}</dt>
                  <dd>{trip.budget === null ? messages.tripsPage.budgetNotSet : formatMoney(trip.budget)}</dd>
                </div>
                <div>
                  <dt>{messages.tripsPage.membersLabel}</dt>
                  <dd>{trip.memberCount}</dd>
                </div>
                <div>
                  <dt>{messages.tripsPage.roleLabel}</dt>
                  <dd>{trip.myRole}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
      {meta && (
        <TripPagination params={paginationParams} page={meta.page} totalPages={meta.totalPages} />
      )}
    </>
  );
}

export function TripsList() {
  return (
    <Suspense fallback={<TripsListSkeleton />}>
      <TripsListContent />
    </Suspense>
  );
}
