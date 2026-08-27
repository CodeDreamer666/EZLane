"use client";

import Link from "next/link";

import { Tag, type StatusKey } from "~/app/_components/ui";
import { companyOrName, fmtDate, money, statusKey } from "~/lib/format";
import { useEzlane } from "~/lib/store";
import type { Project } from "~/lib/types";

export function ProjectCard({
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
    <Link href={`/projects/${project.id}`} className="card row" style={{ gap: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card-kicker">{companyOrName(c)}</div>
          <div className="card-title" style={{ marginTop: 3 }}>
            {project.title}
          </div>
        </div>
        <Tag status={statusKey(status) as StatusKey}>{status}</Tag>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            flex: 1,
            height: 3,
            background: "color-mix(in srgb, var(--color-text) 12%, transparent)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{ height: "100%", background: "var(--color-accent)", width: `${project.progress}%` }}
          />
        </div>
        <span
          style={{
            fontSize: 11,
            color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {project.progress}%
        </span>
      </div>
      <div className="card-meta" style={{ gap: 14 }}>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{money(project.price)}</span>
        <span>Due {fmtDate(project.due)}</span>
        <span>{payLabel}</span>
        {blocked ? <Tag status="warn">needs a slot</Tag> : null}
      </div>
    </Link>
  );
}
