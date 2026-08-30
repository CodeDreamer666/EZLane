import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { proposalUpdateZodSchema } from "~/schema/proposal";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import sanitize from "~/lib/sanitize";
import sanitizeRichText from "~/lib/sanitizeRichText";

const clientSelect = { select: { name: true, company: true } } as const;

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
    updatedAt: true,
    client: clientSelect,
} as const;

function seededBody(clientLabel: string): string {
    return `
    <h2>Overview</h2>
    <p>What the project is and why it matters to ${clientLabel}.</p>
    <h2>Approach</h2>
    <p>How you will work, in the order you will work.</p>
    <h2>Terms</h2>
    <p>50% deposit to start, 50% on completion.</p>
    `;
}

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
                    select: { name: true, company: true },
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
                        title: "Untitled project",
                        body: seededBody(client.company ?? client.name),
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

                if (cleanTitle.length < 1 || cleanTitle.length > 200)
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Project title must be between 1 and 200 characters",
                    });

                const cleanDeliverables = input.deliverables
                    .map((item) => sanitize(item))
                    .filter((item) => item.length > 0)
                    .slice(0, 50);

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

                const now = new Date();

                return await ctx.db.proposal.update({
                    where: { id: input.id },
                    data: { status: "SENT", sentAt: now, lastSavedAt: now },
                    select: proposalSelect,
                });
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[proposal.send] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't send this proposal. Please try again.",
                });
            }
        }),
});
