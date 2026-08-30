import { accountRouter } from "~/server/api/routers/account";
import { clientRouter } from "~/server/api/routers/client";
import { proposalRouter } from "~/server/api/routers/proposal";
import { settingsRouter } from "~/server/api/routers/settings";
import { createTRPCRouter } from "~/server/api/trpc";
import { createCallerFactory } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
    settings: settingsRouter,
    account: accountRouter,
    clients: clientRouter,
    proposals: proposalRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);

