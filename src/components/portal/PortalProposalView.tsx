"use client";

import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";

import MiniStat from "~/components/portal/MiniStat";
import PortalChrome from "~/components/portal/PortalChrome";
import type { PortalRef } from "~/components/portal/PortalGate";
import PortalSummaryRow from "~/components/portal/PortalSummaryRow";
import {
  Button,
  Dialog,
  LoadingIcon,
  LoadingScreen,
  ServerError,
  Tag,
  Textarea,
  type StatusKey,
} from "~/components/shared";
import {
  ago,
  fmtDate,
  money,
  proposalStatusLabel,
  statusKey,
} from "~/lib/format";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import { api } from "~/trpc/react";

export default function PortalProposalView({
  portalRef,
  basePath,
  password,
  proposalId,
}: {
  portalRef: PortalRef;
  basePath: string;
  password: string;
  proposalId: string;
}) {
  const router = useRouter();
  const { showMessage } = useStatusMessage();
  const utils = api.useUtils();

  const { data, isLoading, error } = api.portal.proposal.useQuery({
    ref: portalRef,
    password,
    proposalId,
  });

  const [pendingAnchor, setPendingAnchor] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [acceptOpen, setAcceptOpen] = useState(false);

  const addComment = api.portal.addComment.useMutation({
    onSuccess: () => {
      showMessage("Comment added", true);
      setPendingAnchor("");
      setCommentDraft("");
    },

    onError: (err) => {
      showMessage(getFriendlyError(err), false);
    },

    onSettled: async () => {
      await utils.portal.invalidate();
    },
  });

  const acceptProposal = api.portal.acceptProposal.useMutation({
    onSuccess: ({ projectId }) => {
      showMessage("Accepted — the agreement is ready to sign", true);
      router.push(`${basePath}/project/${projectId}`);
    },

    onError: (err) => {
      showMessage(getFriendlyError(err), false);
    },

    onSettled: async () => {
      await utils.portal.invalidate();
    },
  });

  const handlePickAnchor = (e: MouseEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest("p,li,h2,h3");
    if (!el) return;
    setPendingAnchor((el.textContent ?? "").slice(0, 140));
  };

  const handleAddComment = () => {
    if (addComment.isPending) return;
    if (!commentDraft.trim()) return;

    addComment.mutate({
      ref: portalRef,
      password,
      proposalId,
      anchor: pendingAnchor,
      text: commentDraft.trim(),
    });
  };

  if (isLoading) return <LoadingScreen />;

  if (error || !data) return <ServerError />;

  const { branding, client, proposal } = data;
  const statusLabel = proposalStatusLabel(proposal.status);
  const accepted = proposal.status === "ACCEPTED";
  const acceptedProjectId = proposal.project?.id ?? null;
  const half = money(Math.round(proposal.price / 2));

  return (
    <PortalChrome
      brandName={branding.brandName}
      hideBranding={branding.hideBranding}
      subtitle={`${proposal.title} · for ${client.company ?? client.name}`}
      backHref={basePath}
    >
      <div className="grid grid-cols-[minmax(0,_1fr)_244px] items-start gap-[28px] max-lg:grid-cols-[minmax(0,1fr)]! max-lg:gap-[26px]! max-lg:[&>aside]:static!">
        <div>
          <div className="border-divider grid grid-cols-[repeat(3,_1fr)] gap-[16px] rounded-[5px] border p-[18px_20px] max-sm:grid-cols-1!">
            <MiniStat label="Price" value={money(proposal.price)} />
            <MiniStat label="Estimated due" value={fmtDate(proposal.due)} />
            <MiniStat
              label="Deliverables"
              value={String(proposal.deliverables.length)}
            />
            <div className="col-[1_/_-1]">
              <ul className="m-0 pl-[18px] text-[13.5px] leading-[1.85]">
                {proposal.deliverables.map((d, i) => (
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
              className="data-[anch=1]:[&_p]:hover:bg-accent/12 data-[anch=1]:[&_p]:hover:outline-accent/30 data-[anch=1]:[&_li]:hover:bg-accent/12 data-[anch=1]:[&_li]:hover:outline-accent/30 [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading [&_a]:text-accent [&_li]:marker:text-text/70 text-[15px] leading-[1.75] max-sm:px-4 max-sm:pt-[18px] max-sm:pb-8 [&_a]:underline [&_b]:font-bold [&_h1]:mt-6 [&_h1]:mb-2.5 [&_h1]:text-[27px] [&_h1]:leading-[1.12] [&_h1]:font-semibold [&_h1]:tracking-[-0.02em] [&_h2]:mt-[22px] [&_h2]:mb-2 [&_h2]:text-[22px] [&_h2]:leading-[1.12] [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h3]:mt-[18px] [&_h3]:mb-1.5 [&_h3]:text-lg [&_h3]:leading-[1.12] [&_h3]:font-semibold [&_h3]:tracking-[-0.015em] [&_li]:mb-1 [&_li]:list-outside [&_li]:pl-1 data-[anch=1]:[&_li]:hover:cursor-text data-[anch=1]:[&_li]:hover:outline [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-[22px] [&_ol]:leading-[1.7] [&_p]:mb-3 [&_p]:leading-[1.72] data-[anch=1]:[&_p]:hover:cursor-text data-[anch=1]:[&_p]:hover:outline [&_strong]:font-bold [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-[22px] [&_ul]:leading-[1.7]"
              data-anch="1"
              onClick={handlePickAnchor}
              dangerouslySetInnerHTML={{ __html: proposal.body }}
            />
          </div>
        </div>
        <aside className="sticky top-[24px] flex flex-col gap-[16px]">
          <div className="border-divider flex flex-col gap-[10px] rounded-[5px] border p-[15px]">
            <Tag
              status={statusKey(statusLabel) as StatusKey}
              className="self-start"
            >
              {statusLabel}
            </Tag>
            <div className="text-text/62 text-[12.5px] leading-[1.55]">
              {accepted
                ? "You accepted these terms. The agreement is ready to sign."
                : "Read it, comment on anything unclear, and accept when you are happy. Accepting is what starts the work."}
            </div>
            {accepted ? (
              acceptedProjectId ? (
                <Button
                  variant="secondary"
                  block
                  onClick={() =>
                    router.push(`${basePath}/project/${acceptedProjectId}`)
                  }
                >
                  Go to the project →
                </Button>
              ) : null
            ) : (
              <Button
                variant="primary"
                block
                disabled={acceptProposal.isPending}
                onClick={() => setAcceptOpen(true)}
              >
                Accept this proposal
              </Button>
            )}
          </div>
          <div>
            <div className="border-divider mb-[10px] border-b pb-[7px]">
              <h6 className="font-heading text-text/50 m-0 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
                Your comments
              </h6>
            </div>
            <div className="flex flex-col gap-[10px]">
              {proposal.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-accent border-l-[2px] p-[2px_0_2px_10px]"
                >
                  <div className="text-text/45 text-[11px]">
                    {comment.author} ·{" "}
                    {ago(new Date(comment.createdAt).getTime())}
                  </div>
                  <div className="text-text/50 m-[3px_0] text-[11.5px] italic">
                    &ldquo;{comment.anchor}&rdquo;
                  </div>
                  <div className="text-[12.5px] leading-[1.5]">
                    {comment.text}
                  </div>
                </div>
              ))}
              {proposal.comments.length === 0 ? (
                <div className="text-text/42 text-[12px] leading-[1.5]">
                  No comments yet.
                </div>
              ) : null}
            </div>
            {pendingAnchor ? (
              <div className="border-accent-400 mt-[12px] rounded-md border p-[10px]">
                <div className="text-text/50 mb-[6px] text-[11px] italic">
                  &ldquo;{pendingAnchor}&rdquo;
                </div>
                <Textarea
                  className="text-[12.5px]!"
                  rows={3}
                  placeholder="Your comment…"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                />
                <div className="mt-[8px] flex gap-[7px]">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setPendingAnchor("");
                      setCommentDraft("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    disabled={addComment.isPending}
                    onClick={handleAddComment}
                  >
                    {addComment.isPending ? (
                      <span className="flex items-center gap-1.5">
                        <LoadingIcon className="h-4 w-4" />
                        Adding...
                      </span>
                    ) : (
                      "Comment"
                    )}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      <Dialog
        open={acceptOpen}
        onClose={() => {
          if (!acceptProposal.isPending) setAcceptOpen(false);
        }}
        title="You're agreeing to these terms"
        maxWidthClassName="max-w-[480px]"
        actions={
          <>
            <Button
              variant="secondary"
              disabled={acceptProposal.isPending}
              onClick={() => setAcceptOpen(false)}
            >
              Not yet
            </Button>
            <Button
              variant="primary"
              disabled={acceptProposal.isPending}
              onClick={() =>
                acceptProposal.mutate({ ref: portalRef, password, proposalId })
              }
            >
              {acceptProposal.isPending ? (
                <span className="flex items-center gap-1.5">
                  <LoadingIcon className="h-4 w-4" />
                  Accepting...
                </span>
              ) : (
                "Accept these terms"
              )}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-[9px] text-[13.5px]">
          <PortalSummaryRow label="Price" value={money(proposal.price)} />
          <PortalSummaryRow
            label="Payment"
            value={`${half} now, ${half} on completion`}
          />
          <PortalSummaryRow
            label="Estimated due"
            value={fmtDate(proposal.due)}
          />
          <div>
            <div className="text-text/55 mb-[5px]">Deliverables</div>
            <ul className="m-0 pl-[18px] leading-[1.8]">
              {proposal.deliverables.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-3 text-[12.5px] opacity-85">
          Accepting locks the proposal and creates the project. The agreement is
          generated next, for you to sign.
        </div>
      </Dialog>
    </PortalChrome>
  );
}
