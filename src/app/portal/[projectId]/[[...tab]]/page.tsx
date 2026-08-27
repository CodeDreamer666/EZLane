"use client";

import { useParams } from "next/navigation";
import type { DragEvent, MouseEvent } from "react";

import { Button, Tag, type StatusKey } from "~/app/_components/ui";
import { ago, contractText, fmtDate, fmtTime, money, received, statusKey } from "~/lib/format";
import { useEzlane } from "~/lib/store";
import type { Project } from "~/lib/types";

const TABS = [
  { key: "proposal", label: "Proposal" },
  { key: "contract", label: "Contract" },
  { key: "overview", label: "Overview" },
  { key: "thread", label: "Messages" },
  { key: "notifications", label: "Activity" },
] as const;

export default function PortalPage() {
  const { projectId, tab } = useParams<{ projectId: string; tab?: string[] }>();
  const { state, project, proposal } = useEzlane();

  const p = project(projectId);
  if (!p) return <div style={{ padding: 40, color: "var(--color-text)" }}>Project not found.</div>;

  const pr = proposal(p.proposalId);
  const unlockedVal = state.unlocked[p.id];
  const tabName = (tab?.[0] as (typeof TABS)[number]["key"] | undefined) ?? "";

  if (!unlockedVal) return <GateScreen project={p} />;

  return <PortalShell project={p} proposalId={pr?.id ?? p.proposalId} tabName={tabName} isPreview={unlockedVal === "preview"} />;
}

function GateScreen({ project: p }: { project: Project }) {
  const { state, setGatePw, tryUnlock } = useEzlane();

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 30 }}>
      <div
        style={{
          width: "min(392px, 100%)",
          border: "1px solid var(--color-divider)",
          borderRadius: 6,
          padding: 30,
          background: "var(--color-bg)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 18, height: 18, border: "1px solid var(--color-accent)", borderRadius: 3, display: "grid", placeItems: "center" }}>
            <div style={{ width: 6, height: 6, background: "var(--color-accent)" }} />
          </div>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16 }}>EZLane</span>
        </div>
        <h3 style={{ margin: "20px 0 6px", fontSize: 23 }}>
          {p.title === "Untitled project" ? "A shared workspace" : p.title}
        </h3>
        <p style={{ fontSize: 13, color: "color-mix(in srgb, var(--color-text) 58%, transparent)", margin: "0 0 18px", lineHeight: 1.6 }}>
          This project&apos;s workspace is password-protected. Use the password
          from your freelancer — there is no account to create.
        </p>
        <div className="field">
          <label>Password</label>
          <input
            className="input"
            type="password"
            value={state.gatePw}
            onChange={(e) => setGatePw(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => {
              if (e.key === "Enter") tryUnlock(p);
            }}
          />
        </div>
        {state.gateError ? (
          <div style={{ fontSize: 12, color: "var(--color-accent-700)", marginTop: 8 }}>
            That password does not match this project.
          </div>
        ) : null}
        <Button variant="primary" block style={{ marginTop: 16 }} onClick={() => tryUnlock(p)}>
          Open the workspace
        </Button>
        <div style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 38%, transparent)", marginTop: 16, lineHeight: 1.6 }}>
          Password protected per project. Nothing you do here creates an
          account.
        </div>
      </div>
    </div>
  );
}

