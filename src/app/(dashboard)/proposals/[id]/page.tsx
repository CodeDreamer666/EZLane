"use client";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ProposalSidebar from "~/components/proposals/ProposalSidebar";
import ProposalTabBar from "~/components/proposals/ProposalTabBar";
import ProposalTerms from "~/components/proposals/ProposalTerms";
import ProposalToolbar from "~/components/proposals/ProposalToolbar";
import { LoadingScreen, ServerError } from "~/components/shared";
import { fmtDate } from "~/lib/format";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import {
  DEFAULT_PROPOSAL_FONT,
  DEFAULT_PROPOSAL_FONT_SIZE,
  type ProposalEditorForm,
  proposalUpdateZodSchema,
} from "~/schema/proposal";
import { api } from "~/trpc/react";

export default function ProposalEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { showMessage } = useStatusMessage();

  const utils = api.useUtils();
  const { data: proposal, isLoading, error } = api.proposals.byId.useQuery({ id });
  const { data: plan } = api.settings.getPlan.useQuery();

  const [form, setForm] = useState<ProposalEditorForm>({
    title: "",
    price: 0,
    due: "",
    deliverables: [],
    font: DEFAULT_PROPOSAL_FONT,
    fontSize: DEFAULT_PROPOSAL_FONT_SIZE,
  });

  const bodyRef = useRef<HTMLDivElement>(null);
  const loadedId = useRef<string | null>(null);

  useEffect(() => {
    if (!proposal || loadedId.current === proposal.id) return;

    setForm({
      title: proposal.title,
      price: proposal.price,
      due: proposal.due,
      deliverables: proposal.deliverables,
      font: proposal.font ?? DEFAULT_PROPOSAL_FONT,
      fontSize: proposal.fontSize ?? DEFAULT_PROPOSAL_FONT_SIZE,
    });

    if (bodyRef.current) bodyRef.current.innerHTML = proposal.body;
    loadedId.current = proposal.id;
  }, [proposal]);

  const updateProposal = api.proposals.update.useMutation({
    onSuccess: async () => {
      showMessage("Proposal saved", true);
      await Promise.all([
        utils.proposals.byId.invalidate({ id }),
        utils.proposals.list.invalidate(),
      ]);
    },
    onError: (err) => {
      showMessage(getFriendlyError(err), false);
    },
  });

  const sendProposal = api.proposals.send.useMutation({
    onSuccess: async () => {
      showMessage("Proposal sent", true);
      await Promise.all([
        utils.proposals.byId.invalidate({ id }),
        utils.proposals.list.invalidate(),
      ]);
    },
    onError: (err) => {
      showMessage(getFriendlyError(err), false);
    },
  });

  const isBusy = updateProposal.isPending || sendProposal.isPending;

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val ?? undefined);
    bodyRef.current?.focus();
  };

  const handleSave = () => {
    if (isBusy) return;

    const result = proposalUpdateZodSchema.safeParse({
      id,
      title: form.title,
      price: form.price,
      due: form.due,
      deliverables: form.deliverables,
      body: bodyRef.current?.innerHTML ?? proposal?.body ?? "",
      font: form.font,
      fontSize: form.fontSize,
    });

    if (!result.success) {
      showMessage(
        result.error.issues[0]?.message ?? "Please check the terms and try again.",
        false,
      );
      return;
    }

    updateProposal.mutate(result.data);
  };

  const handleSend = () => {
    if (isBusy) return;
    sendProposal.mutate({ id });
  };

  if (isLoading) return <LoadingScreen />;

  if (error || !proposal) return <ServerError />;

  const locked = proposal.status === "ACCEPTED";

  return (
    <div>
      <ProposalTabBar proposal={proposal} />

      <div className="grid grid-cols-[minmax(0,_1fr)_282px] items-start gap-[30px] max-lg:grid-cols-[minmax(0,1fr)]! max-lg:gap-[26px]! max-lg:[&>aside]:static!">
        <div>
          <ProposalTerms form={form} setForm={setForm} locked={locked} />

          <div className="border-divider mt-[20px] overflow-hidden rounded-[5px] border">
            <ProposalToolbar
              form={form}
              setForm={setForm}
              locked={locked}
              fontLocked={plan?.plan !== "PRO"}
              exec={exec}
            />
            <div
              ref={bodyRef}
              contentEditable={!locked}
              suppressContentEditableWarning
              className={`[&_h2]:font-heading [&_h3]:font-heading min-h-[420px] px-[30px] pt-[26px] pb-10 leading-[1.72] outline-none max-sm:px-4 max-sm:pt-[18px] max-sm:pb-8 [&_h2]:mt-[22px] [&_h2]:mb-2 [&_h2]:text-[22px] [&_h2]:leading-[1.12] [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h3]:mt-[18px] [&_h3]:mb-1.5 [&_h3]:text-lg [&_h3]:leading-[1.12] [&_h3]:font-semibold [&_h3]:tracking-[-0.015em] [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:pl-[22px] [&_ol]:leading-[1.7] [&_p]:mb-3 [&_p]:leading-[1.72] [&_ul]:mb-3 [&_ul]:pl-[22px] [&_ul]:leading-[1.7] ${form.font === "Lora" ? "font-body" : form.font === "Cormorant Garamond" ? "font-heading" : "font-sans"} ${form.fontSize === "14" ? "text-sm" : form.fontSize === "15" ? "text-[15px]" : form.fontSize === "16" ? "text-base" : "text-lg"}`}
            />
          </div>
          {locked ? (
            <div className="text-text/55 mt-[12px] text-[12.5px]">
              Accepted on{" "}
              {proposal.sentAt
                ? fmtDate(new Date(proposal.sentAt).toISOString().slice(0, 10))
                : "—"}{" "}
              — this proposal is locked.
            </div>
          ) : null}
        </div>

        <ProposalSidebar
          proposal={proposal}
          locked={locked}
          saving={updateProposal.isPending}
          sending={sendProposal.isPending}
          onSave={handleSave}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}
