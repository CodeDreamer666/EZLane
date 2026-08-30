import { z } from "zod";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const clientCreateZodSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .max(120, "Name must be at most 120 characters"),
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .max(255, "Email must be at most 255 characters")
        .refine((value) => EMAIL_PATTERN.test(value), "Enter a valid email address"),
    company: z
        .string()
        .trim()
        .max(120, "Company must be at most 120 characters"),
    notes: z
        .string()
        .trim()
        .max(255, "Notes must be at most 255 characters"),
});

export type ClientCreateInput = z.infer<typeof clientCreateZodSchema>;
