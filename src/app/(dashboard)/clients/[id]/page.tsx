"use client";

import { useParams, useRouter } from "next/navigation";

import InfoRow from "~/components/clients/InfoRow";
import {
  Button,
  LoadingScreen,
  ServerError,
  Tag,
  type StatusKey,
} from "~/components/shared";
import getFriendlyError from "~/lib/getFriendlyError";
import { fmtDate, money, proposalStatusLabel, statusKey } from "~/lib/format";
import useStatusMessage from "~/hook/useStatusMessage";
import { api } from "~/trpc/react";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showMessage } = useStatusMessage();

  const { data: client, isLoading, error } = api.clients.byId.useQuery({ id });
  const { data: proposals } = api.proposals.list.useQuery();

  const createProposal = api.proposals.create.useMutation({
    onSuccess: (proposal) => {
      router.push(`/proposals/${proposal.id}`);
    },
    onError: (err) => {
      showMessage(getFriendlyError(err), false);
    },
  });

  const writeProposal = () => {
    if (createProposal.isPending) return;
    createProposal.mutate({ clientId: id });
  };

  if (isLoading) return <LoadingScreen />;

  if (error || !client) return <ServerError />;

  const clientProposals = (proposals ?? []).filter((p) => p.clientId === id);

  return (
    <div className="grid grid-cols-[minmax(0,_1fr)_260px] items-start gap-[32px] max-lg:grid-cols-[minmax(0,1fr)]! max-lg:gap-[26px]! max-lg:[&>aside]:static!">
      <div>
        <h3 className="font-heading m-[0_0_2px] text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">
          {client.name}
        </h3>
        <div className="text-text/58 text-[13px]">{client.company ?? "—"}</div>
        <hr className="bg-divider my-4 h-px border-0" />
        <h6 className="font-heading text-text/50 mb-2 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
          Proposals
        </h6>
        <div className="mt-[12px] flex flex-col gap-[10px]">
          {clientProposals.map((p) => {
            const label = proposalStatusLabel(p.status);
            return (
              <div
                key={p.id}
                className="border-divider hover:bg-text/5 flex cursor-pointer flex-col gap-2 gap-[8px] rounded-md border bg-transparent p-3"
                onClick={() => router.push(`/proposals/${p.id}`)}
              >
                <div className="flex items-start gap-[12px]">
                  <div className="flex-1">
                    <div className="font-heading text-text text-[17px] leading-[1.2] font-semibold">
                      {p.title}
                    </div>
                    <div className="text-text/50 mt-[5px] flex items-center gap-1.5 gap-[14px] text-[11px]">
                      <span className="tabular-nums">{money(p.price)}</span>
                      <span>Due {fmtDate(p.due)}</span>
                    </div>
                  </div>
                  <Tag status={statusKey(label) as StatusKey}>{label}</Tag>
                </div>
              </div>
            );
          })}
        </div>
        {clientProposals.length === 0 ? (
          <div className="text-text/55 border-divider rounded-[5px] border border-dashed p-[26px] text-center text-[13px]">
            No proposals yet for this client.{" "}
            <button
              className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 no-underline hover:underline disabled:cursor-not-allowed disabled:opacity-45"
              disabled={createProposal.isPending}
              onClick={writeProposal}
            >
              Write a proposal
            </button>
          </div>
        ) : null}
      </div>
      <aside className="border-divider flex flex-col gap-[12px] rounded-[5px] border p-[15px]">
        <InfoRow label="Email" value={client.email} />
        <InfoRow label="Company" value={client.company ?? "—"} />
        <InfoRow label="Notes" value={client.notes ?? "No notes."} muted />
        <Button
          variant="primary"
          block
          disabled={createProposal.isPending}
          onClick={writeProposal}
        >
          New proposal
        </Button>
      </aside>
    </div>
  );
}
