"use client";

import MiniStat from "~/components/portal/MiniStat";
import { Tag, type StatusKey } from "~/components/shared";
import { fmtDate, money, projectStatusLabel, statusKey } from "~/lib/format";
import type { RouterOutputs } from "~/trpc/react";

type PortalProject = RouterOutputs["portal"]["project"]["project"];

export default function PortalOverviewTab({
  project,
  brandName,
}: {
  project: PortalProject;
  brandName: string;
}) {
  const proposal = project.proposal;
  const statusLabel = project.completed
    ? "Completed"
    : projectStatusLabel(project.status);
  const paid =
    (project.depositPaid ? proposal.price / 2 : 0) +
    (project.finalPaid ? proposal.price / 2 : 0);

  return (
    <div className="max-w-[760px]">
      <div className="flex items-center gap-[12px]">
        <Tag status={statusKey(statusLabel) as StatusKey}>{statusLabel}</Tag>
        <span className="text-text/50 text-[12.5px]">
          Updated by {brandName}
        </span>
      </div>
      <h3 className="font-heading m-[10px_0_18px] text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">
        {proposal.title}
      </h3>
      <div className="flex items-center gap-[12px]">
        <div className="bg-text/12 h-[5px] flex-1 overflow-hidden rounded-[3px]">
          <svg className="text-accent block h-full w-full" aria-hidden="true">
            <rect
              width={`${project.progress}%`}
              height="100%"
              fill="currentColor"
            />
          </svg>
        </div>
        <span className="text-[12.5px] tabular-nums">{project.progress}%</span>
      </div>
      <div className="bg-divider border-divider mt-[22px] grid grid-cols-[repeat(3,_1fr)] gap-[1px] overflow-hidden rounded-[5px] border max-sm:grid-cols-1!">
        <MiniStat label="Price" value={money(proposal.price)} big />
        <MiniStat label="Estimated due" value={fmtDate(proposal.due)} big />
        <MiniStat label="Paid" value={money(paid)} big />
      </div>
      <div className="mt-[24px]">
        <h6 className="font-heading text-text/50 mb-2 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
          Deliverables
        </h6>
        <ul className="m-[10px_0_0] pl-[18px] text-[14px] leading-[1.9]">
          {proposal.deliverables.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
