"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdminDestinations, useDeleteAdminDestination, useSetAdminDestinationFeatured, useSetAdminDestinationStatus } from "@/hooks/use-admin";
import { messages } from "@/messages/en";

const statusOptions = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export function AdminDestinationList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const params = {
    page,
    limit: 10,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(status ? { status: status as (typeof statusOptions)[number] } : {}),
  };
  const query = useAdminDestinations(params);
  const deleteMutation = useDeleteAdminDestination();
  const statusMutation = useSetAdminDestinationStatus();
  const featuredMutation = useSetAdminDestinationFeatured();
  const actionError = deleteMutation.error ?? statusMutation.error ?? featuredMutation.error;
  const data = query.data?.data ?? [];
  const meta = query.data?.meta;
  const updateStatus = async (id: string, nextStatus: (typeof statusOptions)[number]) => {
    try {
      await statusMutation.mutateAsync({ destinationId: id, status: nextStatus });
    } catch {
      // The mutation error is rendered in the shared alert above.
    }
  };
  const updateFeatured = async (id: string, isFeatured: boolean) => {
    try {
      await featuredMutation.mutateAsync({ id, body: { isFeatured } });
    } catch {
      // The mutation error is rendered in the shared alert above.
    }
  };

  return (
    <section className="admin-page">
      <header className="admin-page-header admin-page-heading-row">
        <div>
          <p className="admin-eyebrow">{messages.admin.title}</p>
          <h1>{messages.admin.destinationsTitle}</h1>
        </div>
        <Link className="button button-primary" href="/admin/destinations/new">{messages.admin.addDestination}</Link>
      </header>
      <div className="admin-filters">
        <label>
          <span>{messages.admin.search}</span>
          <input value={search} maxLength={100} placeholder={messages.admin.searchPlaceholder} onChange={(event) => {
            setSearch(event.currentTarget.value);
            setPage(1);
          }} />
        </label>
        <label>
          <span>{messages.admin.status}</span>
          <select value={status} onChange={(event) => {
            setStatus(event.currentTarget.value);
            setPage(1);
          }}>
            <option value="">{messages.admin.allStatuses}</option>
            {statusOptions.map((option) => <option key={option} value={option}>{messages.admin.destinationStatus[option]}</option>)}
          </select>
        </label>
      </div>
      {actionError && <p className="admin-alert" role="alert">{actionError.message}</p>}
      {query.isPending ? (
        <div className="admin-skeleton-list" aria-label={messages.admin.loading}><div /><div /><div /></div>
      ) : query.isError ? (
        <div className="admin-empty" role="alert">
          <p>{query.error.message || messages.admin.error}</p>
          <button className="button button-outline" type="button" onClick={() => void query.refetch()}>{messages.admin.retry}</button>
        </div>
      ) : data.length === 0 ? (
        <p className="admin-empty">{messages.admin.emptyDestinations}</p>
      ) : (
        <>
          <div className="admin-table-wrap admin-destinations-table">
            <table className="admin-table">
              <thead><tr>
                <th>{messages.admin.name}</th><th>{messages.admin.division}</th><th>{messages.admin.difficulty}</th>
                <th>{messages.admin.status}</th><th>{messages.admin.rating}</th><th>{messages.admin.actions}</th>
              </tr></thead>
              <tbody>{data.map((destination) => (
                <tr key={destination.id}>
                  <td>{destination.name}</td><td>{destination.division}</td>
                  <td>{messages.home.difficulty[destination.difficulty]}</td><td><span className="admin-status">{messages.admin.destinationStatus[destination.status]}</span></td>
                  <td>{destination.avgRating.toFixed(1)} ({destination.reviewCount})</td>
                  <td><DestinationActions destination={destination} onStatus={updateStatus} onDelete={() => {
                    if (window.confirm(messages.admin.confirmDeleteDestination)) {
                      deleteMutation.mutate(destination.id);
                    }
                  }} onFeatured={updateFeatured} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="admin-destination-cards">
            {data.map((destination) => (
              <article className="admin-card" key={destination.id}>
                <div className="admin-card-head"><h2>{destination.name}</h2><span className="admin-status">{messages.admin.destinationStatus[destination.status]}</span></div>
                <p>{destination.division} · {messages.home.difficulty[destination.difficulty]}</p>
                <p>{messages.admin.rating}: {destination.avgRating.toFixed(1)} ({destination.reviewCount})</p>
                <DestinationActions destination={destination} onStatus={updateStatus} onDelete={() => {
                  if (window.confirm(messages.admin.confirmDeleteDestination)) deleteMutation.mutate(destination.id);
                }} onFeatured={updateFeatured} />
              </article>
            ))}
          </div>
          {meta && meta.totalPages > 1 && <div className="admin-pagination" aria-label={messages.destinationsPage.paginationLabel}>
            <button type="button" className="button button-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>{messages.admin.previous}</button>
            <span>{messages.admin.page(page, meta.totalPages)}</span>
            <button type="button" className="button button-outline" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>{messages.admin.next}</button>
          </div>}
        </>
      )}
    </section>
  );
}

function DestinationActions({
  destination, onStatus, onDelete,
  onFeatured,
}: {
  destination: { id: string; status: (typeof statusOptions)[number]; isFeatured: boolean };
  onStatus: (id: string, status: (typeof statusOptions)[number]) => void;
  onDelete: () => void;
  onFeatured: (id: string, isFeatured: boolean) => void;
}) {
  return (
    <div className="admin-row-actions">
      <Link className="button button-outline" href={`/admin/destinations/${destination.id}/edit`}>{messages.admin.edit}</Link>
      <button className="button button-outline" type="button" onClick={() => onStatus(
        destination.id,
        destination.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
      )}>
        {destination.status === "PUBLISHED" ? messages.admin.unpublish : messages.admin.publish}
      </button>
      {destination.status === "PUBLISHED" && (
        <button className="button button-outline" type="button" onClick={() => onFeatured(destination.id, !destination.isFeatured)}>
          {destination.isFeatured ? messages.admin.removeFeatured : messages.admin.markFeatured}
        </button>
      )}
      {destination.status === "DRAFT" ? (
        <button className="button button-outline" type="button" onClick={onDelete}>{messages.admin.delete}</button>
      ) : (
        destination.status === "PUBLISHED" && (
          <button className="button button-outline" type="button" onClick={() => onStatus(destination.id, "ARCHIVED")}>{messages.admin.archive}</button>
        )
      )}
    </div>
  );
}
