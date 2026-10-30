"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createExpense,
  createSettlement,
  deleteExpense,
  deleteSettlement,
  getTripBalances,
  listExpenses,
  listSettlements,
  updateExpense,
  type CreateExpenseBody,
  type CreateSettlementBody,
  type ExpenseListParams,
  type UpdateExpenseBody,
} from "@/lib/api/expenses";
import { queryKeys } from "@/lib/query-keys";

export function useExpenses(tripId: string, params: ExpenseListParams = {}) {
  return useQuery({
    queryKey: queryKeys.expenses.list(tripId, params),
    queryFn: () => listExpenses(tripId, params),
    enabled: tripId.length > 0,
  });
}

export function useTripBalances(tripId: string) {
  return useQuery({
    queryKey: queryKeys.expenses.balances(tripId),
    queryFn: () => getTripBalances(tripId),
    enabled: tripId.length > 0,
  });
}

export function useSettlements(tripId: string, page: number, limit = 10) {
  return useQuery({
    queryKey: queryKeys.expenses.settlements(tripId, page, limit),
    queryFn: () => listSettlements(tripId, { page, limit }),
    enabled: tripId.length > 0,
  });
}

function invalidateExpenseData(queryClient: ReturnType<typeof useQueryClient>, tripId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists(tripId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses.balances(tripId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses.settlementLists(tripId) }),
  ]);
}

export function useCreateExpense(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateExpenseBody) => createExpense(tripId, body),
    onSuccess: () => invalidateExpenseData(queryClient, tripId),
  });
}

export function useUpdateExpense(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, body }: { expenseId: string; body: UpdateExpenseBody }) =>
      updateExpense(tripId, expenseId, body),
    onSuccess: () => invalidateExpenseData(queryClient, tripId),
  });
}

export function useDeleteExpense(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => deleteExpense(tripId, expenseId),
    onSuccess: () => invalidateExpenseData(queryClient, tripId),
  });
}

export function useCreateSettlement(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSettlementBody) => createSettlement(tripId, body),
    onSuccess: () => invalidateExpenseData(queryClient, tripId),
  });
}

export function useDeleteSettlement(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settlementId: string) => deleteSettlement(tripId, settlementId),
    onSuccess: () => invalidateExpenseData(queryClient, tripId),
  });
}
