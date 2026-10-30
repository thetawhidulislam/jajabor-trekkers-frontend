import { api } from "@/lib/api/client";
import type { paths } from "@/types/api";

type PackingPath = "/api/v1/trips/{tripId}/packing";
type PackingItemPath = "/api/v1/trips/{tripId}/packing/{itemId}";

export type PackingListParams = NonNullable<
  paths[PackingPath]["get"]["parameters"]["query"]
>;
export type CreatePackingItemBody = NonNullable<
  paths[PackingPath]["post"]["requestBody"]
>["content"]["application/json"];
export type UpdatePackingItemBody = NonNullable<
  paths[PackingItemPath]["patch"]["requestBody"]
>["content"]["application/json"];

export type PackingPerson = { id: string; name: string };

export type PackingItem = {
  id: string;
  name: string;
  category: string | null;
  quantity: number;
  isPacked: boolean;
  gearItem: PackingPerson | null;
  assignedTo: PackingPerson | null;
  addedBy: PackingPerson;
};

export type PackingListData = {
  items: PackingItem[];
  summary: { total: number; packed: number };
};

const tripPath = (tripId: string) =>
  `/api/v1/trips/${encodeURIComponent(tripId)}/packing`;

export function listPackingItems(
  tripId: string,
  params: PackingListParams = {},
  signal?: AbortSignal,
) {
  return api.get<PackingListData>(tripPath(tripId), { query: params, signal });
}

export function createPackingItem(tripId: string, body: CreatePackingItemBody) {
  return api.post<PackingItem>(tripPath(tripId), body);
}

export function updatePackingItem(
  tripId: string,
  itemId: string,
  body: UpdatePackingItemBody,
) {
  return api.patch<PackingItem>(
    `${tripPath(tripId)}/${encodeURIComponent(itemId)}`,
    body,
  );
}

export function deletePackingItem(tripId: string, itemId: string) {
  return api.delete<{ id: string }>(
    `${tripPath(tripId)}/${encodeURIComponent(itemId)}`,
  );
}
