"use client";

import { useParams } from "next/navigation";
import type { DragEvent } from "react";

import { Select, Tag, Toggle, type StatusKey } from "~/app/_components/ui";
import {
  contractText,
  fmtTime,
  money,
  received,
  statusKey,
} from "~/lib/format";
import { useEzlane } from "~/lib/store";

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
    composer,
    setComposer,
    sendMessage,
    setDragOver,
    clearDragOver,
    previewPortal,
    openGatePreview,
    completeProject,
    reopenProject,
    go,
  } = useEzlane();

  const p = project(id);
  if (!p) return <div>Project not found.</div>;

  const c = client(p.clientId);
  const ct = contractText(p, c, state.settings);
  const comp = composer(p.id);
  const statusLabel = p.completed ? "Completed" : p.status;
  const dropActive = state.dragOver === p.id;

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (state.dragOver !== p.id) setDragOver(p.id);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    clearDragOver();
    const f = e.dataTransfer.files[0];
    if (f) setComposer(p.id, { file: f.name });
  };

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

        <section className="max-lg:order-1">
          <div className="border-divider mb-[6px] flex items-baseline justify-between border-b pb-[8px]">
            <h4 className="font-heading m-0 text-[16px] leading-[1.12] font-semibold tracking-[-0.015em]">
              Thread
            </h4>
            <span className="text-text/45 text-[11.5px]">
              Flat and chronological · no live sync
            </span>
          </div>
          <div className="flex flex-col">
            {p.messages
              .slice()
              .sort((a, b) => a.ts - b.ts)
              .map((m) => (
                <div
                  key={m.id}
                  className="border-divider border-b p-[15px_2px]"
                >
                  {m.side === "system" ? (
                    <div className="text-text/42 text-[11.5px] tracking-[0.03em] italic">
                      {m.text} · {fmtTime(m.ts)}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-[9px]">
                        <span className="font-heading text-[14px] font-semibold">
                          {m.from}
                        </span>
                        <Tag
                          status={m.side === "client" ? "sent" : "done"}
                          className="px-[7px]! py-[1px]! text-[9.5px]!"
                        >
                          {m.side === "client" ? "Client" : "You"}
                        </Tag>
                        <span className="text-text/40 text-[11px]">
                          {fmtTime(m.ts)}
                        </span>
                      </div>
                      <div className="mt-[6px] max-w-[64ch] text-[13.5px] leading-[1.65] max-sm:max-w-full!">
                        {m.text}
                      </div>
                      {m.file ? (
                        <div className="border-divider mt-[9px] inline-flex items-center gap-[8px] rounded-md border p-[6px_11px] text-[12px]">
                          {m.file}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            {p.messages.length === 0 ? (
              <div className="text-text/45 p-[14px_2px] text-[13px]">
                No messages yet. The thread opens once the project is live.
              </div>
            ) : null}
          </div>
          <div
            className={`mt-4 rounded-[5px] border p-3 ${dropActive ? "border-accent bg-accent/8" : "border-divider"}`}
            onDragOver={onDragOver}
            onDragLeave={clearDragOver}
            onDrop={onDrop}
          >
            <textarea
              className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-[70px]! w-full rounded-md border-0! bg-transparent p-0! text-[13.5px]! leading-[1.55] focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
              rows={3}
              placeholder="Write an update…"
              value={comp.text}
              onChange={(e) => setComposer(p.id, { text: e.target.value })}
            />
            {comp.file ? (
              <div className="text-accent-700 border-accent-400 mb-[10px] inline-flex items-center gap-[8px] rounded-md border p-[5px_10px] text-[12px]">
                {comp.file}
                <button
                  className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 text-[13px] no-underline hover:underline"
                  onClick={() => setComposer(p.id, { file: "" })}
                >
                  ×
                </button>
              </div>
            ) : null}
            <div className="mt-[8px] flex items-center gap-[10px]">
              <span className="text-text/40 flex-1 text-[11.5px]">
                {dropActive
                  ? "Drop to attach"
                  : "Drag a file anywhere in this box to attach it"}
              </span>
              <label className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11">
                Attach
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setComposer(p.id, { file: f.name });
                  }}
                />
              </label>
              <button
                className="font-heading text-text border-accent text-accent hover:bg-accent/12 active:bg-accent/22 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
                onClick={() => sendMessage(p.id, "freelancer")}
              >
                Post update
              </button>
            </div>
          </div>
        </section>
      </div>

      <aside className="sticky top-[96px] flex flex-col gap-[16px]">
        <div className="border-divider flex flex-col gap-[10px] rounded-[5px] border p-[15px]">
          <h6 className="font-heading text-text/50 m-0 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
            Client portal
          </h6>
          <div className="text-text/60 text-[12px] leading-[1.55]">
            One link and password per project. No client account.
          </div>
          <div className="border-divider rounded-md border p-[8px_10px] font-mono text-[11.5px] break-all">
            ezlane.app/portal/{p.id}
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-text/50">Password</span>
            <span className="font-mono">{p.password}</span>
          </div>
          <button
            className="font-heading text-text border-accent text-accent hover:bg-accent/12 active:bg-accent/22 mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
            onClick={() => previewPortal(p.id)}
          >
            Preview portal
          </button>
          <button
            className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 mt-0! inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
            onClick={() => {
              openGatePreview(p.id);
              go(`/portal/${p.id}`);
            }}
          >
            Open the gate as a client
          </button>
        </div>
        <div className="border-divider flex flex-col gap-[9px] rounded-[5px] border p-[15px]">
          <h6 className="font-heading text-text/50 m-0 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
            Lifecycle
          </h6>
          <div className="text-text/60 text-[12px] leading-[1.55]">
            {p.completed
              ? "Completed — out of the active list, still fully readable, and no longer counting against your plan."
              : "Marking this completed frees a plan slot. Nothing is deleted or hidden."}
          </div>
          {!p.completed && p.stage === "active" ? (
            <button
              className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
              onClick={() => completeProject(p.id)}
            >
              Mark completed
            </button>
          ) : null}
          {p.completed ? (
            <button
              className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
              onClick={() => reopenProject(p.id)}
            >
              Reopen project
            </button>
          ) : null}
          <button
            className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 text-left text-[12px] no-underline hover:underline"
            onClick={() => go(`/proposals/${p.proposalId}`)}
          >
            View the accepted proposal →
          </button>
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg p-[13px_15px]">
      <div className="text-text/42 text-[10px] tracking-[0.12em] uppercase">
        {label}
      </div>
      <div className="font-heading mt-[4px] text-[21px] tabular-nums">
        {value}
      </div>
    </div>
  );
}
