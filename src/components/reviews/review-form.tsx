"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { ApiError } from "@/lib/api/client";
import { useCreateDestinationReview, useUpdateMyDestinationReview } from "@/hooks/use-reviews";
import type { DestinationReview } from "@/lib/api/reviews";
import { reviewFormSchema } from "@/lib/validation/review";
import { messages } from "@/messages/en";

type ReviewFormProps = {
  slug: string;
  review?: DestinationReview;
  onSaved: () => void;
  onCancel?: () => void;
};

function validationMessages(errors: readonly unknown[]) {
  return errors.flatMap((error) => {
    if (typeof error === "string") return [error];
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
    ) return [error.message];
    return [];
  });
}

export function ReviewForm({ slug, review, onSaved, onCancel }: ReviewFormProps) {
  const [serverError, setServerError] = useState("");
  const createMutation = useCreateDestinationReview(slug);
  const updateMutation = useUpdateMyDestinationReview(slug);
  const form = useForm({
    defaultValues: {
      rating: review?.rating ?? 5,
      comment: review?.comment ?? "",
    },
    validators: { onSubmit: reviewFormSchema },
    onSubmit: async ({ value }) => {
      setServerError("");
      const body = {
        rating: value.rating,
        ...(value.comment.trim() ? { comment: value.comment.trim() } : {}),
      };
      try {
        if (review) {
          await updateMutation.mutateAsync(body);
        } else {
          await createMutation.mutateAsync(body);
        }
        onSaved();
      } catch (error) {
        setServerError(
          error instanceof ApiError ? error.message : messages.common.genericError,
        );
      }
    },
  });
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form
      className="trip-form review-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      {serverError && <p className="trip-toast trip-toast-error" role="alert">{serverError}</p>}
      <form.Field name="rating">
        {(field) => {
          const errors = validationMessages(field.state.meta.errors);
          return (
            <fieldset className="review-rating-field">
              <legend>{messages.reviews.ratingLabel}</legend>
              <div className="review-rating-options">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <label className="review-rating-option" key={rating}>
                    <input
                      type="radio"
                      name="review-rating"
                      value={rating}
                      checked={field.state.value === rating}
                      aria-label={messages.reviews.ratingChoice(rating)}
                      onBlur={field.handleBlur}
                      onChange={() => field.handleChange(rating)}
                    />
                    <Star
                      size={22}
                      aria-hidden="true"
                      fill={field.state.value >= rating ? "currentColor" : "none"}
                    />
                    <span>{rating}</span>
                  </label>
                ))}
                <span className="review-rating-text">
                  {messages.reviews.ratingChoice(field.state.value)}
                </span>
              </div>
              {errors.length > 0 && <span className="trip-field-error">{errors.join(" ")}</span>}
            </fieldset>
          );
        }}
      </form.Field>
      <form.Field name="comment">
        {(field) => {
          const errors = validationMessages(field.state.meta.errors);
          return (
            <div className="trip-form-field">
              <label htmlFor="destination-review-comment">{messages.reviews.commentLabel}</label>
              <textarea
                id="destination-review-comment"
                maxLength={1000}
                rows={4}
                value={field.state.value ?? ""}
                placeholder={messages.reviews.commentPlaceholder}
                aria-invalid={errors.length > 0}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
              />
              <span className="trip-field-hint">
                {messages.reviews.commentHint}
                {review?.comment ? ` ${messages.reviews.commentCannotClear}` : ""}
              </span>
              {errors.length > 0 && <span className="trip-field-error">{errors.join(" ")}</span>}
            </div>
          );
        }}
      </form.Field>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <div className="trip-form-actions">
            {onCancel && (
              <button
                className="button button-outline"
                type="button"
                onClick={onCancel}
                disabled={isPending}
              >
                {messages.reviews.cancel}
              </button>
            )}
            <button className="button button-primary" type="submit" disabled={isSubmitting || isPending}>
              {isPending
                ? messages.reviews.saving
                : review
                  ? messages.reviews.saveChanges
                  : messages.reviews.submit}
            </button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
