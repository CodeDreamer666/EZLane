"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { Select, Tag, type StatusKey } from "~/app/_components/ui";
import { ago, fmtDate, money, statusKey } from "~/lib/format";
import { useEzlane } from "~/lib/store";

const FONT_STACKS: Record<string, string> = {
  Lora: "var(--font-body)",
  "Cormorant Garamond": "var(--font-heading)",
  "System sans": "system-ui, sans-serif",
};

export default function ProposalEditorPage() {
  const { id } = useParams<{ id: string }>();
  const {
    state,
    client,
    proposal,
    patchProposal,
    addDeliverable,
    setDeliverable,
    removeDeliverable,
    saveProposal,
    sendProposal,
    addProposalComment,
    toggleProposalComment,
    closeTab,
    previewPortal,
    go,
    say,
  } = useEzlane();

  const bodyRef = useRef<HTMLDivElement>(null);
  const loadedId = useRef<string | null>(null);

  const pr = proposal(id);

  useEffect(() => {
    if (bodyRef.current && pr && loadedId.current !== pr.id) {
      bodyRef.current.innerHTML = pr.body;
      loadedId.current = pr.id;
    }
  }, [pr]);

  if (!pr) return <div>Proposal not found.</div>;

  const locked = pr.status === "Accepted";
  const c = client(pr.clientId);
  const font = pr.font ?? "Lora";
  const fontSize = pr.fontSize ?? "15";
  const fontLocked = state.plan !== "pro";

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val ?? undefined);
    bodyRef.current?.focus();
  };

  const currentHtml = () => bodyRef.current?.innerHTML ?? pr.body;

  const tabIds = state.openTabs.includes(id) ? state.openTabs : state.openTabs.concat([id]);
  const tabs = tabIds
    .map((tid) => state.proposals.find((p) => p.id === tid))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const closeThisTab = (tid: string) => {
    const rest = state.openTabs.filter((x) => x !== tid);
    closeTab(tid);
    if (id === tid) {
      go(rest.length ? `/proposals/${rest[rest.length - 1]}` : "/proposals");
    }
  };

  const commentSelection = () => {
    const sel = String(window.getSelection());
    if (!sel.trim()) {
      say("Select some text in the proposal first");
      return;
    }
    const text = window.prompt(`Comment on: "${sel.slice(0, 80)}"`);
    if (!text) return;
    addProposalComment(pr.id, sel, text);
  };

  const openComments = pr.comments.filter((cm) => !cm.resolved).length;

  return (
    <div>
      <Select
        className="tabsel"
        value={id}
        onChange={(e) => {
          if (e.target.value) go(`/proposals/${e.target.value}`);
        }}
      >
        {tabs.map((t) => (
          <option key={t.id} value={t.id}>
            {client(t.clientId).name.split(" ")[0]} — {t.title}
          </option>
        ))}
      </Select>

      <div
        className="tabstrip"
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 3,
          borderBottom: "1px solid var(--color-divider)",
          marginBottom: 22,
          overflow: "auto",
        }}
      >
        {tabs.map((t) => (
          <div
            key={t.id}
            className="tab"
            data-cur={t.id === id ? "1" : "0"}
            onClick={() => go(`/proposals/${t.id}`)}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {client(t.clientId).name.split(" ")[0]} — {t.title}
            </span>
            <span
              className="lnk"
              style={{ opacity: 0.5, fontSize: 14, lineHeight: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                closeThisTab(t.id);
              }}
            >
              ×
            </span>
          </div>
        ))}
        <button className="tb" style={{ marginBottom: 6, marginLeft: 4 }} onClick={() => go("/proposals")}>
          +
        </button>
      </div>

      <div
        className="twocol"
        style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 282px", gap: 30, alignItems: "start" }}
      >
        <div>
          <div
            style={{
              border: "1px solid var(--color-divider)",
              borderRadius: 5,
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              background: "color-mix(in srgb, var(--color-surface) 55%, transparent)",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <h6 style={{ margin: 0, color: "color-mix(in srgb, var(--color-text) 50%, transparent)" }}>
                Terms — the source of truth
              </h6>
              <span style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 42%, transparent)" }}>
                Copied into the contract on accept
              </span>
            </div>
            <div className="field">
              <label>Project title</label>
              <input
                className="input"
                value={pr.title}
                onChange={(e) => patchProposal(pr.id, { title: e.target.value })}
                disabled={locked}
              />
            </div>
            <div className="f2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field">
                <label>Price (USD)</label>
                <input
                  className="input"
                  type="number"
                  value={pr.price}
                  onChange={(e) => patchProposal(pr.id, { price: Number(e.target.value || 0) })}
                  disabled={locked}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                />
              </div>
              <div className="field">
                <label>Estimated due date</label>
                <input
                  className="input"
                  type="date"
                  value={pr.due}
                  onChange={(e) => patchProposal(pr.id, { due: e.target.value })}
                  disabled={locked}
                />
              </div>
            </div>
            <div className="field">
              <label>Deliverables</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {pr.deliverables.map((d, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: 11,
                        width: 14,
                        color: "color-mix(in srgb, var(--color-text) 38%, transparent)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {i + 1}
                    </span>
                    <input
                      className="input"
                      value={d}
                      onChange={(e) => setDeliverable(pr.id, i, e.target.value)}
                      disabled={locked}
                    />
                    <button className="tb" onClick={() => removeDeliverable(pr.id, i)} disabled={locked}>
                      ×
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-secondary"
                  style={{ alignSelf: "flex-start", fontSize: 12.5, padding: "5px 11px" }}
                  onClick={() => addDeliverable(pr.id)}
                  disabled={locked}
                >
                  + Add item
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, border: "1px solid var(--color-divider)", borderRadius: 5, overflow: "hidden" }}>
            <div
              className="edtoolbar"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                padding: "7px 9px",
                borderBottom: "1px solid var(--color-divider)",
                flexWrap: "wrap",
                background: "color-mix(in srgb, var(--color-surface) 55%, transparent)",
              }}
            >
              <button className="tb" style={{ fontWeight: 700 }} onClick={() => exec("bold")} disabled={locked}>
                B
              </button>
              <button className="tb" style={{ fontStyle: "italic" }} onClick={() => exec("italic")} disabled={locked}>
                I
              </button>
              <Divider />
              <button className="tb" onClick={() => exec("formatBlock", "h2")} disabled={locked}>
                H2
              </button>
              <button className="tb" onClick={() => exec("formatBlock", "h3")} disabled={locked}>
                H3
              </button>
              <button className="tb" onClick={() => exec("formatBlock", "p")} disabled={locked}>
                ¶
              </button>
              <Divider />
              <button className="tb" onClick={() => exec("insertUnorderedList")} disabled={locked}>
                •<span className="hide-sm"> List</span>
              </button>
              <button className="tb" onClick={() => exec("insertOrderedList")} disabled={locked}>
                1.<span className="hide-sm"> List</span>
              </button>
              <Divider />
              <div className="hide-sm" style={{ display: "flex", alignItems: "center", gap: 6, opacity: state.plan === "pro" ? 1 : 0.45 }}>
                <Select
                  style={{ width: 130, minHeight: 28, fontSize: 12 }}
                  disabled={fontLocked}
                  value={font}
                  onChange={(e) => patchProposal(pr.id, { font: e.target.value })}
                >
                  <option>Lora</option>
                  <option>Cormorant Garamond</option>
                  <option>System sans</option>
                </Select>
                <Select
                  style={{ width: 64, minHeight: 28, fontSize: 12 }}
                  disabled={fontLocked}
                  value={fontSize}
                  onChange={(e) => patchProposal(pr.id, { fontSize: e.target.value })}
                >
                  <option>14</option>
                  <option>15</option>
                  <option>16</option>
                  <option>18</option>
                </Select>
                {state.plan === "free" ? (
                  <button className="lnk" style={{ fontSize: 10, letterSpacing: "0.08em" }} onClick={() => go("/plans")}>
                    PRO
                  </button>
                ) : null}
              </div>
              <span style={{ flex: 1 }} />
              <button className="tb" onClick={commentSelection} disabled={locked} title="Comment on selection">
                +<span className="hide-sm"> Comment on selection</span>
              </button>
            </div>
            <div
              ref={bodyRef}
              className="pbody"
              contentEditable={!locked}
              suppressContentEditableWarning
              style={{
                padding: "26px 30px 40px",
                minHeight: 420,
                outline: "none",
                fontSize: `${fontSize}px`,
                fontFamily: FONT_STACKS[font],
                lineHeight: 1.72,
              }}
            />
          </div>
          {locked ? (
            <div
              style={{
                marginTop: 12,
                fontSize: 12.5,
                color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
              }}
            >
              Accepted on {pr.sentAt ? fmtDate(new Date(pr.sentAt).toISOString().slice(0, 10)) : "—"} — this
              proposal is locked. The live terms now belong to{" "}
              <button className="lnk" onClick={() => go(`/projects/${pr.projectId}`)}>
                the project
              </button>
              .
            </div>
          ) : null}
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 96 }}>
          <div style={{ border: "1px solid var(--color-divider)", borderRadius: 5, padding: 15, display: "flex", flexDirection: "column", gap: 11 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Tag status={statusKey(pr.status) as StatusKey}>{pr.status}</Tag>
              <span style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 45%, transparent)" }}>
                {pr.lastSaved
                  ? `Last saved at ${new Date(pr.lastSaved).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
                  : "Never saved"}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 60%, transparent)", lineHeight: 1.5 }}>
              {locked
                ? "Accepted and locked. The project is live."
                : pr.status === "Client Commented"
                  ? "The client left comments. Revise, save, then send again."
                  : pr.status === "Sent"
                    ? "Sent — waiting on the client. No decline button: it simply stays here until they respond."
                    : "Draft — nothing is visible to the client until you send."}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => saveProposal(pr.id, currentHtml())}
                disabled={locked}
              >
                Save
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => sendProposal(pr.id, currentHtml())}
                disabled={locked}
              >
                {pr.status === "Draft" ? "Send" : "Send revision"}
              </button>
            </div>
            <hr className="hr" style={{ margin: "2px 0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12 }}>
              <SummaryRow label="Client" value={c.name} />
              <SummaryRow label="Price" value={money(pr.price)} />
              <SummaryRow label="Due" value={fmtDate(pr.due)} />
            </div>
            <button className="btn btn-secondary btn-block" onClick={() => previewPortal(pr.projectId)}>
              Preview client view
            </button>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--color-divider)",
                paddingBottom: 7,
                marginBottom: 10,
              }}
            >
              <h6 style={{ margin: 0, color: "color-mix(in srgb, var(--color-text) 50%, transparent)" }}>
                Comments
              </h6>
              <span style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 40%, transparent)" }}>
                {openComments ? `${openComments} open` : ""}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pr.comments.map((cm) => (
                <div
                  key={cm.id}
                  style={{
                    borderLeft: "2px solid var(--color-accent)",
                    padding: "2px 0 2px 10px",
                    opacity: cm.resolved ? 0.22 : 1,
                  }}
                >
                  <div style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 45%, transparent)" }}>
                    {cm.author} · {ago(cm.ts)}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontStyle: "italic",
                      color: "color-mix(in srgb, var(--color-text) 50%, transparent)",
                      margin: "3px 0",
                    }}
                  >
                    &ldquo;{cm.anchor}&rdquo;
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>{cm.text}</div>
                  <button
                    className="lnk"
                    style={{ fontSize: 11, marginTop: 4 }}
                    onClick={() => toggleProposalComment(pr.id, cm.id)}
                  >
                    {cm.resolved ? "Reopen" : "Resolve"}
                  </button>
                </div>
              ))}
              {pr.comments.length === 0 ? (
                <div style={{ fontSize: 12, color: "color-mix(in srgb, var(--color-text) 42%, transparent)", lineHeight: 1.5 }}>
                  No comments. Client comments appear here the next time you
                  open the proposal — nothing syncs live.
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Divider() {
  return <span style={{ width: 1, height: 18, background: "var(--color-divider)", margin: "0 6px" }} />;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>{label}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}
