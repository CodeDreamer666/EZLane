import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const accountRouter = createTRPCRouter({
    deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
        const userId = ctx.session.user.id;
        const email = ctx.session.user.email;

        try {
            await ctx.db.$transaction([
                ctx.db.proposal.deleteMany({ where: { userId } }),
                ctx.db.client.deleteMany({ where: { userId } }),
                ctx.db.session.deleteMany({ where: { userId } }),
                ctx.db.account.deleteMany({ where: { userId } }),
                ctx.db.verification.deleteMany({ where: { identifier: email } }),
                ctx.db.user.delete({ where: { id: userId } }),
            ]);

            return { success: true };
        } catch (err) {
            if (err instanceof TRPCError) throw err;

            console.error("[account.deleteAccount] unexpected error", err);

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "We couldn't delete your account. Please try again.",
            });
        }
    }),
});
