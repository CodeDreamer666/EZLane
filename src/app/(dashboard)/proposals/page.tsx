"use client";
import { useRouter } from "next/navigation";
import {
    Button,
    LoadingScreen,
    ServerError,
    Tag,
    type StatusKey,
} from "~/components/shared";
import useAddClientModal from "~/hook/useAddClientModal";
import { ago, money, proposalStatusLabel, statusKey } from "~/lib/format";
import { api } from "~/trpc/react";

export default function ProposalsPage() {
    const router = useRouter();
    const { openModal } = useAddClientModal();

    const { data: proposals, isLoading, error } = api.proposals.list.useQuery();

    if (isLoading) return <LoadingScreen />;

    if (error || !proposals) return <ServerError />;

    if (proposals.length === 0) {
        return (
            <div className="border-divider rounded-[5px] border border-dashed p-[56px] text-center">
                <div className="font-heading text-[22px]">
                    Create your first proposal
                </div>
                <p className="text-text/55 m-[8px_auto_16px] max-w-[380px] text-[13.5px]">
                    Price, due date and deliverables sit at the top; the pitch goes
                    underneath. Accepted terms become the project and the contract.
                </p>
                <Button variant="primary" onClick={openModal}>
                    + Add a client to start
                </Button>
            </div>
        );
    }

    const rows = proposals.map((p) => {
        const label = proposalStatusLabel(p.status);
        const updated = p.lastSavedAt
            ? ago(new Date(p.lastSavedAt).getTime())
            : "not saved";
        return { p, label, updated };
    });

    return (
        <>
            {/* Mobile: card list */}
            <div className="flex flex-col gap-3 md:hidden">
                {rows.map(({ p, label, updated }) => (
                    <div
                        key={p.id}
                        className="border-divider bg-surface cursor-pointer rounded-[7px] border p-4"
                        onClick={() => router.push(`/proposals/${p.id}`)}
                    >
                        <div className="font-heading text-[19px] font-semibold break-words">
                            {p.title}
                        </div>
                        <div className="text-text/60 mt-1 text-[13px] break-words">
                            {p.client.name} · {p.client.company ?? "—"}
                        </div>

                        <dl className="mt-3 flex flex-col">
                            <div className="border-divider border-t py-2.5">
                                <dt className="text-text/40 text-[9.5px] tracking-[.11em] uppercase">
                                    Status
                                </dt>
                                <dd className="mt-1.5 flex flex-wrap items-center gap-2">
                                    <Tag
                                        status={statusKey(label) as StatusKey}
                                        className="max-w-full whitespace-normal"
                                    >
                                        {label}
                                    </Tag>
                                </dd>
                            </div>
                            <div className="border-divider border-t py-2.5">
                                <dt className="text-text/40 text-[9.5px] tracking-[.11em] uppercase">
                                    Price
                                </dt>
                                <dd className="mt-1 text-[16px] font-semibold tabular-nums">
                                    {p.price ? money(p.price) : "—"}
                                </dd>
                            </div>
                            <div className="border-divider border-t py-2.5">
                                <dt className="text-text/40 text-[9.5px] tracking-[.11em] uppercase">
                                    Updated
                                </dt>
                                <dd className="text-text/55 mt-1 text-[12.5px]">{updated}</dd>
                            </div>
                        </dl>
                    </div>
                ))}
            </div>

            {/* md+: table */}
            <table className="[&_th]:border-divider [&_th]:text-text/60 [&_td]:border-divider [&_tbody_tr]:hover:bg-text/4 hidden w-full border-collapse text-sm leading-[1.55] md:table [&_td]:border-b [&_td]:p-2 [&_th]:border-b [&_th]:p-2 [&_th]:text-left [&_th]:text-[11px] [&_th]:tracking-[.08em] [&_th]:uppercase">
                <thead>
                    <tr>
                        <th>Client</th>
                        <th>Proposal</th>
                        <th>Status</th>
                        <th className="text-right">Price</th>
                        <th className="text-right">Last updated</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ p, label, updated }) => (
                        <tr
                            key={p.id}
                            className="hover:bg-text/5 cursor-pointer"
                            onClick={() => router.push(`/proposals/${p.id}`)}
                        >
                            <td className="text-[13.5px]">
                                {p.client.name} · {p.client.company ?? "—"}
                            </td>
                            <td className="font-heading text-[15px] font-semibold">
                                {p.title}
                            </td>
                            <td>
                                <Tag status={statusKey(label) as StatusKey}>{label}</Tag>
                            </td>
                            <td className="text-right text-[13.5px] tabular-nums">
                                {p.price ? money(p.price) : "—"}
                            </td>
                            <td className="text-text/55 text-right text-[12.5px]">{updated}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
