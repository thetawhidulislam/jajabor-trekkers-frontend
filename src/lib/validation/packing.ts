import { z } from "zod";
import { messages } from "@/messages/en";

export const packingItemFormSchema = z.object({
  name: z.string().trim().min(1, messages.packing.nameRequired)
    .max(200, messages.packing.nameTooLong),
  category: z.string().trim().max(100, messages.packing.categoryTooLong),
  quantity: z.number().int(messages.packing.quantityInvalid)
    .min(1, messages.packing.quantityInvalid).max(99, messages.packing.quantityInvalid),
});

export type PackingItemFormValues = z.infer<typeof packingItemFormSchema>;
