"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ProjectSidebar from "~/components/projects/ProjectSidebar";
import ProjectThread from "~/components/projects/ProjectThread";
import Stat from "~/components/projects/Stat";
import {
    LoadingScreen,
    Select,
    ServerError,
    Tag,
    Toggle,
    type StatusKey,
} from "~/components/shared";
import { fmtDate, money, projectStatusLabel, statusKey } from "~/lib/format";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import { api } from "~/trpc/react";

const STATUS_OPTIONS = [
    { value: "NOT_STARTED", label: "Not started" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "AWAITING_REVIEW", label: "Awaiting Review" },
    { value: "APPROVED", label: "Approved" },
] as const;

type ProjectStatusValue = (typeof STATUS_OPTIONS)[number]["value"];

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { showMessage } = useStatusMessage();
    const utils = api.useUtils();

    const { data: project, isLoading, error } = api.projects.byId.useQuery({ id });
    const { data: invoice } = api.settings.getInvoice.useQuery();

    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (project) setProgress(project.progress);
    }, [project]);

    const setStatus = api.projects.setStatus.useMutation({
        onSuccess: () => {
            showMessage("Status updated", true);
        },

        onError: (err) => {
            showMessage(getFriendlyError(err), false);
        },

        onSettled: async () => {
            await utils.invalidate();
        },
    });

    const updateProgress = api.projects.setProgress.useMutation({
        onError: (err) => {
            showMessage(getFriendlyError(err), false);
        },

        onSettled: async () => {
            await utils.invalidate();
        },
    });

    const setDeposit = api.projects.setDeposit.useMutation({
        onError: (err) => {
            showMessage(getFriendlyError(err), false);
        },

        onSettled: async () => {
            await utils.invalidate();
        },
    });

    const setFinal = api.projects.setFinal.useMutation({
        onError: (err) => {
            showMessage(getFriendlyError(err), false);
        },

        onSettled: async () => {
            await utils.invalidate();
        },
    });

    const commitProgress = () => {
        if (!project || progress === project.progress) return;
        updateProgress.mutate({ id, progress });
    };

    if (isLoading) return <LoadingScreen />;

    if (error || !project) return <ServerError />;

    const clientLabel = project.client.company ?? project.client.name;
    const statusLabel = project.completed
        ? "Completed"
        : projectStatusLabel(project.status);
    const price = project.proposal.price;
    const received =
        (project.depositPaid ? price / 2 : 0) +
        (project.finalPaid ? price / 2 : 0);
    const half = money(Math.round(price / 2));
    const contractorName = invoice?.invoiceDisplayName ?? "the Contractor";

    return (
        <div className="grid grid-cols-[minmax(0,_1fr)_300px] items-start gap-[30px] max-lg:grid-cols-[minmax(0,1fr)]! max-lg:gap-[26px]! max-lg:[&>aside]:static!">
            <div className="flex flex-col gap-[30px]">
                <section>
                    <div className="flex flex-wrap items-center gap-[12px]">
                        <Tag status={statusKey(statusLabel) as StatusKey}>{statusLabel}</Tag>
                        <span className="text-text/55 text-[12.5px]">
                            {project.client.name} · {project.client.company ?? "—"}
                        </span>
                    </div>
                    <h3 className="font-heading m-[9px_0_0] text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">
                        {project.proposal.title}
                    </h3>
                    <div className="bg-divider border-divider mt-[18px] grid grid-cols-[repeat(3,_1fr)] gap-[1px] overflow-hidden rounded-[5px] border max-sm:grid-cols-1!">
                        <Stat label="Price" value={money(price)} />
                        <Stat label="Due" value={fmtDate(project.proposal.due)} />
                        <Stat label="Received" value={money(received)} />
                    </div>
                    <div className="mt-[18px] grid grid-cols-[1fr_1fr] gap-[18px] max-sm:grid-cols-1!">
                        <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
                            <label>Status</label>
                            <Select
                                value={project.status}
                                disabled={project.completed || setStatus.isPending}
                                onChange={(e) =>
                                    setStatus.mutate({
                                        id,
                                        status: e.target.value as ProjectStatusValue,
                                    })
                                }
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </Select>
                            <div className="text-text/42 mt-[5px] text-[11px]">
                                Changing this posts a line in the thread.
                            </div>
                        </div>
                        <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
                            <label>Progress — {progress}%</label>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                value={progress}
                                onChange={(e) => setProgress(Number(e.target.value))}
                                onPointerUp={commitProgress}
                                onKeyUp={commitProgress}
                                className="mt-[9px] w-full"
                            />
                            <div className="text-text/42 mt-[5px] text-[11px]">
                                Set by hand — nothing is derived.
                            </div>
                        </div>
                    </div>
                    <div className="mt-[20px]">
                        <h6 className="font-heading text-text/50 mb-2 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
                            Deliverables
                        </h6>
                        <ul className="m-[10px_0_0] pl-[18px] text-[13.5px] leading-[1.85]">
                            {project.proposal.deliverables.map((d, i) => (
                                <li key={i}>{d}</li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="max-lg:order-2">
                    <div className="border-divider mb-[16px] flex items-baseline justify-between border-b pb-[8px]">
                        <h4 className="font-heading m-0 text-[16px] leading-[1.12] font-semibold tracking-[-0.015em]">
                            Contract &amp; payment
                        </h4>
                        <span className="text-text/45 text-[11.5px]">
                            50 / 50 · marked by hand
                        </span>
                    </div>
                    {project.contractName ? (
                        <div className="bg-surface/45 border-divider rounded-[5px] border p-[20px_22px]">
                            <div className="text-text/80 text-[13.5px] leading-[1.75]">
                                This agreement is made between {contractorName} (“the
                                Contractor”) and {clientLabel} (“the Client”).
                            </div>
                            <div className="text-text/80 mt-[10px] text-[13.5px] leading-[1.75]">
                                Fee: {money(price)}, paid as {half} on signature and {half} on
                                completion. Estimated completion{" "}
                                {fmtDate(project.proposal.due)}.
                            </div>
                            <div className="border-divider mt-[16px] flex items-center gap-[14px] border-t pt-[14px]">
                                <div className="font-heading text-[19px]">
                                    {project.contractName}
                                </div>
                                {project.contractSignedAt ? (
                                    <div className="text-text/45 text-[11.5px]">
                                        signed{" "}
                                        {new Date(project.contractSignedAt).toLocaleString(
                                            "en-US",
                                            {
                                                month: "short",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                            },
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <div className="text-text/55 border-divider rounded-[5px] border border-dashed p-[20px] text-center text-[13px]">
                            No signed contract yet. It is generated from the proposal terms
                            when the client signs in the portal. You can still track payments
                            below.
                        </div>
                    )}
                    <div className="mt-[14px] flex flex-wrap gap-[10px]">
                        <Toggle
                            on={project.depositPaid}
                            disabled={setDeposit.isPending}
                            onClick={() =>
                                setDeposit.mutate({ id, paid: !project.depositPaid })
                            }
                        >
                            Deposit received — {half}
                        </Toggle>
                        <Toggle
                            on={project.finalPaid}
                            disabled={setFinal.isPending}
                            onClick={() => setFinal.mutate({ id, paid: !project.finalPaid })}
                        >
                            Final payment received — {half}
                        </Toggle>
                    </div>
                </section>

                <ProjectThread projectId={project.id} messages={project.messages} />
            </div>

            <ProjectSidebar
                id={project.id}
                clientId={project.client.id}
                proposalId={project.proposalId}
                completed={project.completed}
            />
        </div>
    );
}
