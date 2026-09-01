"use client";

import { useRouter } from "next/navigation";
import ProjectCard from "~/components/ProjectCard";
import { LoadingScreen, ServerError, Tag, type StatusKey } from "~/components/shared";
import {
    money,
    projectStatusLabel,
    proposalStatusLabel,
    statusKey,
} from "~/lib/format";
import { api } from "~/trpc/react";

const OUT_FOR_ACCEPTANCE = ["SENT", "CLIENT_COMMENTED", "REVISED"];

function payLabel(depositPaid: boolean, finalPaid: boolean): string {
    if (depositPaid && finalPaid) return "Paid in full";
    if (depositPaid) return "Deposit in";
    return "Unpaid";
}

export default function ProjectsPage() {
    const router = useRouter();

    const { data: projects, isLoading, error } = api.projects.list.useQuery();
    const { data: proposals } = api.proposals.list.useQuery();
    const { data: plan } = api.settings.getPlan.useQuery();

    if (isLoading) return <LoadingScreen />;

    if (error || !projects) return <ServerError />;

    const active = projects.filter((p) => !p.completed);
    const completed = projects.filter((p) => p.completed);
    const prospects = (proposals ?? []).filter((pr) =>
        OUT_FOR_ACCEPTANCE.includes(pr.status),
    );
    const isPro = plan?.plan === "PRO";
    const usageNote = isPro
        ? "Unlimited active projects"
        : `${active.length} of 2 active projects used`;

    return (
        <div className="flex flex-col gap-[34px]">
            <section>
                <div className="border-divider mb-[16px] flex items-baseline justify-between border-b pb-[8px]">
                    <h4 className="font-heading m-0 text-[16px] leading-[1.12] font-semibold tracking-[-0.015em]">
                        Active
                    </h4>
                    <span className="text-text/45 text-[11.5px]">{usageNote}</span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,_minmax(320px,_1fr))] gap-[14px] max-sm:grid-cols-1!">
                    {active.map((p, i) => (
                        <ProjectCard
                            key={p.id}
                            href={`/projects/${p.id}`}
                            clientLabel={p.client.company ?? p.client.name}
                            title={p.proposal.title}
                            statusLabel={projectStatusLabel(p.status)}
                            progress={p.progress}
                            price={p.proposal.price}
                            due={p.proposal.due}
                            payLabel={payLabel(p.depositPaid, p.finalPaid)}
                            blocked={!isPro && i >= 2}
                        />
                    ))}
                </div>
                {active.length === 0 ? (
                    <div className="text-text/55 border-divider rounded-[5px] border border-dashed p-[34px] text-center text-[13px]">
                        Nothing active. A project starts when a client accepts a proposal.
                    </div>
                ) : null}
            </section>

            <section>
                <div className="border-divider mb-[16px] flex items-baseline justify-between border-b pb-[8px]">
                    <h4 className="font-heading m-0 text-[16px] leading-[1.12] font-semibold tracking-[-0.015em]">
                        Completed
                    </h4>
                    <span className="text-text/45 text-[11.5px]">
                        Kept in full — never archived or hidden
                    </span>
                </div>
                <table className="[&_th]:border-divider [&_th]:text-text/60 [&_td]:border-divider [&_tbody_tr]:hover:bg-text/4 max-sm:[&_tr]:border-divider max-sm:[&_td[data-l]::before]:text-text/40 w-full border-collapse text-sm leading-[1.55] max-sm:block! max-sm:w-auto! max-sm:[&_tbody]:block! [&_td]:border-b [&_td]:p-2 max-sm:[&_td]:flex! max-sm:[&_td]:w-auto! max-sm:[&_td]:items-baseline max-sm:[&_td]:justify-between max-sm:[&_td]:gap-3.5 max-sm:[&_td]:border-0! max-sm:[&_td]:px-0! max-sm:[&_td]:py-1! max-sm:[&_td]:text-left! max-sm:[&_td[data-l]::before]:flex-none max-sm:[&_td[data-l]::before]:text-[9.5px] max-sm:[&_td[data-l]::before]:tracking-[.11em] max-sm:[&_td[data-l]::before]:uppercase max-sm:[&_td[data-l]::before]:content-[attr(data-l)] [&_th]:border-b [&_th]:p-2 [&_th]:text-left [&_th]:text-[11px] [&_th]:tracking-[.08em] [&_th]:uppercase max-sm:[&_thead]:hidden max-sm:[&_tr]:mb-2.5 max-sm:[&_tr]:block! max-sm:[&_tr]:w-auto! max-sm:[&_tr]:rounded-[5px] max-sm:[&_tr]:border max-sm:[&_tr]:px-3.5 max-sm:[&_tr]:py-3">
                    <tbody>
                        {completed.map((p) => (
                            <tr
                                key={p.id}
                                className="hover:bg-text/5 cursor-pointer"
                                onClick={() => router.push(`/projects/${p.id}`)}
                            >
                                <td className="font-heading text-[15px] font-semibold">
                                    {p.proposal.title}
                                </td>
                                <td data-l="Client" className="text-text/60 text-[13px]">
                                    {p.client.company ?? p.client.name}
                                </td>
                                <td data-l="Price" className="text-[13px] tabular-nums">
                                    {money(p.proposal.price)}
                                </td>
                                <td data-l="Payment">
                                    {payLabel(p.depositPaid, p.finalPaid)}
                                </td>
                                <td className="text-right">
                                    <Tag status="done">Completed</Tag>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {completed.length === 0 ? (
                    <div className="text-text/45 p-[8px_2px] text-[13px]">
                        No completed projects yet.
                    </div>
                ) : null}
            </section>

            {prospects.length > 0 ? (
                <section>
                    <div className="border-divider mb-[16px] border-b pb-[8px]">
                        <h4 className="font-heading m-0 text-[16px] leading-[1.12] font-semibold tracking-[-0.015em]">
                            Out for acceptance
                        </h4>
                    </div>
                    <table className="[&_th]:border-divider [&_th]:text-text/60 [&_td]:border-divider [&_tbody_tr]:hover:bg-text/4 max-sm:[&_tr]:border-divider max-sm:[&_td[data-l]::before]:text-text/40 w-full border-collapse text-sm leading-[1.55] max-sm:block! max-sm:w-auto! max-sm:[&_tbody]:block! [&_td]:border-b [&_td]:p-2 max-sm:[&_td]:flex! max-sm:[&_td]:w-auto! max-sm:[&_td]:items-baseline max-sm:[&_td]:justify-between max-sm:[&_td]:gap-3.5 max-sm:[&_td]:border-0! max-sm:[&_td]:px-0! max-sm:[&_td]:py-1! max-sm:[&_td]:text-left! max-sm:[&_td[data-l]::before]:flex-none max-sm:[&_td[data-l]::before]:text-[9.5px] max-sm:[&_td[data-l]::before]:tracking-[.11em] max-sm:[&_td[data-l]::before]:uppercase max-sm:[&_td[data-l]::before]:content-[attr(data-l)] [&_th]:border-b [&_th]:p-2 [&_th]:text-left [&_th]:text-[11px] [&_th]:tracking-[.08em] [&_th]:uppercase max-sm:[&_thead]:hidden max-sm:[&_tr]:mb-2.5 max-sm:[&_tr]:block! max-sm:[&_tr]:w-auto! max-sm:[&_tr]:rounded-[5px] max-sm:[&_tr]:border max-sm:[&_tr]:px-3.5 max-sm:[&_tr]:py-3">
                        <tbody>
                            {prospects.map((pr) => {
                                const label = proposalStatusLabel(pr.status);
                                return (
                                    <tr
                                        key={pr.id}
                                        className="hover:bg-text/5 cursor-pointer"
                                        onClick={() => router.push(`/proposals/${pr.id}`)}
                                    >
                                        <td className="font-heading text-[15px] font-semibold">
                                            {pr.title}
                                        </td>
                                        <td data-l="Client" className="text-text/60 text-[13px]">
                                            {pr.client.company ?? pr.client.name}
                                        </td>
                                        <td data-l="Price" className="text-[13px] tabular-nums">
                                            {money(pr.price)}
                                        </td>
                                        <td className="text-right">
                                            <Tag status={statusKey(label) as StatusKey}>
                                                {label}
                                            </Tag>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </section>
            ) : null}
        </div>
    );
}
