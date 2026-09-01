"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    Button,
    Dialog,
    LoadingIcon,
    LoadingScreen,
    ServerError,
    Tag,
    type StatusKey,
} from "~/components/shared";
import useAddClientModal from "~/hook/useAddClientModal";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import { ago, money, proposalStatusLabel, statusKey } from "~/lib/format";
import { api } from "~/trpc/react";

export default function ProposalsPage() {
    const router = useRouter();
    const { openModal } = useAddClientModal();
    const { showMessage } = useStatusMessage();
    const utils = api.useUtils();

    const { data: proposals, isLoading, error } = api.proposals.list.useQuery();

    const [managing, setManaging] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const deleteProposals = api.proposals.delete.useMutation({
        onSuccess: (result) => {
            showMessage(
                `${result.count} proposal${result.count === 1 ? "" : "s"} deleted`,
                true,
            );
            setManaging(false);
            setSelectedIds([]);
            setConfirmOpen(false);
        },

        onError: (err) => {
            showMessage(getFriendlyError(err), false);
        },

        onSettled: async () => {
            await utils.invalidate();
        },
    });

    const toggleSelected = (proposalId: string) => {
        setSelectedIds(
            selectedIds.includes(proposalId)
                ? selectedIds.filter((id) => id !== proposalId)
                : [...selectedIds, proposalId],
        );
    };

    const cancelManage = () => {
        setManaging(false);
        setSelectedIds([]);
    };

    const handleDelete = () => {
        if (selectedIds.length === 0) return;

        deleteProposals.mutate({ ids: selectedIds });
    };

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
            <div className="mb-3 flex items-center gap-2">
                {managing ? (
                    <>
                        <span className="text-text/55 mr-auto text-[13px]">
                            {selectedIds.length} selected
                        </span>
                        <Button
                            variant="secondary"
                            onClick={cancelManage}
                            disabled={deleteProposals.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setConfirmOpen(true)}
                            disabled={selectedIds.length === 0 || deleteProposals.isPending}
                        >
                            Delete selected
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="secondary"
                        className="ml-auto"
                        onClick={() => setManaging(true)}
                    >
                        Manage
                    </Button>
                )}
            </div>

            {/* Mobile: card list */}
            <div className="flex flex-col gap-3 md:hidden">
                {rows.map(({ p, label, updated }) => {
                    const locked = p.status === "ACCEPTED";
                    return (
                        <div
                            key={p.id}
                            className="border-divider bg-surface cursor-pointer rounded-[7px] border p-4"
                            onClick={() => {
                                if (!managing) {
                                    router.push(`/proposals/${p.id}`);
                                    return;
                                }
                                if (!locked) toggleSelected(p.id);
                            }}
                        >
                            <div className="flex items-start gap-3">
                                {managing ? (
                                    <input
                                        type="checkbox"
                                        className="mt-1.5 size-4 flex-none disabled:opacity-40"
                                        checked={selectedIds.includes(p.id)}
                                        disabled={locked}
                                        readOnly
                                    />
                                ) : null}

                                <div className="min-w-0 flex-1">
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
                                            <dd className="text-text/55 mt-1 text-[12.5px]">
                                                {updated}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* md+: table */}
            <table className="[&_th]:border-divider [&_th]:text-text/60 [&_td]:border-divider [&_tbody_tr]:hover:bg-text/4 hidden w-full border-collapse text-sm leading-[1.55] md:table [&_td]:border-b [&_td]:p-2 [&_th]:border-b [&_th]:p-2 [&_th]:text-left [&_th]:text-[11px] [&_th]:tracking-[.08em] [&_th]:uppercase">
                <thead>
                    <tr>
                        {managing ? <th className="w-8"></th> : null}
                        <th>Client</th>
                        <th>Proposal</th>
                        <th>Status</th>
                        <th className="text-right">Price</th>
                        <th className="text-right">Last updated</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ p, label, updated }) => {
                        const locked = p.status === "ACCEPTED";
                        return (
                            <tr
                                key={p.id}
                                className="hover:bg-text/5 cursor-pointer"
                                onClick={() => {
                                    if (!managing) {
                                        router.push(`/proposals/${p.id}`);
                                        return;
                                    }
                                    if (!locked) toggleSelected(p.id);
                                }}
                            >
                                {managing ? (
                                    <td className="w-8">
                                        <input
                                            type="checkbox"
                                            className="size-4 disabled:opacity-40"
                                            checked={selectedIds.includes(p.id)}
                                            disabled={locked}
                                            readOnly
                                        />
                                    </td>
                                ) : null}
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
                                <td className="text-text/55 text-right text-[12.5px]">
                                    {updated}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <Dialog
                open={confirmOpen}
                onClose={() => {
                    if (!deleteProposals.isPending) setConfirmOpen(false);
                }}
                title="Delete proposals?"
                actions={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setConfirmOpen(false)}
                            disabled={deleteProposals.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleDelete}
                            disabled={deleteProposals.isPending}
                        >
                            {deleteProposals.isPending ? (
                                <div className="flex items-center gap-2">
                                    <LoadingIcon />
                                    Deleting...
                                </div>
                            ) : "Delete"}
                        </Button>
                    </>
                }
            >
                Deleting {selectedIds.length} proposal
                {selectedIds.length === 1 ? "" : "s"} cannot be undone.
            </Dialog>
        </>
    );
}
