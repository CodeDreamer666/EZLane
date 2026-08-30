"use client";

import type { DragEvent } from "react";

import { fmtTime } from "~/lib/format";
import useEzlane from "~/hook/useEzlane";
import type { Project } from "~/type";

export default function ThreadTab({ project: p }: { project: Project }) {
  const {
    state,
    composer,
    setComposer,
    sendMessage,
    setDragOver,
    clearDragOver,
    approveWork,
  } = useEzlane();
  const comp = composer(p.id);
  const dropActive = state.dragOver === p.id;
  const canApprove =
    (p.stage === "active" || p.completed) &&
    p.status !== "Approved" &&
    !!p.contract;

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
    <div className="max-w-[760px]">
      <div className="border-divider flex items-baseline justify-between border-b pb-[8px]">
        <h4 className="font-heading m-0 text-[16px] leading-[1.12] font-semibold tracking-[-0.015em]">
          Messages
        </h4>
        <span className="text-text/45 text-[11.5px]">
          New messages appear when you reload — nothing is live
        </span>
      </div>
      <div className="flex flex-col">
        {p.messages
          .slice()
          .sort((a, b) => a.ts - b.ts)
          .map((m) => (
            <div key={m.id} className="border-divider border-b p-[15px_2px]">
              {m.side === "system" ? (
                <div className="text-text/42 text-[11.5px] italic">
                  {m.text} · {fmtTime(m.ts)}
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-[9px]">
                    <span className="font-heading text-[14px] font-semibold">
                      {m.from}
                    </span>
                    <span className="text-text/40 text-[11px]">
                      {fmtTime(m.ts)}
                    </span>
                  </div>
                  <div className="mt-[6px] max-w-[62ch] text-[14px] leading-[1.7] max-sm:max-w-full!">
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
          <div className="text-text/45 p-[16px_2px] text-[13px]">
            No messages yet.
          </div>
        ) : null}
      </div>
      <div
        className={`mt-[18px] rounded-[5px] border p-[13px] ${dropActive ? "border-accent bg-accent/8" : "border-divider"}`}
        onDragOver={onDragOver}
        onDragLeave={clearDragOver}
        onDrop={onDrop}
      >
        <textarea
          className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-9 w-full rounded-md border border-0 bg-transparent p-0 px-2.5 py-1.5 text-sm text-[14px] focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
          rows={3}
          placeholder="Reply…"
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
        <div className="mt-[8px] flex flex-wrap items-center gap-[10px]">
          <span className="text-text/40 flex-1 text-[11.5px]">
            {dropActive
              ? "Drop to attach"
              : "Drag a file into this box to attach it"}
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
            onClick={() => sendMessage(p.id, "client")}
          >
            Send message
          </button>
        </div>
      </div>
      {canApprove ? (
        <div className="bg-accent/6 border-accent mt-[20px] flex items-center gap-[16px] rounded-[5px] border p-[16px_18px]">
          <div className="flex-1">
            <div className="font-heading text-[15px] font-semibold">
              Happy with the work?
            </div>
            <div className="text-text/60 mt-[3px] text-[12.5px]">
              Approving is a deliberate step, separate from messaging.
            </div>
          </div>
          <button
            className="font-heading text-text border-accent text-accent hover:bg-accent/12 active:bg-accent/22 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
            onClick={() => approveWork(p)}
          >
            Approve the work
          </button>
        </div>
      ) : null}
      {p.status === "Approved" ? (
        <div className="text-text/55 mt-[20px] text-[12.5px]">
          You approved this work.
        </div>
      ) : null}
    </div>
  );
}
