import { z } from "zod";
import { messages } from "@/messages/en";

export const reviewFormSchema = z.object({
  rating: z.number()
    .int(messages.reviews.ratingInteger)
    .min(1, messages.reviews.ratingRange)
    .max(5, messages.reviews.ratingRange),
  comment: z.string().max(1000, messages.reviews.commentTooLong),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
