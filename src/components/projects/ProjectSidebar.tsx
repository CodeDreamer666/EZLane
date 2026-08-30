"use client";

import useEzlane from "~/hook/useEzlane";
import type { Project } from "~/type";

export default function ProjectSidebar({ project: p }: { project: Project }) {
  const { previewPortal, openGatePreview, completeProject, reopenProject, go } =
    useEzlane();

  return (
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
  );
}
