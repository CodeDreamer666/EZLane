"use client";

import { Button, Tag, type StatusKey } from "~/app/_components/ui";
import { ago, money, statusKey } from "~/lib/format";
import { useEzlane } from "~/lib/store";

export default function ProposalsPage() {
  const { state, client, openTab, go, openAddClient } = useEzlane();

  if (state.proposals.length === 0) {
    return (
      <div
        style={{
          border: "1px dashed var(--color-divider)",
          borderRadius: 5,
          padding: 56,
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 22 }}>
          Create your first proposal
        </div>
        <p
          style={{
            fontSize: 13.5,
            color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
            margin: "8px auto 16px",
            maxWidth: 380,
          }}
        >
          Price, due date and deliverables sit at the top; the pitch goes
          underneath. Accepted terms become the project and the contract.
        </p>
        <Button variant="primary" onClick={openAddClient}>
          + Add a client to start
        </Button>
      </div>
    );
  }

  const rows = state.proposals
    .slice()
    .sort((a, b) => (b.lastSaved ?? b.sentAt ?? 0) - (a.lastSaved ?? a.sentAt ?? 0));

  return (
    <table className="table tbl">
      <thead>
        <tr>
          <th>Client</th>
          <th>Proposal</th>
          <th>Status</th>
          <th style={{ textAlign: "right" }}>Price</th>
          <th style={{ textAlign: "right" }}>Last updated</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => {
          const openComments = p.comments.filter((c) => !c.resolved).length;
          const c = client(p.clientId);
          return (
            <tr
              key={p.id}
              className="row"
              onClick={() => {
                openTab(p.id);
                go(`/proposals/${p.id}`);
              }}
            >
              <td data-l="Client" style={{ fontSize: 13.5 }}>
                {c.name} · {c.company || "—"}
              </td>
              <td style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15 }}>
                {p.title}
              </td>
              <td data-l="Status">
                <Tag status={statusKey(p.status) as StatusKey}>{p.status}</Tag>
                {openComments > 0 ? (
                  <span style={{ fontSize: 11, color: "var(--color-accent-700)", marginLeft: 8 }}>
                    {openComments} open
                  </span>
                ) : null}
              </td>
              <td
                data-l="Price"
                style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontSize: 13.5 }}
              >
                {p.price ? money(p.price) : "—"}
              </td>
              <td
                data-l="Updated"
                style={{
                  textAlign: "right",
                  fontSize: 12.5,
                  color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
                }}
              >
                {p.lastSaved ? ago(p.lastSaved) : "not saved"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
