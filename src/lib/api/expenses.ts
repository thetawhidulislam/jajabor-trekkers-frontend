import { api } from "@/lib/api/client";
import type { paths } from "@/types/api";

export type ExpenseListParams = NonNullable<
  paths["/api/v1/trips/{tripId}/expenses"]["get"]["parameters"]["query"]
>;
export type CreateExpenseBody = NonNullable<
  paths["/api/v1/trips/{tripId}/expenses"]["post"]["requestBody"]
>["content"]["application/json"];
export type UpdateExpenseBody = NonNullable<
  paths["/api/v1/trips/{tripId}/expenses/{expenseId}"]["patch"]["requestBody"]
>["content"]["application/json"];
export type CreateSettlementBody = NonNullable<
  paths["/api/v1/trips/{tripId}/expenses/settlements"]["post"]["requestBody"]
>["content"]["application/json"];
export type ExpenseCategory = NonNullable<CreateExpenseBody["category"]>;

export type ExpenseUser = { id: string; name: string };

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
  note: string | null;
  paidBy: ExpenseUser;
  splits: Array<{ user: ExpenseUser; amount: number }>;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseList = {
  expenses: Expense[];
  summary: { totalSpent: number; count: number };
};

export type TripBalances = {
  members: Array<{
    user: { id: string; name: string | null };
    paid: number;
    owed: number;
    settledSent: number;
    settledReceived: number;
    net: number;
  }>;
  suggestedTransfers: Array<{
    from: { id: string; name: string | null };
    to: { id: string; name: string | null };
    amount: number;
  }>;
  totalSpent: number;
};

export type Settlement = {
  id: string;
  from: ExpenseUser;
  to: ExpenseUser;
  amount: number;
  note: string | null;
  settledAt: string;
  createdAt: string;
  updatedAt: string;
};

const tripExpensesUrl = (tripId: string) =>
  `/api/v1/trips/${encodeURIComponent(tripId)}/expenses`;

export function listExpenses(tripId: string, params: ExpenseListParams = {}) {
  return api.get<ExpenseList>(tripExpensesUrl(tripId), { query: params });
}

export function createExpense(tripId: string, body: CreateExpenseBody) {
  return api.post<Expense>(tripExpensesUrl(tripId), body);
}

export function updateExpense(tripId: string, expenseId: string, body: UpdateExpenseBody) {
  return api.patch<Expense>(
    `${tripExpensesUrl(tripId)}/${encodeURIComponent(expenseId)}`,
    body,
  );
}

export function deleteExpense(tripId: string, expenseId: string) {
  return api.delete<{ id: string }>(
    `${tripExpensesUrl(tripId)}/${encodeURIComponent(expenseId)}`,
  );
}

export function getTripBalances(tripId: string) {
  return api.get<TripBalances>(`${tripExpensesUrl(tripId)}/balances`);
}

export function listSettlements(
  tripId: string,
  params: { page?: number; limit?: number } = {},
) {
  return api.get<Settlement[]>(`${tripExpensesUrl(tripId)}/settlements`, { query: params });
}

export function createSettlement(tripId: string, body: CreateSettlementBody) {
  return api.post<Settlement>(`${tripExpensesUrl(tripId)}/settlements`, body);
}

export function deleteSettlement(tripId: string, settlementId: string) {
  return api.delete<{ id: string }>(
    `${tripExpensesUrl(tripId)}/settlements/${encodeURIComponent(settlementId)}`,
  );
}
