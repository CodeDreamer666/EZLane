"use client";

import { useParams } from "next/navigation";
import type { DragEvent, MouseEvent } from "react";

import { Button, Tag, type StatusKey } from "~/app/_components/ui";
import {
  ago,
  contractText,
  fmtDate,
  fmtTime,
  money,
  received,
  statusKey,
} from "~/lib/format";
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
  if (!p) return <div className="text-text p-[40px]">Project not found.</div>;

  const pr = proposal(p.proposalId);
  const unlockedVal = state.unlocked[p.id];
  const tabName = (tab?.[0] as (typeof TABS)[number]["key"] | undefined) ?? "";

  if (!unlockedVal) return <GateScreen project={p} />;

  return (
    <PortalShell
      project={p}
      proposalId={pr?.id ?? p.proposalId}
      tabName={tabName}
      isPreview={unlockedVal === "preview"}
    />
  );
}

function GateScreen({ project: p }: { project: Project }) {
  const { state, setGatePw, tryUnlock } = useEzlane();

  return (
    <div className="grid min-h-screen place-items-center p-[30px]">
      <div className="bg-bg border-divider w-[min(392px,_100%)] rounded-[6px] border p-[30px] shadow-[var(--elev-lg)]">
        <div className="flex items-center gap-[9px]">
          <div className="border-accent grid h-[18px] w-[18px] place-items-center rounded-[3px] border">
            <div className="bg-accent h-[6px] w-[6px]" />
          </div>
          <span className="font-heading text-[16px] font-semibold">EZLane</span>
        </div>
        <h3 className="font-heading m-[20px_0_6px] text-[23px] leading-[1.12] font-semibold tracking-[-0.015em]">
          {p.title === "Untitled project" ? "A shared workspace" : p.title}
        </h3>
        <p className="text-text/58 m-[0_0_18px] text-[13px] leading-[1.6]">
          This project&apos;s workspace is password-protected. Use the password
          from your freelancer — there is no account to create.
        </p>
        <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
          <label>Password</label>
          <input
            className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-9 w-full rounded-md border bg-transparent px-2.5 py-1.5 text-sm focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
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
          <div className="text-accent-700 mt-[8px] text-[12px]">
            That password does not match this project.
          </div>
        ) : null}
        <Button
          variant="primary"
          block
          className="mt-[16px]"
          onClick={() => tryUnlock(p)}
        >
          Open the workspace
        </Button>
        <div className="text-text/38 mt-[16px] text-[11.5px] leading-[1.6]">
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
  const welcomeShown =
    state.plan === "pro" && !!state.settings.welcome && tab === "overview";

  const base = `/portal/${p.id}`;

  return (
    <div>
      <header className="bg-bg border-divider border-b">
        <div className="m-[0_auto] max-w-[940px] p-[16px_26px_0] max-lg:px-[18px]! max-lg:pt-3.5!">
          <div className="flex items-center gap-[12px]">
            <div className="border-accent grid h-[20px] w-[20px] place-items-center rounded-[3px] border">
              <div className="bg-accent h-[7px] w-[7px]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-heading text-[17px] font-semibold">
                {brandName}
              </div>
              <div className="text-text/45 text-[11.5px]">
                {p.title} · for {c.company || c.name}
              </div>
            </div>
            {isPreview ? (
              <button
                className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent p-[5px_11px] px-[calc(var(--spacing-3)*1.2)] py-2 text-sm text-[12px] leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
                onClick={() => go(`/projects/${p.id}`)}
              >
                ← Back to EZLane
              </button>
            ) : null}
          </div>
          <nav className="mt-[16px] flex gap-[2px] max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:[&_.nv]:px-[13px] max-lg:[&_.nv]:py-[11px] max-lg:[&_.nv]:text-sm max-lg:[&_.nv]:whitespace-nowrap">
            {TABS.map((t) => (
              <a
                key={t.key}
                className="font-body text-text/60 hover:bg-text/6 hover:text-text data-[cur=1]:border-accent/32 data-[cur=1]:bg-accent/15 data-[cur=1]:text-text flex cursor-pointer items-center gap-[9px] rounded rounded-[4px_4px_0_0] px-[9px] py-1.5 text-[13px] no-underline data-[cur=1]:border max-lg:px-3 max-lg:py-[11px] max-lg:text-sm [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:flex-none [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:opacity-90"
                data-cur={
                  tab === t.key || (t.key === "overview" && !tabName)
                    ? "1"
                    : "0"
                }
                onClick={() => go(`${base}/${t.key}`)}
              >
                <span>{t.label}</span>
                {t.key === "notifications" && unreadCount > 0 ? (
                  <span
                    className="data-[s=sent]:bg-accent-100 data-[s=sent]:text-accent-800 data-[s=commented]:text-accent-700 data-[s=accepted]:bg-text data-[s=accepted]:text-bg data-[s=done]:text-text/60 data-[s=warn]:text-accent-700 ml-[6px] inline-flex items-center rounded-[3px] px-[6px] py-[1px] text-[10px] tracking-[0.02em] whitespace-nowrap data-[s=commented]:bg-transparent data-[s=commented]:shadow-[inset_0_0_0_1px_var(--color-accent)] data-[s=done]:bg-transparent data-[s=done]:shadow-[inset_0_0_0_1px_var(--color-divider)] data-[s=draft]:bg-neutral-200 data-[s=draft]:text-neutral-800 data-[s=warn]:bg-transparent data-[s=warn]:shadow-[inset_0_0_0_1px_var(--color-accent-400)]"
                    data-s="sent"
                  >
                    {unreadCount}
                  </span>
                ) : null}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="m-[0_auto] max-w-[940px] p-[30px_26px_70px] max-lg:px-[18px]! max-lg:pt-6! max-lg:pb-[70px]! max-sm:px-3.5! max-sm:pt-5! max-sm:pb-[34px]!">
        {welcomeShown ? (
          <div className="text-text/72 border-accent mb-[26px] border-l-[2px] p-[2px_0_2px_14px] text-[13.5px] leading-[1.65]">
            {state.settings.welcome}
          </div>
        ) : null}

        {tab === "proposal" ? (
          <ProposalTab project={p} proposalId={proposalId} />
        ) : null}
        {tab === "contract" ? (
          <ContractTab project={p} proposalId={proposalId} />
        ) : null}
        {tab === "overview" ? (
          <OverviewTab project={p} proposalId={proposalId} />
        ) : null}
        {tab === "thread" ? <ThreadTab project={p} /> : null}
        {tab === "notifications" ? <NotificationsTab project={p} /> : null}
      </main>

      <footer className="border-divider border-t p-[20px_26px] text-center">
        {!proBrand ? (
          <div className="text-text/38 text-[11.5px]">
            Powered by <span className="font-heading">EZLane</span>
          </div>
        ) : (
          <div className="text-text/38 text-[11.5px]">
            {brandName} · {state.settings.email}
          </div>
        )}
      </footer>
    </div>
  );
}

function ProposalTab({
  project: p,
  proposalId,
}: {
  project: Project;
  proposalId: string;
}) {
  const {
    state,
    client,
    proposal,
    setPendingAnchor,
    setCommentDraft,
    cancelComment,
    addClientComment,
    openAccept,
    closeAccept,
    acceptProposal,
    go,
  } = useEzlane();
  const pr = proposal(proposalId);
  if (!pr) return null;
  const c = client(p.clientId);

  if (pr.status === "Draft") {
    return (
      <div className="border-divider rounded-[5px] border border-dashed p-[60px] text-center">
        <div className="font-heading text-[21px]">Nothing to review yet</div>
        <p className="text-text/52 m-[8px_auto_0] max-w-[340px] text-[13px]">
          {state.settings.name} has not sent the proposal for this project. You
          will get an email when it arrives.
        </p>
      </div>
    );
  }

  const deliverables = pr.deliverables.length
    ? pr.deliverables
    : p.deliverables;
  const canAccept =
    pr.status === "Sent" ||
    pr.status === "Client Commented" ||
    pr.status === "Revised";
  const accepted = pr.status === "Accepted";
  const ct = contractText(p, c, state.settings);

  const pickAnchor = (e: MouseEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest("p,li,h2,h3");
    if (!el) return;
    setPendingAnchor((el.textContent ?? "").slice(0, 140));
  };

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,_1fr)_244px] items-start gap-[28px] max-lg:grid-cols-[minmax(0,1fr)]! max-lg:gap-[26px]! max-lg:[&>aside]:static!">
        <div>
          <div className="border-divider grid grid-cols-[repeat(3,_1fr)] gap-[16px] rounded-[5px] border p-[18px_20px] max-sm:grid-cols-1!">
            <MiniStat label="Price" value={money(pr.price || p.price)} />
            <MiniStat label="Estimated due" value={fmtDate(pr.due || p.due)} />
            <MiniStat
              label="Deliverables"
              value={String(deliverables.length)}
            />
            <div className="col-[1_/_-1]">
              <ul className="m-0 pl-[18px] text-[13.5px] leading-[1.85]">
                {deliverables.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-divider mt-[20px] rounded-[5px] border p-[26px_30px_34px]">
            <div className="text-text/42 mb-[14px] text-[11.5px]">
              Click any paragraph to comment on it.
            </div>
            <div
              className="data-[anch=1]:[&_p]:hover:bg-accent/12 data-[anch=1]:[&_p]:hover:outline-accent/30 data-[anch=1]:[&_li]:hover:bg-accent/12 data-[anch=1]:[&_li]:hover:outline-accent/30 [&_h2]:font-heading [&_h3]:font-heading text-[15px] leading-[1.75] max-sm:px-4 max-sm:pt-[18px] max-sm:pb-8 [&_h2]:mt-[22px] [&_h2]:mb-2 [&_h2]:text-[22px] [&_h2]:leading-[1.12] [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h3]:mt-[18px] [&_h3]:mb-1.5 [&_h3]:text-lg [&_h3]:leading-[1.12] [&_h3]:font-semibold [&_h3]:tracking-[-0.015em] [&_li]:mb-1 data-[anch=1]:[&_li]:hover:cursor-text data-[anch=1]:[&_li]:hover:outline [&_ol]:mb-3 [&_ol]:pl-[22px] [&_ol]:leading-[1.7] [&_p]:mb-3 [&_p]:leading-[1.72] data-[anch=1]:[&_p]:hover:cursor-text data-[anch=1]:[&_p]:hover:outline [&_ul]:mb-3 [&_ul]:pl-[22px] [&_ul]:leading-[1.7]"
              data-anch="1"
              onClick={pickAnchor}
              dangerouslySetInnerHTML={{ __html: pr.body }}
            />
          </div>
        </div>
        <aside className="sticky top-[24px] flex flex-col gap-[16px]">
          <div className="border-divider flex flex-col gap-[10px] rounded-[5px] border p-[15px]">
            <Tag
              status={statusKey(pr.status) as StatusKey}
              className="self-start"
            >
              {pr.status}
            </Tag>
            <div className="text-text/62 text-[12.5px] leading-[1.55]">
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
              <Button
                variant="secondary"
                block
                onClick={() => go(`/portal/${p.id}/contract`)}
              >
                Go to the contract →
              </Button>
            ) : null}
          </div>
          <div>
            <div className="border-divider mb-[10px] border-b pb-[7px]">
              <h6 className="font-heading text-text/50 m-0 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
                Your comments
              </h6>
            </div>
            <div className="flex flex-col gap-[10px]">
              {pr.comments.map((cm) => (
                <div
                  key={cm.id}
                  className="border-accent border-l-[2px] p-[2px_0_2px_10px]"
                >
                  <div className="text-text/45 text-[11px]">
                    {cm.author} · {ago(cm.ts)}
                  </div>
                  <div className="text-text/50 m-[3px_0] text-[11.5px] italic">
                    &ldquo;{cm.anchor}&rdquo;
                  </div>
                  <div className="text-[12.5px] leading-[1.5]">{cm.text}</div>
                </div>
              ))}
              {pr.comments.length === 0 ? (
                <div className="text-text/42 text-[12px] leading-[1.5]">
                  No comments yet.
                </div>
              ) : null}
            </div>
            {state.pendingAnchor ? (
              <div className="border-accent-400 mt-[12px] rounded-md border p-[10px]">
                <div className="text-text/50 mb-[6px] text-[11px] italic">
                  &ldquo;{state.pendingAnchor}&rdquo;
                </div>
                <textarea
                  className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-9 w-full rounded-md border bg-transparent px-2.5 py-1.5 text-sm text-[12.5px] focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
                  rows={3}
                  placeholder="Your comment…"
                  value={state.commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                />
                <div className="mt-[8px] flex gap-[7px]">
                  <button
                    className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent p-[4px] px-[calc(var(--spacing-3)*1.2)] py-2 text-sm text-[12px] leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
                    onClick={cancelComment}
                  >
                    Cancel
                  </button>
                  <button
                    className="font-heading text-text border-accent text-accent hover:bg-accent/12 active:bg-accent/22 inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent p-[4px] px-[calc(var(--spacing-3)*1.2)] py-2 text-sm text-[12px] leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
                    onClick={() => {
                      if (!state.commentDraft.trim()) return;
                      addClientComment(
                        p.id,
                        pr.id,
                        state.pendingAnchor,
                        state.commentDraft,
                      );
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
        <div
          className="fixed inset-0 z-50 z-[70] grid place-items-center bg-neutral-900/50 p-4"
          onClick={closeAccept}
        >
          <div
            className="border-divider bg-surface flex w-[min(440px,100%)] w-[min(480px,_100%)] flex-col gap-3 rounded-lg border p-4 shadow-lg max-sm:max-h-[88vh] max-sm:w-[calc(100vw-26px)] max-sm:overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-heading text-xl font-semibold">
              You&apos;re agreeing to these terms
            </div>
            <div className="flex flex-col gap-[9px] text-[13.5px]">
              <Row label="Price" value={money(pr.price)} />
              <Row
                label="Payment"
                value={`${ct.half} now, ${ct.half} on completion`}
              />
              <Row label="Estimated due" value={fmtDate(pr.due)} />
              <div>
                <div className="text-text/55 mb-[5px]">Deliverables</div>
                <ul className="m-0 pl-[18px] leading-[1.8]">
                  {deliverables.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="text-sm text-[12.5px] opacity-85">
              Accepting locks the proposal and creates the project. The
              agreement is generated next, for you to sign.
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <button
                className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
                onClick={closeAccept}
              >
                Not yet
              </button>
              <button
                className="font-heading text-text border-accent text-accent hover:bg-accent/12 active:bg-accent/22 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
                onClick={() => acceptProposal(p, pr)}
              >
                Accept these terms
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ContractTab({
  project: p,
  proposalId,
}: {
  project: Project;
  proposalId: string;
}) {
  const { state, client, proposal, setSignName, signContract } = useEzlane();
  const pr = proposal(proposalId);
  const c = client(p.clientId);
  const ct = contractText(p, c, state.settings);
  const deliverables = pr?.deliverables.length
    ? pr.deliverables
    : p.deliverables;
  const available = pr?.status === "Accepted";

  if (!available) {
    return (
      <div className="max-w-[720px]">
        <div className="border-divider rounded-[5px] border border-dashed p-[60px] text-center">
          <div className="font-heading text-[21px]">No agreement yet</div>
          <p className="text-text/52 m-[8px_auto_0] max-w-[360px] text-[13px]">
            The agreement is generated the moment you accept the proposal — it
            uses those same terms, so there is nothing new to read.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[720px]">
      <h3 className="font-heading m-[0_0_4px] text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">
        Agreement
      </h3>
      <div className="text-text/50 text-[12.5px]">
        Generated from the terms you accepted. Nothing here was written by hand.
      </div>
      <div className="text-text/85 border-divider mt-[18px] rounded-[5px] border p-[28px_30px] text-[14px] leading-[1.8]">
        <p className="mb-3">{ct.parties}</p>
        <p className="mb-3">
          <strong>Scope.</strong> The Contractor will deliver:
        </p>
        <ul className="pl-[20px]">
          {deliverables.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
        <p className="mb-3">
          <strong>Fee.</strong> {money(p.price)} in total, paid in two halves:{" "}
          {ct.half} on signature and {ct.half} on completion. Invoices are
          settled by bank transfer within 14 days.
        </p>
        <p className="mb-3">
          <strong>Timing.</strong> Estimated completion {fmtDate(p.due)}. Dates
          move if material or decisions are late.
        </p>
        <p className="mb-3">
          <strong>Ownership.</strong> On final payment, the delivered work
          transfers to the Client. The Contractor may show the work publicly
          unless asked not to.
        </p>
      </div>
      <div className="text-text/42 mt-[12px] text-[11.5px] leading-[1.6]">
        This is a plain-language agreement, not legal advice. If the project or
        the sums involved warrant it, have a lawyer look at it before signing.
      </div>
      {p.contract ? (
        <>
          <div className="border-divider mt-[22px] flex items-center gap-[16px] rounded-[5px] border p-[18px_20px]">
            <div className="flex-1">
              <div className="font-heading text-[21px]">{p.contract.name}</div>
              <div className="text-text/45 mt-[2px] text-[11.5px]">
                signed {fmtTime(p.contract.ts)}
              </div>
            </div>
            <Tag status="accepted">Signed</Tag>
          </div>
          <div className="mt-[14px] flex gap-[12px] text-[12.5px]">
            <Tag status={p.deposit ? "accepted" : "done"}>
              {p.deposit ? "Deposit received" : `Deposit due — ${ct.half}`}
            </Tag>
            <Tag status={p.final ? "accepted" : "done"}>
              {p.final
                ? "Final payment received"
                : "Final payment due on completion"}
            </Tag>
          </div>
        </>
      ) : (
        <div className="bg-accent/6 border-accent mt-[22px] rounded-[5px] border p-[18px_20px]">
          <div className="font-heading text-[16px] font-semibold">
            Sign by typing your full name
          </div>
          <div className="text-text/60 m-[4px_0_12px] text-[12.5px]">
            Typing your name below counts as your signature on the terms above.
          </div>
          <div className="flex flex-wrap items-end gap-[10px]">
            <div className="[&>label]:text-text/70 min-w-[220px] flex-1 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
              <label>Full name</label>
              <input
                className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent font-heading min-h-9 min-h-[42px] w-full rounded-md border bg-transparent px-2.5 py-1.5 text-sm text-[17px] focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
                value={state.signName}
                onChange={(e) => setSignName(e.target.value)}
                placeholder={c.name}
              />
            </div>
            <button
              className="font-heading text-text border-accent text-accent hover:bg-accent/12 active:bg-accent/22 inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
              onClick={() => signContract(p)}
            >
              Sign the agreement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewTab({
  project: p,
  proposalId,
}: {
  project: Project;
  proposalId: string;
}) {
  const { state, proposal, go } = useEzlane();
  const pr = proposal(proposalId);
  const live = p.stage === "active" || p.completed;
  const statusLabel = p.completed ? "Completed" : p.status;

  if (!live) {
    return (
      <div className="max-w-[760px]">
        <div className="border-divider rounded-[5px] border border-dashed p-[60px] text-center">
          <div className="font-heading text-[21px]">
            The project starts once you accept
          </div>
          <p className="text-text/52 m-[8px_auto_16px] max-w-[340px] text-[13px]">
            Status, progress and payment appear here as soon as the proposal is
            accepted and signed.
          </p>
          <Button
            variant="primary"
            onClick={() => go(`/portal/${p.id}/proposal`)}
          >
            Read the proposal
          </Button>
        </div>
      </div>
    );
  }

  const deliverables = pr?.deliverables.length
    ? pr.deliverables
    : p.deliverables;

  return (
    <div className="max-w-[760px]">
      <div className="flex items-center gap-[12px]">
        <Tag status={statusKey(statusLabel) as StatusKey}>{statusLabel}</Tag>
        <span className="text-text/50 text-[12.5px]">
          Updated by {state.settings.name}
        </span>
      </div>
      <h3 className="font-heading m-[10px_0_18px] text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">
        {p.title}
      </h3>
      <div className="flex items-center gap-[12px]">
        <div className="bg-text/12 h-[5px] flex-1 overflow-hidden rounded-[3px]">
          <svg className="text-accent block h-full w-full" aria-hidden="true">
            <rect width={`${p.progress}%`} height="100%" fill="currentColor" />
          </svg>
        </div>
        <span className="text-[12.5px] tabular-nums">{p.progress}%</span>
      </div>
      <div className="bg-divider border-divider mt-[22px] grid grid-cols-[repeat(3,_1fr)] gap-[1px] overflow-hidden rounded-[5px] border max-sm:grid-cols-1!">
        <MiniStat label="Price" value={money(p.price)} big />
        <MiniStat label="Estimated due" value={fmtDate(p.due)} big />
        <MiniStat label="Paid" value={money(received(p))} big />
      </div>
      <div className="mt-[24px]">
        <h6 className="font-heading text-text/50 mb-2 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
          Deliverables
        </h6>
        <ul className="m-[10px_0_0] pl-[18px] text-[14px] leading-[1.9]">
          {deliverables.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ThreadTab({ project: p }: { project: Project }) {
  const {
    state,
    composer,
    setComposer,
    sendMessage,
    setDragOver,
    clearDragOver,
    approveWork,
  } = useEzlane();
  const comp = composer(p.id);
  const dropActive = state.dragOver === p.id;
  const canApprove =
    (p.stage === "active" || p.completed) &&
    p.status !== "Approved" &&
    !!p.contract;

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
    <div className="max-w-[760px]">
      <div className="border-divider flex items-baseline justify-between border-b pb-[8px]">
        <h4 className="font-heading m-0 text-[16px] leading-[1.12] font-semibold tracking-[-0.015em]">
          Messages
        </h4>
        <span className="text-text/45 text-[11.5px]">
          New messages appear when you reload — nothing is live
        </span>
      </div>
      <div className="flex flex-col">
        {p.messages
          .slice()
          .sort((a, b) => a.ts - b.ts)
          .map((m) => (
            <div key={m.id} className="border-divider border-b p-[15px_2px]">
              {m.side === "system" ? (
                <div className="text-text/42 text-[11.5px] italic">
                  {m.text} · {fmtTime(m.ts)}
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-[9px]">
                    <span className="font-heading text-[14px] font-semibold">
                      {m.from}
                    </span>
                    <span className="text-text/40 text-[11px]">
                      {fmtTime(m.ts)}
                    </span>
                  </div>
                  <div className="mt-[6px] max-w-[62ch] text-[14px] leading-[1.7] max-sm:max-w-full!">
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
          <div className="text-text/45 p-[16px_2px] text-[13px]">
            No messages yet.
          </div>
        ) : null}
      </div>
      <div
        className={`mt-[18px] rounded-[5px] border p-[13px] ${dropActive ? "border-accent bg-accent/8" : "border-divider"}`}
        onDragOver={onDragOver}
        onDragLeave={clearDragOver}
        onDrop={onDrop}
      >
        <textarea
          className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-9 w-full rounded-md border border-0 bg-transparent p-0 px-2.5 py-1.5 text-sm text-[14px] focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
          rows={3}
          placeholder="Reply…"
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
        <div className="mt-[8px] flex flex-wrap items-center gap-[10px]">
          <span className="text-text/40 flex-1 text-[11.5px]">
            {dropActive
              ? "Drop to attach"
              : "Drag a file into this box to attach it"}
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
            onClick={() => sendMessage(p.id, "client")}
          >
            Send message
          </button>
        </div>
      </div>
      {canApprove ? (
        <div className="bg-accent/6 border-accent mt-[20px] flex items-center gap-[16px] rounded-[5px] border p-[16px_18px]">
          <div className="flex-1">
            <div className="font-heading text-[15px] font-semibold">
              Happy with the work?
            </div>
            <div className="text-text/60 mt-[3px] text-[12.5px]">
              Approving is a deliberate step, separate from messaging.
            </div>
          </div>
          <button
            className="font-heading text-text border-accent text-accent hover:bg-accent/12 active:bg-accent/22 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
            onClick={() => approveWork(p)}
          >
            Approve the work
          </button>
        </div>
      ) : null}
      {p.status === "Approved" ? (
        <div className="text-text/55 mt-[20px] text-[12.5px]">
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
    <div className="max-w-[700px]">
      <div className="border-divider flex items-baseline justify-between border-b pb-[8px]">
        <h4 className="font-heading m-0 text-[16px] leading-[1.12] font-semibold tracking-[-0.015em]">
          Activity on this project
        </h4>
        <button
          className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 text-[12.5px] no-underline hover:underline"
          onClick={() => markAllRead("client", p.id)}
        >
          Mark all read
        </button>
      </div>
      <div>
        {notifs.map((n) => (
          <div
            key={n.id}
            className="border-divider flex items-start gap-[13px] border-b p-[15px_4px]"
          >
            <div
              className={`bg-accent mt-[7px] h-1.5 w-1.5 flex-none rounded-full ${n.read ? "opacity-22" : "opacity-100"}`}
            />
            <div className="flex-1">
              <div className="text-[13.5px] leading-[1.5]">{n.title}</div>
              <div className="text-text/42 mt-[3px] text-[11px]">
                {ago(n.ts)} · {n.read ? "read" : "unread"}
              </div>
            </div>
          </div>
        ))}
        {notifs.length === 0 ? (
          <div className="text-text/45 p-[16px_4px] text-[13px]">
            Nothing yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  big = false,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  return (
    <div className={big ? "bg-bg px-4 py-3.5" : undefined}>
      <div className="text-text/42 text-[10px] tracking-[0.12em] uppercase">
        {label}
      </div>
      <div className="font-heading mt-[4px] text-[22px] tabular-nums">
        {value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-divider flex justify-between border-b pb-[7px]">
      <span className="text-text/55">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
