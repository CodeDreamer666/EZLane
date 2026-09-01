import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { acceptProposalAndCreateProject } from "~/lib/acceptProposal";
import {
    DEFAULT_PROPOSAL_TITLE,
    proposalSendIssue,
    proposalUpdateZodSchema,
} from "~/schema/proposal";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import notify from "~/lib/notify";
import sanitize from "~/lib/sanitize";
import sanitizeRichText from "~/lib/sanitizeRichText";

const clientSelect = { select: { name: true, company: true } } as const;

const sendReadinessSelect = {
    status: true,
    title: true,
    price: true,
    due: true,
    deliverables: true,
    body: true,
    client: { select: { name: true } },
} as const;

const proposalSelect = {
    id: true,
    clientId: true,
    title: true,
    price: true,
    due: true,
    deliverables: true,
    body: true,
    status: true,
    font: true,
    fontSize: true,
    lastSavedAt: true,
    sentAt: true,
    acceptedAt: true,
    updatedAt: true,
    client: clientSelect,
    project: { select: { id: true } },
} as const;

export const proposalRouter = createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
        try {
            return await ctx.db.proposal.findMany({
                where: { userId: ctx.session.user.id },
                orderBy: { updatedAt: "desc" },
                select: {
                    id: true,
                    clientId: true,
                    title: true,
                    price: true,
                    due: true,
                    status: true,
                    lastSavedAt: true,
                    sentAt: true,
                    updatedAt: true,
                    client: clientSelect,
                },
            });
        } catch (err) {
            if (err instanceof TRPCError) throw err;

            console.error("[proposal.list] unexpected error", err);

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "We couldn't load your proposals. Please try again.",
            });
        }
    }),

    byId: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
            try {
                const proposal = await ctx.db.proposal.findFirst({
                    where: { id: input.id, userId: ctx.session.user.id },
                    select: proposalSelect,
                });

                if (!proposal)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "This proposal doesn't exist or isn't yours.",
                    });

                return proposal;
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[proposal.byId] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't load this proposal. Please try again.",
                });
            }
        }),

    create: protectedProcedure
        .input(z.object({ clientId: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            try {
                const client = await ctx.db.client.findFirst({
                    where: { id: input.clientId, userId: ctx.session.user.id },
                    select: { id: true },
                });

                if (!client)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "That client doesn't exist or isn't yours.",
                    });

                const proposal = await ctx.db.proposal.create({
                    data: {
                        userId: ctx.session.user.id,
                        clientId: input.clientId,
                        title: DEFAULT_PROPOSAL_TITLE,
                        body: "",
                        deliverables: [],
                    },
                    select: { id: true },
                });

                return proposal;
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[proposal.create] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't start this proposal. Please try again.",
                });
            }
        }),

    update: protectedProcedure
        .input(proposalUpdateZodSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const existing = await ctx.db.proposal.findFirst({
                    where: { id: input.id, userId: ctx.session.user.id },
                    select: { status: true },
                });

                if (!existing)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "This proposal doesn't exist or isn't yours.",
                    });

                if (existing.status === "ACCEPTED")
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "This proposal has been accepted and is locked.",
                    });

                const cleanTitle = sanitize(input.title);

                if (cleanTitle.length < 1 || cleanTitle.length > 120)
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Project title must be between 1 and 120 characters",
                    });

                if (input.due !== "") {
                    const today = new Date();
                    
                    const todayStr = `${today.getFullYear()}-${String(
                        today.getMonth() + 1,
                    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

                    if (input.due <= todayStr)
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message:
                                "The estimated due date must be in the future",
                        });
                }

                const cleanDeliverables = input.deliverables
                    .map((item) => sanitize(item))
                    .filter((item) => item.length > 0)
                    .slice(0, 50);

                const seen = new Set<string>();

                for (const item of cleanDeliverables) {
                    const key = item.toLowerCase();

                    if (seen.has(key))
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "Deliverables can't contain duplicates",
                        });
                    seen.add(key);

                }

                return await ctx.db.proposal.update({
                    where: { id: input.id },
                    data: {
                        title: cleanTitle,
                        price: input.price,
                        due: input.due,
                        deliverables: cleanDeliverables,
                        body: sanitizeRichText(input.body),
                        font: input.font,
                        fontSize: input.fontSize,
                        lastSavedAt: new Date(),
                    },
                    select: proposalSelect,
                });
                
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[proposal.update] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't save this proposal. Please try again.",
                });
            }
        }),

    send: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            try {
                const existing = await ctx.db.proposal.findFirst({
                    where: { id: input.id, userId: ctx.session.user.id },
                    select: sendReadinessSelect,
                });

                if (!existing)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "This proposal doesn't exist or isn't yours.",
                    });

                if (existing.status === "ACCEPTED")
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "This proposal has been accepted and is locked.",
                    });

                const issue = proposalSendIssue(existing);

                if (issue)
                    throw new TRPCError({ code: "BAD_REQUEST", message: issue });

                const now = new Date();
                const wasOut = existing.status !== "DRAFT";

                const updated = await ctx.db.proposal.update({
                    where: { id: input.id },
                    data: { status: "SENT", sentAt: now, lastSavedAt: now },
                    select: proposalSelect,
                });

                await notify(ctx.db, {
                    userId: ctx.session.user.id,
                    audience: "FREELANCER",
                    title: `${wasOut ? "Revised proposal" : "Proposal"} sent to ${existing.client.name} — “${existing.title}”`,
                    route: `/proposals/${input.id}`,
                    proposalId: input.id,
                });

                return updated;
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[proposal.send] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't send this proposal. Please try again.",
                });
            }
        }),

    accept: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            try {
                const project = await acceptProposalAndCreateProject(ctx.db, {
                    proposalId: input.id,
                    ownerUserId: ctx.session.user.id,
                });

                return { id: project.id };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[proposal.accept] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't accept this proposal. Please try again.",
                });
            }
        }),

    delete: protectedProcedure
        .input(z.object({ ids: z.array(z.string().min(1)).min(1).max(100) }))
        .mutation(async ({ ctx, input }) => {
            try {
                const accepted = await ctx.db.proposal.findFirst({
                    where: {
                        id: { in: input.ids },
                        userId: ctx.session.user.id,
                        status: "ACCEPTED",
                    },
                    select: { id: true },
                });

                if (accepted)
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Accepted proposals are locked and can't be deleted.",
                    });

                const result = await ctx.db.proposal.deleteMany({
                    where: { id: { in: input.ids }, userId: ctx.session.user.id },
                });

                return { count: result.count };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[proposal.delete] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't delete those proposals. Please try again.",
                });
            }
        }),
});
