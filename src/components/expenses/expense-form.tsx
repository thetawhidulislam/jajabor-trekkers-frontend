"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  minorUnitsToTaka,
  positiveTakaToMinorUnits,
  splitEquallyMinor,
  sumMinorUnits,
  takaToMinorUnits,
} from "@/lib/money";
import type { CreateExpenseBody, Expense } from "@/lib/api/expenses";
import type { TripMember } from "@/lib/api/trips";
import { expenseFormSchema, type ExpenseFormValues } from "@/lib/validation/expense";
import { formatMoney } from "@/lib/format";
import { messages } from "@/messages/en";
import { ApiError } from "@/lib/api/client";

type ExpenseFormProps = {
  members: TripMember[];
  currentUserId?: string;
  expense?: Expense;
  onSave: (body: CreateExpenseBody) => Promise<void>;
  onCancel: () => void;
};

function todayDhaka() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: "year" | "month" | "day") =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function defaultValues(members: TripMember[], currentUserId?: string, expense?: Expense): ExpenseFormValues {
  const participants = expense?.splits.map((split) => split.user.id) ?? members.map((member) => member.id);
  return {
    title: expense?.title ?? "",
    amount: expense ? String(expense.amount) : "",
    paidById: expense?.paidBy.id ?? currentUserId ?? members[0]?.id ?? "",
    expenseDate: expense?.expenseDate.slice(0, 10) ?? todayDhaka(),
    splitMode: expense ? "EXACT" : "EQUAL",
    participantIds: participants,
    exactAmounts: Object.fromEntries(
      expense?.splits.map((split) => [split.user.id, String(split.amount)]) ?? [],
    ),
  };
}

function fieldErrors(errors: readonly unknown[]) {
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

function getSplitPreview(values: ExpenseFormValues) {
  try {
    const totalMinor = takaToMinorUnits(values.amount);
    if (totalMinor <= 0 || values.participantIds.length === 0) return null;
    if (values.splitMode === "EQUAL") {
      const shares = splitEquallyMinor(totalMinor, values.participantIds);
      return { totalMinor, shares, isExact: true };
    }

    let isComplete = true;
    const shares = values.participantIds.map((userId) => {
      const value = values.exactAmounts[userId] ?? "";
      if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
        isComplete = false;
        return { userId, amountMinor: 0 };
      }
      return { userId, amountMinor: takaToMinorUnits(value) };
    });
    return {
      totalMinor,
      shares,
      isExact:
        isComplete &&
        sumMinorUnits(shares.map((share) => share.amountMinor)) === totalMinor,
    };
  } catch {
    return null;
  }
}

