"use client";

import { useParams } from "next/navigation";

import { Button, Tag, type StatusKey } from "~/app/_components/ui";
import InfoRow from "~/app/_components/clients/InfoRow";
import { fmtDate, money, statusKey } from "~/lib/format";
import useEzlane from "~/lib/useEzlane";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { client, state, newProposal, go } = useEzlane();
  const c = client(id);
  const projects = state.projects.filter(
    (p) => p.clientId === id && p.stage !== "proposal",
  );

  return (
    <div className="grid grid-cols-[minmax(0,_1fr)_260px] items-start gap-[32px] max-lg:grid-cols-[minmax(0,1fr)]! max-lg:gap-[26px]! max-lg:[&>aside]:static!">
      <div>
        <h3 className="font-heading m-[0_0_2px] text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">
          {c.name}
        </h3>
        <div className="text-text/58 text-[13px]">{c.company || "—"}</div>
        <hr className="bg-divider my-4 h-px border-0" />
        <h6 className="font-heading text-text/50 mb-2 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
          Projects
        </h6>
        <div className="mt-[12px] flex flex-col gap-[10px]">
          {projects.map((p) => {
            const status = p.completed ? "Completed" : p.status;
            const stageLabel = p.completed
              ? "Completed"
              : p.stage === "proposal"
                ? "Proposal out"
                : "Active";
            return (
              <div
                key={p.id}
                className="border-divider hover:bg-text/5 flex cursor-pointer flex-col gap-2 gap-[8px] rounded-md border bg-transparent p-3"
                onClick={() => go(`/projects/${p.id}`)}
              >
                <div className="flex items-start gap-[12px]">
                  <div className="flex-1">
                    <div className="font-heading text-text text-[17px] leading-[1.2] font-semibold">
                      {p.title}
                    </div>
                    <div className="text-text/50 mt-[5px] flex items-center gap-1.5 gap-[14px] text-[11px]">
                      <span className="tabular-nums">{money(p.price)}</span>
                      <span>{stageLabel}</span>
                      <span>Due {fmtDate(p.due)}</span>
                    </div>
                  </div>
                  <Tag status={statusKey(status) as StatusKey}>{status}</Tag>
                </div>
              </div>
            );
          })}
        </div>
        {projects.length === 0 ? (
          <div className="text-text/55 border-divider rounded-[5px] border border-dashed p-[26px] text-center text-[13px]">
            No projects yet for this client.{" "}
            <button
              className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 no-underline hover:underline"
              onClick={() => newProposal(id)}
            >
              Write a proposal
            </button>
          </div>
        ) : null}
      </div>
      <aside className="border-divider flex flex-col gap-[12px] rounded-[5px] border p-[15px]">
        <InfoRow label="Email" value={c.email} />
        <InfoRow label="Company" value={c.company || "—"} />
        <InfoRow label="Notes" value={c.notes || "No notes."} muted />
        <Button variant="primary" block onClick={() => newProposal(id)}>
          New proposal
        </Button>
      </aside>
    </div>
  );
}
