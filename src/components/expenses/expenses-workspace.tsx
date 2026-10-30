"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
} from "lucide-react";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { SettlementForm } from "@/components/expenses/settlement-form";
import { useCreateExpense, useCreateSettlement, useDeleteExpense, useDeleteSettlement, useExpenses, useSettlements, useTripBalances, useUpdateExpense } from "@/hooks/use-expenses";
import { useTrip } from "@/hooks/use-trips";
import { authClient } from "@/lib/auth/auth-client";
import { ApiError } from "@/lib/api/client";
import type { CreateExpenseBody, Expense, Settlement } from "@/lib/api/expenses";
import { formatDate, formatMoney } from "@/lib/format";
import { minorUnitsToTaka, takaToMinorUnits } from "@/lib/money";
import { messages } from "@/messages/en";
import { TripTabs } from "@/components/trips/trip-detail";

type ExpensesWorkspaceProps = { tripId: string };
type ExpenseTab = "expenses" | "balances" | "settlements";

const PAGE_LIMIT = 10;

function SkeletonCard() {
  return (
    <div className="trip-detail-section expense-skeleton" aria-hidden="true">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line" />
    </div>
  );
}

function RetryState({
  title,
  error,
  retry,
}: {
  title: string;
  error: unknown;
  retry: () => void;
}) {
  return (
    <section className="trip-state trip-error-state" role="alert">
      <h2>{title}</h2>
      <p>{error instanceof ApiError ? error.message : messages.common.genericError}</p>
      <button className="button button-primary" type="button" onClick={retry}>
        {messages.expenses.retry}
      </button>
    </section>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
  label,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  label: string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="trip-pagination expense-pagination" aria-label={label}>
      <button
        className="button button-outline"
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={17} aria-hidden="true" />
        {messages.expenses.previousPage}
      </button>
      <span>{messages.expenses.page(page, totalPages)}</span>
      <button
        className="button button-outline"
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        {messages.expenses.nextPage}
        <ChevronRight size={17} aria-hidden="true" />
      </button>
    </nav>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : messages.expenses.actionFailed;
}

function ExpenseRow({
  expense,
  canManage,
  busy,
  onEdit,
  onDelete,
}: {
  expense: Expense;
  canManage: boolean;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="expense-row">
      <div className="expense-row-main">
        <div className="expense-row-title">
          <h3>{expense.title}</h3>
          <strong>{formatMoney(expense.amount)}</strong>
        </div>
        <p className="expense-row-meta">
          {messages.expenses.payerLabel}: {expense.paidBy.name}
          <span aria-hidden="true"> · </span>
          <time dateTime={expense.expenseDate}>{formatDate(expense.expenseDate)}</time>
        </p>
        <ul className="expense-row-splits" aria-label={messages.expenses.splitAmong}>
          {expense.splits.map((split) => (
            <li key={split.user.id}>
              <span>{split.user.name}</span>
              <span>{formatMoney(split.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
      {canManage && (
        <div className="expense-row-actions">
          <button className="button button-outline" type="button" onClick={onEdit} disabled={busy}>
            <Pencil size={16} aria-hidden="true" />
            {messages.expenses.editExpense}
          </button>
          <button className="button button-outline" type="button" onClick={onDelete} disabled={busy}>
            <Trash2 size={16} aria-hidden="true" />
            {messages.expenses.deleteExpense}
          </button>
        </div>
      )}
    </article>
  );
}

function ExpenseList({
  expenses,
  canManage,
  busy,
  onEdit,
  onDelete,
}: {
  expenses: Expense[];
  canManage: (expense: Expense) => boolean;
  busy: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}) {
  return (
    <div className="expense-list">
      {expenses.map((expense) => (
        <ExpenseRow
          key={expense.id}
          expense={expense}
          canManage={canManage(expense)}
          busy={busy}
          onEdit={() => onEdit(expense)}
          onDelete={() => onDelete(expense)}
        />
      ))}
    </div>
  );
}

function BalancesPanel({
  tripId,
  currentUserId,
  retry,
}: {
  tripId: string;
  currentUserId?: string;
  retry: () => void;
}) {
  const balancesQuery = useTripBalances(tripId);
  if (balancesQuery.isPending) return <SkeletonCard />;
  if (balancesQuery.isError) {
    return (
      <RetryState
        title={messages.expenses.errorTitle}
        error={balancesQuery.error}
        retry={retry}
      />
    );
  }

  const balances = balancesQuery.data.data;
  const names = new Map(balances.members.map(({ user }) => [user.id, user.name ?? messages.expenses.unknownMember]));
  return (
    <section className="trip-detail-section expense-balances">
      <h2>{messages.expenses.balancesTitle}</h2>
      <ul className="expense-balance-list">
        {balances.members.map(({ user, net }) => {
          const netMinor = takaToMinorUnits(net);
          const name = user.name ?? messages.expenses.unknownMember;
          if (netMinor === 0) {
            return (
              <li className="expense-balance-row is-balanced" key={user.id}>
                <span className="expense-balance-icon"><Check size={18} aria-hidden="true" /></span>
                <span className="expense-balance-name">{name}</span>
                <span className="expense-balance-value">{messages.expenses.balanced}</span>
              </li>
            );
          }
          const amount = formatMoney(minorUnitsToTaka(Math.abs(netMinor)));
          return (
            <li className={`expense-balance-row ${netMinor > 0 ? "is-positive" : "is-negative"}`} key={user.id}>
              <span className="expense-balance-icon">
                {netMinor > 0
                  ? <ArrowDownLeft size={18} aria-hidden="true" />
                  : <ArrowUpRight size={18} aria-hidden="true" />}
              </span>
              <span className="expense-balance-name">{name}</span>
              <span className="expense-balance-value">
                {netMinor > 0 ? messages.expenses.owed(name) : messages.expenses.owes(name)} {amount}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="expense-settlement-suggestions">
        <h3>{messages.expenses.suggestedSettlements}</h3>
        {balances.suggestedTransfers.length === 0 ? (
          <p>{messages.expenses.noSuggestedSettlements}</p>
        ) : (
          <ul>
            {balances.suggestedTransfers.map((transfer, index) => {
              const from = transfer.from.name ?? names.get(transfer.from.id) ?? messages.expenses.unknownMember;
              const to = transfer.to.name ?? names.get(transfer.to.id) ?? messages.expenses.unknownMember;
              return (
                <li key={`${transfer.from.id}-${transfer.to.id}-${index}`}>
                  <span>{messages.expenses.pays(from, to)}</span>
                  <strong>{formatMoney(transfer.amount)}</strong>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {currentUserId && !balances.members.some((item) => item.user.id === currentUserId) && (
        <p className="trip-field-hint">{messages.expenses.noCurrentBalance}</p>
      )}
    </section>
  );
}

function SettlementList({
  settlements,
  currentUserId,
  isOwner,
  isReadOnly,
  busy,
  onDelete,
}: {
  settlements: Settlement[];
  currentUserId?: string;
  isOwner: boolean;
  isReadOnly: boolean;
  busy: boolean;
  onDelete: (settlement: Settlement) => void;
}) {
  if (settlements.length === 0) {
    return (
      <div className="trip-state expense-empty-state">
        <p>{messages.expenses.noSettlements}</p>
      </div>
    );
  }
  return (
    <ul className="expense-settlement-list">
      {settlements.map((settlement) => {
        const canDelete = !isReadOnly && (
          isOwner || settlement.from.id === currentUserId || settlement.to.id === currentUserId
        );
        return (
          <li className="expense-settlement-row" key={settlement.id}>
            <div>
              <strong>{messages.expenses.pays(settlement.from.name, settlement.to.name)}</strong>
              <time dateTime={settlement.settledAt}>{formatDate(settlement.settledAt)}</time>
              {settlement.note && <p>{settlement.note}</p>}
            </div>
            <strong className="expense-settlement-amount">{formatMoney(settlement.amount)}</strong>
            {canDelete && (
              <button
                className="button button-outline"
                type="button"
                disabled={busy}
                aria-label={`${messages.expenses.deleteSettlement}: ${settlement.from.name} → ${settlement.to.name}`}
                onClick={() => onDelete(settlement)}
              >
                <Trash2 size={17} aria-hidden="true" />
                {messages.expenses.deleteSettlement}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ExpensesWorkspaceContent({ tripId }: ExpensesWorkspaceProps) {
  const tripQuery = useTrip(tripId);
  const sessionQuery = authClient.useSession();
  const [activeTab, setActiveTab] = useState<ExpenseTab>("expenses");
  const [expensePage, setExpensePage] = useState(1);
  const [settlementPage, setSettlementPage] = useState(1);
  const [addingExpense, setAddingExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [addingSettlement, setAddingSettlement] = useState(false);
  const [notice, setNotice] = useState("");

  const expensesQuery = useExpenses(tripId, { page: expensePage, limit: PAGE_LIMIT, sort: "newest" });
  const balancesQuery = useTripBalances(tripId);
  const settlementsQuery = useSettlements(tripId, settlementPage, PAGE_LIMIT);
  const createExpenseMutation = useCreateExpense(tripId);
  const updateExpenseMutation = useUpdateExpense(tripId);
  const deleteExpenseMutation = useDeleteExpense(tripId);
  const createSettlementMutation = useCreateSettlement(tripId);
  const deleteSettlementMutation = useDeleteSettlement(tripId);
  const currentUserId = sessionQuery.data?.user.id;

  if (tripQuery.isPending) {
    return (
      <main className="trip-shell expense-workspace" aria-busy="true" aria-label={messages.expenses.loading}>
        <SkeletonCard />
        <SkeletonCard />
      </main>
    );
  }
  if (tripQuery.isError) {
    const isNotFound = tripQuery.error instanceof ApiError && tripQuery.error.isNotFound;
    return (
      <main className="trip-shell">
        <RetryState
          title={isNotFound ? messages.tripsPage.notFoundTitle : messages.expenses.errorTitle}
          error={tripQuery.error}
          retry={() => void tripQuery.refetch()}
        />
      </main>
    );
  }

  const trip = tripQuery.data.data;
  const isOwner = trip.myRole === "OWNER";
  const isReadOnly = trip.status === "CANCELLED";
  const isBusy = deleteExpenseMutation.isPending || createExpenseMutation.isPending || updateExpenseMutation.isPending;
  const canRecordSettlement =
    isOwner || Boolean(currentUserId && trip.members.some((member) => member.id === currentUserId));
  const expenseResult = expensesQuery.data?.data;
  const balanceResult = balancesQuery.data?.data;
  const myBalance = balanceResult?.members.find((member) => member.user.id === currentUserId);
  const myNetMinor = myBalance ? takaToMinorUnits(myBalance.net) : undefined;
  const totalSpent = balanceResult ? formatMoney(balanceResult.totalSpent) : messages.expenses.notAvailable;
  const myShare = myBalance ? formatMoney(myBalance.owed) : messages.expenses.notAvailable;

  async function saveExpense(body: CreateExpenseBody) {
    setNotice("");
    try {
      if (editingExpense) {
        await updateExpenseMutation.mutateAsync({ expenseId: editingExpense.id, body });
      } else {
        await createExpenseMutation.mutateAsync(body);
      }
      setNotice(messages.expenses.expenseSaved);
    } catch (error) {
      setNotice(getErrorMessage(error));
      throw error;
    }
  }

  async function removeExpense(expense: Expense) {
    if (!window.confirm(messages.expenses.deleteExpenseConfirm(expense.title))) return;
    setNotice("");
    const shouldMoveToPreviousPage =
      expensePage > 1 && expensesQuery.data?.data.expenses.length === 1;
    try {
      await deleteExpenseMutation.mutateAsync(expense.id);
      setNotice(messages.expenses.expenseDeleted);
      if (shouldMoveToPreviousPage) {
        setExpensePage((page) => Math.max(1, page - 1));
      }
    } catch (error) {
      setNotice(getErrorMessage(error));
    }
  }

  async function saveSettlement(body: Parameters<typeof createSettlementMutation.mutateAsync>[0]) {
    setNotice("");
    try {
      await createSettlementMutation.mutateAsync(body);
      setNotice(messages.expenses.settlementSaved);
    } catch (error) {
      setNotice(getErrorMessage(error));
      throw error;
    }
  }

  async function removeSettlement(settlement: Settlement) {
    if (!window.confirm(messages.expenses.deleteSettlementConfirm)) return;
    setNotice("");
    const shouldMoveToPreviousPage =
      settlementPage > 1 && settlementsQuery.data?.data.length === 1;
    try {
      await deleteSettlementMutation.mutateAsync(settlement.id);
      setNotice(messages.expenses.settlementDeleted);
      if (shouldMoveToPreviousPage) {
        setSettlementPage((page) => Math.max(1, page - 1));
      }
    } catch (error) {
      setNotice(getErrorMessage(error));
    }
  }

  const tabs: Array<{ key: ExpenseTab; label: string }> = [
    { key: "expenses", label: messages.expenses.expensesTab },
    { key: "balances", label: messages.expenses.balancesTab },
    { key: "settlements", label: messages.expenses.settlementsTab },
  ];

  return (
    <main className="trip-shell trip-detail-page expense-workspace">
      <TripTabs tripId={tripId} current="expenses" />
      <header className="trip-feature-heading expense-page-heading">
        <div>
          <p className="eyebrow">{trip.title}</p>
          <h1>{messages.expenses.title}</h1>
        </div>
        {!isReadOnly && activeTab === "expenses" && !addingExpense && !editingExpense && (
          <button
            className="button button-primary"
            type="button"
            onClick={() => setAddingExpense(true)}
            disabled={trip.members.length === 0}
          >
            <Plus size={18} aria-hidden="true" />
            {messages.expenses.addExpense}
          </button>
        )}
        {!isReadOnly && activeTab === "settlements" && canRecordSettlement && !addingSettlement && (
          <button
            className="button button-primary"
            type="button"
            onClick={() => setAddingSettlement(true)}
            disabled={trip.members.length < 2}
          >
            <Plus size={18} aria-hidden="true" />
            {messages.expenses.recordSettlement}
          </button>
        )}
      </header>

      <section className="expense-summary" aria-label={messages.expenses.title}>
        <article className="expense-summary-card">
          <ReceiptText size={20} aria-hidden="true" />
          <span>{messages.expenses.totalSpent}</span>
          {balancesQuery.isError ? <strong>{messages.expenses.notAvailable}</strong> : <strong>{totalSpent}</strong>}
        </article>
        <article className="expense-summary-card">
          <span>{messages.expenses.myShare}</span>
          <strong>{myShare}</strong>
        </article>
        <article className={`expense-summary-card ${myNetMinor === undefined ? "" : myNetMinor < 0 ? "is-negative" : myNetMinor > 0 ? "is-positive" : "is-balanced"}`}>
          <span>
            {myNetMinor === undefined
              ? messages.expenses.netBalance
              : myNetMinor < 0
                ? messages.expenses.youOwe
                : myNetMinor > 0
                  ? messages.expenses.owedToYou
                  : messages.expenses.settledUp}
          </span>
          <strong>
            {myNetMinor === undefined
              ? messages.expenses.notAvailable
              : myNetMinor === 0
                ? messages.expenses.settledUp
                : formatMoney(minorUnitsToTaka(Math.abs(myNetMinor)))}
          </strong>
        </article>
      </section>
      {balancesQuery.isError && (
        <RetryState
          title={messages.expenses.errorTitle}
          error={balancesQuery.error}
          retry={() => void balancesQuery.refetch()}
        />
      )}
      {isReadOnly && <p className="trip-toast" role="status">{messages.expenses.readOnlyTrip}</p>}
      {notice && <p className="trip-toast trip-toast-error" role="alert">{notice}</p>}

      <nav className="expense-tabs" aria-label={messages.expenses.title}>
        {tabs.map((tab) => (
          <button
            className={activeTab === tab.key ? "is-current" : ""}
            type="button"
            key={tab.key}
            aria-pressed={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "expenses" && (
        <section className="expense-tab-panel">
          {(addingExpense || editingExpense) && !isReadOnly && (
            <ExpenseForm
              key={editingExpense?.id ?? "new-expense"}
              members={trip.members}
              currentUserId={currentUserId}
              expense={editingExpense ?? undefined}
              onSave={saveExpense}
              onCancel={() => {
                setAddingExpense(false);
                setEditingExpense(null);
              }}
            />
          )}
          {expensesQuery.isPending ? (
            <SkeletonCard />
          ) : expensesQuery.isError ? (
            <RetryState
              title={messages.expenses.errorTitle}
              error={expensesQuery.error}
              retry={() => void expensesQuery.refetch()}
            />
          ) : expenseResult && expenseResult.expenses.length > 0 ? (
            <>
              <ExpenseList
                expenses={expenseResult.expenses}
                canManage={(expense) =>
                  !isReadOnly && (isOwner || expense.paidBy.id === currentUserId)
                }
                busy={isBusy}
                onEdit={(expense) => {
                  setAddingExpense(false);
                  setEditingExpense(expense);
                }}
                onDelete={(expense) => void removeExpense(expense)}
              />
              <Pagination
                page={expensesQuery.data.meta?.page ?? expensePage}
                totalPages={expensesQuery.data.meta?.totalPages ?? 1}
                onChange={setExpensePage}
                label={messages.expenses.paginationLabel}
              />
            </>
          ) : (
            <section className="trip-state expense-empty-state">
              <h2>{messages.expenses.noExpenses}</h2>
              <p>{messages.expenses.noExpensesDescription}</p>
            </section>
          )}
        </section>
      )}

      {activeTab === "balances" && (
        <div className="expense-tab-panel">
          {balancesQuery.isPending ? (
            <SkeletonCard />
          ) : balancesQuery.isError ? (
            <RetryState
              title={messages.expenses.errorTitle}
              error={balancesQuery.error}
              retry={() => void balancesQuery.refetch()}
            />
          ) : (
            <BalancesPanel
              tripId={tripId}
              currentUserId={currentUserId}
              retry={() => void balancesQuery.refetch()}
            />
          )}
        </div>
      )}

      {activeTab === "settlements" && (
        <section
          className="expense-tab-panel expense-settlements-panel"
        >
          {addingSettlement && !isReadOnly && (
            <SettlementForm
              key={`settlement-${currentUserId ?? "member"}`}
              members={trip.members}
              currentUserId={currentUserId}
              onSave={saveSettlement}
              onCancel={() => setAddingSettlement(false)}
            />
          )}
          <section className="trip-detail-section">
            <h2>{messages.expenses.settlementHistory}</h2>
            {settlementsQuery.isPending ? (
              <div className="expense-skeleton" aria-busy="true">
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line" />
              </div>
            ) : settlementsQuery.isError ? (
              <RetryState
                title={messages.expenses.errorTitle}
                error={settlementsQuery.error}
                retry={() => void settlementsQuery.refetch()}
              />
            ) : (
              <>
                <SettlementList
                  settlements={settlementsQuery.data.data}
                  currentUserId={currentUserId}
                  isOwner={isOwner}
                  isReadOnly={isReadOnly}
                  busy={deleteSettlementMutation.isPending}
                  onDelete={(settlement) => void removeSettlement(settlement)}
                />
                <Pagination
                  page={settlementsQuery.data.meta?.page ?? settlementPage}
                  totalPages={settlementsQuery.data.meta?.totalPages ?? 1}
                  onChange={setSettlementPage}
                  label={messages.expenses.settlementPaginationLabel}
                />
              </>
            )}
          </section>
        </section>
      )}
    </main>
  );
}

export function ExpensesWorkspace(props: ExpensesWorkspaceProps) {
  return <ExpensesWorkspaceContent {...props} />;
}
