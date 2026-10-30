import { api } from "@/lib/api/client";
import type { paths } from "@/types/api";

type ItineraryPath = "/api/v1/trips/{tripId}/itinerary";
type ItineraryItemPath = "/api/v1/trips/{tripId}/itinerary/{itemId}";
type ItineraryReorderPath = "/api/v1/trips/{tripId}/itinerary/reorder";

export type CreateItineraryItemBody = NonNullable<
  paths[ItineraryPath]["post"]["requestBody"]
>["content"]["application/json"];
export type UpdateItineraryItemBody = NonNullable<
  paths[ItineraryItemPath]["patch"]["requestBody"]
>["content"]["application/json"];
export type ReorderItineraryBody = NonNullable<
  paths[ItineraryReorderPath]["patch"]["requestBody"]
>["content"]["application/json"];

export type ItineraryItem = {
  id: string;
  dayNumber: number;
  startTime: string | null;
  title: string;
  description: string | null;
  location: string | null;
  estimatedCost: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ItineraryDay = {
  dayNumber: number;
  items: ItineraryItem[];
};

export type Itinerary = {
  days: ItineraryDay[];
  totalEstimatedCost: number;
};

const tripPath = (tripId: string) =>
  `/api/v1/trips/${encodeURIComponent(tripId)}/itinerary`;

export function getItinerary(tripId: string, signal?: AbortSignal) {
  return api.get<Itinerary>(tripPath(tripId), { signal });
}

export function createItineraryItem(tripId: string, body: CreateItineraryItemBody) {
  return api.post<ItineraryItem>(tripPath(tripId), body);
}

export function updateItineraryItem(
  tripId: string,
  itemId: string,
  body: UpdateItineraryItemBody,
) {
  return api.patch<ItineraryItem>(
    `${tripPath(tripId)}/${encodeURIComponent(itemId)}`,
    body,
  );
}

export function deleteItineraryItem(tripId: string, itemId: string) {
  return api.delete<{ id: string }>(
    `${tripPath(tripId)}/${encodeURIComponent(itemId)}`,
  );
}

export function reorderItineraryItems(tripId: string, body: ReorderItineraryBody) {
  return api.patch<{ dayNumber: number; itemIds: string[] }>(
    `${tripPath(tripId)}/reorder`,
    body,
  );
}
