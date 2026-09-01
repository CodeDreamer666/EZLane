import { TRPCError } from "@trpc/server";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";
import {
    generatePortalPassword,
    generatePortalToken,
} from "~/lib/portalToken";
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const URL_TOKEN_1_LENGTH = 32;
const URL_TOKEN_2_LENGTH = 16;

const URL_SEGMENT_PATTERN = /^[a-z0-9-]+$/;

const urlSegmentSchema = z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Each URL segment must be at least 3 characters")
    .max(40, "Each URL segment must be at most 40 characters")
    .regex(
        URL_SEGMENT_PATTERN,
        "URL segments can use lowercase letters, numbers and hyphens only",
    );

const portalBaseUrl = (env.BETTER_AUTH_URL ?? "").replace(/\/$/, "");

const portalPath = (token1: string, token2: string) =>
    `/portal/${token1}/${token2}`;

const portalFullUrl = (token1: string, token2: string) =>
    `${portalBaseUrl}${portalPath(token1, token2)}`;

export const clientPortalRouter = createTRPCRouter({
    get: protectedProcedure
        .input(z.object({ clientId: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
            try {
                const client = await ctx.db.client.findFirst({
                    where: { id: input.clientId, userId: ctx.session.user.id },
                    select: { id: true },
                });

                if (!client)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "This client doesn't exist or isn't yours.",
                    });

                const portal = await ctx.db.clientPortal.findUnique({
                    where: { clientId: input.clientId },
                    select: {
                        urlToken1: true,
                        urlToken2: true,
                        createdAt: true,
                    },
                });

                if (!portal) return null;

                return {
                    url: portalPath(portal.urlToken1, portal.urlToken2),
                    fullUrl: portalFullUrl(portal.urlToken1, portal.urlToken2),
                    token1: portal.urlToken1,
                    token2: portal.urlToken2,
                    createdAt: portal.createdAt,
                };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[clientPortal.get] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't load the portal. Please try again.",
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
                        message: "This client doesn't exist or isn't yours.",
                    });

                const existing = await ctx.db.clientPortal.findUnique({
                    where: { clientId: input.clientId },
                    select: { id: true },
                });

                if (existing)
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "This client already has a portal.",
                    });

                let urlToken1 = "";

                for (let attempt = 0; attempt < 5; attempt++) {
                    urlToken1 = generatePortalToken(URL_TOKEN_1_LENGTH);

                    const clash = await ctx.db.clientPortal.findUnique({
                        where: { urlToken1 },
                        select: { id: true },
                    });

                    if (!clash) break;
                }

                const password = generatePortalPassword();

                const portal = await ctx.db.clientPortal.create({
                    data: {
                        clientId: input.clientId,
                        urlToken1,
                        urlToken2: generatePortalToken(URL_TOKEN_2_LENGTH),
                        passwordHash: await hashPassword(password),
                    },
                    select: { urlToken1: true, urlToken2: true },
                });

                return {
                    url: portalPath(portal.urlToken1, portal.urlToken2),
                    fullUrl: portalFullUrl(portal.urlToken1, portal.urlToken2),
                    token1: portal.urlToken1,
                    token2: portal.urlToken2,
                    password,
                };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error("[clientPortal.create] unexpected error", err);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't create the portal. Please try again.",
                });
            }
        }),

    changePassword: protectedProcedure
        .input(
            z.object({
                clientId: z.string().min(1),
                password: z
                    .string()
                    .min(8, "Password must be at least 8 characters")
                    .max(72, "Password must be at most 72 characters")
            }),
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const portal = await ctx.db.clientPortal.findFirst({
                    where: {
                        clientId: input.clientId,
                        client: { userId: ctx.session.user.id },
                    },
                    select: { id: true },
                });

                if (!portal)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "This portal doesn't exist or isn't yours.",
                    });

                const password = input.password

                await ctx.db.clientPortal.update({
                    where: { id: portal.id },
                    data: { passwordHash: await hashPassword(password) },
                });

                return { password };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error(
                    "[clientPortal.changePassword] unexpected error",
                    err,
                );

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't change the password. Please try again.",
                });
            }
        }),

    setCustomUrl: protectedProcedure
        .input(
            z.object({
                clientId: z.string().min(1),
                token1: urlSegmentSchema,
                token2: urlSegmentSchema,
            }),
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const portal = await ctx.db.clientPortal.findFirst({
                    where: {
                        clientId: input.clientId,
                        client: { userId: ctx.session.user.id },
                    },
                    select: { id: true },
                });

                if (!portal)
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "This portal doesn't exist or isn't yours.",
                    });

                const user = await ctx.db.user.findUnique({
                    where: { id: ctx.session.user.id },
                    select: { plan: true },
                });

                if (!user) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "The user doesn't exist.",
                    });
                }

                if (user.plan !== "PRO")
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message:
                            "Custom portal URLs are available on the Pro plan. Upgrade to Pro to set one.",
                    });

                const taken = await ctx.db.clientPortal.findFirst({
                    where: {
                        urlToken1: input.token1,
                        NOT: { id: portal.id },
                    },
                    select: { id: true },
                });

                if (taken)
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "That portal URL is already taken.",
                    });

                await ctx.db.clientPortal.update({
                    where: { id: portal.id },
                    data: { urlToken1: input.token1, urlToken2: input.token2 },
                });

                return {
                    url: portalPath(input.token1, input.token2),
                    fullUrl: portalFullUrl(input.token1, input.token2),
                    token1: input.token1,
                    token2: input.token2,
                };
            } catch (err) {
                if (err instanceof TRPCError) throw err;

                console.error(
                    "[clientPortal.setCustomUrl] unexpected error",
                    err,
                );

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "We couldn't save the portal URL. Please try again.",
                });
            }
        }),
});
