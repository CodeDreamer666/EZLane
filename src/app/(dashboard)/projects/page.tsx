"use client";

import { ProjectCard } from "~/app/_components/ProjectCard";
import { Tag, type StatusKey } from "~/app/_components/ui";
import { companyOrName, money, statusKey } from "~/lib/format";
import { useEzlane } from "~/lib/store";

export default function ProjectsPage() {
  const { state, client, activeProjects, limit, go } = useEzlane();

  const active = activeProjects();
  const lim = limit();
  const usageNote =
    state.plan === "pro"
      ? "Unlimited active projects"
      : `${active.length} of ${lim} active projects used`;
  const completed = state.projects.filter((p) => p.completed);
  const prospects = state.projects.filter((p) => p.stage === "proposal");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--color-divider)",
            paddingBottom: 8,
            marginBottom: 16,
          }}
        >
          <h4 style={{ margin: 0, fontSize: 16 }}>Active</h4>
          <span style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 45%, transparent)" }}>
            {usageNote}
          </span>
        </div>
        <div
          className="cardsgrid"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}
        >
          {active.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
        {active.length === 0 ? (
          <div
            style={{
              border: "1px dashed var(--color-divider)",
              borderRadius: 5,
              padding: 34,
              textAlign: "center",
              fontSize: 13,
              color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
            }}
          >
            Nothing active. A project starts when a client accepts a proposal.
          </div>
        ) : null}
      </section>

      <section>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--color-divider)",
            paddingBottom: 8,
            marginBottom: 16,
          }}
        >
          <h4 style={{ margin: 0, fontSize: 16 }}>Completed</h4>
          <span style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 45%, transparent)" }}>
            Kept in full — never archived or hidden
          </span>
        </div>
        <table className="table tbl">
          <tbody>
            {completed.map((p) => {
              const payLabel =
                p.deposit && p.final ? "Paid in full" : p.deposit ? "Deposit in" : "Unpaid";
              return (
                <tr key={p.id} className="row" onClick={() => go(`/projects/${p.id}`)}>
                  <td style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15 }}>
                    {p.title}
                  </td>
                  <td
                    data-l="Client"
                    style={{ fontSize: 13, color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}
                  >
                    {companyOrName(client(p.clientId))}
                  </td>
                  <td data-l="Price" style={{ fontVariantNumeric: "tabular-nums", fontSize: 13 }}>
                    {money(p.price)}
                  </td>
                  <td data-l="Payment">{payLabel}</td>
                  <td style={{ textAlign: "right" }}>
                    <Tag status="done">Completed</Tag>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {completed.length === 0 ? (
          <div style={{ fontSize: 13, color: "color-mix(in srgb, var(--color-text) 45%, transparent)", padding: "8px 2px" }}>
            No completed projects yet.
          </div>
        ) : null}
      </section>

      {prospects.length > 0 ? (
        <section>
          <div style={{ borderBottom: "1px solid var(--color-divider)", paddingBottom: 8, marginBottom: 16 }}>
            <h4 style={{ margin: 0, fontSize: 16 }}>Out for acceptance</h4>
          </div>
          <table className="table tbl">
            <tbody>
              {prospects.map((p) => {
                const pr = state.proposals.find((x) => x.id === p.proposalId);
                const status = pr?.status ?? p.status;
                return (
                  <tr key={p.id} className="row" onClick={() => go(`/projects/${p.id}`)}>
                    <td style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15 }}>
                      {p.title}
                    </td>
                    <td
                      data-l="Client"
                      style={{ fontSize: 13, color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}
                    >
                      {companyOrName(client(p.clientId))}
                    </td>
                    <td data-l="Price" style={{ fontVariantNumeric: "tabular-nums", fontSize: 13 }}>
                      {money(p.price)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Tag status={statusKey(status) as StatusKey}>{status}</Tag>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}