function PortalShell({
  project: p,
  proposalId,
  tabName,
  isPreview,
}: {
  project: Project;
  proposalId: string;
  tabName: string;
  isPreview: boolean;
}) {
  const { state, client, go } = useEzlane();
  const c = client(p.clientId);
  const proBrand = state.plan === "pro" && state.settings.hideBranding;
  const brandName = proBrand ? state.settings.invoiceName : "EZLane";
  const clientNotifs = state.notifications
    .filter((n) => n.audience === "client" && n.projectId === p.id)
    .sort((a, b) => b.ts - a.ts);
  const unreadCount = clientNotifs.filter((n) => !n.read).length;
  const tab = tabName || "overview";
  const welcomeShown = state.plan === "pro" && !!state.settings.welcome && tab === "overview";

  const base = `/portal/${p.id}`;

  return (
    <div>
      <header style={{ borderBottom: "1px solid var(--color-divider)", background: "var(--color-bg)" }}>
        <div className="po-head" style={{ maxWidth: 940, margin: "0 auto", padding: "16px 26px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 20, height: 20, border: "1px solid var(--color-accent)", borderRadius: 3, display: "grid", placeItems: "center" }}>
              <div style={{ width: 7, height: 7, background: "var(--color-accent)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 17 }}>{brandName}</div>
              <div style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 45%, transparent)" }}>
                {p.title} · for {c.company || c.name}
              </div>
            </div>
            {isPreview ? (
              <button className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 11px" }} onClick={() => go(`/projects/${p.id}`)}>
                ← Back to EZLane
              </button>
            ) : null}
          </div>
          <nav className="ponav" style={{ display: "flex", gap: 2, marginTop: 16 }}>
            {TABS.map((t) => (
              <a
                key={t.key}
                className="nv"
                data-cur={tab === t.key || (t.key === "overview" && !tabName) ? "1" : "0"}
                style={{ borderRadius: "4px 4px 0 0", cursor: "pointer" }}
                onClick={() => go(`${base}/${t.key}`)}
              >
                <span>{t.label}</span>
                {t.key === "notifications" && unreadCount > 0 ? (
                  <span className="tag" data-s="sent" style={{ padding: "1px 6px", fontSize: 10, marginLeft: 6 }}>
                    {unreadCount}
                  </span>
                ) : null}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="po-main" style={{ maxWidth: 940, margin: "0 auto", padding: "30px 26px 70px" }}>
        {welcomeShown ? (
          <div
            style={{
              borderLeft: "2px solid var(--color-accent)",
              padding: "2px 0 2px 14px",
              fontSize: 13.5,
              lineHeight: 1.65,
              color: "color-mix(in srgb, var(--color-text) 72%, transparent)",
              marginBottom: 26,
            }}
          >
            {state.settings.welcome}
          </div>
        ) : null}

        {tab === "proposal" ? <ProposalTab project={p} proposalId={proposalId} /> : null}
        {tab === "contract" ? <ContractTab project={p} proposalId={proposalId} /> : null}
        {tab === "overview" ? <OverviewTab project={p} proposalId={proposalId} /> : null}
        {tab === "thread" ? <ThreadTab project={p} /> : null}
        {tab === "notifications" ? <NotificationsTab project={p} /> : null}
      </main>

      <footer style={{ borderTop: "1px solid var(--color-divider)", padding: "20px 26px", textAlign: "center" }}>
        {!proBrand ? (
          <div style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 38%, transparent)" }}>
            Powered by <span style={{ fontFamily: "var(--font-heading)" }}>EZLane</span>
          </div>
        ) : (
          <div style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 38%, transparent)" }}>
            {brandName} · {state.settings.email}
          </div>
        )}
      </footer>
    </div>
  );
}

function ProposalTab({ project: p, proposalId }: { project: Project; proposalId: string }) {
  const { state, client, proposal, setPendingAnchor, setCommentDraft, cancelComment, addClientComment, openAccept, closeAccept, acceptProposal, go } =
    useEzlane();
  const pr = proposal(proposalId);
  if (!pr) return null;
  const c = client(p.clientId);

  if (pr.status === "Draft") {
    return (
      <div style={{ border: "1px dashed var(--color-divider)", borderRadius: 5, padding: 60, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 21 }}>Nothing to review yet</div>
        <p style={{ fontSize: 13, color: "color-mix(in srgb, var(--color-text) 52%, transparent)", margin: "8px auto 0", maxWidth: 340 }}>
          {state.settings.name} has not sent the proposal for this project.
          You will get an email when it arrives.
        </p>
      </div>
    );
  }

  const deliverables = pr.deliverables.length ? pr.deliverables : p.deliverables;
  const canAccept = pr.status === "Sent" || pr.status === "Client Commented" || pr.status === "Revised";
  const accepted = pr.status === "Accepted";
  const ct = contractText(p, c, state.settings);

  const pickAnchor = (e: MouseEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest("p,li,h2,h3");
    if (!el) return;
    setPendingAnchor((el.textContent ?? "").slice(0, 140));
  };

  return (
    <div>
      <div className="twocol" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 244px", gap: 28, alignItems: "start" }}>
        <div>
          <div className="g3" style={{ border: "1px solid var(--color-divider)", borderRadius: 5, padding: "18px 20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <MiniStat label="Price" value={money(pr.price || p.price)} />
            <MiniStat label="Estimated due" value={fmtDate(pr.due || p.due)} />
            <MiniStat label="Deliverables" value={String(deliverables.length)} />
            <div style={{ gridColumn: "1 / -1" }}>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.85 }}>
                {deliverables.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ marginTop: 20, border: "1px solid var(--color-divider)", borderRadius: 5, padding: "26px 30px 34px" }}>
            <div style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 42%, transparent)", marginBottom: 14 }}>
              Click any paragraph to comment on it.
            </div>
            <div
              className="pbody"
              data-anch="1"
              onClick={pickAnchor}
              style={{ fontSize: 15, lineHeight: 1.75 }}
              dangerouslySetInnerHTML={{ __html: pr.body }}
            />
          </div>
        </div>
        <aside style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24 }}>
          <div style={{ border: "1px solid var(--color-divider)", borderRadius: 5, padding: 15, display: "flex", flexDirection: "column", gap: 10 }}>
            <Tag status={statusKey(pr.status) as StatusKey} style={{ alignSelf: "flex-start" }}>
              {pr.status}
            </Tag>
            <div style={{ fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 62%, transparent)", lineHeight: 1.55 }}>
              {accepted
                ? "You accepted these terms. The agreement is ready to sign."
                : "Read it, comment on anything unclear, and accept when you are happy. Accepting is what starts the work."}
            </div>
            {canAccept ? (
              <Button variant="primary" block onClick={openAccept}>
                Accept this proposal
              </Button>
            ) : null}
            {accepted ? (
              <Button variant="secondary" block onClick={() => go(`/portal/${p.id}/contract`)}>
                Go to the contract →
              </Button>
            ) : null}
          </div>
          <div>
            <div style={{ borderBottom: "1px solid var(--color-divider)", paddingBottom: 7, marginBottom: 10 }}>
              <h6 style={{ margin: 0, color: "color-mix(in srgb, var(--color-text) 50%, transparent)" }}>Your comments</h6>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pr.comments.map((cm) => (
                <div key={cm.id} style={{ borderLeft: "2px solid var(--color-accent)", padding: "2px 0 2px 10px" }}>
                  <div style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 45%, transparent)" }}>
                    {cm.author} · {ago(cm.ts)}
                  </div>
                  <div style={{ fontSize: 11.5, fontStyle: "italic", color: "color-mix(in srgb, var(--color-text) 50%, transparent)", margin: "3px 0" }}>
                    &ldquo;{cm.anchor}&rdquo;
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>{cm.text}</div>
                </div>
              ))}
              {pr.comments.length === 0 ? (
                <div style={{ fontSize: 12, color: "color-mix(in srgb, var(--color-text) 42%, transparent)", lineHeight: 1.5 }}>
                  No comments yet.
                </div>
              ) : null}
            </div>
            {state.pendingAnchor ? (
              <div style={{ marginTop: 12, border: "1px solid var(--color-accent-400)", borderRadius: 4, padding: 10 }}>
                <div style={{ fontSize: 11, fontStyle: "italic", color: "color-mix(in srgb, var(--color-text) 50%, transparent)", marginBottom: 6 }}>
                  &ldquo;{state.pendingAnchor}&rdquo;
                </div>
                <textarea
                  className="input"
                  rows={3}
                  style={{ fontSize: 12.5 }}
                  placeholder="Your comment…"
                  value={state.commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                />
                <div style={{ display: "flex", gap: 7, marginTop: 8 }}>
                  <button className="btn btn-secondary" style={{ flex: 1, fontSize: 12, padding: 4 }} onClick={cancelComment}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: 12, padding: 4 }}
                    onClick={() => {
                      if (!state.commentDraft.trim()) return;
                      addClientComment(p.id, pr.id, state.pendingAnchor, state.commentDraft);
                    }}
                  >
                    Comment
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {state.acceptOpen ? (
        <div className="dialog-backdrop" style={{ zIndex: 70 }} onClick={closeAccept}>
          <div className="dialog" style={{ width: "min(480px, 100%)" }} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">You&apos;re agreeing to these terms</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 13.5 }}>
              <Row label="Price" value={money(pr.price)} />
              <Row label="Payment" value={`${ct.half} now, ${ct.half} on completion`} />
              <Row label="Estimated due" value={fmtDate(pr.due)} />
              <div>
                <div style={{ color: "color-mix(in srgb, var(--color-text) 55%, transparent)", marginBottom: 5 }}>Deliverables</div>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                  {deliverables.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="dialog-body" style={{ fontSize: 12.5 }}>
              Accepting locks the proposal and creates the project. The
              agreement is generated next, for you to sign.
            </div>
            <div className="dialog-actions">
              <button className="btn btn-secondary" onClick={closeAccept}>
                Not yet
              </button>
              <button className="btn btn-primary" onClick={() => acceptProposal(p, pr)}>
                Accept these terms
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ContractTab({ project: p, proposalId }: { project: Project; proposalId: string }) {
  const { state, client, proposal, setSignName, signContract } = useEzlane();
  const pr = proposal(proposalId);
  const c = client(p.clientId);
  const ct = contractText(p, c, state.settings);
  const deliverables = pr?.deliverables.length ? pr.deliverables : p.deliverables;
  const available = pr?.status === "Accepted";

  if (!available) {
    return (
      <div style={{ maxWidth: 720 }}>
        <div style={{ border: "1px dashed var(--color-divider)", borderRadius: 5, padding: 60, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 21 }}>No agreement yet</div>
          <p style={{ fontSize: 13, color: "color-mix(in srgb, var(--color-text) 52%, transparent)", margin: "8px auto 0", maxWidth: 360 }}>
            The agreement is generated the moment you accept the proposal — it
            uses those same terms, so there is nothing new to read.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h3 style={{ margin: "0 0 4px" }}>Agreement</h3>
      <div style={{ fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 50%, transparent)" }}>
        Generated from the terms you accepted. Nothing here was written by
        hand.
      </div>
      <div
        style={{
          border: "1px solid var(--color-divider)",
          borderRadius: 5,
          padding: "28px 30px",
          marginTop: 18,
          fontSize: 14,
          lineHeight: 1.8,
          color: "color-mix(in srgb, var(--color-text) 85%, transparent)",
        }}
      >
        <p>{ct.parties}</p>
        <p>
          <strong>Scope.</strong> The Contractor will deliver:
        </p>
        <ul style={{ paddingLeft: 20 }}>
          {deliverables.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
        <p>
          <strong>Fee.</strong> {money(p.price)} in total, paid in two halves: {ct.half} on signature and {ct.half} on completion.
          Invoices are settled by bank transfer within 14 days.
        </p>
        <p>
          <strong>Timing.</strong> Estimated completion {fmtDate(p.due)}. Dates move if material or decisions are late.
        </p>
        <p>
          <strong>Ownership.</strong> On final payment, the delivered work transfers to the Client. The Contractor may show the work publicly unless
          asked not to.
        </p>
      </div>
      <div style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 42%, transparent)", marginTop: 12, lineHeight: 1.6 }}>
        This is a plain-language agreement, not legal advice. If the project
        or the sums involved warrant it, have a lawyer look at it before
        signing.
      </div>
      {p.contract ? (
        <>
          <div style={{ marginTop: 22, border: "1px solid var(--color-divider)", borderRadius: 5, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 21 }}>{p.contract.name}</div>
              <div style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 45%, transparent)", marginTop: 2 }}>
                signed {fmtTime(p.contract.ts)}
              </div>
            </div>
            <Tag status="accepted">Signed</Tag>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 12, fontSize: 12.5 }}>
            <Tag status={p.deposit ? "accepted" : "done"}>{p.deposit ? "Deposit received" : `Deposit due — ${ct.half}`}</Tag>
            <Tag status={p.final ? "accepted" : "done"}>{p.final ? "Final payment received" : "Final payment due on completion"}</Tag>
          </div>
        </>
      ) : (
        <div style={{ marginTop: 22, border: "1px solid var(--color-accent)", borderRadius: 5, padding: "18px 20px", background: "color-mix(in srgb, var(--color-accent) 6%, transparent)" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16 }}>Sign by typing your full name</div>
          <div style={{ fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 60%, transparent)", margin: "4px 0 12px" }}>
            Typing your name below counts as your signature on the terms
            above.
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="field" style={{ flex: 1, minWidth: 220 }}>
              <label>Full name</label>
              <input
                className="input"
                value={state.signName}
                onChange={(e) => setSignName(e.target.value)}
                placeholder={c.name}
                style={{ fontFamily: "var(--font-heading)", fontSize: 17, minHeight: 42 }}
              />
            </div>
            <button className="btn btn-primary" style={{ minHeight: 42 }} onClick={() => signContract(p)}>
              Sign the agreement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewTab({ project: p, proposalId }: { project: Project; proposalId: string }) {
  const { state, proposal, go } = useEzlane();
  const pr = proposal(proposalId);
  const live = p.stage === "active" || p.completed;
  const statusLabel = p.completed ? "Completed" : p.status;

  if (!live) {
    return (
      <div style={{ maxWidth: 760 }}>
        <div style={{ border: "1px dashed var(--color-divider)", borderRadius: 5, padding: 60, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 21 }}>The project starts once you accept</div>
          <p style={{ fontSize: 13, color: "color-mix(in srgb, var(--color-text) 52%, transparent)", margin: "8px auto 16px", maxWidth: 340 }}>
            Status, progress and payment appear here as soon as the proposal
            is accepted and signed.
          </p>
          <Button variant="primary" onClick={() => go(`/portal/${p.id}/proposal`)}>
            Read the proposal
          </Button>
        </div>
      </div>
    );
  }

  const deliverables = pr?.deliverables.length ? pr.deliverables : p.deliverables;

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Tag status={statusKey(statusLabel) as StatusKey}>{statusLabel}</Tag>
        <span style={{ fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 50%, transparent)" }}>
          Updated by {state.settings.name}
        </span>
      </div>
      <h3 style={{ margin: "10px 0 18px" }}>{p.title}</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 5, background: "color-mix(in srgb, var(--color-text) 12%, transparent)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "var(--color-accent)", width: `${p.progress}%` }} />
        </div>
        <span style={{ fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>{p.progress}%</span>
      </div>
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
          marginTop: 22,
        }}
      >
        <MiniStat label="Price" value={money(p.price)} big />
        <MiniStat label="Estimated due" value={fmtDate(p.due)} big />
        <MiniStat label="Paid" value={money(received(p))} big />
      </div>
      <div style={{ marginTop: 24 }}>
        <h6 style={{ color: "color-mix(in srgb, var(--color-text) 50%, transparent)" }}>Deliverables</h6>
        <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 14, lineHeight: 1.9 }}>
          {deliverables.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ThreadTab({ project: p }: { project: Project }) {
  const { state, composer, setComposer, sendMessage, setDragOver, clearDragOver, approveWork } = useEzlane();
  const comp = composer(p.id);
  const dropActive = state.dragOver === p.id;
  const canApprove = (p.stage === "active" || p.completed) && p.status !== "Approved" && !!p.contract;

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
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: "1px solid var(--color-divider)", paddingBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: 16 }}>Messages</h4>
        <span style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 45%, transparent)" }}>
          New messages appear when you reload — nothing is live
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {p.messages
          .slice()
          .sort((a, b) => a.ts - b.ts)
          .map((m) => (
            <div key={m.id} style={{ padding: "15px 2px", borderBottom: "1px solid var(--color-divider)" }}>
              {m.side === "system" ? (
                <div style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 42%, transparent)", fontStyle: "italic" }}>
                  {m.text} · {fmtTime(m.ts)}
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14 }}>{m.from}</span>
                    <span style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 40%, transparent)" }}>{fmtTime(m.ts)}</span>
                  </div>
                  <div className="msg" style={{ fontSize: 14, lineHeight: 1.7, marginTop: 6, maxWidth: "62ch" }}>
                    {m.text}
                  </div>
                  {m.file ? (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 9, border: "1px solid var(--color-divider)", borderRadius: 4, padding: "6px 11px", fontSize: 12 }}>
                      {m.file}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        {p.messages.length === 0 ? (
          <div style={{ fontSize: 13, color: "color-mix(in srgb, var(--color-text) 45%, transparent)", padding: "16px 2px" }}>No messages yet.</div>
        ) : null}
      </div>
      <div
        style={{
          marginTop: 18,
          border: dropActive ? "1px solid var(--color-accent)" : "1px solid var(--color-divider)",
          background: dropActive ? "color-mix(in srgb, var(--color-accent) 8%, transparent)" : undefined,
          borderRadius: 5,
          padding: 13,
        }}
        onDragOver={onDragOver}
        onDragLeave={clearDragOver}
        onDrop={onDrop}
      >
        <textarea
          className="input"
          rows={3}
          style={{ border: 0, padding: 0, fontSize: 14 }}
          placeholder="Reply…"
          value={comp.text}
          onChange={(e) => setComposer(p.id, { text: e.target.value })}
        />
        {comp.file ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--color-accent-400)", borderRadius: 4, padding: "5px 10px", fontSize: 12, color: "var(--color-accent-700)", marginBottom: 10 }}>
            {comp.file}
            <button className="lnk" style={{ fontSize: 13 }} onClick={() => setComposer(p.id, { file: "" })}>
              ×
            </button>
          </div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 40%, transparent)", flex: 1 }}>
            {dropActive ? "Drop to attach" : "Drag a file into this box to attach it"}
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
          <button className="btn btn-primary" onClick={() => sendMessage(p.id, "client")}>
            Send message
          </button>
        </div>
      </div>
      {canApprove ? (
        <div style={{ marginTop: 20, border: "1px solid var(--color-accent)", borderRadius: 5, padding: "16px 18px", display: "flex", alignItems: "center", gap: 16, background: "color-mix(in srgb, var(--color-accent) 6%, transparent)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15 }}>Happy with the work?</div>
            <div style={{ fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 60%, transparent)", marginTop: 3 }}>
              Approving is a deliberate step, separate from messaging.
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => approveWork(p)}>
            Approve the work
          </button>
        </div>
      ) : null}
      {p.status === "Approved" ? (
        <div style={{ marginTop: 20, fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>
          You approved this work.
        </div>
      ) : null}
    </div>
  );
}

function NotificationsTab({ project: p }: { project: Project }) {
  const { state, markAllRead } = useEzlane();
  const notifs = state.notifications
    .filter((n) => n.audience === "client" && n.projectId === p.id)
    .sort((a, b) => b.ts - a.ts);

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: "1px solid var(--color-divider)", paddingBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: 16 }}>Activity on this project</h4>
        <button className="lnk" style={{ fontSize: 12.5 }} onClick={() => markAllRead("client", p.id)}>
          Mark all read
        </button>
      </div>
      <div>
        {notifs.map((n) => (
          <div key={n.id} style={{ display: "flex", gap: 13, alignItems: "flex-start", padding: "15px 4px", borderBottom: "1px solid var(--color-divider)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 7, flex: "none", background: "var(--color-accent)", opacity: n.read ? 0.22 : 1 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{n.title}</div>
              <div style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 42%, transparent)", marginTop: 3 }}>
                {ago(n.ts)} · {n.read ? "read" : "unread"}
              </div>
            </div>
          </div>
        ))}
        {notifs.length === 0 ? (
          <div style={{ fontSize: 13, color: "color-mix(in srgb, var(--color-text) 45%, transparent)", padding: "16px 4px" }}>Nothing yet.</div>
        ) : null}
      </div>
    </div>
  );
}

function MiniStat({ label, value, big = false }: { label: string; value: string; big?: boolean }) {
  return (
    <div style={big ? { background: "var(--color-bg)", padding: "14px 16px" } : undefined}>
      <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "color-mix(in srgb, var(--color-text) 42%, transparent)" }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-divider)", paddingBottom: 7 }}>
      <span style={{ color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>{label}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}
