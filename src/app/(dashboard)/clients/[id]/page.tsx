"use client";

import { useParams } from "next/navigation";

import { Button, Tag, type StatusKey } from "~/app/_components/ui";
import { fmtDate, money, statusKey } from "~/lib/format";
import { useEzlane } from "~/lib/store";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { client, state, newProposal, go } = useEzlane();
  const c = client(id);
  const projects = state.projects.filter(
    (p) => p.clientId === id && p.stage !== "proposal",
  );

  return (
    <div
      className="twocol"
      style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 260px", gap: 32, alignItems: "start" }}
    >
      <div>
        <h3 style={{ margin: "0 0 2px" }}>{c.name}</h3>
        <div style={{ fontSize: 13, color: "color-mix(in srgb, var(--color-text) 58%, transparent)" }}>
          {c.company || "—"}
        </div>
        <hr className="hr" />
        <h6 style={{ color: "color-mix(in srgb, var(--color-text) 50%, transparent)" }}>Projects</h6>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {projects.map((p) => {
            const status = p.completed ? "Completed" : p.status;
            const stageLabel = p.completed ? "Completed" : p.stage === "proposal" ? "Proposal out" : "Active";
            return (
              <div
                key={p.id}
                className="card row"
                onClick={() => go(`/projects/${p.id}`)}
                style={{ gap: 8 }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div className="card-title">{p.title}</div>
                    <div className="card-meta" style={{ marginTop: 5, gap: 14 }}>
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>{money(p.price)}</span>
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
          <div
            style={{
              border: "1px dashed var(--color-divider)",
              borderRadius: 5,
              padding: 26,
              textAlign: "center",
              fontSize: 13,
              color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
            }}
          >
            No projects yet for this client.{" "}
            <button className="lnk" onClick={() => newProposal(id)}>
              Write a proposal
            </button>
          </div>
        ) : null}
      </div>
      <aside
        style={{
          border: "1px solid var(--color-divider)",
          borderRadius: 5,
          padding: 15,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
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

function InfoRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "color-mix(in srgb, var(--color-text) 42%, transparent)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          marginTop: 3,
          color: muted ? "color-mix(in srgb, var(--color-text) 70%, transparent)" : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}
