"use client";

import type { MouseEvent } from "react";

import MiniStat from "~/components/portal/MiniStat";
import PortalSummaryRow from "~/components/portal/PortalSummaryRow";
import { Button, Dialog, Tag, type StatusKey } from "~/components/shared";
import { ago, contractText, fmtDate, money, statusKey } from "~/lib/format";
import useEzlane from "~/hook/useEzlane";
import type { Project } from "~/type";

export default function ProposalTab({
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
              className="data-[anch=1]:[&_p]:hover:bg-accent/12 data-[anch=1]:[&_p]:hover:outline-accent/30 data-[anch=1]:[&_li]:hover:bg-accent/12 data-[anch=1]:[&_li]:hover:outline-accent/30 [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading [&_a]:text-accent [&_a]:underline [&_b]:font-bold [&_strong]:font-bold [&_ul]:list-disc [&_ol]:list-decimal [&_li]:list-outside [&_li]:pl-1 [&_li]:marker:text-text/70 [&_h1]:mt-6 [&_h1]:mb-2.5 [&_h1]:text-[27px] [&_h1]:leading-[1.12] [&_h1]:font-semibold [&_h1]:tracking-[-0.02em] text-[15px] leading-[1.75] max-sm:px-4 max-sm:pt-[18px] max-sm:pb-8 [&_h2]:mt-[22px] [&_h2]:mb-2 [&_h2]:text-[22px] [&_h2]:leading-[1.12] [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h3]:mt-[18px] [&_h3]:mb-1.5 [&_h3]:text-lg [&_h3]:leading-[1.12] [&_h3]:font-semibold [&_h3]:tracking-[-0.015em] [&_li]:mb-1 data-[anch=1]:[&_li]:hover:cursor-text data-[anch=1]:[&_li]:hover:outline [&_ol]:mb-3 [&_ol]:pl-[22px] [&_ol]:leading-[1.7] [&_p]:mb-3 [&_p]:leading-[1.72] data-[anch=1]:[&_p]:hover:cursor-text data-[anch=1]:[&_p]:hover:outline [&_ul]:mb-3 [&_ul]:pl-[22px] [&_ul]:leading-[1.7]"
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

      <Dialog
        open={state.acceptOpen}
        onClose={closeAccept}
        title="You're agreeing to these terms"
        maxWidthClassName="max-w-[480px]"
        actions={
          <>
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
          </>
        }
      >
        <div className="flex flex-col gap-[9px] text-[13.5px] opacity-100">
          <PortalSummaryRow label="Price" value={money(pr.price)} />
          <PortalSummaryRow
            label="Payment"
            value={`${ct.half} now, ${ct.half} on completion`}
          />
          <PortalSummaryRow label="Estimated due" value={fmtDate(pr.due)} />
          <div>
            <div className="text-text/55 mb-[5px]">Deliverables</div>
            <ul className="m-0 pl-[18px] leading-[1.8]">
              {deliverables.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-3 text-sm text-[12.5px] opacity-85">
          Accepting locks the proposal and creates the project. The agreement is
          generated next, for you to sign.
        </div>
      </Dialog>
    </div>
  );
}
