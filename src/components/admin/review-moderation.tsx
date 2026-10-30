"use client";

import { useState } from "react";
import {
  useAdminReviews,
  useDeleteAdminReview,
  useSetAdminReviewVisibility,
} from "@/hooks/use-admin";
import { messages } from "@/messages/en";

export function AdminReviewModeration() {
  const [page, setPage] = useState(1);
  const [visibility, setVisibility] = useState("");
  const [rating, setRating] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const params = {
    page,
    limit: 10,
    ...(visibility ? { isHidden: visibility as "true" | "false" } : {}),
    ...(rating ? { rating: Number(rating) } : {}),
    ...(destinationId.trim() ? { destinationId: destinationId.trim() } : {}),
  };
  const query = useAdminReviews(params);
  const visibilityMutation = useSetAdminReviewVisibility();
  const deleteMutation = useDeleteAdminReview();
  const actionError = visibilityMutation.error ?? deleteMutation.error;
  const reviews = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <section className="admin-page">
      <header className="admin-page-header">
        <p className="admin-eyebrow">{messages.admin.title}</p>
        <h1>{messages.admin.reviewsTitle}</h1>
      </header>
      <div className="admin-filters admin-review-filters">
        <label><span>{messages.admin.reviewFilter}</span>
          <select value={visibility} onChange={(event) => {
            setVisibility(event.currentTarget.value);
            setPage(1);
          }}>
            <option value="">{messages.admin.allReviews}</option>
            <option value="false">{messages.admin.visibleReviews}</option>
            <option value="true">{messages.admin.hiddenReviews}</option>
          </select>
        </label>
        <label><span>{messages.admin.ratingFilter}</span>
          <select value={rating} onChange={(event) => {
            setRating(event.currentTarget.value);
            setPage(1);
          }}>
            <option value="">{messages.admin.allRatings}</option>
            {[5, 4, 3, 2, 1].map((score) => <option key={score} value={score}>{score}</option>)}
          </select>
        </label>
        <label><span>{messages.admin.destinationFilter}</span>
          <input value={destinationId} onChange={(event) => {
            setDestinationId(event.currentTarget.value);
            setPage(1);
          }} />
        </label>
      </div>
      {actionError && <p className="admin-alert" role="alert">{actionError.message}</p>}
      {query.isPending ? (
        <div className="admin-skeleton-list"><div /><div /><div /></div>
      ) : query.isError ? (
        <div className="admin-empty" role="alert"><p>{query.error.message || messages.admin.error}</p><button className="button button-outline" type="button" onClick={() => void query.refetch()}>{messages.admin.retry}</button></div>
      ) : reviews.length === 0 ? (
        <p className="admin-empty">{messages.admin.emptyReviews}</p>
      ) : (
        <>
          <div className="admin-review-list">
            {reviews.map((review) => <article className="admin-card admin-review-card" key={review.id}>
              <header className="admin-card-head">
                <h2>{review.destination.name}</h2>
                <span className="admin-status">{review.isHidden ? messages.admin.hiddenReviews : messages.admin.visibleReviews}</span>
              </header>
              <dl className="admin-review-meta">
                <div><dt>{messages.admin.reviewer}</dt><dd>{review.user.name}</dd></div>
                <div><dt>{messages.admin.rating}</dt><dd>{review.rating}/5</dd></div>
                <div><dt>{messages.admin.destination}</dt><dd>{review.destination.name}</dd></div>
                <div><dt>{messages.expenses.dateLabel}</dt><dd>{new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(new Date(review.createdAt))}</dd></div>
              </dl>
              <p>{review.comment || messages.admin.noComment}</p>
              <div className="admin-row-actions">
                <button className="button button-outline" type="button" disabled={visibilityMutation.isPending} onClick={() => {
                  visibilityMutation.mutate({ id: review.id, body: { isHidden: !review.isHidden } });
                }}>{review.isHidden ? messages.admin.show : messages.admin.hide}</button>
                <button className="button button-outline" type="button" disabled={deleteMutation.isPending} onClick={() => {
                  if (window.confirm(messages.admin.reviewDeleteConfirm)) deleteMutation.mutate(review.id);
                }}>{messages.admin.delete}</button>
              </div>
            </article>)}
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
