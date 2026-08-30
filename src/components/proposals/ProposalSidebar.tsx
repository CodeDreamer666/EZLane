"use client";

import SummaryRow from "~/components/proposals/SummaryRow";
import { LoadingIcon, Tag, type StatusKey } from "~/components/shared";
import { fmtDate, money, proposalStatusLabel, statusKey } from "~/lib/format";

interface SidebarProposal {
  status: string;
  lastSavedAt: string | Date | null;
  price: number;
  due: string;
  client: { name: string };
}

export default function ProposalSidebar({
  proposal,
  locked,
  saving,
  sending,
  onSave,
  onSend,
}: {
  proposal: SidebarProposal;
  locked: boolean;
  saving: boolean;
  sending: boolean;
  onSave: () => void;
  onSend: () => void;
}) {
  const label = proposalStatusLabel(proposal.status);
  const busy = saving || sending;

  const lastSaved = proposal.lastSavedAt
    ? `Last saved at ${new Date(proposal.lastSavedAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`
    : "Never saved";

  return (
    <aside className="sticky top-[96px] flex flex-col gap-[18px]">
      <div className="border-divider flex flex-col gap-[11px] rounded-[5px] border p-[15px]">
        <div className="flex items-center justify-between">
          <Tag status={statusKey(label) as StatusKey}>{label}</Tag>
          <span className="text-text/45 text-[11px]">{lastSaved}</span>
        </div>
        <div className="text-text/60 text-[12.5px] leading-[1.5]">
          {locked
            ? "Accepted and locked."
            : proposal.status === "SENT"
              ? "Sent — waiting on the client."
              : "Draft — nothing is visible to the client until you send."}
        </div>
        <div className="flex gap-[8px]">
          <button
            className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
            onClick={onSave}
            disabled={locked || busy}
          >
            {saving ? (
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
            onClick={onSend}
            disabled={locked || busy}
          >
            {sending ? (
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
        <hr className="bg-divider m-[2px_0] my-4 h-px border-0" />
        <div className="flex flex-col gap-[5px] text-[12px]">
          <SummaryRow label="Client" value={proposal.client.name} />
          <SummaryRow label="Price" value={money(proposal.price)} />
          <SummaryRow label="Due" value={fmtDate(proposal.due)} />
        </div>
      </div>
    </aside>
  );
}
