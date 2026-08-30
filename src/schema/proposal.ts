import { z } from "zod";

export const PROPOSAL_FONTS = [
    "Lora",
    "Cormorant Garamond",
    "System sans",
] as const;

export const PROPOSAL_FONT_SIZES = ["14", "15", "16", "18"] as const;
export const DEFAULT_PROPOSAL_FONT = "Lora";
export const DEFAULT_PROPOSAL_FONT_SIZE = "15";

export const proposalUpdateZodSchema = z.object({
    id: z.string().min(1, "Missing proposal id"),

    title: z
        .string()
        .trim()
        .min(1, "Project title is required")
        .max(120, "Project title must be at most 120 characters"),

    price: z
        .number({ error: "Enter a price" })
        .int("Price must be a whole number")
        .min(0, "Price can't be negative")
        .max(100_000_000, "Price must be at most 100,000,000"),

    due: z.union([
        z.literal(""),
        z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter the estimated due date as YYYY-MM-DD"),
    ]),

    deliverables: z
        .array(
            z
                .string()
                .trim()
                .max(255, "Each deliverable must be at most 255 characters"),
        )
        .max(50, "A proposal can have at most 50 deliverables"),

    body: z
        .string()
        .max(50_000, "The proposal body is too long"),

    font: z.enum(PROPOSAL_FONTS, { error: "Pick a font from the list" }),
    
    fontSize: z.enum(PROPOSAL_FONT_SIZES, { error: "Pick a font size from the list" }),
});

export type ProposalUpdateInput = z.infer<typeof proposalUpdateZodSchema>;

export interface ProposalEditorForm {
    title: string;
    price: number;
    due: string;
    deliverables: string[];
    font: string;
    fontSize: string;
}
