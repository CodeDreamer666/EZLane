import type {
    NotificationAudience,
    PrismaClient,
} from "../../generated/prisma";

interface NotificationInput {
    userId: string;
    audience: NotificationAudience;
    title: string;
    route: string;
    projectId?: string;
    proposalId?: string;
}

/**
 * Records an app-wide notification for the freelancer's feed. A `FREELANCER`
 * entry is something they may need to act on; a `CLIENT` entry logs what the
 * client saw. Notifications are a side effect — a failure here must never break
 * the action that triggered it, so the error is logged and swallowed.
 */
export default async function notify(
    db: PrismaClient,
    input: NotificationInput,
): Promise<void> {
    try {
        await db.notification.create({ data: input });
    } catch (err) {
        console.error("[notify] failed to record notification", err);
    }
}
