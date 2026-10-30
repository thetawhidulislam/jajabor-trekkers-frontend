"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPackingItem,
  deletePackingItem,
  listPackingItems,
  updatePackingItem,
  type CreatePackingItemBody,
  type PackingListData,
  type UpdatePackingItemBody,
} from "@/lib/api/packing";
import { queryKeys } from "@/lib/query-keys";

export function usePackingList(tripId: string) {
  return useQuery({
    queryKey: queryKeys.packing.list(tripId),
    enabled: tripId.length > 0,
    queryFn: async ({ signal }) => {
      const firstPage = await listPackingItems(tripId, { page: 1, limit: 50 }, signal);
      const totalPages = firstPage.meta?.totalPages ?? 1;
      const remainingPages =
        totalPages <= 1
          ? []
          : await Promise.all(
              Array.from({ length: totalPages - 1 }, (_, index) =>
                listPackingItems(tripId, { page: index + 2, limit: 50 }, signal),
              ),
            );
      return {
        ...firstPage,
        data: {
          ...firstPage.data,
          items: [
            ...firstPage.data.items,
            ...remainingPages.flatMap(({ data }) => data.items),
          ],
        } satisfies PackingListData,
      };
    },
  });
}

export function useCreatePackingItem(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePackingItemBody) => createPackingItem(tripId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.packing.list(tripId) }),
  });
}

export function useUpdatePackingItem(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, body }: { itemId: string; body: UpdatePackingItemBody }) =>
      updatePackingItem(tripId, itemId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.packing.list(tripId) }),
  });
}

export function useTogglePackingItem(tripId: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.packing.list(tripId);
  return useMutation({
    mutationFn: ({ itemId, isPacked }: { itemId: string; isPacked: boolean }) =>
      updatePackingItem(tripId, itemId, { isPacked }),
    onMutate: async ({ itemId, isPacked }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Awaited<ReturnType<typeof listPackingItems>>>(queryKey);
      queryClient.setQueryData<Awaited<ReturnType<typeof listPackingItems>>>(queryKey, (current) =>
        current
          ? {
              ...current,
              data: {
                ...current.data,
                items: current.data.items.map((item) => item.id === itemId
                  ? { ...item, isPacked }
                  : item),
                summary: {
                  ...current.data.summary,
                  packed: current.data.summary.packed + (
                    current.data.items.find((item) => item.id === itemId)?.isPacked === isPacked
                      ? 0
                      : isPacked ? 1 : -1
                  ),
                },
              },
            }
          : current,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

export function useDeletePackingItem(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deletePackingItem(tripId, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.packing.list(tripId) }),
  });
}
