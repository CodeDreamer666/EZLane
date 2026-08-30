import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { env } from "~/env";
import { db } from "~/server/db";

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,

    database: prismaAdapter(db, {
        provider: "postgresql",
    }),

    socialProviders: {
        google: {
            prompt: "select_account",
            clientId: env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
        },
    },

    plugins: [nextCookies()],
});
