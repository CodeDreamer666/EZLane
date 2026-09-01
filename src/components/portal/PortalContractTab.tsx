"use client";

import { useState } from "react";

import type { PortalRef } from "~/components/portal/PortalGate";
import { Button, Field, Input, LoadingIcon, Tag } from "~/components/shared";
import { fmtDate, fmtTime, money } from "~/lib/format";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import { api, type RouterOutputs } from "~/trpc/react";

type PortalProject = RouterOutputs["portal"]["project"]["project"];

export default function PortalContractTab({
  project,
  brandName,
  clientLabel,
  portalRef,
  password,
  projectId,
}: {
  project: PortalProject;
  brandName: string;
  clientLabel: string;
  portalRef: PortalRef;
  password: string;
  projectId: string;
}) {
  const { showMessage } = useStatusMessage();
  const utils = api.useUtils();

  const [signName, setSignName] = useState("");

  const signContract = api.portal.signContract.useMutation({
    onSuccess: () => {
      showMessage("Signed — work can start", true);
      setSignName("");
    },

    onError: (err) => {
      showMessage(getFriendlyError(err), false);
    },

    onSettled: async () => {
      await utils.portal.invalidate();
    },
  });

  const handleSign = () => {
    if (signContract.isPending) return;

    const signature = signName.trim();

    if (
      signature.length < 8 ||
      !/[A-Za-z]/.test(signature) ||
      !/[0-9]/.test(signature)
    ) {
      showMessage(
        "Your signature must be at least 8 characters and include a letter and a number",
        false,
      );
      return;
    }

    signContract.mutate({
      ref: portalRef,
      password,
      projectId,
      name: signature,
    });
  };

  const proposal = project.proposal;
  const half = money(Math.round(proposal.price / 2));

  return (
    <div className="max-w-[720px]">
      <h3 className="font-heading m-[0_0_4px] text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">
        Agreement
      </h3>
      <div className="text-text/50 text-[12.5px]">
        Generated from the terms you accepted. Nothing here was written by hand.
      </div>
      <div className="text-text/85 border-divider mt-[18px] rounded-[5px] border p-[28px_30px] text-[14px] leading-[1.8]">
        <p className="mb-3">
          This agreement is made between {brandName} (“the Contractor”) and{" "}
          {clientLabel} (“the Client”).
        </p>
        <p className="mb-3">
          <strong>Scope.</strong> The Contractor will deliver:
        </p>
        <ul className="pl-[20px]">
          {proposal.deliverables.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
        <p className="mb-3">
          <strong>Fee.</strong> {money(proposal.price)} in total, paid in two
          halves: {half} on signature and {half} on completion. Invoices are
          settled by bank transfer within 14 days.
        </p>
        <p className="mb-3">
          <strong>Timing.</strong> Estimated completion {fmtDate(proposal.due)}.
          Dates move if material or decisions are late.
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
      {project.contractName ? (
        <>
          <div className="border-divider mt-[22px] flex items-center gap-[16px] rounded-[5px] border p-[18px_20px]">
            <div className="flex-1">
              <div className="font-heading text-[21px]">
                {project.contractName}
              </div>
              {project.contractSignedAt ? (
                <div className="text-text/45 mt-[2px] text-[11.5px]">
                  signed {fmtTime(new Date(project.contractSignedAt).getTime())}
                </div>
              ) : null}
            </div>
            <Tag status="accepted">Signed</Tag>
          </div>
          <div className="mt-[14px] flex gap-[12px] text-[12.5px]">
            <Tag status={project.depositPaid ? "accepted" : "done"}>
              {project.depositPaid
                ? "Deposit received"
                : `Deposit due — ${half}`}
            </Tag>
            <Tag status={project.finalPaid ? "accepted" : "done"}>
              {project.finalPaid
                ? "Final payment received"
                : "Final payment due on completion"}
            </Tag>
          </div>
        </>
      ) : (
        <div className="bg-accent/6 border-accent mt-[22px] rounded-[5px] border p-[18px_20px]">
          <div className="font-heading text-[16px] font-semibold">
            Sign with a signature phrase
          </div>
          <div className="text-text/60 m-[4px_0_12px] text-[12.5px]">
            Choose any phrase you like — it does not have to be your name.
            Entering it here counts as your signature on the terms above. To keep
            every signature distinct, it must be at least 8 characters and
            include a letter and a number.
          </div>
          <div className="flex flex-wrap items-end gap-[10px]">
            <Field label="Signature phrase" className="min-w-[220px] flex-1">
              <Input
                className="font-heading min-h-[42px]! text-[17px]!"
                value={signName}
                onChange={(e) => setSignName(e.target.value)}
                placeholder="e.g. skyline-oak-2026"
                maxLength={120}
              />
            </Field>
            <Button
              variant="primary"
              className="min-h-[42px]"
              disabled={signContract.isPending}
              onClick={handleSign}
            >
              {signContract.isPending ? (
                <span className="flex items-center gap-1.5">
                  <LoadingIcon className="h-4 w-4" />
                  Signing...
                </span>
              ) : (
                "Sign the agreement"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
