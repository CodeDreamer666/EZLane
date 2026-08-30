"use client";

import type { DragEvent } from "react";

import { Tag } from "~/components/shared";
import { fmtTime } from "~/lib/format";
import useEzlane from "~/hook/useEzlane";
import type { Project } from "~/type";

export default function ProjectThread({ project: p }: { project: Project }) {
  const {
    state,
    composer,
    setComposer,
    sendMessage,
    setDragOver,
    clearDragOver,
  } = useEzlane();

  const comp = composer(p.id);
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
            <div key={m.id} className="border-divider border-b p-[15px_2px]">
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
  );
}
