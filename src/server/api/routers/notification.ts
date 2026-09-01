import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const notificationSelect = {
    id: true,
    audience: true,
    title: true,
    route: true,
    projectId: true,
    proposalId: true,
    read: true,
    createdAt: true,
} as const;

export const notificationRouter = createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
        try {
            return await ctx.db.notification.findMany({
                where: { userId: ctx.session.user.id },
                orderBy: { createdAt: "desc" },
                take: 100,
                select: notificationSelect,
            });
        } catch (err) {
            if (err instanceof TRPCError) throw err;

            console.error("[notification.list] unexpected error", err);

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "We couldn't load your notifications. Please try again.",
            });
        }
    }),

    unreadCount: protectedProcedure.query(async ({ ctx }) => {
        try {
            return await ctx.db.notification.count({
                where: {
                    userId: ctx.session.user.id,
                    audience: "FREELANCER",
                    read: false,
                },
            });
        } catch (err) {
            if (err instanceof TRPCError) throw err;

            console.error("[notification.unreadCount] unexpected error", err);

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "We couldn't load your notifications. Please try again.",
            });
        }
    }),

    markRead: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            try {
                const result = await ctx.db.notification.updateMany({
                    where: { id: input.id, userId: ctx.session.user.id },
                    data: { read: true },
                });

                return { count: result.count };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[notification.markRead] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't update that notification. Please try again.",
                });
            }
        }),

    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
        try {
            const result = await ctx.db.notification.updateMany({
                where: { userId: ctx.session.user.id, read: false },
                data: { read: true },
            });

            return { count: result.count };
        } catch (err) {
            if (err instanceof TRPCError) throw err;

            console.error("[notification.markAllRead] unexpected error", err);

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "We couldn't update your notifications. Please try again.",
            });
        }
    }),
});
