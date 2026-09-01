import { TRPCError } from "@trpc/server";
import notify from "~/lib/notify";
import type { PrismaClient } from "../../generated/prisma";

/** Active (non-completed) projects allowed at once on the Free plan. Pro is unlimited. */
const FREE_ACTIVE_PROJECT_LIMIT = 2;

/**
 * Locks an accepted proposal and creates its project, enforcing the Free-plan
 * active-project limit. Shared by the freelancer "Mark as accepted" action
 * (`proposalRouter.accept`) and the client-portal acceptance flow
 * (`portalRouter.acceptProposal`) so both stay in sync.
 */
export async function acceptProposalAndCreateProject(
    db: PrismaClient,
    { proposalId, ownerUserId }: { proposalId: string; ownerUserId: string },
): Promise<{ id: string }> {
    const proposal = await db.proposal.findUnique({
        where: { id: proposalId },
        select: {
            userId: true,
            status: true,
            clientId: true,
            title: true,
            client: { select: { name: true } },
            project: { select: { id: true } },
        },
    });

    if (proposal?.userId !== ownerUserId)
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "This proposal doesn't exist or isn't yours.",
        });

    if (proposal.project)
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This proposal already has a project.",
        });

    if (proposal.status === "DRAFT")
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Send the proposal before marking it accepted.",
        });

    const user = await db.user.findUnique({
        where: { id: ownerUserId },
        select: { plan: true },
    });

    if (user?.plan !== "PRO") {
        const activeCount = await db.project.count({
            where: { userId: ownerUserId, completed: false },
        });

        if (activeCount >= FREE_ACTIVE_PROJECT_LIMIT)
            throw new TRPCError({
                code: "FORBIDDEN",
                message:
                    "The Free plan allows 2 active projects. Complete one or upgrade to Pro.",
            });
    }

    const now = new Date();

    const [, project] = await db.$transaction([
        db.proposal.update({
            where: { id: proposalId },
            data: { status: "ACCEPTED", acceptedAt: now },
        }),
        db.project.create({
            data: {
                userId: ownerUserId,
                clientId: proposal.clientId,
                proposalId,
            },
            select: { id: true },
        }),
    ]);

    await notify(db, {
        userId: ownerUserId,
        audience: "FREELANCER",
        title: `${proposal.client.name} accepted “${proposal.title}” — the project is now active`,
        route: `/projects/${project.id}`,
        projectId: project.id,
        proposalId,
    });

    return { id: project.id };
}
