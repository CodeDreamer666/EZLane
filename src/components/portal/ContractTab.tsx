"use client";

import { Tag } from "~/components/shared";
import { contractText, fmtDate, fmtTime, money } from "~/lib/format";
import useEzlane from "~/hook/useEzlane";
import type { Project } from "~/type";

export default function ContractTab({
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
