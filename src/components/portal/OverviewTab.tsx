"use client";

import MiniStat from "~/components/portal/MiniStat";
import { Button, Tag, type StatusKey } from "~/components/shared";
import { fmtDate, money, received, statusKey } from "~/lib/format";
import useEzlane from "~/hook/useEzlane";
import type { Project } from "~/type";

export default function OverviewTab({
  project: p,
  proposalId,
}: {
  project: Project;
  proposalId: string;
}) {
  const { state, proposal, go } = useEzlane();
  const pr = proposal(proposalId);
  const live = p.stage === "active" || p.completed;
  const statusLabel = p.completed ? "Completed" : p.status;

  if (!live) {
    return (
      <div className="max-w-[760px]">
        <div className="border-divider rounded-[5px] border border-dashed p-[60px] text-center">
          <div className="font-heading text-[21px]">
            The project starts once you accept
          </div>
          <p className="text-text/52 m-[8px_auto_16px] max-w-[340px] text-[13px]">
            Status, progress and payment appear here as soon as the proposal is
            accepted and signed.
          </p>
          <Button
            variant="primary"
            onClick={() => go(`/portal/${p.id}/proposal`)}
          >
            Read the proposal
          </Button>
        </div>
      </div>
    );
  }

  const deliverables = pr?.deliverables.length
    ? pr.deliverables
    : p.deliverables;

  return (
    <div className="max-w-[760px]">
      <div className="flex items-center gap-[12px]">
        <Tag status={statusKey(statusLabel) as StatusKey}>{statusLabel}</Tag>
        <span className="text-text/50 text-[12.5px]">
          Updated by {state.settings.name}
        </span>
      </div>
      <h3 className="font-heading m-[10px_0_18px] text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">
        {p.title}
      </h3>
      <div className="flex items-center gap-[12px]">
        <div className="bg-text/12 h-[5px] flex-1 overflow-hidden rounded-[3px]">
          <svg className="text-accent block h-full w-full" aria-hidden="true">
            <rect width={`${p.progress}%`} height="100%" fill="currentColor" />
          </svg>
        </div>
        <span className="text-[12.5px] tabular-nums">{p.progress}%</span>
      </div>
      <div className="bg-divider border-divider mt-[22px] grid grid-cols-[repeat(3,_1fr)] gap-[1px] overflow-hidden rounded-[5px] border max-sm:grid-cols-1!">
        <MiniStat label="Price" value={money(p.price)} big />
        <MiniStat label="Estimated due" value={fmtDate(p.due)} big />
        <MiniStat label="Paid" value={money(received(p))} big />
      </div>
      <div className="mt-[24px]">
        <h6 className="font-heading text-text/50 mb-2 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
          Deliverables
        </h6>
        <ul className="m-[10px_0_0] pl-[18px] text-[14px] leading-[1.9]">
          {deliverables.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
