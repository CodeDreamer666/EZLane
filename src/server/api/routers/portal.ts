import { TRPCError } from "@trpc/server";
import { verifyPassword } from "better-auth/crypto";
import { z } from "zod";
import { acceptProposalAndCreateProject } from "~/lib/acceptProposal";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import sanitize from "~/lib/sanitize";
import type { PrismaClient, ProposalStatus } from "../../../../generated/prisma";

const VISIBLE_PROPOSAL_STATUSES: ProposalStatus[] = [
    "SENT",
    "CLIENT_COMMENTED",
    "REVISED",
    "ACCEPTED",
];

const portalRefSchema = z.object({
    token1: z.string().min(1).max(64),
    token2: z.string().min(1).max(64),
});

type PortalRef = z.infer<typeof portalRefSchema>;

const portalInclude = {
    client: {
        select: {
            id: true,
            userId: true,
            name: true,
            company: true,
            user: {
                select: {
                    plan: true,
                    invoiceDisplayName: true,
                    accentColour: true,
                    logo: true,
                    welcomeMessage: true,
                    hideBranding: true,
                },
            },
        },
    },
} as const;

async function resolvePortal(db: PrismaClient, ref: PortalRef) {
    const portal = await db.clientPortal.findFirst({
        where: { urlToken1: ref.token1, urlToken2: ref.token2 },
        include: portalInclude,
    });

    if (!portal)
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "This portal doesn't exist.",
        });

    return portal;
}

async function assertAccess(
    portal: { passwordHash: string },
    password: string,
) {
    const ok = await verifyPassword({ hash: portal.passwordHash, password });

    if (!ok)
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "That password doesn't match this portal.",
        });
}

/** Branding the portal shows, resolved from the freelancer's plan and settings. */
function portalBranding(user: {
    plan: "FREE" | "PRO";
    invoiceDisplayName: string | null;
    accentColour: string | null;
    logo: string | null;
    welcomeMessage: string | null;
    hideBranding: boolean;
}) {
    const hideBranding = user.plan === "PRO" && user.hideBranding;

    return {
        brandName:
            hideBranding && user.invoiceDisplayName
                ? user.invoiceDisplayName
                : "EZLane",
        accentColour: user.accentColour ?? "#5b93ff",
        logo: user.logo ?? "",
        welcomeMessage: user.plan === "PRO" ? user.welcomeMessage ?? "" : "",
        hideBranding,
    };
}

const refInput = z.object({ ref: portalRefSchema, password: z.string().min(1) });

/**
 * A signature is a free-choice string, not the signer's legal name. It is held
 * to password-like rules so two signers are very unlikely to land on the same
 * value — there is deliberately no uniqueness check in the database.
 */
const signatureSchema = z
    .string()
    .trim()
    .min(8, "Your signature must be at least 8 characters")
    .max(120, "Your signature must be at most 120 characters")
    .regex(
        /[A-Za-z]/,
        "Your signature must include at least one letter",
    )
    .regex(/[0-9]/, "Your signature must include at least one number");

