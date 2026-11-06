import { z } from "zod";
import { messages } from "@/messages/en";

export const emailSchema = z.object({
  email: z.string().trim().pipe(z.email(messages.auth.emailInvalid)),
});

export const loginSchema = emailSchema.extend({
  password: z.string().min(1, messages.auth.passwordRequired),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, messages.auth.nameLength).max(80, messages.auth.nameLength),
  email: z.string().trim().pipe(z.email(messages.auth.emailInvalid)),
  password: z.string().min(8, messages.auth.passwordTooShort),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, messages.auth.passwordTooShort),
  confirmPassword: z.string().min(1, messages.auth.confirmPasswordRequired),
}).superRefine((value, context) => {
  if (value.password !== value.confirmPassword) {
    context.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: messages.auth.passwordMismatch,
    });
  }
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, messages.auth.nameLength).max(80, messages.auth.nameLength),
  phone: z.string().trim().refine(
    (value) => value === "" || /^[+\d ]{6,20}$/.test(value),
    messages.auth.phoneInvalid,
  ),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
