import Link from "next/link";
import { AlertCircle, Star } from "lucide-react";
import { DestinationRetryButton } from "@/components/destinations/destination-retry-button";
import { ApiError } from "@/lib/api/client";
import { listDestinationReviews } from "@/lib/api/reviews";
import { messages } from "@/messages/en";

type ReviewPageParams = Record<string, string | string[] | undefined>;

function getReviewPage(value: string | string[] | undefined) {
  const rawPage = Array.isArray(value) ? value[0] : value;
  const page = Number(rawPage);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function getReviewPageHref(slug: string, page: number) {
  return `/destinations/${encodeURIComponent(slug)}?page=${page}#reviews`;
}

function reviewFields(item: unknown) {
  if (typeof item !== "object" || item === null || Array.isArray(item)) return [];

  return Object.entries(item).flatMap(([key, value]) => {
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
      return [];
    }
    return [{
      label: messages.destinationsPage.reviewFieldLabel(key),
      value: String(value),
    }];
  });
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
    <nav className="destination-pagination destination-review-pagination" aria-label={messages.destinationsPage.paginationLabel}>
      {page > 1 ? (
        <Link className="button button-outline" href={getReviewPageHref(slug, page - 1)}>
          {messages.destinationsPage.previousPage}
        </Link>
      ) : (
        <span className="button button-outline is-disabled" aria-disabled="true">
          {messages.destinationsPage.previousPage}
        </span>
      )}
      <span>{messages.destinationsPage.pageLabel(page)}</span>
      {page < totalPages ? (
        <Link className="button button-outline" href={getReviewPageHref(slug, page + 1)}>
          {messages.destinationsPage.nextPage}
        </Link>
      ) : (
        <span className="button button-outline is-disabled" aria-disabled="true">
          {messages.destinationsPage.nextPage}
        </span>
      )}
    </nav>
  );
}

export function DestinationReviewsSkeleton() {
  return (
    <section className="destination-reviews" id="reviews" aria-busy="true">
      <h2>{messages.destinationsPage.reviewsTitle}</h2>
      <div className="destination-review-skeleton" />
      <div className="destination-review-skeleton" />
    </section>
  );
}

export async function DestinationReviews({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams: Promise<ReviewPageParams>;
}) {
  const params = await searchParams;
  const page = getReviewPage(params.page);
  let outcome:
    | { success: true; result: Awaited<ReturnType<typeof listDestinationReviews>> }
    | { success: false; message: string };

  try {
    const result = await listDestinationReviews(slug, page);
    outcome = { success: true, result };
  } catch (error) {
    outcome = {
      success: false,
      message: error instanceof ApiError ? error.message : messages.common.genericError,
    };
  }

  if (!outcome.success) {
    return (
      <section className="destination-reviews" id="reviews" role="alert">
        <h2>{messages.destinationsPage.reviewsTitle}</h2>
        <div className="data-state destination-load-error">
          <span className="state-icon"><AlertCircle size={23} /></span>
          <p>{outcome.message}</p>
          <DestinationRetryButton />
        </div>
      </section>
    );
  }

  const { result } = outcome;
  const { summary } = result.data;
  const ratings = ["5", "4", "3", "2", "1"] as const;
  return (
    <section className="destination-reviews" id="reviews" aria-labelledby="destination-reviews-title">
      <div className="destination-reviews-heading">
        <div>
          <h2 id="destination-reviews-title">{messages.destinationsPage.reviewsTitle}</h2>
          <p>
            <Star size={17} fill="currentColor" />
            {messages.destinationsPage.reviewsSummary(
              summary.avgRating.toFixed(1),
              summary.reviewCount,
            )}
          </p>
        </div>
        <div className="destination-rating-distribution" aria-label={messages.destinationsPage.reviewsTitle}>
          {ratings.map((rating) => (
            <span key={rating}>
              <span>{messages.destinationsPage.reviewDistribution(
                Number(rating),
                summary.distribution[rating],
              )}</span>
              <Star size={14} aria-hidden="true" />
              <strong>{summary.distribution[rating]}</strong>
            </span>
          ))}
        </div>
      </div>

      {result.data.items.length === 0 ? (
        <div className="destination-review-empty">
          <h3>{messages.destinationsPage.noReviewsTitle}</h3>
          <p>{messages.destinationsPage.noReviewsDescription}</p>
        </div>
      ) : (
        <div className="destination-review-list">
          {result.data.items.map((item, index) => {
            const fields = reviewFields(item);
            return (
              <article className="destination-review-card" key={index}>
                <h3>{messages.destinationsPage.reviewInformation}</h3>
                {fields.length > 0 && (
                  <dl>
                    {fields.map(({ label, value }) => (
                      <div key={`${label}-${value}`}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </article>
            );
          })}
        </div>
      )}
      {result.meta && (
        <ReviewPagination slug={slug} page={result.meta.page} totalPages={result.meta.totalPages} />
      )}
    </section>
  );
}
