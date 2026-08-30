import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "~/server/better-auth";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        redirect("/?error=auth-required");
    }

    return <DashboardShell>{children}</DashboardShell>;
}
