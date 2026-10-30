"use client";

import Link from "next/link";
import { AlertCircle, Star } from "lucide-react";
import { useDestinationRating, useDestinationReviews } from "@/hooks/use-reviews";
import type { DestinationDetail } from "@/lib/api/destinations";
import type { DestinationReviewList } from "@/lib/api/reviews";
import type { ApiResult } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import { messages } from "@/messages/en";

function getReviewPageHref(slug: string, page: number) {
  return `/destinations/${encodeURIComponent(slug)}?page=${page}#reviews`;
}

function ReviewPagination({
  slug,
  page,
  totalPages,
}: {
  slug: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="destination-pagination destination-review-pagination" aria-label={messages.reviews.paginationLabel}>
      {page > 1 ? (
        <Link className="button button-outline" href={getReviewPageHref(slug, page - 1)}>
          {messages.reviews.previousPage}
        </Link>
      ) : (
        <span className="button button-outline is-disabled" aria-disabled="true">
          {messages.reviews.previousPage}
        </span>
      )}
      <span>{messages.reviews.pageLabel(page)}</span>
      {page < totalPages ? (
        <Link className="button button-outline" href={getReviewPageHref(slug, page + 1)}>
          {messages.reviews.nextPage}
        </Link>
      ) : (
        <span className="button button-outline is-disabled" aria-disabled="true">
          {messages.reviews.nextPage}
        </span>
      )}
    </nav>
  );
}

export function DestinationReviewsClient({
  slug,
  page,
  initialReviews,
  initialDestination,
}: {
  slug: string;
  page: number;
  initialReviews: ApiResult<DestinationReviewList>;
  initialDestination: ApiResult<DestinationDetail>;
}) {
  const reviewsQuery = useDestinationReviews(slug, page, initialReviews);
  const destinationQuery = useDestinationRating(slug, initialDestination);
  const reviewResult = reviewsQuery.data;
  const rating = destinationQuery.data?.data;
  const summary = reviewResult?.data.summary;
  const distribution = summary?.distribution;
  const ratings = ["5", "4", "3", "2", "1"] as const;
  const error = reviewsQuery.error ?? destinationQuery.error;

  return (
    <section className="destination-reviews" id="reviews" aria-labelledby="destination-reviews-title">
      <div className="destination-reviews-heading">
        <div>
          <h2 id="destination-reviews-title">{messages.destinationsPage.reviewsTitle}</h2>
          <p>
            <Star size={17} fill="currentColor" aria-hidden="true" />
            {rating
              ? messages.reviews.ratingAndReviews(rating.avgRating.toFixed(1), rating.reviewCount)
              : summary
                ? messages.reviews.ratingAndReviews(summary.avgRating.toFixed(1), summary.reviewCount)
                : messages.reviews.loadError}
          </p>
        </div>
        {distribution && (
          <div className="destination-rating-distribution" aria-label={messages.destinationsPage.reviewsTitle}>
            {ratings.map((value) => (
              <span key={value}>
                <span>{messages.reviews.distribution(Number(value), distribution[value])}</span>
                <Star size={14} aria-hidden="true" />
                <strong>{distribution[value]}</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      {(reviewsQuery.isError || destinationQuery.isError) && (
        <div className="data-state destination-load-error" role="alert">
          <span className="state-icon"><AlertCircle size={23} aria-hidden="true" /></span>
          <p>{error instanceof Error ? error.message : messages.reviews.loadError}</p>
          <button
            className="button button-outline"
            type="button"
            onClick={() => {
              void reviewsQuery.refetch();
              void destinationQuery.refetch();
            }}
          >
            {messages.reviews.retry}
          </button>
        </div>
      )}

      {reviewResult?.data.items.length === 0 ? (
        <div className="destination-review-empty">
          <h3>{messages.reviews.noReviewsTitle}</h3>
          <p>{messages.reviews.noReviewsDescription}</p>
        </div>
      ) : (
        <div className="destination-review-list">
          {reviewResult?.data.items.map((review) => (
            <article className="destination-review-card" key={review.id}>
              <div className="destination-review-card-heading">
                <h3>{review.user.name || messages.reviews.anonymousReviewer}</h3>
                <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
              </div>
              <p
                className="destination-review-stars"
                aria-label={messages.reviews.ratingChoice(review.rating)}
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    size={16}
                    aria-hidden="true"
                    fill={index < review.rating ? "currentColor" : "none"}
                  />
                ))}
                <span>{messages.reviews.ratingChoice(review.rating)}</span>
              </p>
              {review.comment && <p className="destination-review-comment">{review.comment}</p>}
            </article>
          ))}
        </div>
      )}
      {reviewResult?.meta && (
        <ReviewPagination
          slug={slug}
          page={reviewResult.meta.page}
          totalPages={reviewResult.meta.totalPages}
        />
      )}
    </section>
  );
}
