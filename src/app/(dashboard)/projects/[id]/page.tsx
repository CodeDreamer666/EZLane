"use client";

import { useParams } from "next/navigation";

import ProjectSidebar from "~/components/projects/ProjectSidebar";
import ProjectThread from "~/components/projects/ProjectThread";
import Stat from "~/components/projects/Stat";
import { Select, Tag, Toggle, type StatusKey } from "~/components/shared";
import {
  contractText,
  fmtTime,
  money,
  received,
  statusKey,
} from "~/lib/format";
import useEzlane from "~/hook/useEzlane";

const STATUS_OPTIONS = [
  "Not started",
  "In Progress",
  "Delivered",
  "Awaiting Review",
  "Approved",
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    state,
    client,
    project,
    setStatus,
    patchProject,
    toggleDeposit,
    toggleFinal,
  } = useEzlane();

  const p = project(id);
  if (!p) return <div>Project not found.</div>;

  const c = client(p.clientId);
  const ct = contractText(p, c, state.settings);
  const statusLabel = p.completed ? "Completed" : p.status;

  return (
    <div className="grid grid-cols-[minmax(0,_1fr)_300px] items-start gap-[30px] max-lg:grid-cols-[minmax(0,1fr)]! max-lg:gap-[26px]! max-lg:[&>aside]:static!">
      <div className="flex flex-col gap-[30px]">
        <section>
          <div className="flex flex-wrap items-center gap-[12px]">
            <Tag status={statusKey(statusLabel) as StatusKey}>
              {statusLabel}
            </Tag>
            <span className="text-text/55 text-[12.5px]">
              {c.name} · {c.company || "—"}
            </span>
          </div>
          <h3 className="font-heading m-[9px_0_0] text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">
            {p.title}
          </h3>
          <div className="bg-divider border-divider mt-[18px] grid grid-cols-[repeat(3,_1fr)] gap-[1px] overflow-hidden rounded-[5px] border max-sm:grid-cols-1!">
            <Stat label="Price" value={money(p.price)} />
            <Stat
              label="Due"
              value={
                p.due
                  ? new Date(p.due + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"
              }
            />
            <Stat label="Received" value={money(received(p))} />
          </div>
          <div className="mt-[18px] grid grid-cols-[1fr_1fr] gap-[18px] max-sm:grid-cols-1!">
            <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
              <label>Status</label>
              <Select
                value={p.status}
                onChange={(e) => setStatus(p.id, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
              <div className="text-text/42 mt-[5px] text-[11px]">
                Changing this posts a line in the thread.
              </div>
            </div>
            <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
              <label>Progress — {p.progress}%</label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={p.progress}
                onChange={(e) =>
                  patchProject(p.id, { progress: Number(e.target.value) })
                }
                className="mt-[9px] w-full"
              />
              <div className="text-text/42 mt-[5px] text-[11px]">
                Set by hand — nothing is derived.
              </div>
            </div>
          </div>
          <div className="mt-[20px]">
            <h6 className="font-heading text-text/50 mb-2 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
              Deliverables
            </h6>
            <ul className="m-[10px_0_0] pl-[18px] text-[13.5px] leading-[1.85]">
              {p.deliverables.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="max-lg:order-2">
          <div className="border-divider mb-[16px] flex items-baseline justify-between border-b pb-[8px]">
            <h4 className="font-heading m-0 text-[16px] leading-[1.12] font-semibold tracking-[-0.015em]">
              Contract &amp; payment
            </h4>
            <span className="text-text/45 text-[11.5px]">
              50 / 50 · marked by hand
            </span>
          </div>
          {p.contract ? (
            <>
              <div className="bg-surface/45 border-divider rounded-[5px] border p-[20px_22px]">
                <div className="text-text/80 text-[13.5px] leading-[1.75]">
                  {ct.parties}
                </div>
                <div className="text-text/80 mt-[10px] text-[13.5px] leading-[1.75]">
                  Fee: {ct.price}, paid as {ct.half} on signature and {ct.half}{" "}
                  on completion. Estimated completion {ct.due}.
                </div>
                <div className="border-divider mt-[16px] flex items-center gap-[14px] border-t pt-[14px]">
                  <div className="font-heading text-[19px]">
                    {p.contract.name}
                  </div>
                  <div className="text-text/45 text-[11.5px]">
                    signed {fmtTime(p.contract.ts)}
                  </div>
                </div>
              </div>
              <div className="mt-[14px] flex flex-wrap gap-[10px]">
                <Toggle on={p.deposit} onClick={() => toggleDeposit(p.id)}>
                  Deposit received — {ct.half}
                </Toggle>
                <Toggle on={p.final} onClick={() => toggleFinal(p.id)}>
                  Final payment received — {ct.half}
                </Toggle>
              </div>
            </>
          ) : (
            <div className="text-text/55 border-divider rounded-[5px] border border-dashed p-[26px] text-center text-[13px]">
              No contract yet. It is generated from the accepted proposal&apos;s
              terms — nothing to sign until the client accepts.
            </div>
          )}
        </section>

        <ProjectThread project={p} />
      </div>

      <ProjectSidebar project={p} />
    </div>
  );
}
