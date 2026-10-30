import { z } from "zod";
import { positiveTakaToMinorUnits, sumMinorUnits, takaToMinorUnits } from "@/lib/money";
import { messages } from "@/messages/en";

const moneyText = /^\d+(?:\.\d{1,2})?$/;

const positiveMoney = z.string().superRefine((value, context) => {
  if (!moneyText.test(value)) {
    context.addIssue({ code: "custom", message: messages.expenses.amountInvalid });
    return;
  }
  try {
    positiveTakaToMinorUnits(value);
  } catch {
    const isZero = /^0+(?:\.0+)?$/.test(value);
    context.addIssue({
      code: "custom",
      message: isZero ? messages.expenses.amountPositive : messages.expenses.amountInvalid,
    });
  }
});

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export const expenseFormSchema = z.object({
  title: z.string().trim().min(1, messages.expenses.titleRequired).max(200, messages.expenses.titleTooLong),
  amount: positiveMoney,
  paidById: z.string().trim().min(1, messages.expenses.payerRequired),
  expenseDate: z.string().refine(isCalendarDate, messages.expenses.dateRequired),
  splitMode: z.enum(["EQUAL", "EXACT"]),
  participantIds: z.array(z.string().min(1)).min(1, messages.expenses.participantRequired),
  exactAmounts: z.record(z.string(), z.string()),
}).superRefine((value, context) => {
  if (new Set(value.participantIds).size !== value.participantIds.length) {
    context.addIssue({
      code: "custom",
      path: ["participantIds"],
      message: messages.expenses.duplicateParticipants,
    });
  }
  if (value.splitMode !== "EXACT") return;

  try {
    const total = takaToMinorUnits(value.amount);
    const shares = value.participantIds.map((userId) => {
      const amount = value.exactAmounts[userId];
      if (amount === undefined || !moneyText.test(amount)) {
        context.addIssue({
          code: "custom",
          path: ["exactAmounts"],
          message: messages.expenses.exactAmountRequired,
        });
        return 0;
      }
      const shareMinor = takaToMinorUnits(amount);
      if (shareMinor < 0) {
        context.addIssue({
          code: "custom",
          path: ["exactAmounts"],
          message: messages.expenses.shareNonnegative,
        });
      }
      return shareMinor;
    });
    if (sumMinorUnits(shares) !== total) {
      context.addIssue({
        code: "custom",
        path: ["exactAmounts"],
        message: messages.expenses.splitMustMatch,
      });
    }
  } catch {
    context.addIssue({
      code: "custom",
      path: ["exactAmounts"],
      message: messages.expenses.amountInvalid,
    });
  }
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export const settlementFormSchema = z.object({
  fromUserId: z.string().min(1, messages.expenses.payerRequired),
  toUserId: z.string().min(1, messages.expenses.receiverRequired),
  amount: positiveMoney,
}).refine((value) => value.fromUserId !== value.toUserId, {
  path: ["toUserId"],
  message: messages.expenses.settlementDifferentPeople,
});

export type SettlementFormValues = z.infer<typeof settlementFormSchema>;
