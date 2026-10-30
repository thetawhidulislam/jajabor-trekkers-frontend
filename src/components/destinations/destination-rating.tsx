"use client";

import { Star } from "lucide-react";
import { useDestinationRating } from "@/hooks/use-reviews";
import type { DestinationDetail } from "@/lib/api/destinations";
import type { ApiResult } from "@/lib/api/client";
import { messages } from "@/messages/en";

export function DestinationRating({
  slug,
  initialData,
}: {
  slug: string;
  initialData: ApiResult<DestinationDetail>;
}) {
  const query = useDestinationRating(slug, initialData);
  const destination = query.data?.data ?? initialData.data;
  return (
    <p
      className="destination-detail-rating"
      aria-label={messages.reviews.destinationRating(
        destination.avgRating,
        destination.reviewCount,
      )}
    >
      <Star size={16} fill="currentColor" aria-hidden="true" />
      {messages.home.destinations.reviews(destination.reviewCount)} · {destination.avgRating.toFixed(1)}
    </p>
  );
}
