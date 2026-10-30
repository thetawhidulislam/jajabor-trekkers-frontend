"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import type { CreateSettlementBody } from "@/lib/api/expenses";
import type { TripMember } from "@/lib/api/trips";
import { minorUnitsToTaka, positiveTakaToMinorUnits } from "@/lib/money";
import { formatMoney } from "@/lib/format";
import { ApiError } from "@/lib/api/client";
import { settlementFormSchema, type SettlementFormValues } from "@/lib/validation/expense";
import { messages } from "@/messages/en";

type SettlementFormProps = {
  members: TripMember[];
  currentUserId?: string;
  onSave: (body: CreateSettlementBody) => Promise<void>;
  onCancel: () => void;
};

function errorsFrom(errors: readonly unknown[]) {
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

function defaults(members: TripMember[], currentUserId?: string): SettlementFormValues {
  const payer = members.find((member) => member.id === currentUserId) ?? members[0];
  const receiver = members.find((member) => member.id !== payer?.id) ?? members[1];
  return {
    fromUserId: payer?.id ?? "",
    toUserId: receiver?.id ?? "",
    amount: "",
  };
}

export function SettlementForm({ members, currentUserId, onSave, onCancel }: SettlementFormProps) {
  const [serverError, setServerError] = useState("");
  const form = useForm({
    defaultValues: defaults(members, currentUserId),
    validators: { onSubmit: settlementFormSchema },
    onSubmit: async ({ value }) => {
      setServerError("");
      try {
        const amount = minorUnitsToTaka(positiveTakaToMinorUnits(value.amount));
        const payer = members.find((member) => member.id === value.fromUserId)?.name ?? "";
        const receiver = members.find((member) => member.id === value.toUserId)?.name ?? "";
        if (!window.confirm(messages.expenses.settlementConfirm(
          payer,
          receiver,
          formatMoney(amount),
        ))) return;
        const body: CreateSettlementBody = {
          fromUserId: value.fromUserId,
          toUserId: value.toUserId,
          amount,
        };
        await onSave(body);
        onCancel();
      } catch (error) {
        setServerError(error instanceof ApiError ? error.message : messages.common.genericError);
      }
    },
  });

  return (
    <section className="trip-detail-section expense-editor" aria-labelledby="settlement-form-title">
      <h2 id="settlement-form-title">{messages.expenses.recordSettlement}</h2>
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
          <form.Field name="fromUserId">
            {(field) => {
              const errors = errorsFrom(field.state.meta.errors);
              return (
                <div className="trip-form-field">
                  <label htmlFor="settlement-from">{messages.expenses.settlementFromLabel}</label>
                  <select
                    id="settlement-from"
                    value={field.state.value}
                    aria-invalid={errors.length > 0}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.currentTarget.value)}
                  >
                    {members.map((member) => (
                      <option value={member.id} key={member.id}>{member.name}</option>
                    ))}
                  </select>
                  {errors.length > 0 && <span className="trip-field-error">{errors.join(" ")}</span>}
                </div>
              );
            }}
          </form.Field>
          <form.Field name="toUserId">
            {(field) => {
              const errors = errorsFrom(field.state.meta.errors);
              return (
                <div className="trip-form-field">
                  <label htmlFor="settlement-to">{messages.expenses.settlementToLabel}</label>
                  <select
                    id="settlement-to"
                    value={field.state.value}
                    aria-invalid={errors.length > 0}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.currentTarget.value)}
                  >
                    {members.map((member) => (
                      <option value={member.id} key={member.id}>{member.name}</option>
                    ))}
                  </select>
                  {errors.length > 0 && <span className="trip-field-error">{errors.join(" ")}</span>}
                </div>
              );
            }}
          </form.Field>
          <form.Field name="amount">
            {(field) => {
              const errors = errorsFrom(field.state.meta.errors);
              return (
                <div className="trip-form-field">
                  <label htmlFor="settlement-amount">{messages.expenses.settlementAmountLabel}</label>
                  <input
                    id="settlement-amount"
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
        </div>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <div className="trip-form-actions">
              <button className="button button-outline" type="button" onClick={onCancel}>
                {messages.expenses.cancel}
              </button>
              <button className="button button-primary" type="submit" disabled={isSubmitting || members.length < 2}>
                {isSubmitting ? messages.expenses.savingExpense : messages.expenses.recordSettlement}
              </button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </section>
  );
}
