import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
    EMAIL_PATTERN,
    clientCreateZodSchema,
} from "~/schema/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import sanitize from "~/lib/sanitize";

export const clientRouter = createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
        try {
            const clients = await ctx.db.client.findMany({
                where: { userId: ctx.session.user.id },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    company: true,
                    notes: true,
                },
            });

            return clients;
        } catch (err) {
            if (err instanceof TRPCError) throw err;

            console.error("[client.list] unexpected error", err);

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "We couldn't load your clients. Please try again.",
            });
        }
    }),

    byId: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
            try {
                const client = await ctx.db.client.findFirst({
                    where: { id: input.id, userId: ctx.session.user.id },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        company: true,
                        notes: true,
                    },
                });

                if (!client)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "This client doesn't exist or isn't yours.",
                    });

                return client;
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[client.byId] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't load this client. Please try again.",
                });
            }
        }),

    create: protectedProcedure
        .input(clientCreateZodSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const cleanName = sanitize(input.name);
                const cleanEmail = sanitize(input.email);
                const cleanCompany = input.company ? sanitize(input.company) : "";
                const cleanNotes = input.notes ? sanitize(input.notes) : "";

                if (cleanName.length < 1 || cleanName.length > 120) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Name must be between 1 and 120 characters",
                    });
                }

                if (
                    cleanEmail.length < 1 ||
                    cleanEmail.length > 255 ||
                    !EMAIL_PATTERN.test(cleanEmail)
                ) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Enter a valid email address",
                    });
                }

                if (cleanCompany.length > 120) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Company must be at most 120 characters",
                    });
                }

                if (cleanNotes.length > 255) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Notes must be at most 255 characters",
                    });
                }

                const duplicates = await ctx.db.client.findMany({
                    where: {
                        OR: [{ email: cleanEmail }, { name: cleanName }],
                    },
                    select: { email: true, name: true },
                });

                if (duplicates.length > 0) {
                    const emailTaken = duplicates.some(
                        (c) => c.email === cleanEmail,
                    );
                    const nameTaken = duplicates.some(
                        (c) => c.name === cleanName,
                    );

                    const message =
                        emailTaken && nameTaken
                            ? "A client with this name and email already exists"
                            : emailTaken
                              ? "A client with this email already exists"
                              : "A client with this name already exists";

                    throw new TRPCError({ code: "CONFLICT", message });
                }

                const client = await ctx.db.client.create({
                    data: {
                        userId: ctx.session.user.id,
                        name: cleanName,
                        email: cleanEmail,
                        company: cleanCompany || null,
                        notes: cleanNotes || null,
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        company: true,
                        notes: true,
                    },
                });

                return client;
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[client.create] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't save this client. Please try again.",
                });
            }
        }),

    delete: protectedProcedure
        .input(z.object({ ids: z.array(z.string().min(1)).min(1).max(100) }))
        .mutation(async ({ ctx, input }) => {
            try {
                const result = await ctx.db.client.deleteMany({
                    where: { id: { in: input.ids }, userId: ctx.session.user.id },
                });

                return { count: result.count };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[client.delete] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't delete those clients. Please try again.",
                });
            }
        }),
});
