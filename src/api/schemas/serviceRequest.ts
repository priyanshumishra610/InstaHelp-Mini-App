import { z } from "zod";

export const serviceRequestSchema = z.object({
  serviceId: z.string().min(1, "Choose a service"),
  serviceLabel: z.string().min(1),
  description: z
    .string()
    .min(12, "A short description helps your concierge start faster")
    .max(2000),
  preferredTime: z.string().min(2, "Pick a preferred time"),
  notes: z.string().max(2000).optional(),
});

export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, "Enter a valid number")
    .max(16, "Enter a valid number")
    .regex(/^\+?[0-9\s-]+$/, "Digits only"),
});

export const signUpSchema = z.object({
  phone: z
    .string()
    .min(10, "Enter a valid number")
    .max(16, "Enter a valid number")
    .regex(/^\+?[0-9\s-]+$/, "Digits only"),
  name: z
    .string()
    .min(2, "Tell us your name")
    .max(60, "Keep it under 60 characters"),
  addressLabel: z
    .string()
    .max(20, "Short label, like Home or Office")
    .optional()
    .or(z.literal("")),
  addressLine: z
    .string()
    .max(200, "Keep address under 200 characters")
    .optional()
    .or(z.literal("")),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