export function ExpenseForm({
  members,
  currentUserId,
  expense,
  onSave,
  onCancel,
}: ExpenseFormProps) {
  const [serverError, setServerError] = useState("");
  const form = useForm({
    defaultValues: defaultValues(members, currentUserId, expense),
    validators: { onSubmit: expenseFormSchema },
    onSubmit: async ({ value }) => {
      setServerError("");
      try {
        const totalMinor = positiveTakaToMinorUnits(value.amount);
        const split = value.splitMode === "EQUAL"
          ? { type: "EQUAL" as const, participantIds: value.participantIds }
          : {
              type: "EXACT" as const,
              shares: value.participantIds.map((userId) => ({
                userId,
                amount: minorUnitsToTaka(takaToMinorUnits(value.exactAmounts[userId])),
              })),
            };
        const body: CreateExpenseBody = {
          title: value.title.trim(),
          amount: minorUnitsToTaka(totalMinor),
          paidById: value.paidById,
          expenseDate: new Date(`${value.expenseDate}T00:00:00.000Z`).toISOString(),
          split,
        };
        await onSave(body);
        onCancel();
      } catch (error) {
        setServerError(error instanceof ApiError ? error.message : messages.common.genericError);
      }
    },
  });

  return (
    <section className="trip-detail-section expense-editor" aria-labelledby="expense-form-title">
      <h2 id="expense-form-title">
        {expense ? messages.expenses.editExpense : messages.expenses.addExpense}
      </h2>
      <form
        className="trip-form expense-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        {serverError && <p className="trip-toast trip-toast-error" role="alert">{serverError}</p>}
        <div className="trip-form-grid">
          <form.Field name="title">
            {(field) => {
              const errors = fieldErrors(field.state.meta.errors);
              return (
                <div className="trip-form-field">
                  <label htmlFor="expense-title">{messages.expenses.titleLabel}</label>
                  <input
                    id="expense-title"
                    maxLength={200}
                    value={field.state.value}
                    placeholder={messages.expenses.titlePlaceholder}
                    aria-invalid={errors.length > 0}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.currentTarget.value)}
                  />
                  {errors.length > 0 && <span className="trip-field-error">{errors.join(" ")}</span>}
                </div>
              );
            }}
          </form.Field>
          <form.Field name="amount">
            {(field) => {
              const errors = fieldErrors(field.state.meta.errors);
              return (
                <div className="trip-form-field">
                  <label htmlFor="expense-amount">{messages.expenses.amountLabel}</label>
                  <input
                    id="expense-amount"
                    inputMode="decimal"
                    type="text"
                    value={field.state.value}
                    aria-invalid={errors.length > 0}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.currentTarget.value)}
                  />
                  {errors.length > 0 && <span className="trip-field-error">{errors.join(" ")}</span>}
                </div>
              );
            }}
          </form.Field>
          <form.Field name="paidById">
            {(field) => {
              const errors = fieldErrors(field.state.meta.errors);
              return (
                <div className="trip-form-field">
                  <label htmlFor="expense-payer">{messages.expenses.payerLabel}</label>
                  <select
                    id="expense-payer"
                    value={field.state.value}
                    aria-invalid={errors.length > 0}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.currentTarget.value)}
                  >
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                  {errors.length > 0 && <span className="trip-field-error">{errors.join(" ")}</span>}
                </div>
              );
            }}
          </form.Field>
          <form.Field name="expenseDate">
            {(field) => {
              const errors = fieldErrors(field.state.meta.errors);
              return (
                <div className="trip-form-field">
                  <label htmlFor="expense-date">{messages.expenses.dateLabel}</label>
                  <input
                    id="expense-date"
                    type="date"
                    value={field.state.value}
                    aria-invalid={errors.length > 0}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.currentTarget.value)}
                  />
                  {errors.length > 0 && <span className="trip-field-error">{errors.join(" ")}</span>}
                </div>
              );
            }}
          </form.Field>
        </div>
        {members.length === 0 ? (
          <p className="trip-form-server-error" role="alert">{messages.expenses.emptyMembers}</p>
        ) : (
          <>
            <form.Field name="splitMode">
              {(field) => (
                <div className="trip-form-field">
                  <label htmlFor="expense-split-mode">{messages.expenses.splitModeLabel}</label>
                  <select
                    id="expense-split-mode"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(
                      event.currentTarget.value === "EXACT" ? "EXACT" : "EQUAL",
                    )}
                  >
                    <option value="EQUAL">{messages.expenses.equalSplit}</option>
                    <option value="EXACT">{messages.expenses.exactSplit}</option>
                  </select>
                </div>
              )}
            </form.Field>
            <fieldset className="expense-members">
              <legend>{messages.expenses.splitAmong}</legend>
              <p className="trip-field-hint">{messages.expenses.memberSelectionHint}</p>
              <form.Field name="participantIds">
                {(field) => {
                  const errors = fieldErrors(field.state.meta.errors);
                  return (
                    <>
                      <div className="expense-member-options">
                        {members.map((member) => {
                          const checked = field.state.value.includes(member.id);
                          return (
                            <label className="expense-member-option" key={member.id}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) => field.handleChange(
                                  event.currentTarget.checked
                                    ? [...field.state.value, member.id]
                                    : field.state.value.filter((id) => id !== member.id),
                                )}
                              />
                              <span>{member.name}</span>
                            </label>
                          );
                        })}
                      </div>
                      {errors.length > 0 && <span className="trip-field-error">{errors.join(" ")}</span>}
                    </>
                  );
                }}
              </form.Field>
            </fieldset>
            <form.Subscribe selector={(state) => state.values}>
              {(values) => {
                const preview = getSplitPreview(values);
                return (
                  <div className="expense-split-preview">
                    {values.splitMode === "EXACT" && (
                      <form.Field name="exactAmounts">
                        {(field) => (
                          <div className="expense-exact-shares">
                            {values.participantIds.map((userId) => {
                              const member = members.find((item) => item.id === userId);
                              if (!member) return null;
                              return (
                                <label className="trip-form-field" key={userId}>
                                  <span>{messages.expenses.exactShareLabel(member.name)}</span>
                                  <input
                                    inputMode="decimal"
                                    type="text"
                                    value={field.state.value[userId] ?? ""}
                                    aria-label={messages.expenses.exactShareLabel(member.name)}
                                    onBlur={field.handleBlur}
                                    onChange={(event) => field.handleChange({
                                      ...field.state.value,
                                      [userId]: event.currentTarget.value,
                                    })}
                                  />
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </form.Field>
                    )}
                    {preview && (
                      <>
                        <ul className="expense-share-preview">
                          {preview.shares.map((share) => (
                            <li key={share.userId}>
                              <span>{members.find((member) => member.id === share.userId)?.name}</span>
                              <strong>{formatMoney(minorUnitsToTaka(share.amountMinor))}</strong>
                            </li>
                          ))}
                        </ul>
                        <p
                          className={preview.isExact ? "expense-split-status is-valid" : "expense-split-status is-invalid"}
                          role="status"
                        >
                          {preview.isExact ? messages.expenses.splitValid : messages.expenses.splitInvalid}
                        </p>
                      </>
                    )}
                  </div>
                );
              }}
            </form.Subscribe>
          </>
        )}
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <div className="trip-form-actions">
              <button className="button button-outline" type="button" onClick={onCancel}>
                {messages.expenses.cancel}
              </button>
              <button
                className="button button-primary"
                type="submit"
                disabled={isSubmitting || members.length === 0}
              >
                {isSubmitting ? messages.expenses.savingExpense : messages.expenses.saveExpense}
              </button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </section>
  );
}
