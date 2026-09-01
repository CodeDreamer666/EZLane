"use client";

import { useRouter } from "next/navigation";

import { LoadingIcon } from "~/components/shared";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import { api } from "~/trpc/react";

interface ProjectSidebarProps {
    id: string;
    clientId: string;
    proposalId: string;
    completed: boolean;
}

const buttonClass =
    "font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11";

export default function ProjectSidebar({
    id,
    clientId,
    proposalId,
    completed,
}: ProjectSidebarProps) {
    const router = useRouter();
    const { showMessage } = useStatusMessage();
    const utils = api.useUtils();

    const complete = api.projects.complete.useMutation({
        onSuccess: () => {
            showMessage("Completed — a plan slot is free", true);
        },

        onError: (err) => {
            showMessage(getFriendlyError(err), false);
        },

        onSettled: async () => {
            await utils.invalidate();
        },
    });

    const reopen = api.projects.reopen.useMutation({
        onSuccess: () => {
            showMessage("Reopened as an active project", true);
        },

        onError: (err) => {
            showMessage(getFriendlyError(err), false);
        },

        onSettled: async () => {
            await utils.invalidate();
        },
    });

    const isBusy = complete.isPending || reopen.isPending;

    return (
        <aside className="sticky top-[96px] flex flex-col gap-[16px]">
            <div className="border-divider flex flex-col gap-[10px] rounded-[5px] border p-[15px]">
                <h6 className="font-heading text-text/50 m-0 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
                    Client portal
                </h6>
                <div className="text-text/60 text-[12px] leading-[1.55]">
                    The portal belongs to the client and shows all of their proposals
                    and projects together. Manage its link and password from the
                    client.
                </div>
                <button
                    className={`${buttonClass} border-accent! text-accent! hover:bg-accent/12! active:bg-accent/22!`}
                    onClick={() => router.push(`/clients/${clientId}`)}
                >
                    Manage the client portal
                </button>
            </div>
            <div className="border-divider flex flex-col gap-[9px] rounded-[5px] border p-[15px]">
                <h6 className="font-heading text-text/50 m-0 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
                    Lifecycle
                </h6>
                <div className="text-text/60 text-[12px] leading-[1.55]">
                    {completed
                        ? "Completed — out of the active list, still fully readable, and no longer counting against your plan."
                        : "Marking this completed frees a plan slot. Nothing is deleted or hidden."}
                </div>
                {completed ? (
                    <button
                        className={buttonClass}
                        onClick={() => reopen.mutate({ id })}
                        disabled={isBusy}
                    >
                        {reopen.isPending ? (
                            <span className="flex items-center gap-1.5">
                                <LoadingIcon className="h-4 w-4" />
                                Reopening...
                            </span>
                        ) : "Reopen project"}
                    </button>
                ) : (
                    <button
                        className={buttonClass}
                        onClick={() => complete.mutate({ id })}
                        disabled={isBusy}
                    >
                        {complete.isPending ? (
                            <span className="flex items-center gap-1.5">
                                <LoadingIcon className="h-4 w-4" />
                                Completing...
                            </span>
                        ) : "Mark completed"}
                    </button>
                )}
                <button
                    className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 text-left text-[12px] no-underline hover:underline"
                    onClick={() => router.push(`/proposals/${proposalId}`)}
                >
                    View the accepted proposal →
                </button>
            </div>
        </aside>
    );
}