export const portalRouter = createTRPCRouter({
    exists: publicProcedure
        .input(z.object({ ref: portalRefSchema }))
        .query(async ({ ctx, input }) => {
            try {
                const portal = await resolvePortal(ctx.db, input.ref);

                return { ok: true, clientName: portal.client.name };
            } catch (err) {
                if (err instanceof TRPCError && err.code === "NOT_FOUND")
                    return { ok: false, clientName: null };

                console.error("[portal.exists] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't load this portal. Please try again.",
                });
            }
        }),

    verify: publicProcedure
        .input(refInput)
        .mutation(async ({ ctx, input }) => {
            try {
                const portal = await resolvePortal(ctx.db, input.ref);
                await assertAccess(portal, input.password);

                return { ok: true as const };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[portal.verify] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't open this portal. Please try again.",
                });
            }
        }),

    overview: publicProcedure
        .input(refInput)
        .query(async ({ ctx, input }) => {
            try {
                const portal = await resolvePortal(ctx.db, input.ref);
                await assertAccess(portal, input.password);

                const proposals = await ctx.db.proposal.findMany({
                    where: {
                        clientId: portal.client.id,
                        status: { in: VISIBLE_PROPOSAL_STATUSES },
                    },
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        due: true,
                        status: true,
                        project: {
                            select: {
                                id: true,
                                status: true,
                                progress: true,
                                completed: true,
                            },
                        },
                    },
                });

                return {
                    branding: portalBranding(portal.client.user),
                    client: {
                        name: portal.client.name,
                        company: portal.client.company,
                    },
                    items: proposals,
                };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[portal.overview] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't load this portal. Please try again.",
                });
            }
        }),

    proposal: publicProcedure
        .input(refInput.extend({ proposalId: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
            try {
                const portal = await resolvePortal(ctx.db, input.ref);
                await assertAccess(portal, input.password);

                const proposal = await ctx.db.proposal.findFirst({
                    where: {
                        id: input.proposalId,
                        clientId: portal.client.id,
                        status: { in: VISIBLE_PROPOSAL_STATUSES },
                    },
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        due: true,
                        deliverables: true,
                        body: true,
                        status: true,
                        project: { select: { id: true } },
                        comments: {
                            orderBy: { createdAt: "asc" },
                            select: {
                                id: true,
                                side: true,
                                author: true,
                                anchor: true,
                                text: true,
                                createdAt: true,
                            },
                        },
                    },
                });

                if (!proposal)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "This proposal isn't available yet.",
                    });

                return {
                    branding: portalBranding(portal.client.user),
                    client: {
                        name: portal.client.name,
                        company: portal.client.company,
                    },
                    proposal,
                };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[portal.proposal] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't load this proposal. Please try again.",
                });
            }
        }),

    project: publicProcedure
        .input(refInput.extend({ projectId: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
            try {
                const portal = await resolvePortal(ctx.db, input.ref);
                await assertAccess(portal, input.password);

                const project = await ctx.db.project.findFirst({
                    where: {
                        id: input.projectId,
                        clientId: portal.client.id,
                    },
                    select: {
                        id: true,
                        status: true,
                        progress: true,
                        completed: true,
                        depositPaid: true,
                        finalPaid: true,
                        contractName: true,
                        contractSignedAt: true,
                        proposal: {
                            select: {
                                id: true,
                                title: true,
                                price: true,
                                due: true,
                                deliverables: true,
                                body: true,
                                status: true,
                                comments: {
                                    orderBy: { createdAt: "asc" },
                                    select: {
                                        id: true,
                                        side: true,
                                        author: true,
                                        anchor: true,
                                        text: true,
                                        createdAt: true,
                                    },
                                },
                            },
                        },
                        messages: {
                            orderBy: { createdAt: "asc" },
                            select: {
                                id: true,
                                side: true,
                                author: true,
                                text: true,
                                file: true,
                                createdAt: true,
                            },
                        },
                    },
                });

                if (!project)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "This project doesn't exist.",
                    });

                return {
                    branding: portalBranding(portal.client.user),
                    client: {
                        name: portal.client.name,
                        company: portal.client.company,
                    },
                    project,
                };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[portal.project] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't load this project. Please try again.",
                });
            }
        }),

    addComment: publicProcedure
        .input(
            refInput.extend({
                proposalId: z.string().min(1),
                anchor: z
                    .string()
                    .trim()
                    .min(1, "Pick a paragraph to comment on")
                    .max(200, "That selection is too long"),
                text: z
                    .string()
                    .trim()
                    .min(1, "Write a comment")
                    .max(2000, "Comment must be at most 2000 characters"),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const portal = await resolvePortal(ctx.db, input.ref);
                await assertAccess(portal, input.password);

                const proposal = await ctx.db.proposal.findFirst({
                    where: {
                        id: input.proposalId,
                        clientId: portal.client.id,
                        status: { in: VISIBLE_PROPOSAL_STATUSES },
                    },
                    select: { id: true, status: true },
                });

                if (!proposal)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "This proposal isn't available yet.",
                    });

                const cleanAnchor = sanitize(input.anchor);
                const cleanText = sanitize(input.text);

                if (cleanText.length < 1)
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Write a comment.",
                    });

                await ctx.db.proposalComment.create({
                    data: {
                        proposalId: proposal.id,
                        side: "client",
                        author: portal.client.name,
                        anchor: cleanAnchor,
                        text: cleanText,
                    },
                });

                if (proposal.status !== "ACCEPTED")
                    await ctx.db.proposal.update({
                        where: { id: proposal.id },
                        data: { status: "CLIENT_COMMENTED" },
                    });

                return { id: proposal.id };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[portal.addComment] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't post your comment. Please try again.",
                });
            }
        }),

    acceptProposal: publicProcedure
        .input(refInput.extend({ proposalId: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            try {
                const portal = await resolvePortal(ctx.db, input.ref);
                await assertAccess(portal, input.password);

                const proposal = await ctx.db.proposal.findFirst({
                    where: {
                        id: input.proposalId,
                        clientId: portal.client.id,
                    },
                    select: { id: true },
                });

                if (!proposal)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "This proposal isn't available yet.",
                    });

                const project = await acceptProposalAndCreateProject(ctx.db, {
                    proposalId: proposal.id,
                    ownerUserId: portal.client.userId,
                });

                return { projectId: project.id };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[portal.acceptProposal] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't accept this proposal. Please try again.",
                });
            }
        }),

    signContract: publicProcedure
        .input(
            refInput.extend({
                projectId: z.string().min(1),
                name: signatureSchema,
            }),
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const portal = await resolvePortal(ctx.db, input.ref);
                await assertAccess(portal, input.password);

                const project = await ctx.db.project.findFirst({
                    where: {
                        id: input.projectId,
                        clientId: portal.client.id,
                    },
                    select: {
                        id: true,
                        contractName: true,
                        proposal: { select: { status: true } },
                    },
                });

                if (!project)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "This project doesn't exist.",
                    });

                if (project.proposal.status !== "ACCEPTED")
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Accept the proposal before signing.",
                    });

                if (project.contractName)
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "This agreement has already been signed.",
                    });

                const signerName = sanitize(input.name);

                if (signerName.length < 8)
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message:
                            "Your signature must be at least 8 characters with a letter and a number.",
                    });

                await ctx.db.$transaction([
                    ctx.db.project.update({
                        where: { id: project.id },
                        data: {
                            contractName: signerName,
                            contractSignedAt: new Date(),
                            status: "IN_PROGRESS",
                        },
                    }),
                    ctx.db.projectMessage.create({
                        data: {
                            projectId: project.id,
                            side: "system",
                            author: "system",
                            text: `Agreement signed by ${signerName}`,
                        },
                    }),
                ]);

                return { id: project.id };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[portal.signContract] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't record your signature. Please try again.",
                });
            }
        }),

    approveWork: publicProcedure
        .input(refInput.extend({ projectId: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            try {
                const portal = await resolvePortal(ctx.db, input.ref);
                await assertAccess(portal, input.password);

                const project = await ctx.db.project.findFirst({
                    where: {
                        id: input.projectId,
                        clientId: portal.client.id,
                    },
                    select: { id: true, status: true, contractName: true },
                });

                if (!project)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "This project doesn't exist.",
                    });

                if (!project.contractName)
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Sign the agreement before approving the work.",
                    });

                if (project.status === "APPROVED") return { id: project.id };

                await ctx.db.$transaction([
                    ctx.db.project.update({
                        where: { id: project.id },
                        data: { status: "APPROVED", progress: 100 },
                    }),
                    ctx.db.projectMessage.create({
                        data: {
                            projectId: project.id,
                            side: "system",
                            author: "system",
                            text: `${portal.client.name} approved the work`,
                        },
                    }),
                ]);

                return { id: project.id };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[portal.approveWork] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't record your approval. Please try again.",
                });
            }
        }),

    postMessage: publicProcedure
        .input(
            refInput.extend({
                projectId: z.string().min(1),
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
                const portal = await resolvePortal(ctx.db, input.ref);
                await assertAccess(portal, input.password);

                const project = await ctx.db.project.findFirst({
                    where: {
                        id: input.projectId,
                        clientId: portal.client.id,
                    },
                    select: { id: true },
                });

                if (!project)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "This project doesn't exist.",
                    });

                const cleanText = sanitize(input.text);
                const cleanFile = input.file ? sanitize(input.file) : "";

                if (cleanText.length < 1 && cleanFile.length < 1)
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Write a message or attach a file.",
                    });

                await ctx.db.projectMessage.create({
                    data: {
                        projectId: project.id,
                        side: "client",
                        author: portal.client.name,
                        text: cleanText,
                        file: cleanFile || null,
                    },
                });

                return { id: project.id };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[portal.postMessage] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't post your message. Please try again.",
                });
            }
        }),
});
