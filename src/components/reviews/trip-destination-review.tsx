"use client";

import { useState } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";
import { ReviewForm } from "@/components/reviews/review-form";
import { useDestinationRating, useDestinationReviews, useDeleteMyDestinationReview, useMyDestinationReview } from "@/hooks/use-reviews";
import { ApiError } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import { messages } from "@/messages/en";

type TripDestinationReviewProps = {
  slug: string;
  destinationName: string;
};

export function TripDestinationReview({ slug, destinationName }: TripDestinationReviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notice, setNotice] = useState<{ message: string; isError: boolean } | null>(null);
  const myReviewQuery = useMyDestinationReview(slug);
  const ratingQuery = useDestinationRating(slug);
  useDestinationReviews(slug, 1);
  const deleteMutation = useDeleteMyDestinationReview(slug);
  const review = myReviewQuery.data?.data.review;

  async function deleteReview() {
    if (!window.confirm(messages.reviews.deleteConfirm(destinationName))) return;
    setNotice(null);
    try {
      await deleteMutation.mutateAsync();
      setNotice({ message: messages.reviews.deleted, isError: false });
      setIsEditing(false);
    } catch (error) {
      setNotice({
        message: error instanceof ApiError ? error.message : messages.common.genericError,
        isError: true,
      });
    }
  }

  return (
    <section className="trip-detail-section trip-destination-review" aria-labelledby="trip-review-heading">
      <div className="trip-destination-review-heading">
        <div>
          <p className="eyebrow">{messages.reviews.eyebrow}</p>
          <h2 id="trip-review-heading">{messages.reviews.title(destinationName)}</h2>
        </div>
        {ratingQuery.data && (
          <p className="trip-destination-review-rating" aria-label={messages.reviews.destinationRating(
            ratingQuery.data.data.avgRating,
            ratingQuery.data.data.reviewCount,
          )}>
            <Star size={18} fill="currentColor" aria-hidden="true" />
            <strong>{ratingQuery.data.data.avgRating.toFixed(1)}</strong>
            <span>{messages.reviews.reviewCount(ratingQuery.data.data.reviewCount)}</span>
          </p>
        )}
      </div>

      {ratingQuery.isError && (
        <div className="review-inline-error" role="alert">
          <p>{ratingQuery.error instanceof ApiError ? ratingQuery.error.message : messages.common.genericError}</p>
          <button className="button button-outline" type="button" onClick={() => void ratingQuery.refetch()}>
            {messages.reviews.retry}
          </button>
        </div>
      )}
      {notice && (
        <p
          className={notice.isError ? "trip-toast trip-toast-error" : "trip-toast"}
          role={notice.isError ? "alert" : "status"}
        >
          {notice.message}
        </p>
      )}
      {myReviewQuery.isPending ? (
        <div className="review-card-skeleton" aria-busy="true">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
        </div>
      ) : myReviewQuery.isError ? (
        <div className="review-inline-error" role="alert">
          <p>{myReviewQuery.error instanceof ApiError
            ? myReviewQuery.error.message
            : messages.common.genericError}</p>
          <button className="button button-outline" type="button" onClick={() => void myReviewQuery.refetch()}>
            {messages.reviews.retry}
          </button>
        </div>
      ) : review && !isEditing ? (
        <div className="trip-my-review">
          <div className="trip-my-review-heading">
            <p className="review-stars" aria-label={messages.reviews.ratingChoice(review.rating)}>
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  size={18}
                  aria-hidden="true"
                  fill={index < review.rating ? "currentColor" : "none"}
                />
              ))}
              <span>{messages.reviews.ratingChoice(review.rating)}</span>
            </p>
            <time dateTime={review.createdAt}>
              {formatDate(review.createdAt)}
            </time>
          </div>
          {review.comment && (
            <p className="trip-my-review-comment">{review.comment}</p>
          )}
          <div className="trip-form-actions">
            <button
              className="button button-outline"
              type="button"
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={16} aria-hidden="true" />
              {messages.reviews.edit}
            </button>
            <button
              className="button button-outline"
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => void deleteReview()}
            >
              <Trash2 size={16} aria-hidden="true" />
              {messages.reviews.delete}
            </button>
          </div>
        </div>
      ) : review ? (
        <ReviewForm
          key={review.id}
          slug={slug}
          review={review}
          onSaved={() => {
            setIsEditing(false);
            setNotice({ message: messages.reviews.updated, isError: false });
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : myReviewQuery.data.data.canReview ? (
        <ReviewForm
          slug={slug}
          onSaved={() => setNotice({ message: messages.reviews.created, isError: false })}
        />
      ) : (
        <p className="review-eligibility-note">{messages.reviews.notEligible}</p>
      )}
    </section>
  );
}
