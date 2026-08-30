"use client";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SummaryRow from "~/components/proposals/SummaryRow";
import ProposalToolbar from "~/components/proposals/ProposalToolbar";
import {
    LoadingIcon,
    LoadingScreen,
    ServerError,
    Tag,
    type StatusKey,
} from "~/components/shared";
import { fmtDate, money, proposalStatusLabel, statusKey } from "~/lib/format";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import {
    DEFAULT_PROPOSAL_FONT,
    DEFAULT_PROPOSAL_FONT_SIZE,
    type ProposalEditorForm,
    proposalUpdateZodSchema,
} from "~/schema/proposal";
import { api } from "~/trpc/react";

export default function ProposalEditorPage() {
    const { id } = useParams<{ id: string }>();
    const { showMessage } = useStatusMessage();

    const utils = api.useUtils();

    const { data: proposal, isLoading, error } = api.proposals.byId.useQuery({ id });
    const { data: plan } = api.settings.getPlan.useQuery();

    const [form, setForm] = useState<ProposalEditorForm>({
        title: "",
        price: 0,
        due: "",
        deliverables: [],
        font: DEFAULT_PROPOSAL_FONT,
        fontSize: DEFAULT_PROPOSAL_FONT_SIZE,
    });

    const bodyRef = useRef<HTMLDivElement>(null);
    const loadedId = useRef<string | null>(null);

    useEffect(() => {
        if (!proposal || loadedId.current === proposal.id) return;

        setForm({
            title: proposal.title,
            price: proposal.price,
            due: proposal.due,
            deliverables: proposal.deliverables,
            font: proposal.font ?? DEFAULT_PROPOSAL_FONT,
            fontSize: proposal.fontSize ?? DEFAULT_PROPOSAL_FONT_SIZE,
        });

        if (bodyRef.current) bodyRef.current.innerHTML = proposal.body;
        
        loadedId.current = proposal.id;
    }, [proposal]);

    const updateProposal = api.proposals.update.useMutation({
        onSuccess: () => {
            showMessage("Proposal saved", true);
        },

        onError: (err) => {
            showMessage(getFriendlyError(err), false);
        },

        onSettled: async () => {
            await utils.invalidate();
        },
    });

    const sendProposal = api.proposals.send.useMutation({
        onSuccess: () => {
            showMessage("Proposal sent", true);
        },

        onError: (err) => {
            showMessage(getFriendlyError(err), false);
        },

        onSettled: async () => {
            await utils.invalidate();
        },
    });

    const isBusy = updateProposal.isPending || sendProposal.isPending;

    const exec = (cmd: string, val?: string) => {
        document.execCommand(cmd, false, val ?? undefined);
        bodyRef.current?.focus();
    };

    const handleSave = () => {
        if (isBusy) return;

        const result = proposalUpdateZodSchema.safeParse({
            id,
            ...form,
            body: bodyRef.current?.innerHTML ?? proposal?.body ?? "",
        });

        if (!result.success) {
            showMessage(
                result.error.issues[0]?.message ?? "Please check the terms and try again.",
                false,
            );
            return;
        }

        updateProposal.mutate(result.data);
    };

    const handleSend = () => {
        if (isBusy) return;
        sendProposal.mutate({ id });
    };

    if (isLoading) return <LoadingScreen />;

    if (error || !proposal) return <ServerError />;

    const statusLabel = proposalStatusLabel(proposal.status);
    const isProposalAccepted = proposal.status === "ACCEPTED"

    return (
        <div>
            <div className="border-divider mb-[22px] flex items-end gap-[3px] overflow-auto border-b max-sm:hidden!">
                <div className="font-body border-divider bg-surface text-text flex max-w-[230px] items-center gap-2 rounded-t-[5px] border border-b-0 px-[13px] py-2 text-[12.5px] leading-[normal] whitespace-nowrap">
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {proposal.client.name.split(" ")[0]} — {proposal.title}
                    </span>
                </div>
                <Link
                    href="/proposals"
                    className="font-body text-text/72 hover:bg-text/8 hover:text-text mb-[6px] ml-[4px] min-w-7 cursor-pointer rounded-[3px] border border-transparent bg-transparent px-[8px] py-[3px] text-[13px] leading-[normal] whitespace-nowrap max-lg:min-h-[38px] max-lg:min-w-[38px]"
                >
                    All proposals
                </Link>
            </div>

            <div className="grid grid-cols-[minmax(0,_1fr)_282px] items-start gap-[30px] max-lg:grid-cols-[minmax(0,1fr)]! max-lg:gap-[26px]! max-lg:[&>aside]:static!">
                <div>
                    <div className="bg-surface/55 border-divider flex flex-col gap-[16px] rounded-[5px] border p-[18px_20px]">
                        <div className="flex items-baseline justify-between">
                            <h6 className="font-heading text-text/50 m-0 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
                                Terms — the source of truth
                            </h6>
                        </div>
                        <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
                            <label>Project title</label>
                            <input
                                className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-9 w-full rounded-md border bg-transparent px-2.5 py-1.5 text-sm focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
                                value={form.title}
                                maxLength={200}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                disabled={isProposalAccepted}
                            />
                        </div>
                        <div className="grid grid-cols-[1fr_1fr] gap-[14px] max-sm:grid-cols-1!">
                            <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
                                <label>Price (USD)</label>
                                <input
                                    className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-9 w-full rounded-md border bg-transparent px-2.5 py-1.5 text-sm tabular-nums focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
                                    type="number"
                                    value={form.price}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            price: Math.trunc(Number(e.target.value) || 0),
                                        })
                                    }
                                    disabled={isProposalAccepted}
                                />
                            </div>
                            <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
                                <label>Estimated due date</label>
                                <input
                                    className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-9 w-full rounded-md border bg-transparent px-2.5 py-1.5 text-sm focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
                                    type="date"
                                    value={form.due}
                                    onChange={(e) => setForm({ ...form, due: e.target.value })}
                                    disabled={isProposalAccepted}
                                />
                            </div>
                        </div>
                        <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
                            <label>Deliverables</label>
                            <div className="flex flex-col gap-[7px]">
                                {form.deliverables.map((d, i) => (
                                    <div key={i} className="flex items-center gap-[8px]">
                                        <span className="text-text/38 w-[14px] text-[11px] tabular-nums">
                                            {i + 1}
                                        </span>
                                        <input
                                            className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-9 w-full rounded-md border bg-transparent px-2.5 py-1.5 text-sm focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
                                            value={d}
                                            maxLength={255}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    deliverables: form.deliverables.map((item, idx) =>
                                                        idx === i ? e.target.value : item,
                                                    ),
                                                })
                                            }
                                            disabled={isProposalAccepted}
                                        />
                                        <button
                                            className="font-body text-text/72 hover:bg-text/8 hover:text-text min-w-7 cursor-pointer rounded-[3px] border border-transparent bg-transparent px-[8px] py-[3px] text-[13px] leading-[normal] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-35 max-lg:min-h-[38px] max-lg:min-w-[38px]"
                                            onClick={() =>
                                                setForm({
                                                    ...form,
                                                    deliverables: form.deliverables.filter(
                                                        (_, idx) => idx !== i,
                                                    ),
                                                })
                                            }
                                            disabled={isProposalAccepted}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <div className="flex w-full items-center justify-end">
                                    <button
                                        className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 inline-flex cursor-pointer items-center justify-center gap-1.5 self-start rounded-md border bg-transparent px-[11px] py-[5px] text-[12.5px] leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
                                        onClick={() =>
                                            setForm({
                                                ...form,
                                                deliverables: form.deliverables.concat([""]),
                                            })
                                        }
                                        disabled={isProposalAccepted}
                                    >
                                        + Add item
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-divider mt-[20px] overflow-hidden rounded-[5px] border">
                        <ProposalToolbar
                            form={form}
                            setForm={setForm}
                            locked={isProposalAccepted}
                            fontLocked={plan?.plan !== "PRO"}
                            exec={exec}
                        />
                        <div
                            ref={bodyRef}
                            contentEditable={!isProposalAccepted}
                            suppressContentEditableWarning
                            className={`[&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading [&_a]:text-accent [&_a]:underline [&_h1]:mt-6 [&_h1]:mb-2.5 [&_h1]:text-[27px] [&_h1]:leading-[1.12] [&_h1]:font-semibold [&_h1]:tracking-[-0.02em] min-h-[420px] px-[30px] pt-[26px] pb-10 leading-[1.72] outline-none max-sm:px-4 max-sm:pt-[18px] max-sm:pb-8 [&_h2]:mt-[22px] [&_h2]:mb-2 [&_h2]:text-[22px] [&_h2]:leading-[1.12] [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h3]:mt-[18px] [&_h3]:mb-1.5 [&_h3]:text-lg [&_h3]:leading-[1.12] [&_h3]:font-semibold [&_h3]:tracking-[-0.015em] [&_b]:font-bold [&_strong]:font-bold [&_ul]:list-disc [&_ol]:list-decimal [&_li]:list-outside [&_li]:pl-1 [&_li]:marker:text-text/70 [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:pl-[22px] [&_ol]:leading-[1.7] [&_p]:mb-3 [&_p]:leading-[1.72] [&_ul]:mb-3 [&_ul]:pl-[22px] [&_ul]:leading-[1.7] ${form.font === "Lora" ? "font-body" : form.font === "Cormorant Garamond" ? "font-heading" : "font-sans"} ${form.fontSize === "14" ? "text-sm" : form.fontSize === "15" ? "text-[15px]" : form.fontSize === "16" ? "text-base" : "text-lg"}`}
                        />
                    </div>

                    {isProposalAccepted ? (
                        <div className="text-text/55 mt-[12px] text-[12.5px]">
                            Accepted on{" "}
                            {proposal.sentAt
                                ? fmtDate(new Date(proposal.sentAt).toISOString().slice(0, 10))
                                : "—"}{" "}
                            — this proposal is locked.
                        </div>
                    ) : null}

                </div>

                <aside className="sticky top-[96px] flex flex-col gap-[18px]">
                    <div className="bg-surface/55 border-divider shadow-sm flex flex-col gap-[13px] rounded-[5px] border p-[16px_17px]">
                        <div className="flex items-center justify-between gap-2">
                            <Tag status={statusKey(statusLabel) as StatusKey}>{statusLabel}</Tag>
                            <span className="text-text/40 text-[10.5px] tracking-[0.04em] uppercase">
                                {proposal.lastSavedAt
                                    ? `Last saved at ${new Date(proposal.lastSavedAt).toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}`
                                    : "Never saved"}
                            </span>
                        </div>
                        <div className="text-text/60 text-[12.5px] leading-[1.5]">
                            {isProposalAccepted
                                ? "Accepted and locked."
                                : proposal.status === "SENT"
                                    ? "Sent — waiting on the client."
                                    : "Draft — nothing is visible to the client until you send."}
                        </div>
                        <div className="flex gap-[8px]">
                            <button
                                className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
                                onClick={handleSave}
                                disabled={isProposalAccepted || isBusy}
                            >
                                {updateProposal.isPending ? (
                                    <span className="flex items-center gap-1.5">
                                        <LoadingIcon className="h-4 w-4" />
                                        Saving...
                                    </span>
                                ) : (
                                    "Save"
                                )}
                            </button>
                            <button
                                className="font-heading text-text border-accent text-accent hover:bg-accent/12 active:bg-accent/22 inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
                                onClick={handleSend}
                                disabled={isProposalAccepted || isBusy}
                            >
                                {sendProposal.isPending ? (
                                    <span className="flex items-center gap-1.5">
                                        <LoadingIcon className="h-4 w-4" />
                                        Sending...
                                    </span>
                                ) : proposal.status === "DRAFT" ? (
                                    "Send"
                                ) : (
                                    "Send revision"
                                )}
                            </button>
                        </div>
                        <div className="mt-[3px]">
                            <div className="text-text/38 mb-[8px] text-[10px] font-medium tracking-[0.12em] uppercase">
                                Summary
                            </div>
                            <div className="grid grid-cols-3 gap-[7px] max-sm:grid-cols-1">
                                <SummaryRow label="Client" value={proposal.client.name} />
                                <SummaryRow label="Price" value={money(proposal.price)} />
                                <SummaryRow label="Due" value={fmtDate(proposal.due)} />
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
