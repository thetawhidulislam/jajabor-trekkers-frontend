import { AlertCircle } from "lucide-react";
import { DestinationRetryButton } from "@/components/destinations/destination-retry-button";
import { ApiError } from "@/lib/api/client";
import { listDestinationReviews } from "@/lib/api/reviews";
import { messages } from "@/messages/en";
import { DestinationReviewsClient } from "@/components/destinations/destination-reviews-client";
import type { DestinationDetail } from "@/lib/api/destinations";
import type { ApiResult } from "@/lib/api/client";
import type { DestinationReviewList } from "@/lib/api/reviews";

type ReviewPageParams = Record<string, string | string[] | undefined>;

function getReviewPage(value: string | string[] | undefined) {
  const rawPage = Array.isArray(value) ? value[0] : value;
  const page = Number(rawPage);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
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
  destination,
}: {
  slug: string;
  searchParams: Promise<ReviewPageParams>;
  destination: ApiResult<DestinationDetail>;
}) {
  const params = await searchParams;
  const page = getReviewPage(params.page);
  let outcome: { success: true; result: ApiResult<DestinationReviewList> }
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
          <span className="state-icon"><AlertCircle size={23} aria-hidden="true" /></span>
          <p>{outcome.message}</p>
          <DestinationRetryButton />
        </div>
      </section>
    );
  }

  return (
    <DestinationReviewsClient
      slug={slug}
      page={outcome.result.meta?.page ?? page}
      initialReviews={outcome.result}
      initialDestination={destination}
    />
  );
}
