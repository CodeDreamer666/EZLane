import { accountRouter } from "~/server/api/routers/account";
import { clientRouter } from "~/server/api/routers/client";
import { clientPortalRouter } from "~/server/api/routers/clientPortal";
import { portalRouter } from "~/server/api/routers/portal";
import { projectRouter } from "~/server/api/routers/project";
import { proposalRouter } from "~/server/api/routers/proposal";
import { settingsRouter } from "~/server/api/routers/settings";
import { createTRPCRouter } from "~/server/api/trpc";
import { createCallerFactory } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
    settings: settingsRouter,
    account: accountRouter,
    clients: clientRouter,
    clientPortal: clientPortalRouter,
    portal: portalRouter,
    proposals: proposalRouter,
    projects: projectRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);

