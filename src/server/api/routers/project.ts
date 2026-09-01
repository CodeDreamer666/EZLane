import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { projectStatusLabel } from "~/lib/format";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import sanitize from "~/lib/sanitize";

/** Active (non-completed) projects allowed at once on the Free plan. Pro is unlimited. */
const FREE_ACTIVE_PROJECT_LIMIT = 2;

const PROJECT_STATUSES = [
    "NOT_STARTED",
    "IN_PROGRESS",
    "DELIVERED",
    "AWAITING_REVIEW",
    "APPROVED",
] as const;

const projectSelect = {
    id: true,
    status: true,
    progress: true,
    depositPaid: true,
    finalPaid: true,
    completed: true,
    contractName: true,
    contractSignedAt: true,
    createdAt: true,
    proposalId: true,
    client: { select: { id: true, name: true, company: true } },
    proposal: {
        select: {
            id: true,
            title: true,
            price: true,
            due: true,
            deliverables: true,
            body: true,
        },
    },
} as const;

const messageSelect = {
    id: true,
    side: true,
    author: true,
    text: true,
    file: true,
    createdAt: true,
} as const;

const notFound = new TRPCError({
    code: "NOT_FOUND",
    message: "This project doesn't exist or isn't yours.",
});

export const projectRouter = createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
        try {
            return await ctx.db.project.findMany({
                where: { userId: ctx.session.user.id },
                orderBy: { createdAt: "desc" },
                select: projectSelect,
            });
        } catch (err) {
            if (err instanceof TRPCError) throw err;

            console.error("[project.list] unexpected error", err);

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "We couldn't load your projects. Please try again.",
            });
        }
    }),

    byId: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
            try {
                const project = await ctx.db.project.findFirst({
                    where: { id: input.id, userId: ctx.session.user.id },
                    select: {
                        ...projectSelect,
                        messages: {
                            orderBy: { createdAt: "asc" },
                            select: messageSelect,
                        },
                    },
                });

                if (!project) throw notFound;

                return project;
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[project.byId] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't load this project. Please try again.",
                });
            }
        }),

    setStatus: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
                status: z.enum(PROJECT_STATUSES, {
                    error: () => "Pick a status from the list",
                }),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const project = await ctx.db.project.findFirst({
                    where: { id: input.id, userId: ctx.session.user.id },
                    select: { completed: true },
                });

                if (!project) throw notFound;

                if (project.completed)
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Reopen the project before changing its status.",
                    });

                const label = projectStatusLabel(input.status);

                const [updated] = await ctx.db.$transaction([
                    ctx.db.project.update({
                        where: { id: input.id },
                        data: { status: input.status },
                        select: projectSelect,
                    }),
                    ctx.db.projectMessage.create({
                        data: {
                            projectId: input.id,
                            side: "system",
                            author: "system",
                            text: `Status changed to ${label}`,
                        },
                    }),
                ]);

                return updated;
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[project.setStatus] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't update the status. Please try again.",
                });
            }
        }),

    setProgress: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
                progress: z
                    .number()
                    .int("Progress must be a whole number")
                    .min(0, "Progress can't be negative")
                    .max(100, "Progress can't be over 100"),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const project = await ctx.db.project.findFirst({
                    where: { id: input.id, userId: ctx.session.user.id },
                    select: { id: true },
                });

                if (!project) throw notFound;

                return await ctx.db.project.update({
                    where: { id: input.id },
                    data: { progress: input.progress },
                    select: projectSelect,
                });
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[project.setProgress] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't update progress. Please try again.",
                });
            }
        }),

    setDeposit: protectedProcedure
        .input(z.object({ id: z.string().min(1), paid: z.boolean() }))
        .mutation(async ({ ctx, input }) => {
            try {
                const project = await ctx.db.project.findFirst({
                    where: { id: input.id, userId: ctx.session.user.id },
                    select: { id: true },
                });

                if (!project) throw notFound;

                return await ctx.db.project.update({
                    where: { id: input.id },
                    data: { depositPaid: input.paid },
                    select: projectSelect,
                });
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[project.setDeposit] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't update the payment. Please try again.",
                });
            }
        }),

    setFinal: protectedProcedure
        .input(z.object({ id: z.string().min(1), paid: z.boolean() }))
        .mutation(async ({ ctx, input }) => {
            try {
                const project = await ctx.db.project.findFirst({
                    where: { id: input.id, userId: ctx.session.user.id },
                    select: { id: true },
                });

                if (!project) throw notFound;

                return await ctx.db.project.update({
                    where: { id: input.id },
                    data: { finalPaid: input.paid },
                    select: projectSelect,
                });
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[project.setFinal] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't update the payment. Please try again.",
                });
            }
        }),

    complete: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            try {
                const project = await ctx.db.project.findFirst({
                    where: { id: input.id, userId: ctx.session.user.id },
                    select: { completed: true },
                });

                if (!project) throw notFound;

                if (project.completed)
                    return await ctx.db.project.findUniqueOrThrow({
                        where: { id: input.id },
                        select: projectSelect,
                    });

                const [updated] = await ctx.db.$transaction([
                    ctx.db.project.update({
                        where: { id: input.id },
                        data: { completed: true, progress: 100 },
                        select: projectSelect,
                    }),
                    ctx.db.projectMessage.create({
                        data: {
                            projectId: input.id,
                            side: "system",
                            author: "system",
                            text: "Project marked completed",
                        },
                    }),
                ]);

                return updated;
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[project.complete] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't complete this project. Please try again.",
                });
            }
        }),

    reopen: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            try {
                const project = await ctx.db.project.findFirst({
                    where: { id: input.id, userId: ctx.session.user.id },
                    select: { completed: true },
                });

                if (!project) throw notFound;

                if (!project.completed)
                    return await ctx.db.project.findUniqueOrThrow({
                        where: { id: input.id },
                        select: projectSelect,
                    });

                const user = await ctx.db.user.findUnique({
                    where: { id: ctx.session.user.id },
                    select: { plan: true },
                });

                if (user?.plan !== "PRO") {
                    const activeCount = await ctx.db.project.count({
                        where: { userId: ctx.session.user.id, completed: false },
                    });

                    if (activeCount >= FREE_ACTIVE_PROJECT_LIMIT)
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message:
                                "The Free plan allows 2 active projects. Complete one or upgrade to Pro.",
                        });
                }

                return await ctx.db.project.update({
                    where: { id: input.id },
                    data: { completed: false },
                    select: projectSelect,
                });
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[project.reopen] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't reopen this project. Please try again.",
                });
            }
        }),

    postMessage: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
                text: z
                    .string()
                    .trim()
                    .max(5000, "Message must be at most 5000 characters"),
                file: z
                    .string()
                    .trim()
                    .max(255, "File name must be at most 255 characters")
                    .optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const project = await ctx.db.project.findFirst({
                    where: { id: input.id, userId: ctx.session.user.id },
                    select: { id: true },
                });

                if (!project) throw notFound;

                const cleanText = sanitize(input.text);
                const cleanFile = input.file ? sanitize(input.file) : "";

                if (cleanText.length < 1 && cleanFile.length < 1)
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Write a message or attach a file.",
                    });

                const user = await ctx.db.user.findUnique({
                    where: { id: ctx.session.user.id },
                    select: { name: true },
                });

                await ctx.db.projectMessage.create({
                    data: {
                        projectId: input.id,
                        side: "freelancer",
                        author: user?.name ?? "You",
                        text: cleanText,
                        file: cleanFile || null,
                    },
                });

                return { id: input.id };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[project.postMessage] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't post your message. Please try again.",
                });
            }
        }),
});
