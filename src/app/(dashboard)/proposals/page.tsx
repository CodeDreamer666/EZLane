"use client";

import { Button, Tag, type StatusKey } from "~/app/_components/ui";
import { ago, money, statusKey } from "~/lib/format";
import useEzlane from "~/lib/useEzlane";

export default function ProposalsPage() {
  const { state, client, openTab, go, openAddClient } = useEzlane();

  if (state.proposals.length === 0) {
    return (
      <div className="border-divider rounded-[5px] border border-dashed p-[56px] text-center">
        <div className="font-heading text-[22px]">
          Create your first proposal
        </div>
        <p className="text-text/55 m-[8px_auto_16px] max-w-[380px] text-[13.5px]">
          Price, due date and deliverables sit at the top; the pitch goes
          underneath. Accepted terms become the project and the contract.
        </p>
        <Button variant="primary" onClick={openAddClient}>
          + Add a client to start
        </Button>
      </div>
    );
  }

  const rows = state.proposals
    .slice()
    .sort(
      (a, b) => (b.lastSaved ?? b.sentAt ?? 0) - (a.lastSaved ?? a.sentAt ?? 0),
    );

  return (
    <table className="[&_th]:border-divider [&_th]:text-text/60 [&_td]:border-divider [&_tbody_tr]:hover:bg-text/4 max-sm:[&_tr]:border-divider max-sm:[&_td[data-l]::before]:text-text/40 w-full border-collapse text-sm leading-[1.55] max-sm:block! max-sm:w-auto! max-sm:[&_tbody]:block! [&_td]:border-b [&_td]:p-2 max-sm:[&_td]:flex! max-sm:[&_td]:w-auto! max-sm:[&_td]:items-baseline max-sm:[&_td]:justify-between max-sm:[&_td]:gap-3.5 max-sm:[&_td]:border-0! max-sm:[&_td]:px-0! max-sm:[&_td]:py-1! max-sm:[&_td]:text-left! max-sm:[&_td[data-l]::before]:flex-none max-sm:[&_td[data-l]::before]:text-[9.5px] max-sm:[&_td[data-l]::before]:tracking-[.11em] max-sm:[&_td[data-l]::before]:uppercase max-sm:[&_td[data-l]::before]:content-[attr(data-l)] [&_th]:border-b [&_th]:p-2 [&_th]:text-left [&_th]:text-[11px] [&_th]:tracking-[.08em] [&_th]:uppercase max-sm:[&_thead]:hidden max-sm:[&_tr]:mb-2.5 max-sm:[&_tr]:block! max-sm:[&_tr]:w-auto! max-sm:[&_tr]:rounded-[5px] max-sm:[&_tr]:border max-sm:[&_tr]:px-3.5 max-sm:[&_tr]:py-3">
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
        {rows.map((p) => {
          const openComments = p.comments.filter((c) => !c.resolved).length;
          const c = client(p.clientId);
          return (
            <tr
              key={p.id}
              className="hover:bg-text/5 cursor-pointer"
              onClick={() => {
                openTab(p.id);
                go(`/proposals/${p.id}`);
              }}
            >
              <td data-l="Client" className="text-[13.5px]">
                {c.name} · {c.company || "—"}
              </td>
              <td className="font-heading text-[15px] font-semibold">
                {p.title}
              </td>
              <td data-l="Status">
                <Tag status={statusKey(p.status) as StatusKey}>{p.status}</Tag>
                {openComments > 0 ? (
                  <span className="text-accent-700 ml-[8px] text-[11px]">
                    {openComments} open
                  </span>
                ) : null}
              </td>
              <td
                data-l="Price"
                className="text-right text-[13.5px] tabular-nums"
              >
                {p.price ? money(p.price) : "—"}
              </td>
              <td
                data-l="Updated"
                className="text-text/55 text-right text-[12.5px]"
              >
                {p.lastSaved ? ago(p.lastSaved) : "not saved"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
