import { z } from "zod";

export const PROPOSAL_FONTS = [
    "Lora",
    "Cormorant Garamond",
    "System sans",
] as const;

export const PROPOSAL_FONT_SIZES = ["14", "15", "16", "18"] as const;
export const DEFAULT_PROPOSAL_FONT = "Lora";
export const DEFAULT_PROPOSAL_FONT_SIZE = "15";

/** The placeholder title a proposal is created with. It can't be sent as-is. */
export const DEFAULT_PROPOSAL_TITLE = "Untitled proposal";

/**
 * Prompts shown as ghost text in an empty editor to help the freelancer start
 * writing. This is guidance only — it is never saved as the proposal body.
 */
export const PROPOSAL_BODY_GUIDE: readonly string[] = [
    "Overview — what the project is and why it matters.",
    "Approach — how you will work, in the order you will work.",
    "Terms — e.g. 50% deposit to start, 50% on completion.",
];

const stripHtml = (html: string): string =>
    html
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

/**
 * Returns a human-readable reason the proposal can't be sent yet, or `null`
 * when it is ready. Used by both the editor (before calling `send`) and the
 * `send` procedure (against the persisted row).
 */
export function proposalSendIssue(p: {
    title: string;
    price: number;
    due: string;
    deliverables: string[];
    body: string;
}): string | null {
    const title = p.title.trim();

    if (
        title.length === 0 ||
        title.toLowerCase() === DEFAULT_PROPOSAL_TITLE.toLowerCase()
    )
        return "Give the proposal a real title before sending.";

    if (!Number.isFinite(p.price) || p.price <= 0)
        return "Set a price above 0 before sending.";

    if (p.due.trim().length === 0)
        return "Add an estimated due date before sending.";

    if (!p.deliverables.some((item) => item.trim().length > 0))
        return "Add at least one deliverable before sending.";

    if (stripHtml(p.body).length === 0)
        return "Write the proposal body before sending.";

    return null;
}

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
