import { z } from "zod";
import { messages } from "@/messages/en";

function dhakaDateInputValue() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: "year" | "month" | "day") =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export const tripFormSchema = z
  .object({
    title: z.string().min(1, messages.tripForm.titleRequired).max(160, messages.tripForm.titleTooLong),
    destinationId: z.string(),
    startDate: z.string().refine(isCalendarDate, messages.tripForm.dateRequired),
    endDate: z.string().refine(isCalendarDate, messages.tripForm.dateRequired),
    budget: z
      .number()
      .finite(messages.tripForm.budgetInvalid)
      .min(0, messages.tripForm.budgetMinimum)
      .optional(),
    notes: z.string().max(4000, messages.tripForm.notesTooLong),
  })
  .superRefine((trip, context) => {
    if (isCalendarDate(trip.startDate) && trip.startDate < dhakaDateInputValue()) {
      context.addIssue({
        code: "custom",
        path: ["startDate"],
        message: messages.tripForm.startDateTodayOrLater,
      });
    }

    if (
      isCalendarDate(trip.startDate) &&
      isCalendarDate(trip.endDate) &&
      trip.endDate < trip.startDate
    ) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: messages.tripForm.endDateAfterStart,
      });
    }
  });

export type TripFormValues = z.infer<typeof tripFormSchema>;
