"use client";

import { useParams } from "next/navigation";
import type { DragEvent } from "react";

import { Select, Tag, Toggle, type StatusKey } from "~/app/_components/ui";
import { contractText, fmtTime, money, received, statusKey } from "~/lib/format";
import { useEzlane } from "~/lib/store";

const STATUS_OPTIONS = ["Not started", "In Progress", "Delivered", "Awaiting Review", "Approved"];

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
    <div className="twocol" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 30, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Tag status={statusKey(statusLabel) as StatusKey}>{statusLabel}</Tag>
            <span style={{ fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>
              {c.name} · {c.company || "—"}
            </span>
          </div>
          <h3 style={{ margin: "9px 0 0" }}>{p.title}</h3>
          <div
            className="g3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
              background: "var(--color-divider)",
              border: "1px solid var(--color-divider)",
              borderRadius: 5,
              overflow: "hidden",
              marginTop: 18,
            }}
          >
            <Stat label="Price" value={money(p.price)} />
            <Stat label="Due" value={p.due ? new Date(p.due + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"} />
            <Stat label="Received" value={money(received(p))} />
          </div>
          <div className="f2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
            <div className="field">
              <label>Status</label>
              <Select value={p.status} onChange={(e) => setStatus(p.id, e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
              <div style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 42%, transparent)", marginTop: 5 }}>
                Changing this posts a line in the thread.
              </div>
            </div>
            <div className="field">
              <label>Progress — {p.progress}%</label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={p.progress}
                onChange={(e) => patchProject(p.id, { progress: Number(e.target.value) })}
                style={{ width: "100%", marginTop: 9 }}
              />
              <div style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 42%, transparent)", marginTop: 5 }}>
                Set by hand — nothing is derived.
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <h6 style={{ color: "color-mix(in srgb, var(--color-text) 50%, transparent)" }}>Deliverables</h6>
            <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 13.5, lineHeight: 1.85 }}>
              {p.deliverables.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="sec-contract">
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
            <h4 style={{ margin: 0, fontSize: 16 }}>Contract &amp; payment</h4>
            <span style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 45%, transparent)" }}>
              50 / 50 · marked by hand
            </span>
          </div>
          {p.contract ? (
            <>
              <div
                style={{
                  border: "1px solid var(--color-divider)",
                  borderRadius: 5,
                  padding: "20px 22px",
                  background: "color-mix(in srgb, var(--color-surface) 45%, transparent)",
                }}
              >
                <div style={{ fontSize: 13.5, lineHeight: 1.75, color: "color-mix(in srgb, var(--color-text) 80%, transparent)" }}>
                  {ct.parties}
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.75,
                    marginTop: 10,
                    color: "color-mix(in srgb, var(--color-text) 80%, transparent)",
                  }}
                >
                  Fee: {ct.price}, paid as {ct.half} on signature and {ct.half} on completion.
                  Estimated completion {ct.due}.
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginTop: 16,
                    paddingTop: 14,
                    borderTop: "1px solid var(--color-divider)",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: 19 }}>{p.contract.name}</div>
                  <div style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 45%, transparent)" }}>
                    signed {fmtTime(p.contract.ts)}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                <Toggle on={p.deposit} onClick={() => toggleDeposit(p.id)}>
                  Deposit received — {ct.half}
                </Toggle>
                <Toggle on={p.final} onClick={() => toggleFinal(p.id)}>
                  Final payment received — {ct.half}
                </Toggle>
              </div>
            </>
          ) : (
            <div
              style={{
                border: "1px dashed var(--color-divider)",
                borderRadius: 5,
                padding: 26,
                fontSize: 13,
                color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
                textAlign: "center",
              }}
            >
              No contract yet. It is generated from the accepted proposal&apos;s
              terms — nothing to sign until the client accepts.
            </div>
          )}
        </section>

        <section className="sec-thread">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--color-divider)",
              paddingBottom: 8,
              marginBottom: 6,
            }}
          >
            <h4 style={{ margin: 0, fontSize: 16 }}>Thread</h4>
            <span style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 45%, transparent)" }}>
              Flat and chronological · no live sync
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {p.messages
              .slice()
              .sort((a, b) => a.ts - b.ts)
              .map((m) => (
                <div key={m.id} style={{ padding: "15px 2px", borderBottom: "1px solid var(--color-divider)" }}>
                  {m.side === "system" ? (
                    <div
                      style={{
                        fontSize: 11.5,
                        letterSpacing: "0.03em",
                        color: "color-mix(in srgb, var(--color-text) 42%, transparent)",
                        fontStyle: "italic",
                      }}
                    >
                      {m.text} · {fmtTime(m.ts)}
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14 }}>
                          {m.from}
                        </span>
                        <Tag status={m.side === "client" ? "sent" : "done"} style={{ fontSize: 9.5, padding: "1px 7px" }}>
                          {m.side === "client" ? "Client" : "You"}
                        </Tag>
                        <span style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 40%, transparent)" }}>
                          {fmtTime(m.ts)}
                        </span>
                      </div>
                      <div className="msg" style={{ fontSize: 13.5, lineHeight: 1.65, marginTop: 6, maxWidth: "64ch" }}>
                        {m.text}
                      </div>
                      {m.file ? (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            marginTop: 9,
                            border: "1px solid var(--color-divider)",
                            borderRadius: 4,
                            padding: "6px 11px",
                            fontSize: 12,
                          }}
                        >
                          {m.file}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            {p.messages.length === 0 ? (
              <div style={{ fontSize: 13, color: "color-mix(in srgb, var(--color-text) 45%, transparent)", padding: "14px 2px" }}>
                No messages yet. The thread opens once the project is live.
              </div>
            ) : null}
          </div>
          <div
            style={{
              marginTop: 16,
              border: dropActive ? "1px solid var(--color-accent)" : "1px solid var(--color-divider)",
              background: dropActive ? "color-mix(in srgb, var(--color-accent) 8%, transparent)" : undefined,
              borderRadius: 5,
              padding: 12,
            }}
            onDragOver={onDragOver}
            onDragLeave={clearDragOver}
            onDrop={onDrop}
          >
            <textarea
              className="input"
              rows={3}
              style={{ border: 0, padding: 0, fontSize: 13.5 }}
              placeholder="Write an update…"
              value={comp.text}
              onChange={(e) => setComposer(p.id, { text: e.target.value })}
            />
            {comp.file ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid var(--color-accent-400)",
                  borderRadius: 4,
                  padding: "5px 10px",
                  fontSize: 12,
                  color: "var(--color-accent-700)",
                  marginBottom: 10,
                }}
              >
                {comp.file}
                <button className="lnk" style={{ fontSize: 13 }} onClick={() => setComposer(p.id, { file: "" })}>
                  ×
                </button>
              </div>
            ) : null}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <span style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 40%, transparent)", flex: 1 }}>
                {dropActive ? "Drop to attach" : "Drag a file anywhere in this box to attach it"}
              </span>
              <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
                Attach
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setComposer(p.id, { file: f.name });
                  }}
                />
              </label>
              <button className="btn btn-primary" onClick={() => sendMessage(p.id, "freelancer")}>
                Post update
              </button>
            </div>
          </div>
        </section>
      </div>

      <aside style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 96 }}>
        <div style={{ border: "1px solid var(--color-divider)", borderRadius: 5, padding: 15, display: "flex", flexDirection: "column", gap: 10 }}>
          <h6 style={{ margin: 0, color: "color-mix(in srgb, var(--color-text) 50%, transparent)" }}>Client portal</h6>
          <div style={{ fontSize: 12, color: "color-mix(in srgb, var(--color-text) 60%, transparent)", lineHeight: 1.55 }}>
            One link and password per project. No client account.
          </div>
          <div
            style={{
              fontFamily: "ui-monospace, Menlo, monospace",
              fontSize: 11.5,
              border: "1px solid var(--color-divider)",
              borderRadius: 4,
              padding: "8px 10px",
              wordBreak: "break-all",
            }}
          >
            ezlane.app/portal/{p.id}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "color-mix(in srgb, var(--color-text) 50%, transparent)" }}>Password</span>
            <span style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>{p.password}</span>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => previewPortal(p.id)}>
            Preview portal
          </button>
          <button className="btn btn-secondary btn-block" style={{ marginTop: 0 }} onClick={() => { openGatePreview(p.id); go(`/portal/${p.id}`); }}>
            Open the gate as a client
          </button>
        </div>
        <div style={{ border: "1px solid var(--color-divider)", borderRadius: 5, padding: 15, display: "flex", flexDirection: "column", gap: 9 }}>
          <h6 style={{ margin: 0, color: "color-mix(in srgb, var(--color-text) 50%, transparent)" }}>Lifecycle</h6>
          <div style={{ fontSize: 12, color: "color-mix(in srgb, var(--color-text) 60%, transparent)", lineHeight: 1.55 }}>
            {p.completed
              ? "Completed — out of the active list, still fully readable, and no longer counting against your plan."
              : "Marking this completed frees a plan slot. Nothing is deleted or hidden."}
          </div>
          {!p.completed && p.stage === "active" ? (
            <button className="btn btn-secondary btn-block" onClick={() => completeProject(p.id)}>
              Mark completed
            </button>
          ) : null}
          {p.completed ? (
            <button className="btn btn-secondary btn-block" onClick={() => reopenProject(p.id)}>
              Reopen project
            </button>
          ) : null}
          <button className="lnk" style={{ fontSize: 12, textAlign: "left" }} onClick={() => go(`/proposals/${p.proposalId}`)}>
            View the accepted proposal →
          </button>
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "var(--color-bg)", padding: "13px 15px" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "color-mix(in srgb, var(--color-text) 42%, transparent)" }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 21, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
    </div>
  );
}
