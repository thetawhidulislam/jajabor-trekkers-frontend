import { z } from "zod";
import { messages } from "@/messages/en";

const optionalText = z.string().trim();

export const adminDestinationSchema = z.object({
  name: z.string().trim().min(1, messages.admin.fieldRequired).max(160),
  slug: z.string().trim().max(180),
  division: z.string().trim().min(1, messages.admin.fieldRequired).max(100),
  district: optionalText.max(100),
  locationText: optionalText.max(500),
  latitude: z.string().refine((value) => {
    if (!value.trim()) return true;
    const number = Number(value);
    return Number.isFinite(number) && number >= -90 && number <= 90;
  }, messages.admin.coordinateInvalid),
  longitude: z.string().refine((value) => {
    if (!value.trim()) return true;
    const number = Number(value);
    return Number.isFinite(number) && number >= -180 && number <= 180;
  }, messages.admin.coordinateInvalid),
  description: z.string().trim().min(1, messages.admin.fieldRequired),
  coverImage: z.string().url(messages.admin.coverRequired),
  estimatedCostMin: z.number().finite().min(0),
  estimatedCostMax: z.number().finite().min(0),
  recommendedDays: z.number().int().min(1),
  bestTimeToVisit: optionalText.max(200),
  activities: z.string(),
  difficulty: z.enum(["EASY", "MODERATE", "HARD"]),
  isFeatured: z.boolean(),
  safetyNotes: optionalText.max(2000),
  permissionRequired: z.boolean(),
  permissionNote: optionalText.max(1000),
  lastVerifiedAt: z.string(),
  categoryId: z.string().trim().min(1, messages.admin.fieldRequired),
}).superRefine((value, context) => {
  if (value.estimatedCostMin > value.estimatedCostMax) {
    context.addIssue({
      code: "custom",
      path: ["estimatedCostMax"],
      message: messages.admin.costOrder,
    });
  }
  if (value.permissionRequired && !value.permissionNote.trim()) {
    context.addIssue({
      code: "custom",
      path: ["permissionNote"],
      message: messages.admin.permissionNoteRequired,
    });
  }
});

export type AdminDestinationFormValues = z.infer<typeof adminDestinationSchema>;
