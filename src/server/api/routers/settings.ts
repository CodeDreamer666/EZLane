import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import sanitize from "~/lib/sanitize";

export const settingsRouter = createTRPCRouter({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
        try {
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { name: true },
            });

            if (!user)
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

            return { name: user.name };
        } catch (err) {
            if (err instanceof TRPCError) throw err;

            console.error("[settings.getProfile] unexpected error", err);

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "We couldn't save your changes. Please try again.",
            });
        }
    }),

    updateProfile: protectedProcedure
        .input(
            z.object({
                name: z
                    .string()
                    .trim()
                    .min(1, "Display name is required")
                    .max(120, "Display name must be at most 120 characters"),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const cleanName = sanitize(input.name);

                if (cleanName.length < 1 || cleanName.length > 120) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Display name must be between 1 and 120 characters",
                    });
                }

                const updated = await ctx.db.user.update({
                    where: { id: ctx.session.user.id },
                    data: { name: cleanName },
                    select: { name: true },
                });

                return updated;
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[settings.updateProfile] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't save your changes. Please try again.",
                });
            }
        }),

    getInvoice: protectedProcedure.query(async ({ ctx }) => {
        try {
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: {
                    invoiceDisplayName: true,
                    invoiceContact: true,
                    invoicePrefix: true,
                },
            });

            if (!user)
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

            return {
                invoiceDisplayName: user.invoiceDisplayName ?? "",
                invoiceContact: user.invoiceContact ?? "",
                invoicePrefix: user.invoicePrefix ?? "",
            };
        } catch (err) {
            if (err instanceof TRPCError) throw err;

            console.error("[settings.getInvoice] unexpected error", err);

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "We couldn't save your changes. Please try again.",
            });
        }
    }),

    updateInvoice: protectedProcedure
        .input(z.object({
            invoiceDisplayName: z
                .string()
                .trim()
                .min(1, "Invoice display name is required")
                .max(120, "Invoice display name must be at most 120 characters"),
            invoiceContact: z
                .string()
                .trim()
                .min(1, "Contact info is required")
                .max(120, "Contact info must be at most 120 characters"),
            invoicePrefix: z
                .string()
                .trim()
                .min(1, "Invoice prefix is required")
                .max(20, "Invoice prefix must be at most 20 characters")
                .regex(
                    /^[A-Z0-9-]+$/,
                    "Invoice prefix must be uppercase letters, numbers and hyphens only (e.g. MD-2026-)",
                ),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                const cleanDisplayName = sanitize(input.invoiceDisplayName);
                const cleanContact = sanitize(input.invoiceContact);
                const cleanPrefix = sanitize(input.invoicePrefix);

                if (cleanDisplayName.length < 1 || cleanDisplayName.length > 120) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message:
                            "Invoice display name must be between 1 and 120 characters",
                    });
                }

                if (cleanContact.length < 1 || cleanContact.length > 120) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Contact info must be between 1 and 120 characters",
                    });
                }

                if (cleanPrefix.length < 1 || cleanPrefix.length > 20) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Invoice prefix must be between 1 and 20 characters",
                    });
                }

                if (!/^[A-Z0-9-]+$/.test(cleanPrefix)) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message:
                            "Invoice prefix must be uppercase letters, numbers and hyphens only (e.g. MD-2026-)",
                    });
                }

                const updated = await ctx.db.user.update({
                    where: { id: ctx.session.user.id },
                    data: {
                        invoiceDisplayName: cleanDisplayName,
                        invoiceContact: cleanContact,
                        invoicePrefix: cleanPrefix,
                    },
                    select: {
                        invoiceDisplayName: true,
                        invoiceContact: true,
                        invoicePrefix: true,
                    },
                });

                return updated;
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[settings.updateInvoice] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't save your changes. Please try again.",
                });
            }
        }),

    getPlan: protectedProcedure.query(async ({ ctx }) => {
        try {
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { plan: true },
            });

            if (!user)
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

            return { plan: user.plan };
        } catch (err) {
            if (err instanceof TRPCError) throw err;

            console.error("[settings.getPlan] unexpected error", err);

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "We couldn't save your changes. Please try again.",
            });
        }
    }),

    updatePlan: protectedProcedure
        .input(z.object({
            plan: z
                .string()
                .trim()
                .transform((v) => v.toUpperCase())
                .pipe(
                    z.enum(["FREE", "PRO"], {
                        error: () => "Plan must be FREE or PRO",
                    }),
                ),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                const updated = await ctx.db.user.update({
                    where: { id: ctx.session.user.id },
                    data: { plan: input.plan },
                    select: { plan: true },
                });

                return updated;
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[settings.updatePlan] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't save your changes. Please try again.",
                });
            }
        }),

    getBranding: protectedProcedure.query(async ({ ctx }) => {
        try {
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: {
                    accentColour: true,
                    logo: true,
                    welcomeMessage: true,
                    hideBranding: true,
                    plan: true,
                },
            });

            if (!user)
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

            return {
                accentColour: user.accentColour ?? "#5b93ff",
                logo: user.logo ?? "",
                welcomeMessage: user.welcomeMessage ?? "",
                hideBranding: user.hideBranding ?? false,
                plan: user.plan,
            };
        } catch (err) {
            if (err instanceof TRPCError) throw err;

            console.error("[settings.getBranding] unexpected error", err);

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "We couldn't save your changes. Please try again.",
            });
        }
    }),

    updateBranding: protectedProcedure
        .input(z.object({
            accentColour: z
                .string()
                .trim()
                .regex(
                    /^#[0-9A-Fa-f]{6}$/,
                    "Accent colour must be a hex value like #4F46E5",
                ),
            logo: z
                .string()
                .trim()
                .min(1, "Logo is required")
                .max(255, "Logo must be at most 255 characters")
                .optional()
                .or(z.literal("")),
            welcomeMessage: z
                .string()
                .trim()
                .min(1, "Welcome message is required")
                .max(255, "Welcome message must be at most 255 characters"),
            hideBranding: z.boolean(),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                const user = await ctx.db.user.findUnique({
                    where: { id: ctx.session.user.id },
                    select: { plan: true },
                });

                if (!user)
                    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
                
                if (user.plan !== "PRO") {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message:
                            "Portal branding is available on the Pro plan. Upgrade to Pro to save branding changes.",
                    });
                }

                const cleanAccent = sanitize(input.accentColour);
                const cleanLogo = input.logo ? sanitize(input.logo) : "";
                const cleanWelcome = sanitize(input.welcomeMessage);

                if (!/^#[0-9A-Fa-f]{6}$/.test(cleanAccent)) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Accent colour must be a hex value like #4F46E5",
                    });
                }

                if (cleanLogo.length > 255) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Logo must be at most 255 characters",
                    });
                }

                if (cleanWelcome.length < 1 || cleanWelcome.length > 255) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Welcome message must be between 1 and 255 characters",
                    });
                }

                const updated = await ctx.db.user.update({
                    where: { id: ctx.session.user.id },
                    data: {
                        accentColour: cleanAccent,
                        logo: cleanLogo || null,
                        welcomeMessage: cleanWelcome,
                        hideBranding: input.hideBranding,
                    },
                    select: {
                        accentColour: true,
                        logo: true,
                        welcomeMessage: true,
                        hideBranding: true,
                    },
                });

                return updated;
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[settings.updateBranding] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't save your changes. Please try again.",
                });
            }
        }),

    // Combined fetch for convenience
    getAll: protectedProcedure.query(async ({ ctx }) => {
        try {
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: {
                    name: true,
                    plan: true,
                    invoiceDisplayName: true,
                    invoiceContact: true,
                    invoicePrefix: true,
                    accentColour: true,
                    logo: true,
                    welcomeMessage: true,
                    hideBranding: true,
                },
            });
            
            if (!user)
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

            return {
                name: user.name,
                plan: user.plan,
                invoiceDisplayName: user.invoiceDisplayName ?? "",
                invoiceContact: user.invoiceContact ?? "",
                invoicePrefix: user.invoicePrefix ?? "",
                accentColour: user.accentColour ?? "#5b93ff",
                logo: user.logo ?? "",
                welcomeMessage: user.welcomeMessage ?? "",
                hideBranding: user.hideBranding ?? false,
            };

        } catch (err) {
            if (err instanceof TRPCError) throw err;

            console.error("[settings.getAll] unexpected error", err);
            
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "We couldn't save your changes. Please try again.",
            });
        }
    }),
});
