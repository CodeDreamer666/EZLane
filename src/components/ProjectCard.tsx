"use client";

import Link from "next/link";

import { Tag, type StatusKey } from "~/components/shared";
import { companyOrName, fmtDate, money, statusKey } from "~/lib/format";
import useEzlane from "~/hook/useEzlane";
import type { Project } from "~/type";

export default function ProjectCard({
  project,
  blocked = false,
}: {
  project: Project;
  blocked?: boolean;
}) {
  const { client } = useEzlane();
  const c = client(project.clientId);
  const status = project.completed ? "Completed" : project.status;
  const payLabel =
    project.deposit && project.final
      ? "Paid in full"
      : project.deposit
        ? "Deposit in"
        : "Unpaid";

  return (
    <Link
      href={`/projects/${project.id}`}
      className="border-divider hover:bg-text/5 flex cursor-pointer flex-col gap-2 gap-[10px] rounded-md border bg-transparent p-3"
    >
      <div className="flex items-start gap-[12px]">
        <div className="min-w-0 flex-1">
          <div className="text-accent text-[10px] tracking-[0.1em] uppercase">
            {companyOrName(c)}
          </div>
          <div className="font-heading text-text mt-[3px] text-[17px] leading-[1.2] font-semibold">
            {project.title}
          </div>
        </div>
        <Tag status={statusKey(status) as StatusKey}>{status}</Tag>
      </div>
      <div className="flex items-center gap-[10px]">
        <div className="bg-text/12 h-[3px] flex-1 overflow-hidden rounded-sm">
          <svg className="text-accent block h-full w-full" aria-hidden="true">
            <rect
              width={`${project.progress}%`}
              height="100%"
              fill="currentColor"
            />
          </svg>
        </div>
        <span className="text-text/55 text-[11px] tabular-nums">
          {project.progress}%
        </span>
      </div>
      <div className="text-text/50 flex items-center gap-1.5 gap-[14px] text-[11px]">
        <span className="tabular-nums">{money(project.price)}</span>
        <span>Due {fmtDate(project.due)}</span>
        <span>{payLabel}</span>
        {blocked ? <Tag status="warn">needs a slot</Tag> : null}
      </div>
    </Link>
  );
}
