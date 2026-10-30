import { z } from "zod";
import { messages } from "@/messages/en";

const startTime = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, messages.itinerary.timeFormat);

export function itineraryItemFormSchemaForDays(dayCount: number) {
  return z.object({
    dayNumber: z.number().int().min(1).max(dayCount, messages.itinerary.dateInvalid),
    startTime: startTime.or(z.literal("")),
    title: z.string().trim().min(1, messages.itinerary.titleRequired)
      .max(160, messages.itinerary.titleTooLong),
    description: z.string().trim().max(4000, messages.itinerary.notesTooLong),
    location: z.string().trim().max(500, messages.itinerary.locationTooLong),
    estimatedCost: z.number().finite(messages.itinerary.costInvalid)
      .min(0, messages.itinerary.costInvalid).optional(),
  });
}

export type ItineraryItemFormValues = z.infer<ReturnType<typeof itineraryItemFormSchemaForDays>>;
